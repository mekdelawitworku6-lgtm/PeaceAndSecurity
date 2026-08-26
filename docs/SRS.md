# Software Requirements Specification (SRS)

## Peace & Security Platform

**Version:** 1.0.0
**Date:** August 26, 2026
**Prepared by:** System Architecture Team
**Project Code:** PeaceAndSecurity

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Roles and Access Control](#4-roles-and-access-control)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Database Schema](#7-database-schema)
8. [API Specification](#8-api-specification)
9. [Real-Time Communication](#9-real-time-communication)
10. [Security Requirements](#10-security-requirements)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Appendices](#12-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the **Peace & Security Platform** — an integrated environmental and community safety system deployed in Addis Ababa, Ethiopia. The platform connects citizens, patrol officers, and administrative personnel through mobile applications, a web dashboard, and a centralized backend API to enable incident reporting, response coordination, real-time communication, and oversight.

### 1.2 Scope

The platform consists of four components:

| Component | Technology | Target Users |
|---|---|---|
| Backend API | NestJS 10 + TypeORM + PostgreSQL + Redis + Socket.IO | System (all clients) |
| Citizen Mobile App | Flutter 3.44 + BLoC | Citizens of Addis Ababa |
| Patrol Mobile App | Flutter 3.44 + BLoC | Patrol officers and police personnel |
| Admin Dashboard | Next.js 16 + Redux Toolkit + Tailwind CSS | Administrators, peace officers, police commanders |

The system enables citizens to report incidents (noise pollution, littering, vandalism, air/water/soil pollution, illegal dumping, deforestation, hazardous waste, wildlife poaching), allows patrol officers to manage and respond to reports in the field, and provides administrators with oversight, user management, analytics, and audit capabilities.

### 1.3 Definitions and Acronyms

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| OTP | One-Time Password |
| PIN | Personal Identification Number |
| BLoC | Business Logic Component (state management pattern) |
| JWT | JSON Web Token |
| Socket.IO | Bidirectional event-based real-time communication protocol |
| Subcity | Administrative division below city level (Kifle Kilil) |
| Woreda | Administrative division below subcity level |
| TypeORM | Object-Relational Mapping for TypeScript/Node.js |

### 1.4 References

- PostgreSQL 14+ documentation
- NestJS framework documentation
- Flutter SDK documentation
- Socket.IO protocol specification
- TypeORM entity relationship documentation

---

## 2. Overall Description

### 2.1 Product Perspective

The Peace & Security Platform is a multi-client, service-oriented system with the following data flow:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Citizen App     │────▶│                  │◀────│  Patrol App          │
│  (Flutter)       │     │  Backend API     │     │  (Flutter)           │
└─────────────────┘     │  (NestJS)        │     └─────────────────────┘
                        │                  │
┌─────────────────┐     │  PostgreSQL      │     ┌─────────────────────┐
│  Admin Dashboard │────▶│  Redis           │◀────│  Socket.IO           │
│  (Next.js)       │     │  Socket.IO       │     │  (Real-time)         │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

### 2.2 User Classes and Characteristics

| User Class | Description | Authentication | Primary Interface |
|---|---|---|---|
| Citizen | Addis Ababa residents | Phone + OTP + PIN | Flutter mobile app |
| Patrol Officer | Field response personnel | Phone + PIN | Flutter mobile app |
| System Super Admin | Highest-level system administrator | Email/phone + password | Web dashboard |
| System Admin | System administrator | Email/phone + password | Web dashboard |
| Peace Super Admin | Bureau-level peace officer | Email/phone + password | Web dashboard |
| Peace Officer Subcity | Subcity-level peace officer | Email/phone + password | Web dashboard |
| Peace Officer Woreda | Woreda-level peace officer | Email/phone + password | Web dashboard |
| Police Commander City | City-level police commander | Email/phone + password | Web dashboard |
| Police Commander Subcity | Subcity-level police commander | Email/phone + password | Web dashboard |
| Police Commander Woreda | Woreda-level police commander | Email/phone + password | Web dashboard |
| All above + _VIEWER | Read-only variant of any role | Email/phone + password | Web dashboard |

### 2.3 Operating Environment

**Backend:**
- Runtime: Node.js 18+ / NestJS 10
- Database: PostgreSQL 14+
- Cache: Redis 7+
- Real-time: Socket.IO 4.x
- Containerization: Docker + Docker Compose

**Citizen App:**
- Flutter 3.44+ (Dart 3.12.2+)
- Platforms: Android (primary), iOS, Web
- Minimum Android SDK: Configured in build.gradle

**Patrol App:**
- Flutter 3.44+ (Dart 3.12.2+)
- Platforms: Android (primary), iOS
- Minimum Android SDK: Configured in build.gradle

**Admin Dashboard:**
- Next.js 16 (App Router, standalone output)
- Node.js 18+ runtime
- Browser: Modern browsers (Chrome, Firefox, Safari, Edge)

**Infrastructure:**
- Docker Compose stack: PostgreSQL, Redis, Backend, Dashboard
- Ports: Backend 5001, Dashboard 8001, PostgreSQL 5433, Redis 6380

### 2.4 Design and Implementation Constraints

- Global API prefix: `/api`
- Response envelope: `{ success, message, statusCode, data }`
- All three user types (citizen, patrol, admin staff) have separate database tables
- Geographic hierarchy is fixed: City → Subcity → Woreda
- Addis Ababa (code `AA`) is always seeded as the city
- Mobile apps do not support APK building through the agent (user builds locally)
- pnpm is the required package manager for the dashboard

### 2.5 Assumptions and Dependencies

- Internet connectivity is available on all client devices
- Google Maps API key is valid and configured
- SMS service is configured for OTP delivery (via `SMS_URL`/`SMS_TOKEN`/`SMS_SENDER` environment variables)
- PostgreSQL and Redis services are running and accessible
- Device location services (GPS) are enabled on mobile devices

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
                          ┌──────────────────────┐
                          │    Load Balancer      │
                          │    (Nginx/Cloud)      │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐
              │  Citizen   │  │   Patrol    │  │  Dashboard │
              │  App       │  │   App       │  │  (Next.js) │
              │ (Flutter)  │  │  (Flutter)  │  │            │
              └─────┬─────┘  └──────┬──────┘  └─────┬─────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │ HTTPS/REST
                          ┌──────────▼───────────┐
                          │   Backend API Server  │
                          │   (NestJS + Socket.IO)│
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐
              │ PostgreSQL  │  │   Redis     │  │  File     │
              │ Database    │  │   Cache     │  │  Storage  │
              └────────────┘  └─────────────┘  └───────────┘
```

### 3.2 Backend Architecture

The backend follows the NestJS modular architecture pattern:

```
apps/backend/src/
├── main.ts                    # Application bootstrap
├── app.module.ts              # Root module
├── auth/                      # Authentication module
├── user/                      # User management module
├── citizen/                   # Citizen management module
├── patrol/                    # Patrol officer module
├── patrol-team/               # Patrol team module
├── reports/                   # Incident reports module
├── report-types/              # Report category module
├── notifications/             # Notification module
├── chat/                      # Chat/messaging module
├── dashboard/                 # Dashboard statistics module
├── geo/                       # Geographic data module
├── cameras/                   # Camera management module
├── settings/                  # System settings module
├── audit/                     # Audit trail module
├── media/                     # File upload/serving module
├── otp/                       # OTP generation/verification module
├── work-reports/              # Officer work reports module
├── common/                    # Shared utilities
│   ├── guards/                # Auth, Roles, Hierarchy guards
│   ├── decorators/            # Custom decorators
│   ├── interceptors/          # Response transformation
│   ├── filters/               # Exception filters
│   └── utils/                 # Utility functions
└── database/
    ├── seeds/                 # Data seeders
    └── migrations/            # TypeORM migrations
```

### 3.3 Client Architecture

#### Citizen & Patrol Apps (Flutter)

Both Flutter apps follow the same architecture:

```
lib/
├── main.dart                  # Entry point
├── app.dart                   # App widget, BlocProviders
├── router/                    # GoRouter configuration
│   └── app_router.dart        # Route definitions + redirect guards
├── core/
│   ├── config/                # API URLs, Socket URLs, Google Maps key
│   ├── network/               # Dio HTTP client singleton
│   ├── services/              # Session manager, Socket.IO service
│   ├── models/                # Data models (User, Report, Message, etc.)
│   ├── theme/                 # Colors, typography, radii
│   ├── i18n/                  # Localization dictionary (en/am/om/ti)
│   ├── utils/                 # Formatters, media helpers
│   └── widgets/               # Reusable UI components
└── features/
    ├── auth/                  # Authentication feature
    │   ├── data/repositories/
    │   └── presentation/
    │       ├── bloc/
    │       └── screens/
    ├── reports/               # Report management feature
    ├── chat/                  # Messaging feature
    ├── notifications/         # Notification feature
    ├── settings/              # Settings/profile feature
    ├── home/                  # Home screen
    ├── map/                   # Map screen (citizen only)
    ├── team/                  # Team screen (patrol only)
    └── work_reports/          # Work reports (patrol only)
```

**State Management Pattern (BLoC):**

```
Event ──▶ BLoC ──▶ State
  │          │
  │          ▼
  │     Repository ──▶ API Client ──▶ Backend
  │          │
  │          ▼
  │     Model (JSON parsing)
  │
  └──▶ Socket.IO Service ──▶ Stream ──▶ BLoC
```

#### Admin Dashboard (Next.js)

```
apps/peace-and-security-dashboard/
├── app/                       # Next.js App Router pages
│   ├── page.tsx               # Login
│   ├── dashboard/             # Protected dashboard routes
│   │   ├── page.tsx           # Main dashboard
│   │   ├── reports/           # Report management
│   │   ├── patrols/           # Patrol management
│   │   ├── citizens/          # Citizen management
│   │   ├── user-management/   # User/role management
│   │   ├── report-types/      # Report category management
│   │   ├── cameras/           # Camera management
│   │   ├── geo/               # Geographic management
│   │   ├── patrol-teams/      # Patrol team management
│   │   ├── work-reports/      # Work report management
│   │   ├── chat/              # Real-time chat
│   │   ├── analytics/         # Analytics & reports
│   │   ├── audit-logs/        # Audit trail
│   │   ├── map/               # Fleet & report map
│   │   ├── notifications/     # Notification management
│   │   └── settings/          # System settings
│   └── layout.tsx             # Root layout
├── components/                # React components (50+)
│   ├── ui/                    # shadcn/ui primitives
│   ├── forms/                 # Form components
│   ├── tables/                # Table components
│   └── maps/                  # Map components
├── lib/
│   ├── services/              # API service files (15 services)
│   ├── store/                 # Redux Toolkit store + slices
│   ├── hooks/                 # Custom React hooks
│   └── utils/                 # Utility functions
└── contexts/                  # React Context providers
    ├── auth-context.tsx
    └── notification-context.tsx
```

### 3.4 Data Flow Diagrams

#### 3.4.1 Citizen Report Submission Flow

```
Citizen                     Backend                     Database
  │                           │                           │
  │  1. POST /reports         │                           │
  │  (multipart: description, │                           │
  │   type, lat/lng, images,  │                           │
  │   video, audio)           │                           │
  │──────────────────────────▶│                           │
  │                           │  2. Validate input        │
  │                           │  3. Process media files   │
  │                           │  4. Generate case ID      │
  │                           │  5. Create Report entity  │
  │                           │──────────────────────────▶│
  │                           │                           │
  │                           │  6. Create AuditLog       │
  │                           │──────────────────────────▶│
  │                           │                           │
  │                           │  7. Create Notification   │
  │                           │  (to assigned patrol)     │
  │                           │  8. Emit Socket.IO event  │
  │                           │                           │
  │  9. Response: {success,   │                           │
  │     data: {report,        │                           │
  │     caseId}}              │                           │
  │◀──────────────────────────│                           │
```

#### 3.4.2 Real-Time Chat Flow

```
Citizen App              Backend (Socket.IO)           Patrol/Dashboard
    │                          │                            │
    │  chat:send ────────────▶│                            │
    │  {conversationId,        │  Validate & persist        │
    │   content, senderType,   │───────────────────────────▶│
    │   senderId}              │  chat:message              │
    │                          │                            │
    │  ◀── chat:message ──────│  chat:message              │
    │  (optimistic replaced)   │                            │
    │                          │                            │
    │  chat:typing ──────────▶│                            │
    │  {isTyping: true}        │  chat:typing               │
    │                          │───────────────────────────▶│
```

---

## 4. Roles and Access Control

### 4.1 Role Hierarchy

The system implements a hierarchical role-based access control (RBAC) model with 25 distinct role values:

```
SYSTEM_SUPER_ADMIN
├── SYSTEM_ADMIN
├── PEACE_SUPER_ADMIN
│   ├── PEACE_OFFICER_SUBCITY
│   │   └── PEACE_OFFICER_WOREDA
│   └── PEACE_OFFICER_VIEWER (read-only variants)
├── POLICE_COMMANDER_CITY
│   ├── POLICE_COMMANDER_SUBCITY
│   │   └── POLICE_COMMANDER_WOREDA
│   └── POLICE_COMMANDER_VIEWER (read-only variants)
├── PATROL
└── CITIZEN
```

### 4.2 Role Definitions

| Role | Scope | Description | Can Create |
|---|---|---|---|
| `SYSTEM_SUPER_ADMIN` | Global | Full system access, manages all users | Any admin role |
| `SYSTEM_ADMIN` | Global | System management, user CRUD | Any admin role |
| `PEACE_SUPER_ADMIN` | City-wide | Bureau-level peace oversight | Subcity/Woreda peace officers + viewers |
| `PEACE_OFFICER_SUBCITY` | Subcity | Subcity peace management | Woreda peace officers + viewers |
| `PEACE_OFFICER_WOREDA` | Woreda | Woreda peace management | Woreda peace officer viewers only |
| `POLICE_COMMANDER_CITY` | City-wide | City police command | City/Subcity/Woreda police + viewers |
| `POLICE_COMMANDER_SUBCITY` | Subcity | Subcity police command | Subcity/Woreda police + viewers |
| `POLICE_COMMANDER_WOREDA` | Woreda | Woreda police command | Woreda police viewers only |
| `*_VIEWER` | Same as parent | Read-only access to parent's scope | None |
| `PATROL` | Assigned area | Field patrol officers | None |
| `CITIZEN` | City-wide | Citizens reporting incidents | None |

### 4.3 Geographic Scope Rules

Each officer (peace or police) is scoped to a geographic level:
- **City-level**: Can view and manage all subcities and woredas
- **Subcity-level**: Can view and manage only their assigned subcity and its woredas
- **Woreda-level**: Can view and manage only their assigned woreda

The `HierarchyGuard` enforces these scope restrictions on API endpoints.

### 4.4 Permission System

The dashboard implements 30+ granular permissions organized by entity:

| Category | Permissions |
|---|---|
| Reports | `REPORT_VIEW`, `REPORT_CREATE`, `REPORT_EDIT`, `REPORT_DELETE`, `REPORT_ASSIGN`, `REPORT_STATUS_CHANGE` |
| Users | `USER_VIEW`, `USER_CREATE`, `USER_EDIT`, `USER_DELETE`, `USER_STATUS_CHANGE` |
| Patrols | `PATROL_VIEW`, `PATROL_CREATE`, `PATROL_EDIT`, `PATROL_DELETE` |
| Citizens | `CITIZEN_VIEW`, `CITIZEN_CREATE`, `CITIZEN_EDIT`, `CITIZEN_DELETE` |
| Cameras | `CAMERA_VIEW`, `CAMERA_CREATE`, `CAMERA_EDIT`, `CAMERA_DELETE` |
| Geo | `GEO_VIEW`, `GEO_CREATE`, `GEO_EDIT`, `GEO_DELETE` |
| Report Types | `REPORT_TYPE_VIEW`, `REPORT_TYPE_CREATE`, `REPORT_TYPE_EDIT`, `REPORT_TYPE_DELETE` |
| Chat | `CHAT_VIEW`, `CHAT_SEND` |
| Analytics | `ANALYTICS_VIEW` |
| Audit | `AUDIT_VIEW` |
| Settings | `SETTINGS_VIEW`, `SETTINGS_EDIT` |

### 4.5 Guards and Middleware

| Guard/Middleware | Purpose |
|---|---|
| `JwtAuthGuard` | Validates JWT token, attaches user to request |
| `RolesGuard` | Checks if user's role is in the `@Roles()` decorator list |
| `HierarchyGuard` | Enforces geographic scope restrictions |
| `OptionalJwtAuthGuard` | Attaches user if token present, but doesn't require it |
| Rate Limiting | 100 requests per 60 seconds globally |

### 4.6 User Creation Access Matrix

| Creator Role | Can Create Roles |
|---|---|
| `SYSTEM_SUPER_ADMIN` | All admin/staff roles |
| `SYSTEM_ADMIN` | All admin/staff roles |
| `PEACE_SUPER_ADMIN` | `PEACE_SUPER_ADMIN`, `PEACE_OFFICER_SUBCITY`, `PEACE_OFFICER_WOREDA`, `PEACE_OFFICER_*_VIEWER` |
| `PEACE_OFFICER_SUBCITY` | `PEACE_OFFICER_WOREDA`, `PEACE_OFFICER_WOREDA_VIEWER` |
| `PEACE_OFFICER_WOREDA` | `PEACE_OFFICER_WOREDA_VIEWER` |
| `POLICE_COMMANDER_CITY` | `POLICE_COMMANDER_CITY`, `POLICE_COMMANDER_SUBCITY`, `POLICE_COMMANDER_WOREDA`, `POLICE_COMMANDER_*_VIEWER` |
| `POLICE_COMMANDER_SUBCITY` | `POLICE_COMMANDER_WOREDA`, `POLICE_COMMANDER_WOREDA_VIEWER` |
| `POLICE_COMMANDER_WOREDA` | `POLICE_COMMANDER_WOREDA_VIEWER` |

---

## 5. Functional Requirements

### 5.1 Authentication Module

#### FR-AUTH-001: Citizen Registration

**Description:** Citizens register via the mobile app using phone number, full name, and PIN.

**Flow:**
1. User enters full name (≥3 chars), phone number (+251 prefix, 9 digits), PIN (4-6 digits), and confirms PIN.
2. Optional: User selects a profile photo from gallery or camera.
3. Client sends `POST /api/auth/citizen/register` (multipart).
4. Backend creates citizen record, generates OTP, sends SMS.
5. Returns `registrationToken` + `devOtp` (development mode only).

**Acceptance Criteria:**
- Phone number must match pattern `^\+?[0-9]{9,15}$`
- PIN must match pattern `^\d{4,6}$`
- Phone number must be unique
- Profile image is optional

#### FR-AUTH-002: OTP Verification

**Description:** After registration, citizens verify their phone number via OTP.

**Flow:**
1. User enters 4-6 digit OTP code.
2. Client sends `POST /api/auth/citizen/verify` with Bearer `registrationToken`.
3. Backend validates OTP, returns `setPinToken`.
4. Client sends `POST /api/auth/citizen/set-pin` with the token and PIN.
5. Citizen is now authenticated with JWT access + refresh tokens.

**Acceptance Criteria:**
- OTP expires after configured time
- Failed OTP attempts are tracked
- Rate limiting on OTP resend (configurable cooldown)

#### FR-AUTH-003: Citizen Login

**Description:** Citizens log in using phone number and PIN.

**Flow:**
1. User enters phone number and PIN.
2. Client sends `POST /api/auth/citizen/login`.
3. Backend validates credentials, returns JWT access + refresh tokens + user object.

**Acceptance Criteria:**
- Invalid credentials return appropriate error message
- Device ID is included in request for device tracking

#### FR-AUTH-004: Patrol Login

**Description:** Patrol officers log in using phone number and PIN.

**Flow:**
1. User enters phone number and PIN.
2. Client sends `POST /api/auth/patrol/login`.
3. Backend validates credentials, returns JWT tokens + patrol user object.

#### FR-AUTH-005: Admin/Dashboard Login

**Description:** Administrators and staff log in using email/phone and password.

**Flow:**
1. User enters email (or phone with +251 prefix) and password.
2. Client sends `POST /api/auth/user/login`.
3. Backend validates credentials, returns JWT tokens + user object + role + permissions.

#### FR-AUTH-006: PIN Change

**Description:** Any authenticated user can change their PIN.

**Flow:**
1. User enters current PIN, new PIN, and confirms new PIN.
2. Client sends `PATCH /api/auth/pin/change`.
3. Backend validates current PIN, updates to new PIN.

#### FR-AUTH-007: PIN Reset

**Description:** Citizens can reset forgotten PIN via OTP verification.

**Flow:**
1. User requests PIN reset with phone number.
2. Backend sends OTP via SMS.
3. User enters OTP and new PIN.
4. PIN is updated.

#### FR-AUTH-008: Guest Mode

**Description:** Citizens can browse the app without signing up.

**Behavior:**
- Guest users can view the incident map
- Guest users can track cases by case ID
- Guest users see prompts to sign in for full features
- No data is persisted server-side for guests

#### FR-AUTH-009: Token Refresh

**Description:** Access tokens are refreshed using refresh tokens.

**Endpoint:** `POST /api/auth/refresh`

#### FR-AUTH-010: Session Persistence

**Description:** Mobile app sessions are persisted locally.

**Behavior:**
- Access token, refresh token, and user data stored in SharedPreferences
- Device ID generated once and persisted (`cit-<uuid>` for citizen, `pat-<uuid>` for patrol)
- Language preference persisted separately
- On app restart, session is hydrated from local storage

### 5.2 Report Management Module

#### FR-RPT-001: Submit Incident Report

**Description:** Citizens submit incident reports with multimedia evidence.

**Input Fields:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| violationType | Enum/String | Yes | Must match a ReportType name |
| reportDescription | String | Yes | Min 5, max 500 chars |
| latitude | Float | Yes | GPS coordinate |
| longitude | Float | Yes | GPS coordinate |
| address | String | No | Reverse-geocoded address |
| isAnonymous | Boolean | No | Default: false |
| incidentDateTime | ISO DateTime | No | When the incident occurred |
| isOngoing | Boolean | No | Whether incident is ongoing |
| isEmergency | Boolean | No | Emergency flag |
| decibelLevel | Float | No | For noise reports (dB) |
| noiseAreaType | String | No | residential/commercial/industrial |
| suspectInfo | String | No | Description of suspect(s) |
| victimInfo | String | No | Description of victim(s) |
| witnessInfo | String | No | Description of witness(es) |
| images | File[] | No | Max 15 images, processed with sharp |
| video | File | No | Max 1 video |
| audio | File | No | Max 1 audio recording |

**API Endpoint:** `POST /api/reports` (multipart)

**Server Processing:**
1. Validate all fields
2. Process images: resize, generate thumbnails, store in `/uploads/`
3. Store video and audio files in `/uploads/`
4. Generate unique case ID
5. Create Report entity in database
6. Create AuditLog entry with SHA-256 hash chain
7. Create notification for assigned patrol officer
8. Emit Socket.IO notification event

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "statusCode": 201,
  "data": {
    "report": { ... },
    "caseId": "CASE-2026-XXXXX"
  }
}
```

#### FR-RPT-002: View My Reports

**Description:** Citizens view their submitted reports with status information.

**API Endpoint:** `GET /api/reports/my-reports`

**Response includes:** Report summary with status, type, case ID, address, timestamp, emergency flag.

**Client Display:**
- Pull-to-refresh
- Status badges with color coding
- Filter by status (Active vs Resolved)
- Empty state when no reports

#### FR-RPT-003: View Report Detail

**Description:** Full report detail view with all media, timeline, and metadata.

**API Endpoints:**
- `GET /api/reports/:id` — Full report data
- `GET /api/reports/:id/history` — Timeline logs

**Display Sections:**
- Status badge + emergency flag
- Reporter info (if not anonymous)
- Photo grid, video thumbnails, audio players
- Location with Google Maps link
- Detail card (type, address, area, dates, flags)
- Description text
- People involved (suspect, victim, witness)
- Assigned patrol officer
- Timeline (vertical stepper with status changes and notes)
- "Chat about this report" button

#### FR-RPT-004: Track Case by Case ID

**Description:** Users track report status using case ID without full authentication.

**API Endpoint:** `GET /api/reports/track/:caseId`

**Behavior:**
- Available to guests and authenticated users
- Shows status, type, location, timestamps
- Authenticated users can navigate to full report detail

#### FR-RPT-005: View Nearby Reports

**Description:** Citizens view reports near their current location.

**API Endpoint:** `GET /api/reports/nearby-citizen?lat={lat}&lng={lng}&radiusKm={km}`

**Behavior:**
- Uses Haversine formula for distance calculation
- Returns reports within specified radius
- Map display with color-coded markers

#### FR-RPT-006: View Report History/Timeline

**Description:** Complete audit trail for a report showing all status changes and actions.

**API Endpoint:** `GET /api/reports/:id/history`

**Timeline Events:**
- Report submitted
- Report assigned to patrol
- Patrol accepted report
- Follow-up submitted
- Report escalated
- Report resolved/closed

#### FR-RPT-007: Accept Report (Patrol)

**Description:** Patrol officer accepts an assigned report to begin investigation.

**API Endpoint:** `PATCH /api/reports/:id/accept`

**Behavior:**
- Status changes from ASSIGNED to IN_PROGRESS
- Confirmation dialog required
- Updates inspection start timestamp

#### FR-RPT-008: Submit Follow-Up (Patrol)

**Description:** Patrol officer submits follow-up evidence and notes on an active report.

**API Endpoint:** `PATCH /api/reports/:id/follow-up` (multipart)

**Input:**
| Field | Type | Required |
|---|---|---|
| notes | String | Yes |
| latitude | Float | Yes |
| longitude | Float | Yes |
| patrolEvidence | File[] | No (photos/audio) |

**Behavior:**
- Creates ReportLog entry
- Attaches patrol-submitted media
- Updates patrol notes
- Creates audit trail entry

#### FR-RPT-009: Escalate Report (Patrol)

**Description:** Patrol officer escalates a report to supervising office.

**API Endpoint:** `PATCH /api/reports/:id/escalate`

**Input:** `{ notes: string }` (mandatory)

**Behavior:**
- Status changes to ESCALATED
- Escalation notes required
- Notification sent to supervising commander

#### FR-RPT-010: Close Report (Patrol)

**Description:** Patrol officer closes a resolved report.

**API Endpoint:** `PATCH /api/reports/:id/close`

**Behavior:**
- Confirmation dialog required
- Status changes to CLOSED
- Updates inspection completion timestamp

#### FR-RPT-011: View Nearby Reports with Radius (Patrol)

**Description:** Patrol officers search for reports within a configurable radius.

**API Endpoint:** `GET /api/reports/nearby?radiusKm={km}`

**Behavior:**
- Slider for radius selection (1-50 km, default 10 km)
- Shows distance from patrol office
- Pull-to-refresh

#### FR-RPT-012: View Reports by Status (Patrol)

**Description:** Patrol officers filter assigned reports by status.

**API Endpoint:** `GET /api/reports/assigned-to-me`

**Filter Options:** All, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED

#### FR-RPT-013: Create Report (Dashboard)

**Description:** Admin users create reports on behalf of citizens.

**API Endpoint:** `POST /api/reports` (with admin authentication)

**Additional Fields:**
- `reporterPhone`: Phone number of the citizen reporter
- `reporterName`: Name of the citizen reporter

### 5.3 Report Types Module

#### FR-RT-001: Pre-seeded Report Types

**Description:** System ships with 11 pre-configured report types:

| Report Type | Description |
|---|---|
| `NOISE` | Noise pollution (residential/commercial thresholds) |
| `LITTERING` | Illegal littering |
| `VANDALISM` | Property vandalism |
| `AIR_POLLUTION` | Air quality violations |
| `WATER_POLLUTION` | Water contamination |
| `SOIL_CONTAMINATION` | Soil contamination |
| `ILLEGAL_DUMPING` | Illegal waste dumping |
| `DEFORESTATION` | Unauthorized deforestation |
| `HAZARDOUS_WASTE` | Hazardous waste disposal |
| `WILDLIFE_POACHING` | Wildlife poaching |
| `OTHERS` | Other environmental/security incidents |

#### FR-RT-002: Report Type CRUD (Dashboard)

**Description:** Admins manage report types.

**API Endpoints:**
- `GET /api/report-types` — List all (paginated, searchable)
- `POST /api/report-types` — Create new
- `PATCH /api/report-types/:id` — Update
- `DELETE /api/report-types/:id` — Delete (soft)

**Fields per Report Type:**
- `name`: Unique identifier string
- `description`: Human-readable description
- `isActive`: Whether type is available for new reports
- `residentialDecibelThreshold`: dB threshold for residential noise
- `commercialDecibelThreshold`: dB threshold for commercial noise

### 5.4 Chat/Messaging Module

#### FR-CHAT-001: Open Conversation for Report

**Description:** Any participant in a report can initiate a chat conversation.

**API Endpoint:** `GET /api/chat/conversations/report/:reportId`

**Behavior:**
- Creates conversation if none exists
- Links conversation to the report
- All report participants (citizen, assigned patrol, admins) can join

#### FR-CHAT-002: Real-Time Messaging

**Description:** Bidirectional real-time messaging within report-scoped conversations.

**Socket.IO Events (Client → Server):**
| Event | Payload | Purpose |
|---|---|---|
| `chat:join` | `{conversationId}` | Join a conversation room |
| `chat:leave` | `{conversationId}` | Leave a conversation room |
| `chat:send` | `{conversationId, content, senderType, senderId, senderName}` | Send a message |
| `chat:typing` | `{conversationId, isTyping, senderName}` | Typing indicator |
| `chat:read` | `{conversationId, readerId, readerName}` | Mark conversation as read |

**Socket.IO Events (Server → Client):**
| Event | Payload | Purpose |
|---|---|---|
| `chat:message` | `Message` object | New message received |
| `chat:typing` | `{conversationId, isTyping, senderName}` | Remote typing status |
| `chat:conversation_created` | `{reportId}` | New conversation created |

**Behavior:**
- Optimistic message insertion (pending ID, replaced on server response)
- REST API fallback if Socket.IO send fails
- Message pagination (page, limit)
- Auto-scroll to bottom on new messages
- Typing indicator with debounce

#### FR-CHAT-003: Conversation List

**Description:** View all active conversations with last message preview.

**API Endpoint:** `GET /api/chat/conversations`

**Display:**
- Conversation title (case ID + report type)
- Last message preview with sender name
- Timestamp (relative: "5m ago")
- Unread count badge (red pill, max 9+)
- Pull-to-refresh

#### FR-CHAT-004: Message History

**Description:** Fetch paginated message history for a conversation.

**API Endpoint:** `GET /api/chat/conversations/:id/messages?page={n}&limit={m}`

**Display:**
- Message bubbles: own (blue, right-aligned), others' (white, left-aligned)
- Sender name for consecutive messages from different senders
- Timestamp under each message
- Read status indicators

#### FR-CHAT-005: Mark Conversation as Read

**Description:** Mark all messages in a conversation as read.

**API Endpoint:** `PATCH /api/chat/conversations/:id/read`

### 5.5 Notification Module

#### FR-NOT-001: Real-Time Notifications

**Description:** Push notifications delivered via Socket.IO root namespace.

**Socket.IO Setup:**
- Client connects to root namespace with JWT auth
- Client emits `authenticate` with `{userId, role}`
- Server joins client to `user:{id}` and `role:{role}` rooms

**Server → Client Events:**
| Event | Payload | Purpose |
|---|---|---|
| `notification` | `AppNotification` object | New notification received |
| `unread_count` | `{count: number}` | Updated unread count |

#### FR-NOT-002: Notification Types

| Type | Trigger | Icon |
|---|---|---|
| `REPORT_SUBMITTED` | Citizen submits report | Message envelope |
| `REPORT_ASSIGNED` | Report assigned to patrol | Police officer |
| `REPORT_STATUS_UPDATED` | Report status changes | Cycle/refresh |
| `PATROL_FOLLOW_UP` | Patrol submits follow-up | Memo |

#### FR-NOT-003: Notification Management

**API Endpoints:**
- `GET /api/notifications?limit={n}` — List notifications
- `GET /api/notifications/unread-count` — Get unread count
- `POST /api/notifications/:id/mark-read` — Mark single as read
- `POST /api/notifications/mark-all-read` — Mark all as read

**Display Locations:**
- Home screen badge (max "9+")
- Notifications screen (full list with type icons)
- Settings screen (inline notifications tab)
- Dashboard header dropdown

#### FR-NOT-004: Notification Database Persistence

**Description:** All notifications are persisted in the database and linked to users.

**Notification Entity Fields:**
- `id`: UUID
- `title`: Notification title
- `message`: Notification body
- `type`: Enum (REPORT_SUBMITTED, REPORT_ASSIGNED, etc.)
- `data`: JSON (contains `reportId`, etc.)
- `isRead`: Boolean
- `userId`: Target user ID
- `userType`: Target user type (CITIZEN, PATROL, USER)

### 5.6 User Management Module (Dashboard)

#### FR-USER-001: User CRUD

**Description:** Admins create, read, update, and delete system users.

**API Endpoints:**
- `GET /api/users` — List users (paginated, filterable by role, status, search)
- `POST /api/users/register` — Create user (multipart with optional profileImage)
- `PATCH /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user
- `PATCH /api/users/:id/toggle-status` — Enable/disable user
- `POST /api/users/:id/reset-password` — Reset user password

**User Form Fields:**
- Full name, email, phone (+251 prefix)
- Role selection (filtered by creator's role)
- Geographic assignment (city/subcity/woreda based on role)
- Patrol-specific: station, office address, lat/lng, commander assignment
- Permissions (searchable grouped picker)
- Profile image upload

#### FR-USER-002: Patrol Officer CRUD

**Description:** Admins manage patrol officers.

**API Endpoints:**
- `GET /api/patrols` — List patrol officers
- `POST /api/patrols` — Create patrol officer
- `PATCH /api/patrols/:id` — Update
- `DELETE /api/patrols/:id` — Delete
- `PATCH /api/patrols/:id/toggle-status` — Enable/disable
- `PATCH /api/patrols/:id/location` — Update current location

**Patrol-Specific Fields:**
- Assigned area, office address, office lat/lng
- Current lat/lng (for fleet map)
- Patrol team assignment

#### FR-USER-003: Citizen Management (Dashboard)

**Description:** Admins view and manage citizen accounts.

**API Endpoints:**
- `GET /api/citizens` — List citizens (paginated, searchable)
- `GET /api/citizens/:id` — Citizen detail
- `PATCH /api/citizens/:id` — Update citizen
- `DELETE /api/citizens/:id` — Delete citizen
- `PATCH /api/citizens/:id/toggle-status` — Enable/disable

### 5.7 Geographic Management Module

#### FR-GEO-001: Geographic Hierarchy

**Description:** Three-level geographic hierarchy: City → Subcity → Woreda.

**Seeded Data:**
- City: Addis Ababa (code: `AA`)
- 4 Subcities: Bole, Kirkos, Yeka, Addis Ketema
- 2 Woredas in Bole: Bole Michael, Bole Medhanealem

**API Endpoints:**
- `GET /api/geo/cities` — List cities
- `POST /api/geo/cities` — Create city
- `GET /api/geo/subcities` — List subcities (filterable by city)
- `POST /api/geo/subcities` — Create subcity
- `GET /api/geo/woredas` — List woredas (filterable by subcity)
- `POST /api/geo/woredas` — Create woreda
- CRUD for each level

**Dashboard Display:**
- Role-based tab visibility (city officers see cities tab, subcity officers see subcities, etc.)
- Map picker for selecting coordinates
- Hierarchical drill-down navigation

### 5.8 Camera Management Module

#### FR-CAM-001: Camera CRUD

**Description:** Admins manage surveillance cameras.

**API Endpoints:**
- `GET /api/cameras` — List cameras
- `POST /api/cameras` — Register camera
- `PATCH /api/cameras/:id` — Update camera
- `DELETE /api/cameras/:id` — Delete camera

**Camera Fields:**
- Camera ID (unique identifier)
- Location description
- Latitude/Longitude
- Stream URL
- Active status

**Dashboard Display:**
- Grid view (table/card layout)
- Map view (markers on Google Maps)

### 5.9 Patrol Team Module

#### FR-TEAM-001: Patrol Team Management

**Description:** Create and manage patrol teams with member assignment.

**API Endpoints:**
- `GET /api/patrol-teams/my` — Get my team (patrol app)
- `GET /api/patrol-teams` — List all teams (dashboard)
- `POST /api/patrol-teams` — Create team
- `PATCH /api/patrol-teams/:id` — Update team
- `DELETE /api/patrol-teams/:id` — Delete team
- `POST /api/patrol-teams/:id/members` — Add member
- `DELETE /api/patrol-teams/:id/members/:memberId` — Remove member

**Team Fields:**
- Name, code, woreda assignment
- Leader (patrol officer)
- Members (list of patrol officers)

**Access Restriction:** Only Woreda Police Commanders can manage patrol teams.

**Patrol App Display:**
- Team name, woreda, code badge
- Member list with avatar, name, phone, online/offline status
- Leader badge

### 5.10 Work Reports Module (Patrol)

#### FR-WORK-001: Submit Work Report

**Description:** Patrol officers submit daily work reports.

**API Endpoint:** `POST /api/work-reports`

**Input Fields:**
| Field | Type | Required |
|---|---|---|
| title | String | Yes |
| description | String | Yes |
| reportDate | ISO Date | No (defaults to today) |
| latitude | Float | No |
| longitude | Float | No |

#### FR-WORK-002: View Work Reports

**Description:** Patrol officers view their work report history.

**API Endpoint:** `GET /api/work-reports?status={status}&limit={n}`

**Filter Options:** All, SUBMITTED, APPROVED, REJECTED

#### FR-WORK-003: Review Work Reports (Dashboard)

**Description:** Admins approve or reject patrol work reports.

**API Endpoints:**
- `GET /api/work-reports` — List all (with status filter)
- `GET /api/work-reports/:id` — Detail
- `PATCH /api/work-reports/:id/approve` — Approve
- `PATCH /api/work-reports/:id/reject` — Reject (with review note)

### 5.11 Dashboard & Analytics Module

#### FR-DASH-001: Dashboard Overview

**Description:** Main dashboard with key metrics and visualizations.

**Metrics Displayed:**
- Total reports
- High priority (emergency) reports
- Average response time
- Top incident location
- Reports by status (bar chart)
- Report trends over time (line chart)
- Reports by category (donut chart)
- Recent activity feed

**API Endpoints:**
- `GET /api/dashboard/stats` — Summary statistics
- `GET /api/dashboard/reports` — Recent reports
- `GET /api/dashboard/fleet` — Patrol locations

**Features:**
- CSV export
- PDF export

#### FR-DASH-002: Analytics Page

**Description:** Detailed analytics with time-range filtering.

**API Endpoint:** `GET /api/analytics?timeRange={range}`

**Visualizations:**
- 4 KPI stat cards
- Status bar chart
- Monthly line chart
- Category donut chart
- Export to CSV and PDF

#### FR-DASH-003: Fleet Map

**Description:** Live map showing patrol officer locations and report locations.

**Behavior:**
- Google Maps with markers for patrol officers, citizens, and reports
- Auto-refresh every 15 seconds
- Color-coded markers by entity type
- Info windows on marker click

#### FR-DASH-004: Report Management (Dashboard)

**Description:** Full CRUD for reports with patrol assignment.

**API Endpoints:**
- `GET /api/reports` — List all reports (paginated, filterable)
- `POST /api/reports` — Create report (as admin)
- `GET /api/reports/:id` — Report detail
- `PATCH /api/reports/:id` — Update report
- `DELETE /api/reports/:id` — Delete report
- `PATCH /api/reports/:id/assign` — Assign to patrol
- `PATCH /api/reports/:id/accept` — Accept report
- `PATCH /api/reports/:id/close` — Close report
- `PATCH /api/reports/:id/escalate` — Escalate
- `PATCH /api/reports/:id/follow-up` — Submit follow-up
- `PATCH /api/reports/:id/review` — Review (approve/reject)

### 5.12 Audit Trail Module

#### FR-AUD-001: Audit Log Recording

**Description:** All significant system actions are recorded in an immutable audit trail.

**Implementation:**
- SHA-256 hash chain for tamper detection
- Each log entry includes: entity, action, actor, timestamp, changes, IP address
- Chain verification endpoint to detect integrity breaches

#### FR-AUD-002: Audit Log Viewing (Dashboard)

**Description:** Three-tab audit system.

**Tabs:**
1. **Audit Trail** — All system actions with entity filtering
2. **Security Events** — Login attempts, permission changes, etc.
3. **Data Access Events** — Who accessed what data and when

**API Endpoints:**
- `GET /api/audit` — List audit logs (paginated, filterable)
- `GET /api/audit/security-events` — Security-specific events
- `GET /api/audit/data-access` — Data access events
- `GET /api/audit/verify-chain` — Verify hash chain integrity

**Features:**
- Entity type filtering
- Date range filtering
- Actor filtering
- CSV and PDF export

### 5.13 Media Management Module

#### FR-MEDIA-001: File Upload and Processing

**Description:** Backend processes uploaded media files.

**Processing Pipeline:**
1. Receive multipart upload
2. Validate file types and sizes
3. Process images with `sharp`:
   - Resize to max dimensions
   - Generate thumbnails
   - Optimize quality
4. Store original + processed files in `/uploads/`
5. Return relative URLs

**File Serving:** `GET /uploads/{filename}` (no `/api` prefix)

#### FR-MEDIA-002: Evidence Categories

| Category | Attached By | Storage Field |
|---|---|---|
| Report images | Citizen | `imageUrls[]` |
| Report video | Citizen | `videoUrls[]` |
| Report audio | Citizen | `audioUrls[]` |
| Patrol evidence | Patrol officer | `patrolImageUrls[]`, `patrolVideoUrls[]`, `patrolAudioUrls[]` |
| Profile images | Any user | `profileImage` |

### 5.14 Map Module (Citizen App)

#### FR-MAP-001: Incident Map

**Description:** Interactive map showing nearby incidents.

**Features:**
- Google Maps with color-coded incident markers:
  - Red: Crime/emergency reports
  - Orange: Illegal activity reports
  - Blue: Security threat reports
  - Green: Other reports
- Filter chips: All, Emergency, Illegal Activity, Security Threat
- Selected marker highlighted in violet
- Bottom sheet with report summary on marker tap
- Legend showing color coding
- Auto-center on Addis Ababa

### 5.15 Internationalization (i18n)

#### FR-I18N-001: Multi-Language Support

**Supported Languages:**
| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `am` | Amharic | Ge'ez |
| `om` | Afaan Oromoo | Latin |
| `ti` | Tigrinya | Ge'ez |

**Implementation:**
- Custom `AppLocalizations` class with inline dictionary
- `AppLocalizationsScope` InheritedWidget
- `LanguageBloc` (Cubit) manages current language
- Language persisted in SharedPreferences
- Language switcher in Home screen and Settings
- All 85+ UI strings translated in all 4 languages
- Parameterized strings: `goodMorning: "Good Morning, {name}"`

### 5.16 Settings Module

#### FR-SET-001: Profile Display

**Description:** User profile information display.

**Citizen App:**
- Avatar (from `profileImage` URL or default icon)
- Full name, phone number
- Guest mode shows "Guest" with login prompt

**Patrol App:**
- Avatar with initials fallback
- Full name, user code, phone number
- Assigned area
- Office address

#### FR-SET-002: Change PIN

**Description:** Secure PIN change flow.

**Fields:** Current PIN, New PIN, Confirm New PIN

**Validation:**
- PINs must match
- Must be 4-6 digits
- Current PIN must be correct

#### FR-SET-003: Language Settings

**Description:** Language preference management.

**Options:** English, Amharic, Afaan Oromoo, Tigrinya

**Persistence:** Saved to SharedPreferences, applied immediately across the app.

#### FR-SET-004: Logout

**Description:** Secure session termination.

**Behavior:**
- Disconnects all Socket.IO connections
- Clears all stored session data
- Redirects to splash/onboarding screen
- Confirmation dialog before logout

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target |
|---|---|
| API response time (P95) | < 500ms |
| Page load time (dashboard) | < 3 seconds |
| Mobile app startup | < 2 seconds |
| Real-time message latency | < 200ms |
| Concurrent users | 1000+ |
| Database query time (P95) | < 100ms |
| File upload (10MB image) | < 10 seconds |

### 6.2 Scalability

- Horizontal scaling via load balancer
- Redis caching for frequently accessed data
- PostgreSQL connection pooling
- Socket.IO adapter for multi-instance support
- Pagination on all list endpoints

### 6.3 Availability

| Requirement | Target |
|---|---|
| System uptime | 99.9% |
| Planned downtime | < 4 hours/month |
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 5 minutes |

### 6.4 Security

| Requirement | Implementation |
|---|---|
| Authentication | JWT with access + refresh tokens |
| Password/PIN hashing | bcrypt with salt rounds |
| HTTPS | Enforced in production |
| CORS | Configurable allowed origins |
| Rate limiting | 100 requests/60 seconds globally |
| Input validation | class-validator on all DTOs |
| SQL injection | TypeORM parameterized queries |
| File upload security | File type validation, size limits |
| Audit trail | SHA-256 hash chain for tamper detection |
| OTP security | Rate limiting, expiry, attempt tracking |
| Device tracking | Device ID headers (x-device-id) |
| Token refresh | Automatic refresh on 401 responses |

### 6.5 Usability

| Requirement | Target |
|---|---|
| Language support | 4 languages (en, am, om, ti) |
| Accessibility | Material Design 3 compliance |
| Mobile responsiveness | Full mobile optimization |
| Error messages | User-friendly, localized |
| Loading states | Visual feedback on all async operations |
| Pull-to-refresh | On all list screens |
| Offline indicators | Connection status awareness |

### 6.6 Maintainability

| Requirement | Standard |
|---|---|
| Code style | No comments, match existing conventions |
| Architecture | Feature-based modular structure |
| State management | BLoC pattern (mobile), Redux Toolkit (dashboard) |
| API design | RESTful with consistent envelope responses |
| Documentation | AGENTS.md for agent-assisted development |
| Testing | Unit tests for business logic, widget tests for UI |

### 6.7 Portability

| Component | Platforms |
|---|---|
| Citizen App | Android (primary), iOS, Web |
| Patrol App | Android (primary), iOS |
| Admin Dashboard | Modern browsers (Chrome, Firefox, Safari, Edge) |
| Backend | Docker containers (Linux) |

---

## 7. Database Schema

### 7.1 Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   citizens    │     │     reports       │     │   patrols    │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │◀──┐ │ id (PK)          │  ┌─▶│ id (PK)      │
│ userCode     │   │ │ caseId (unique)  │  │  │ userCode     │
│ fullName     │   │ │ reporterId (FK)  │──┘  │ fullName     │
│ phoneNumber  │   │ │ reporterType     │     │ phoneNumber  │
│ pinHash      │   │ │ patrolId (FK)    │────▶│ role         │
│ role         │   │ │ reportTypeId(FK) │──┐  │ assignedArea │
│ profileImage │   │ │ violationType    │  │  │ officeAddress│
│ status       │   │ │ description      │  │  │ latitude     │
│ deviceId     │   │ │ latitude         │  │  │ longitude    │
│ createdAt    │   │ │ longitude        │  │  │ teamId (FK)  │──┐
└──────────────┘   │ │ address          │  │  └──────────────┘  │
                   │ │ area             │  │                    │
┌──────────────┐   │ │ imageUrls[]      │  │  ┌──────────────┐  │
│   users       │   │ │ videoUrls[]      │  │  │patrol_teams  │  │
├──────────────┤   │ │ audioUrls[]      │  │  ├──────────────┤  │
│ id (PK)      │   │ │ evidenceUrls[]   │  │  │ id (PK)      │◀─┘
│ fullName     │   │ │ patrolEvidence[]  │  │  │ name         │
│ email        │   │ │ status           │  │  │ code         │
│ phoneNumber  │   │ │ isAnonymous      │  │  │ woredaId(FK) │
│ passwordHash │   │ │ isEmergency      │  │  │ leaderId(FK) │
│ role         │   │ │ isOngoing        │  │  └──────────────┘
│ permissions[]│   │ │ suspectInfo      │  │
│ cityId (FK)  │   │ │ victimInfo       │  │  ┌──────────────┐
│ subcityId(FK)│   │ │ witnessInfo      │  │  │conversations │
│ woredaId(FK) │   │ │ decibelLevel     │  │  ├──────────────┤
│ status       │   │ │ noiseAreaType    │  │  │ id (PK)      │
│ profileImage │   │ │ assignedAt       │  │  │ reportId(FK) │──┘
│ createdAt    │   │ │ inspectionStart  │  │  │ createdAt    │
└──────────────┘   │ │ inspectionEnd    │  │  │ updatedAt    │
                   │ │ patrolNotes      │  │  └──────────────┘
┌──────────────┐   │ │ rejectionReason  │  │
│report_types  │   │ │ createdAt        │  │  ┌──────────────┐
├──────────────┤   │ │ updatedAt        │  │  │  messages     │
│ id (PK)      │◀──┘ └──────────────────┘  │  ├──────────────┤
│ name         │                            │  │ id (PK)      │
│ description  │     ┌──────────────────┐  │  │conversationId│──┘
│ isActive     │     │  notifications   │  │  │ senderId     │
│ residentialDB│     ├──────────────────┤  │  │ senderType   │
│ commercialDB │     │ id (PK)          │  │  │ senderName   │
└──────────────┘     │ title            │  │  │ content      │
                     │ message          │  │  │ isRead       │
┌──────────────┐     │ type             │  │  │ createdAt    │
│    cities     │     │ data (JSON)      │  │  └──────────────┘
├──────────────┤     │ isRead           │  │
│ id (PK)      │     │ userId           │  │  ┌──────────────┐
│ name         │     │ userType         │  │  │  audit_logs   │
│ code (unique)│     │ createdAt        │  │  ├──────────────┤
│ country      │     └──────────────────┘  │  │ id (PK)      │
│ latitude     │                            │  │ entityType   │
│ longitude    │     ┌──────────────────┐  │  │ entityId     │
│ createdAt    │     │  report_logs     │  │  │ action       │
└──────┬───────┘     ├──────────────────┤  │  │ actorId      │
       │             │ id (PK)          │  │  │ actorType    │
       ▼             │ reportId (FK)    │──┘  │ changes(JSON)│
┌──────────────┐     │ status           │     │ ipAddress    │
│  subcities   │     │ note             │     │ hash         │
├──────────────┤     │ changedById      │     │ previousHash │
│ id (PK)      │     │ changedByType    │     │ createdAt    │
│ name         │     │ changedByName    │     └──────────────┘
│ cityId (FK)  │     │ createdAt        │
│ latitude     │     └──────────────────┘
│ longitude    │
│ createdAt    │     ┌──────────────────┐
└──────┬───────┘     │  work_reports     │
       │             ├──────────────────┤
       ▼             │ id (PK)          │
┌──────────────┐     │ title            │
│   woredas    │     │ description      │
├──────────────┤     │ reportDate       │
│ id (PK)      │     │ status           │
│ name         │     │ reporterId(FK)   │
│ subcityId(FK)│     │ reporterType     │
│ latitude     │     │ reviewNote       │
│ longitude    │     │ latitude         │
│ createdAt    │     │ longitude        │
└──────────────┘     │ createdAt        │
                     └──────────────────┘

┌──────────────┐     ┌──────────────────┐
│   cameras     │     │   settings       │
├──────────────┤     ├──────────────────┤
│ id (PK)      │     │ id (PK)          │
│ cameraId     │     │ key (unique)     │
│ location     │     │ value            │
│ latitude     │     │ description      │
│ longitude    │     │ updatedById      │
│ streamUrl    │     │ createdAt        │
│ isActive     │     │ updatedAt        │
│ createdAt    │     └──────────────────┘
│ updatedAt    │
└──────────────┘
```

### 7.2 Key Entity Details

#### Report Status Flow

```
SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
                 ↓            ↓
              ESCALATED    REJECTED
```

Status transitions:
| From | To | Triggered By |
|---|---|---|
| SUBMITTED | ASSIGNED | Admin assigns patrol |
| ASSIGNED | IN_PROGRESS | Patrol accepts |
| IN_PROGRESS | RESOLVED | Patrol follow-up |
| IN_PROGRESS | ESCALATED | Patrol escalates |
| ASSIGNED | ESCALATED | Patrol escalates |
| RESOLVED | CLOSED | Patrol closes |
| Any | REJECTED | Admin rejects |

### 7.3 Seed Data

The system automatically seeds:
- **GeoSeederService**: Addis Ababa city (code `AA`) + 4 subcities + 2 woredas
- **AdminSeederService**: 16 staff/viewer users, 3 patrol officers, 3 citizens (password: `admin123`, PIN: `1234`)
- **ReportTypeSeederService**: 11 report types with descriptions and decibel thresholds

---

## 8. API Specification

### 8.1 Global Configuration

| Property | Value |
|---|---|
| Base URL | `http://host:5001/api` |
| Content Type | `application/json` (or `multipart/form-data` for uploads) |
| Authentication | `Authorization: Bearer <jwt>` |
| Device Headers | `x-device-id`, `x-device-platform`, `x-app-version`, `x-user-role` |

### 8.2 Response Envelope

All API responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "statusCode": 200,
  "data": { ... }
}
```

For paginated responses:
```json
{
  "success": true,
  "message": "Data retrieved",
  "statusCode": 200,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### 8.3 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/citizen/register` | None | Register citizen (multipart) |
| POST | `/auth/citizen/login` | None | Citizen login |
| POST | `/auth/citizen/pre-login` | None | Pre-login check |
| POST | `/auth/citizen/verify` | Bearer registrationToken | Verify OTP |
| POST | `/auth/citizen/resend-otp` | Bearer registrationToken | Resend OTP |
| POST | `/auth/citizen/set-pin` | Bearer setPinToken | Set PIN after OTP |
| POST | `/auth/citizen/pin-reset/request` | None | Request PIN reset |
| POST | `/auth/citizen/pin-reset/confirm` | Bearer resetToken | Confirm PIN reset |
| POST | `/auth/patrol/login` | None | Patrol login |
| POST | `/auth/user/login` | None | Admin/staff login |
| POST | `/auth/refresh` | None | Refresh access token |
| PATCH | `/auth/pin/change` | JWT | Change PIN |

### 8.4 Report Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/reports` | JWT (citizen) | CITIZEN | Submit report (multipart) |
| GET | `/reports/my-reports` | JWT | CITIZEN | My reports |
| GET | `/reports/nearby-citizen` | JWT | CITIZEN | Nearby reports |
| GET | `/reports/stats` | JWT | Any | Home screen statistics |
| GET | `/reports/:id` | JWT | Any | Report detail |
| GET | `/reports/track/:caseId` | Optional | Any | Track by case ID |
| GET | `/reports/:id/history` | JWT | Any | Report timeline |
| GET | `/reports/assigned-to-me` | JWT | PATROL | Assigned reports |
| GET | `/reports/nearby` | JWT | PATROL | Nearby (radius) |
| PATCH | `/reports/:id/accept` | JWT | PATROL | Accept report |
| PATCH | `/reports/:id/follow-up` | JWT | PATROL | Submit follow-up |
| PATCH | `/reports/:id/escalate` | JWT | PATROL | Escalate report |
| PATCH | `/reports/:id/close` | JWT | PATROL | Close report |
| GET | `/reports` | JWT | Admin | List all reports |
| POST | `/reports` | JWT | Admin | Create report |
| PATCH | `/reports/:id` | JWT | Admin | Update report |
| DELETE | `/reports/:id` | JWT | Admin | Delete report |
| PATCH | `/reports/:id/assign` | JWT | Admin | Assign to patrol |

### 8.5 Chat Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/chat/conversations` | JWT | List conversations |
| GET | `/chat/conversations/report/:reportId` | JWT | Open/get conversation |
| GET | `/chat/conversations/:id/messages` | JWT | Fetch messages (paginated) |
| POST | `/chat/conversations/:id/messages` | JWT | Send message (REST) |
| PATCH | `/chat/conversations/:id/read` | JWT | Mark as read |

### 8.6 Notification Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | List notifications |
| GET | `/notifications/unread-count` | JWT | Unread count |
| POST | `/notifications/:id/mark-read` | JWT | Mark single read |
| POST | `/notifications/mark-all-read` | JWT | Mark all read |

### 8.7 User Management Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | JWT (Admin) | List users |
| POST | `/users/register` | JWT (Admin) | Create user (multipart) |
| GET | `/users/:id` | JWT (Admin) | User detail |
| PATCH | `/users/:id` | JWT (Admin) | Update user |
| DELETE | `/users/:id` | JWT (Admin) | Delete user |
| PATCH | `/users/:id/toggle-status` | JWT (Admin) | Toggle status |
| POST | `/users/:id/reset-password` | JWT (Admin) | Reset password |

### 8.8 Patrol Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/patrols` | JWT (Admin) | List patrols |
| POST | `/patrols` | JWT (Admin) | Create patrol |
| GET | `/patrols/:id` | JWT (Admin) | Patrol detail |
| PATCH | `/patrols/:id` | JWT (Admin) | Update patrol |
| DELETE | `/patrols/:id` | JWT (Admin) | Delete patrol |
| PATCH | `/patrols/:id/toggle-status` | JWT (Admin) | Toggle status |
| PATCH | `/patrols/:id/location` | JWT (Patrol) | Update location |
| GET | `/patrols/me/profile` | JWT (Patrol) | My profile |

### 8.9 Citizen Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/citizens` | JWT (Admin) | List citizens |
| GET | `/citizens/:id` | JWT (Admin) | Citizen detail |
| PATCH | `/citizens/:id` | JWT (Admin) | Update citizen |
| DELETE | `/citizens/:id` | JWT (Admin) | Delete citizen |
| PATCH | `/citizens/:id/toggle-status` | JWT (Admin) | Toggle status |

### 8.10 Geographic Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/geo/cities` | JWT | List cities |
| POST | `/geo/cities` | JWT (Admin) | Create city |
| GET | `/geo/subcities` | JWT | List subcities |
| POST | `/geo/subcities` | JWT (Admin) | Create subcity |
| GET | `/geo/woredas` | JWT | List woredas |
| POST | `/geo/woredas` | JWT (Admin) | Create woreda |

### 8.11 Other Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/report-types` | JWT | List report types |
| POST | `/report-types` | JWT (Admin) | Create report type |
| PATCH | `/report-types/:id` | JWT (Admin) | Update report type |
| DELETE | `/report-types/:id` | JWT (Admin) | Delete report type |
| GET | `/cameras` | JWT (Admin) | List cameras |
| POST | `/cameras` | JWT (Admin) | Create camera |
| PATCH | `/cameras/:id` | JWT (Admin) | Update camera |
| DELETE | `/cameras/:id` | JWT (Admin) | Delete camera |
| GET | `/patrol-teams` | JWT (Admin) | List teams |
| GET | `/patrol-teams/my` | JWT (Patrol) | My team |
| POST | `/patrol-teams` | JWT (Admin) | Create team |
| PATCH | `/patrol-teams/:id` | JWT (Admin) | Update team |
| DELETE | `/patrol-teams/:id` | JWT (Admin) | Delete team |
| GET | `/work-reports` | JWT | List work reports |
| GET | `/work-reports/:id` | JWT | Work report detail |
| POST | `/work-reports` | JWT (Patrol) | Submit work report |
| PATCH | `/work-reports/:id/approve` | JWT (Admin) | Approve work report |
| PATCH | `/work-reports/:id/reject` | JWT (Admin) | Reject work report |
| GET | `/dashboard/stats` | JWT (Admin) | Dashboard statistics |
| GET | `/dashboard/reports` | JWT (Admin) | Recent reports |
| GET | `/dashboard/fleet` | JWT (Admin) | Fleet locations |
| GET | `/analytics` | JWT (Admin) | Analytics data |
| GET | `/audit` | JWT (Admin) | Audit logs |
| GET | `/audit/security-events` | JWT (Admin) | Security events |
| GET | `/audit/data-access` | JWT (Admin) | Data access events |
| GET | `/audit/verify-chain` | JWT (Admin) | Verify hash chain |
| GET | `/settings` | JWT (Admin) | Get settings |
| PATCH | `/settings` | JWT (Admin) | Update settings |
| GET | `/chat/conversations` | JWT | List conversations |
| GET | `/chat/conversations/report/:reportId` | JWT | Open conversation |
| GET | `/chat/conversations/:id/messages` | JWT | Fetch messages |
| POST | `/chat/conversations/:id/messages` | JWT | Send message |
| PATCH | `/chat/conversations/:id/read` | JWT | Mark read |
| GET | `/notifications` | JWT | List notifications |
| GET | `/notifications/unread-count` | JWT | Unread count |
| POST | `/notifications/:id/mark-read` | JWT | Mark read |
| POST | `/notifications/mark-all-read` | JWT | Mark all read |

---

## 9. Real-Time Communication

### 9.1 Socket.IO Architecture

The backend runs two Socket.IO gateways:

#### Gateway 1: Notifications (Root Namespace `/`)

**Authentication:**
```javascript
// Client connects with JWT in auth config
io(token: 'jwt_token_here')

// Client emits after connection
socket.emit('authenticate', { userId, role })
```

**Events:**
| Direction | Event | Data |
|---|---|---|
| Client → Server | `authenticate` | `{userId, role}` |
| Server → Client | `notification` | `AppNotification` object |
| Server → Client | `unread_count` | `{count: number}` |

**Room Assignment:**
- `user:{id}` — Individual user room
- `role:{role}` — Role-based broadcast room

#### Gateway 2: Chat (`/chat` Namespace)

**Events:**
| Direction | Event | Data |
|---|---|---|
| Client → Server | `chat:join` | `{conversationId}` |
| Client → Server | `chat:leave` | `{conversationId}` |
| Client → Server | `chat:send` | `{conversationId, content, senderType, senderId, senderName}` |
| Client → Server | `chat:typing` | `{conversationId, isTyping, senderName}` |
| Client → Server | `chat:read` | `{conversationId, readerId, readerName}` |
| Server → Client | `chat:message` | `Message` object |
| Server → Client | `chat:typing` | `{conversationId, isTyping, senderName}` |
| Server → Client | `chat:conversation_created` | `{reportId}` |

### 9.2 Client-Side Socket Implementation

**Mobile Apps (Flutter):**
- Package: `socket_io_client` 3.1.2
- Two singleton connections managed by `SocketService`
- Streams exposed via `StreamController` for BLoC consumption
- Automatic reconnection handling
- Token-based authentication on connect

**Dashboard (Next.js):**
- Package: `socket.io-client` via React hooks
- Single connection with namespace multiplexing
- Context providers for notifications and chat

### 9.3 Message Delivery Guarantees

- Optimistic UI updates (messages appear immediately)
- Server persistence as source of truth
- REST API fallback for message sending
- Message deduplication on client
- Read receipts for conversation tracking

---

## 10. Security Requirements

### 10.1 Authentication & Authorization

- JWT tokens with configurable expiry
- Refresh token rotation on use
- Role-based access control (RBAC) with 25 roles
- Geographic hierarchy enforcement via `HierarchyGuard`
- Optional JWT for public endpoints (e.g., case tracking)

### 10.2 Data Protection

- Passwords hashed with bcrypt
- PINs hashed with bcrypt
- OTPs expire after configured time
- Rate limiting: 100 requests per 60 seconds globally
- OTP cooldown: configurable between resend attempts
- OTP lockout after failed attempt threshold

### 10.3 Audit & Compliance

- SHA-256 hash chain for audit log integrity
- Chain verification endpoint detects tampering
- All report state changes logged with actor, timestamp, and IP
- User creation/deletion logged
- Permission changes logged

### 10.4 Network Security

- CORS configurable per environment
- Development mode allows all origins
- Production mode restricts to `ALLOWED_ORIGINS`
- HTTPS enforced in production
- Secure WebSocket connections (wss://) in production

### 10.5 File Upload Security

- File type validation (images, video, audio only)
- Maximum file sizes enforced
- Files stored outside web root
- Thumbnail generation prevents serving oversized originals
- File names sanitized

---

## 11. Deployment Architecture

### 11.1 Docker Compose Stack

```yaml
services:
  postgres:
    image: postgres:14+
    port: 5433:5432
    volumes: postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    port: 6380:6379

  backend:
    build: apps/backend
    port: 5001:5000
    env_file: .env
    depends_on: [postgres, redis]

  dashboard:
    build: apps/peace-and-security-dashboard
    port: 8001:4000
    env_file: .env
    depends_on: [backend]
```

### 11.2 Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | Backend port (inside container) | `5000` |
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_DATABASE` | Database name | `peace_security` |
| `JWT_SECRET` | JWT signing secret | (secret) |
| `JWT_EXPIRY` | Token expiry | `1d` |
| `SMS_URL` | SMS API endpoint | (URL) |
| `SMS_TOKEN` | SMS API token | (token) |
| `SMS_SENDER` | SMS sender ID | (sender) |
| `ALLOWED_ORIGINS` | CORS origins | (comma-separated) |
| `NEXT_PUBLIC_API_URL` | Dashboard API URL | `http://localhost:5001/api` |
| `NEXTAUTH_SECRET` | Next.js auth secret | (secret) |

### 11.3 Build Commands

| Component | Command |
|---|---|
| Backend build | `npm run build` (uses `pnpm install` in Docker) |
| Backend dev | `npm run start:dev` |
| Backend migrations | `npm run db:run` / `db:revert` / `db:seed` |
| Dashboard build | `pnpm build` |
| Dashboard dev | `pnpm dev` (port 4000) |
| Full stack | `docker compose up -d --build` |

---

## 12. Appendices

### 12.1 Report Status Colors

| Status | Color | Hex |
|---|---|---|
| SUBMITTED | Blue | `#2563eb` |
| UNDER_REVIEW | Indigo | `#6366f1` |
| ASSIGNED | Amber | `#f59e0b` |
| IN_PROGRESS | Violet | `#8b5cf6` |
| RESOLVED | Green | `#16a34a` |
| CLOSED | Slate | `#64748b` |
| REJECTED | Red | `#dc2626` |
| ESCALATED | Orange | `#ea580c` |

### 12.2 Default Test Accounts

| Role | Phone/Email | Password/PIN |
|---|---|---|
| Super Admin | admin@example.com | admin123 |
| Patrol Officer | +2519111111111 | PIN: 1234 |
| Citizen | +2519222222222 | PIN: 1234 |

### 12.3 Default Location

**Meskel Square, Addis Ababa:** Latitude 9.0107, Longitude 38.7612

Used as fallback when GPS is unavailable.

### 12.4 Supported File Types

| Type | Extensions | Max Size |
|---|---|---|
| Images | .jpg, .jpeg, .png, .webp | ~10MB |
| Video | .mp4, .mov, .avi | ~50MB |
| Audio | .m4a, .aac, .mp3, .wav | ~20MB |

---

**End of SRS Document**
