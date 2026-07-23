# Peace & Security System — Architecture Overview

## 1. System Overview

A dual-hierarchy peace and security management platform where citizens submit incident reports, and two parallel chains of command — **Peace & Security** and **Police** — manage and respond to those reports within a geographic scope (City → Subcity → Woreda).

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend API** | NestJS (Node.js), TypeORM, PostgreSQL |
| **Real-time** | Socket.IO (WebSocket) |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Dashboard** | Next.js 16 (App Router), React 19, Redux Toolkit, Axios |
| **Citizen App** | Flutter (mobile) |
| **Patrol App** | Flutter (mobile) |
| **Infrastructure** | Docker Compose (PostgreSQL + Redis + Backend + Dashboard) |

---

## 3. Dual Hierarchy Structure

```
══════════════════════════════════════════════════════════════════
                    GEOGRAPHIC UNITS
══════════════════════════════════════════════════════════════════
  City (e.g., Addis Ababa)
    └── Subcity (e.g., Arada)
          └── Woreda (e.g., Woreda 01)
══════════════════════════════════════════════════════════════════

══════════════════════════════════════════════════════════════════
              PEACE & SECURITY HIERARCHY
══════════════════════════════════════════════════════════════════
  City
    └── PEACE_SUPER_ADMIN (manages city-wide peace & security)
  Subcity
    └── PEACE_OFFICER_SUBCITY (manages subcity, creates woreda officers)
  Woreda
    └── PEACE_OFFICER_WOREDA (manages woreda reports)
══════════════════════════════════════════════════════════════════

══════════════════════════════════════════════════════════════════
                    POLICE HIERARCHY
══════════════════════════════════════════════════════════════════
  City
    └── POLICE_COMMANDER_CITY (manages city-wide police operations)
  Subcity
    └── POLICE_COMMANDER_SUBCITY (manages subcity police)
  Woreda
    └── POLICE_COMMANDER_WOREDA (creates patrol officers & teams)
        ├── Patrol Team "Alpha"
        │   ├── Patrol Officer (police)
        │   └── Patrol Officer (police)
        ├── Patrol Team "Bravo"
        │   ├── Patrol Officer (police)
        │   └── Patrol Officer (police)
        └── Patrol Officer (unassigned, individual)
══════════════════════════════════════════════════════════════════
```

---

## 4. User Roles

| Role | Scope | Creates Users |
|------|-------|---------------|
| `PEACE_SUPER_ADMIN` | City | Subcity Peace Officers, Woreda Peace Officers |
| `PEACE_OFFICER_SUBCITY` | Subcity | Woreda Peace Officers |
| `PEACE_OFFICER_WOREDA` | Woreda | — |
| `POLICE_COMMANDER_CITY` | City | Subcity Police Commanders |
| `POLICE_COMMANDER_SUBCITY` | Subcity | Woreda Police Commanders |
| `POLICE_COMMANDER_WOREDA` | Woreda | Patrol Officers, Patrol Teams |
| `PATROL` | — (assigned to reports) | — |
| `CITIZEN` | — (submits reports via app) | — |

### Chain of Creation

```
PEACE_SUPER_ADMIN
  → creates PEACE_OFFICER_SUBCITY (assigned to a subcity)
    → creates PEACE_OFFICER_WOREDA (assigned to a woreda)

POLICE_COMMANDER_CITY
  → creates POLICE_COMMANDER_SUBCITY (assigned to a subcity)
    → creates POLICE_COMMANDER_WOREDA (assigned to a woreda)
      → creates PATROL officers + Patrol Teams (assigned to woreda)
```

---

## 5. Database Schema

### New Tables

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    cities     │────<│  subcities   │────<│   woredas    │
│──────────────│     │──────────────│     │──────────────│
│ id (uuid)    │     │ id (uuid)    │     │ id (uuid)    │
│ name         │     │ name         │     │ name         │
│ code (unique)│     │ code         │     │ code         │
│ description  │     │ cityId (FK)  │     │ subcityId(FK)│
│ latitude     │     │ latitude     │     │ latitude     │
│ longitude    │     │ longitude    │     │ longitude    │
│ isActive     │     │ isActive     │     │ isActive     │
│ createdById  │     │ createdById  │     │ createdById  │
│ createdAt    │     │ createdAt    │     │ createdAt    │
│ updatedAt    │     │ updatedAt    │     │ updatedAt    │
└──────────────┘     └──────────────┘     └──────────────┘

┌──────────────────┐
│  patrol_teams     │
│──────────────────│
│ id (uuid)         │
│ name              │
│ code (unique)     │
│ woredaId (FK)     │──── woredas
│ leaderId (FK)     │──── patrols
│ isActive          │
│ createdById       │
│ createdAt         │
│ updatedAt         │
└──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  conversations    │────<│     messages      │
│──────────────────│     │──────────────────│
│ id (uuid)         │     │ id (uuid)         │
│ reportId (FK)     │     │ conversationId(FK)│
│ createdAt         │     │ senderId          │
│ updatedAt         │     │ senderType        │
└──────────────────┘     │ senderName        │
                          │ content           │
                          │ isRead            │
                          │ readAt            │
                          │ createdAt         │
                          └──────────────────┘

┌──────────────────────────────────────────────┐
│                audit_logs                     │
│──────────────────────────────────────────────│
│ id (uuid)                                    │
│ timestamp (auto)                             │
│ actorId (FK → users)                         │
│ actorName (string)                           │
│ actorRole (enum)                             │
│ ipAddress (string)                           │
│ entity (string)        "User", "Report", etc │
│ entityId (string)      affected record ID    │
│ action (enum)          CREATE|UPDATE|DELETE   │
│ cityId (FK, nullable)                        │
│ subcityId (FK, nullable)                     │
│ woredaId (FK, nullable)                      │
│ oldValues (jsonb, nullable)  previous state  │
│ newValues (jsonb, nullable)  new state       │
│ changedFields (text[], nullable)             │
│ description (text, nullable)  human-readable │
└──────────────────────────────────────────────┘
```

### Modified Tables

**`users` — add columns:**
```
cityId        (uuid, nullable)  → FK cities
subcityId     (uuid, nullable)  → FK subcities
woredaId      (uuid, nullable)  → FK woredas
createdByUserId (uuid, nullable) → FK users
```

**`patrols` — add columns:**
```
woredaId      (uuid, nullable)  → FK woredas
teamId        (uuid, nullable)  → FK patrol_teams
```

**`reports` — add columns:**
```
cityId        (uuid, nullable)  → FK cities
subcityId     (uuid, nullable)  → FK subcities
woredaId      (uuid, nullable)  → FK woredas
```

All new columns are **nullable** for backward compatibility.

---

## 6. Report Flow

```
1. Citizen submits report (via Citizen App)
   ├── GPS coordinates captured
   ├── Backend auto-tags cityId/subcityId/woredaId based on location
   └── Report created with status: SUBMITTED

2. Report appears in Woreda scope
   ├── PEACE_OFFICER_WOREDA sees it
   ├── POLICE_COMMANDER_WOREDA sees it
   └── Both can manage the report

3. POLICE_COMMANDER_WOREDA assigns response
   ├── Option A: Assign individual Patrol Officer
   └── Option B: Assign Patrol Team (one member handles it)

4. Patrol Officer handles report
   ├── Accepts case (status: IN_PROGRESS)
   ├── Submits follow-up notes + evidence (GPS verified within 50m)
   ├── Citizen can chat with assigned patrol officer
   └── Escalates if needed

5. Report closure
   ├── Patrol Officer marks resolved
   ├── Admin at any level can close
   └── Status: CLOSED
```

### Report Visibility by Role

| Role | Sees Reports From |
|------|-------------------|
| `PEACE_SUPER_ADMIN` | Entire city |
| `PEACE_OFFICER_SUBCITY` | Their subcity only |
| `PEACE_OFFICER_WOREDA` | Their woreda only |
| `POLICE_COMMANDER_CITY` | Entire city |
| `POLICE_COMMANDER_SUBCITY` | Their subcity only |
| `POLICE_COMMANDER_WOREDA` | Their woreda only |
| `PATROL` | Only assigned reports |
| `CITIZEN` | Only their own reports |

---

## 7. Chat System (Real-time)

### Architecture

```
Citizen App ←──Socket.IO──→ Backend (ChatGateway) ←──Socket.IO──→ Patrol App
                                                         │
                                                    Dashboard (view-only)
```

### Conversation Model

- One conversation per report (1:1 relationship)
- Messages stored in `messages` table
- Socket.IO for real-time delivery
- REST endpoints for message history (pagination)

### Visibility

Full chain visibility — all admins up the hierarchy can see chat messages:
```
PATROL ↔ CITIZEN chat
  ↑ visible to:
  ├── POLICE_COMMANDER_WOREDA
  ├── POLICE_COMMANDER_SUBCITY (if in scope)
  ├── POLICE_COMMANDER_CITY (if in scope)
  ├── PEACE_OFFICER_WOREDA (if in scope)
  ├── PEACE_OFFICER_SUBCITY (if in scope)
  └── PEACE_SUPER_ADMIN (if in scope)
```

### Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `chat:join` | Client → Server | `{ conversationId }` |
| `chat:send` | Client → Server | `{ conversationId, content, senderType, senderName }` |
| `chat:message` | Server → Client | `{ id, conversationId, senderId, senderType, senderName, content, createdAt }` |
| `chat:typing` | Client → Server | `{ conversationId, isTyping }` |
| `chat:read` | Client → Server | `{ conversationId }` |

---

## 8. Backend Module Structure

```
apps/backend/src/
├── app.module.ts                    # Root module — registers all feature modules
├── main.ts                          # Bootstrap + global pipes, guards
├── common/
│   ├── baseentity/base.entity.ts    # BaseEntity with id, createdAt, updatedAt, createdById
│   ├── enums/enums.ts               # UserRole, ReportStatus, UserStatus, etc.
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # JWT authentication
│   │   ├── roles.guard.ts           # Role-based access
│   │   └── hierarchy.guard.ts       # NEW — geographic scope validation
│   ├── decorators/
│   │   ├── roles.decorator.ts       # @Roles() decorator
│   │   └── public.decorator.ts      # @Public() for unauthenticated routes
│   ├── types/service-response.ts    # ServiceResponse<T> helper
│   └── utils/
│       ├── password.util.ts
│       ├── sms-sender.ts
│       ├── geo-util.ts              # getDistance() Haversine formula
│       ├── generator.ts             # generateRandomCode()
│       └── file-upload.util.ts
│
├── modules/
│   ├── geo/                         # ★ NEW MODULE
│   │   ├── entities/
│   │   │   ├── city.entity.ts
│   │   │   ├── subcity.entity.ts
│   │   │   └── woreda.entity.ts
│   │   ├── dto/
│   │   │   ├── create-city.dto.ts
│   │   │   ├── create-subcity.dto.ts
│   │   │   └── create-woreda.dto.ts
│   │   ├── geo.service.ts           # CRUD + hierarchy queries
│   │   ├── geo.controller.ts        # REST endpoints
│   │   └── geo.module.ts
│   │
│   ├── chat/                        # ★ NEW MODULE
│   │   ├── entities/
│   │   │   ├── conversation.entity.ts
│   │   │   └── message.entity.ts
│   │   ├── dto/
│   │   │   └── send-message.dto.ts
│   │   ├── chat.service.ts          # Message CRUD
│   │   ├── chat.gateway.ts          # Socket.IO WebSocket gateway
│   │   ├── chat.controller.ts       # REST for message history
│   │   └── chat.module.ts
│   │
│   ├── user/                        # ★ MODIFIED
│   │   ├── entities/user.entity.ts  # + cityId, subcityId, woredaId, createdByUserId
│   │   ├── dto/
│   │   ├── user.service.ts          # + geo-scoped queries, hierarchy validation
│   │   ├── user.controller.ts       # + new role guards
│   │   └── user.module.ts
│   │
│   ├── reports/                     # ★ MODIFIED
│   │   ├── entities/report.entity.ts # + cityId, subcityId, woredaId
│   │   ├── reports.service.ts        # + geo-scoped queries, team assignment
│   │   └── reports.controller.ts     # + new role guards, team assignment endpoint
│   │
│   ├── patrol/                      # ★ MODIFIED
│   │   ├── entities/
│   │   │   ├── patrol.entity.ts      # + woredaId, teamId
│   │   │   └── patrol-team.entity.ts # ★ NEW
│   │   ├── patrol.service.ts         # + team management
│   │   └── patrol.controller.ts      # + team endpoints
│   │
│   ├── audit/                       # ★ NEW MODULE
│   │   ├── entities/
│   │   │   └── audit-log.entity.ts   # AuditLog entity
│   │   ├── audit.subscriber.ts       # TypeORM subscriber (auto-captures CRUD)
│   │   ├── request-context.ts        # AsyncLocalStorage for actor info
│   │   ├── audit.service.ts          # Query/search audit logs
│   │   ├── audit.controller.ts       # REST endpoints
│   │   └── audit.module.ts
│   │
│   ├── auth/                        # Existing — login, tokens, OTP
│   ├── notifications/               # Existing — FCM + Socket.IO notifications
│   ├── citizen/                     # Existing — citizen registration/login
│   ├── dashboard/                   # Existing — stats endpoints
│   ├── cameras/                     # Existing — CCTV management
│   ├── report-types/                # Existing — incident categories
│   ├── media/                       # Existing — file uploads
│   └── otp/                         # Existing — OTP verification
```

---

## 9. Dashboard (Frontend) Structure

```
apps/peace-and-security-dashboard/
├── app/
│   ├── layout.tsx                           # Root layout
│   ├── page.tsx                             # Login page
│   ├── context/
│   │   ├── auth-context.tsx                 # useAuth() hook
│   │   └── notification-context.tsx         # useNotifications() hook
│   └── dashboard/
│       ├── layout.tsx                       # ProtectedRoute + Sidebar + Header
│       ├── page.tsx                         # Main dashboard (stats, charts)
│       │
│       ├── cities/                          # ★ NEW
│       │   ├── page.tsx                     # Cities list
│       │   └── [id]/page.tsx               # City detail + subcities
│       │       └── subcities/page.tsx       # Subcities within a city
│       │
│       ├── subcities/                       # ★ NEW
│       │   └── [id]/page.tsx               # Subcity detail + woredas
│       │       └── woredas/page.tsx         # Woredas within a subcity
│       │
│       ├── woredas/                         # ★ NEW
│       │   └── [id]/page.tsx               # Woreda detail + patrol teams
│       │       └── teams/page.tsx           # Patrol teams in woreda
│       │
│       ├── reports/
│       │   ├── page.tsx                     # Reports list (geo-scoped)
│       │   ├── create/page.tsx              # Create report
│       │   └── [id]/
│       │       ├── page.tsx                 # Report detail
│       │       ├── edit/page.tsx            # Edit report
│       │       └── chat/page.tsx            # ★ NEW — Chat with patrol
│       │
│       ├── users/                           # ★ MODIFIED
│       │   ├── page.tsx                     # Users list (geo-scoped)
│       │   ├── create/page.tsx              # Create user (geo-aware)
│       │   └── [id]/
│       │       ├── page.tsx                 # User detail
│       │       └── edit/page.tsx            # Edit user
│       │
│       ├── patrols/
│       │   └── page.tsx                     # ★ MODIFIED — shows teams, woreda-filtered
│       │
│       ├── analytics/page.tsx               # Analytics (geo-scoped)
│       ├── settings/page.tsx                # Settings
│       ├── map/page.tsx                     # Live map (geo-scoped)
│       └── notifications/page.tsx           # Notifications
│
├── lib/
│   ├── api-config.ts                        # ★ MODIFIED — + geo, chat, team endpoints
│   ├── api-client.ts                        # Existing — Axios with interceptors
│   ├── api-types.ts                         # ★ MODIFIED — + new response types
│   ├── auth.ts                              # ★ MODIFIED — + new role permissions
│   ├── enums.ts                             # ★ MODIFIED — + 5 new roles
│   ├── permissions.ts                       # ★ MODIFIED — + new permissions
│   ├── services/
│   │   ├── auth-service.ts                  # Existing
│   │   ├── dashboard-service.ts             # Existing
│   │   ├── report-service.ts                # ★ MODIFIED — + team assignment
│   │   ├── user-service.ts                  # ★ MODIFIED — + geo params
│   │   ├── patrol-service.ts                # ★ MODIFIED — + team CRUD
│   │   ├── citizen-service.ts               # Existing
│   │   ├── report-type-service.ts           # Existing
│   │   ├── camera-service.ts                # Existing
│   │   ├── geo-service.ts                   # ★ NEW — city/subcity/woreda CRUD
│   │   ├── chat-service.ts                  # ★ NEW — messages, conversations
│   │   └── patrol-team-service.ts           # ★ NEW — team CRUD
│   └── store/
│       ├── store.ts                         # ★ MODIFIED — + new slices
│       ├── authSlice.ts                     # ★ MODIFIED
│       ├── dashboardSlice.ts                # Existing
│       ├── reportsSlice.ts                  # ★ MODIFIED
│       ├── usersSlice.ts                    # ★ MODIFIED
│       ├── patrolsSlice.ts                  # ★ MODIFIED
│       ├── citizensSlice.ts                 # Existing
│       ├── camerasSlice.ts                  # Existing
│       ├── reportTypesSlice.ts              # Existing
│       ├── notificationSlice.ts             # Existing
│       ├── geoSlice.ts                      # ★ NEW — city/subcity/woreda state
│       ├── chatSlice.ts                     # ★ NEW — messages, conversations
│       └── patrolTeamsSlice.ts              # ★ NEW — patrol teams state
│
├── components/
│   ├── layouts/
│   │   ├── sidebar.tsx                      # ★ MODIFIED — + geo + teams nav items
│   │   ├── dashboard-header.tsx
│   │   └── page-header.tsx
│   ├── forms/
│   │   ├── user-form.tsx                    # ★ MODIFIED — + geo selectors
│   │   ├── report-form.tsx                  # ★ MODIFIED — + geo auto-tag
│   │   └── permission-selector.tsx          # ★ MODIFIED — + new role perms
│   ├── geo/                                 # ★ NEW
│   │   ├── city-table.tsx
│   │   ├── subcity-table.tsx
│   │   ├── woreda-table.tsx
│   │   ├── city-form.tsx
│   │   ├── subcity-form.tsx
│   │   └── woreda-form.tsx
│   ├── chat/                                # ★ NEW
│   │   ├── chat-window.tsx
│   │   └── message-bubble.tsx
│   ├── patrol-teams/                        # ★ NEW
│   │   ├── team-table.tsx
│   │   └── team-form.tsx
│   ├── audit/                                # ★ NEW
│   │   ├── audit-table.tsx
│   │   └── audit-diff-viewer.tsx
│   └── ui/                                  # Existing shadcn/ui components
│
└── hooks/
    ├── use-api-call.ts                      # Existing
    ├── use-socket.ts                        # ★ NEW — Socket.IO hook
    └── use-toast.ts                         # Existing
```

---

## 10. API Endpoints

### Geo Management

```
POST   /api/cities                          Create city
GET    /api/cities                          List all cities
GET    /api/cities/:id                      Get city by ID
PATCH  /api/cities/:id                      Update city
DELETE /api/cities/:id                      Delete city

POST   /api/cities/:cityId/subcities        Create subcity in city
GET    /api/cities/:cityId/subcities        List subcities in city
GET    /api/subcities/:id                   Get subcity by ID
PATCH  /api/subcities/:id                   Update subcity
DELETE /api/subcities/:id                   Delete subcity

POST   /api/subcities/:subcityId/woredas    Create woreda in subcity
GET    /api/subcities/:subcityId/woredas    List woredas in subcity
GET    /api/woredas/:id                     Get woreda by ID
PATCH  /api/woredas/:id                     Update woreda
DELETE /api/woredas/:id                     Delete woreda

GET    /api/geo/hierarchy                   Full tree (cities → subcities → woredas)
```

### Patrol Teams

```
POST   /api/patrol-teams                    Create team
GET    /api/patrol-teams                    List teams (filtered by woreda)
GET    /api/patrol-teams/:id                Get team by ID
PATCH  /api/patrol-teams/:id                Update team
DELETE /api/patrol-teams/:id                Delete team
POST   /api/patrol-teams/:id/members        Add patrol officer to team
DELETE /api/patrol-teams/:id/members/:pid   Remove patrol officer from team
```

### Chat

```
GET    /api/conversations/report/:reportId  Get conversation for report
GET    /api/conversations/:id/messages      Get messages (paginated)
POST   /api/conversations/:id/messages      Send message (REST fallback)
PATCH  /api/conversations/:id/read          Mark as read
```

### Existing Endpoints (Modified)

```
POST   /api/users/register                  + cityId, subcityId, woredaId in body
GET    /api/users/all                       + filters by caller's geographic scope

POST   /api/reports                         + auto-tags cityId/subcityId/woredaId
GET    /api/reports                         + filters by caller's geographic scope
PATCH  /api/reports/:id/assign              + accepts patrolId OR teamId
```

### Audit Logs

```
GET    /api/audit-logs                      List audit logs (scoped by caller's geo)
GET    /api/audit-logs/:id                  Get single audit log with full diff
GET    /api/audit-logs/entity/:type/:id     Get full audit trail for a specific record
```

Query params: `?entity=User&action=CREATE&startDate=&endDate=&actorId=&page=&limit=`

---

## 11. Permissions

### New Permissions

```
GEO_MANAGE              Create/edit/delete cities, subcities, woredas
PATROL_TEAM_MANAGE      Create/edit/delete patrol teams
CHAT_SEND               Send messages in report conversations
CHAT_VIEW               View messages in report conversations
AUDIT_LOG_VIEW          View audit logs (scoped by geographic level)
AUDIT_LOG_EXPORT        Export audit logs to CSV
```

### Default Permissions by Role

```typescript
PEACE_SUPER_ADMIN: [
  REPORT_VIEW, REPORT_ASSIGN, REPORT_RESOLVE,
  USER_VIEW, USER_CREATE, USER_UPDATE, USER_DISABLE,
  DASHBOARD_VIEW, DASHBOARD_STATS,
  SETTINGS_VIEW, SETTINGS_UPDATE,
  GEO_MANAGE,
  AUDIT_LOG_VIEW, AUDIT_LOG_EXPORT,
]

PEACE_OFFICER_SUBCITY: [
  REPORT_VIEW, REPORT_ASSIGN, REPORT_RESOLVE,
  USER_VIEW, USER_CREATE,  // woreda officers only
  DASHBOARD_VIEW,
  SETTINGS_VIEW,
  AUDIT_LOG_VIEW,
]

PEACE_OFFICER_WOREDA: [
  REPORT_VIEW, REPORT_UPDATE,
  DASHBOARD_VIEW,
  SETTINGS_VIEW,
  AUDIT_LOG_VIEW,
]

POLICE_COMMANDER_CITY: [
  REPORT_VIEW, REPORT_ASSIGN,
  USER_VIEW, USER_CREATE,  // subcity commanders
  DASHBOARD_VIEW, DASHBOARD_STATS,
  SETTINGS_VIEW,
  GEO_MANAGE,
  AUDIT_LOG_VIEW, AUDIT_LOG_EXPORT,
]

POLICE_COMMANDER_SUBCITY: [
  REPORT_VIEW, REPORT_ASSIGN,
  USER_VIEW, USER_CREATE,  // woreda commanders
  DASHBOARD_VIEW,
  SETTINGS_VIEW,
  AUDIT_LOG_VIEW,
]

POLICE_COMMANDER_WOREDA: [
  REPORT_VIEW, REPORT_ASSIGN,
  USER_VIEW, USER_CREATE,  // patrol officers
  PATROL_TEAM_MANAGE,
  DASHBOARD_VIEW,
  AUDIT_LOG_VIEW,
]

PATROL: [
  REPORT_VIEW, REPORT_UPDATE,  // assigned only
  CHAT_SEND, CHAT_VIEW,
  DASHBOARD_VIEW,
  SETTINGS_CHANGE_PASSWORD,
]

CITIZEN: [
  REPORT_CREATE, REPORT_VIEW,  // own reports only
  CHAT_SEND, CHAT_VIEW,  // assigned report only
]
```

---

## 12. Hierarchy Guard Logic

```
Request comes in → Extract user from JWT → Check role + assigned geo unit

PEACE_SUPER_ADMIN (cityId=X):
  ✓ Can manage subcities in city X
  ✓ Can manage woredas in city X
  ✓ Can manage all users in city X
  ✓ Can view all reports in city X

PEACE_OFFICER_SUBCITY (subcityId=Y):
  ✓ Can manage woredas in subcity Y
  ✓ Can create woreda officers in subcity Y
  ✓ Can view reports in subcity Y
  ✗ Cannot manage other subcities

PEACE_OFFICER_WOREDA (woredaId=Z):
  ✓ Can view reports in woreda Z
  ✓ Can update report status in woreda Z
  ✗ Cannot create users
  ✗ Cannot manage other woredas

POLICE_COMMANDER_CITY (cityId=X):
  ✓ Can manage subcity commanders in city X
  ✓ Can view all reports in city X
  ✓ Can assign patrols city-wide

POLICE_COMMANDER_SUBCITY (subcityId=Y):
  ✓ Can manage woreda commanders in subcity Y
  ✓ Can view reports in subcity Y

POLICE_COMMANDER_WOREDA (woredaId=Z):
  ✓ Can create patrol officers in woreda Z
  ✓ Can manage patrol teams in woreda Z
  ✓ Can view reports in woreda Z
  ✓ Can assign patrols in woreda Z

PATROL:
  ✓ Can view only assigned reports
  ✓ Can chat in assigned report conversations
  ✗ Cannot view other reports
```

---

## 13. Sidebar Navigation

```
Dashboard                          DASHBOARD_VIEW
─────────────────────────────────────────────────
Reports Management                 REPORT_VIEW
─────────────────────────────────────────────────
Officers
  ├── Patrol Officers              USER_VIEW
  └── Patrol Teams                 PATROL_TEAM_MANAGE  ★ NEW
─────────────────────────────────────────────────
Geographic Units                   GEO_MANAGE  ★ NEW
  ├── Cities
  ├── Subcities (drill-down)
  └── Woredas (drill-down)
─────────────────────────────────────────────────
Analytics                          DASHBOARD_VIEW
─────────────────────────────────────────────────
Audit Logs                         AUDIT_LOG_VIEW  ★ NEW
─────────────────────────────────────────────────
Settings                           SETTINGS_VIEW
```

All items filtered by `hasPermission()` — users only see what their role allows.

---

## 14. Data Flow Diagrams

### Report Submission Flow

```
Citizen App                    Backend                     Dashboard
    │                            │                            │
    ├── POST /reports ──────────>│                            │
    │   (GPS, evidence, type)    │                            │
    │                            ├── Auto-tag geo fields      │
    │                            │   (cityId, subcityId,      │
    │                            │    woredaId from GPS)      │
    │                            │                            │
    │                            ├── Save report              │
    │                            ├── Create conversation      │
    │                            │                            │
    │<── FCM notification ───────┤── Notify Woreda officers ─>│
    │    "Report received"        │   (Socket.IO)             │
    │                            │                            │
```

### Report Assignment Flow

```
POLICE_COMMANDER_WOREDA          Backend                     Patrol App
    │                            │                            │
    ├── PATCH /reports/:id/assign──>│                          │
    │   (patrolId or teamId)     │                            │
    │                            ├── Assign patrol            │
    │                            ├── Update status: ASSIGNED  │
    │                            │                            │
    │<── Response ───────────────┤── FCM to patrol officer ──>│
    │                            │   "Case assigned"          │
    │                            │                            │
```

### Chat Flow

```
Citizen App              Backend (ChatGateway)          Patrol App
    │                            │                            │
    ├── chat:send ──────────────>│                            │
    │   { conversationId,        │                            │
    │     content }              │                            │
    │                            ├── Save to messages table   │
    │                            ├── Broadcast to room ──────>│
    │                            │   chat:message event       │
    │                            │                            │
    │                            │<── chat:send ──────────────┤
    │<── chat:message ───────────┤   { content }              │
    │                            ├── Save to messages table   │
    │                            │                            │
    │                            ├── Notify admins in chain   │
    │                            │   (Woreda → Subcity → City)│
```

### Audit Log Flow (Automatic)

```
Any Service Method               TypeORM                  Audit Subscriber
    │                            │                            │
    ├── repository.save() ──────>│                            │
    │                            ├── Intercept INSERT/UPDATE  │
    │                            │                            │
    │                            │<── beforeInsert() ─────────┤
    │                            │    beforeUpdate()          │
    │                            │    beforeRemove()          │
    │                            │                            │
    │                            │    ├── Read RequestContext │
    │                            │    │   (userId, IP, role)  │
    │                            │    │                       │
    │                            │    ├── Compute diff        │
    │                            │    │   oldValues vs new    │
    │                            │    │                       │
    │                            │    └── Save to             │
    │                            │        audit_logs table    │
    │                            │                            │
```

---

## 15. Audit Log System

Every CRUD operation across the entire system is automatically recorded in a centralized audit log with full diff tracking.

### Audit Log Entity

```typescript
@Entity("audit_logs")
export class AuditLog {
  id: string;                          // uuid
  timestamp: Date;                     // when the action happened (auto)

  // Who did it
  actorId: string;                     // FK → users (who performed the action)
  actorName: string;                   // denormalized for display
  actorRole: UserRole;                 // role at time of action
  ipAddress: string;                   // request IP address

  // What was affected
  entity: string;                      // "User", "Report", "City", "Patrol", etc.
  entityId: string;                    // ID of the affected record
  action: AuditAction;                 // CREATE | UPDATE | DELETE

  // Where (geographic scope for filtering)
  cityId?: string;
  subcityId?: string;
  woredaId?: string;

  // Diff tracking
  oldValues?: Record<string, any>;     // previous state (null on CREATE)
  newValues?: Record<string, any>;     // new state (null on DELETE)
  changedFields?: string[];            // which fields changed (on UPDATE)

  // Context
  description?: string;                // human-readable summary
  // e.g., "Created user John Doe" / "Updated report REP-123456 status"
}
```

### Audit Action Enum

```typescript
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}
```

### Entities Audited

| Entity | Module | Tracked Actions |
|--------|--------|-----------------|
| `User` | user | CREATE, UPDATE, DELETE, TOGGLE_STATUS, RESET_PASSWORD |
| `Report` | reports | CREATE, UPDATE, DELETE, ASSIGN, ACCEPT, CLOSE, REVIEW, ESCALATE |
| `Patrol` | patrol | CREATE, UPDATE, DELETE |
| `PatrolTeam` | patrol | CREATE, UPDATE, DELETE, ADD_MEMBER, REMOVE_MEMBER |
| `City` | geo | CREATE, UPDATE, DELETE |
| `Subcity` | geo | CREATE, UPDATE, DELETE |
| `Woreda` | geo | CREATE, UPDATE, DELETE |
| `Camera` | cameras | CREATE, UPDATE, DELETE |
| `ReportType` | report-types | CREATE, UPDATE, DELETE |
| `Conversation/Message` | chat | CREATE (message sent) |
| `Citizen` | citizen | CREATE, UPDATE, DELETE |

### Implementation: TypeORM EntitySubscriber

Use a **TypeORM EventSubscriber** to automatically intercept all database operations — zero changes needed in existing services:

```typescript
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {

  // Intercept every INSERT
  async beforeInsert(event: InsertEvent<any>) {
    // Capture: entity name, new values, actor from request context
  }

  // Intercept every UPDATE
  async beforeUpdate(event: UpdateEvent<any>) {
    // Capture: entity name, old values, new values, changed fields
  }

  // Intercept every DELETE
  async beforeRemove(event: RemoveEvent<any>) {
    // Capture: entity name, old values (full entity before removal)
  }
}
```

**Key benefits:**
- Automatic — no manual logging in each service
- Complete — captures every database write operation
- Non-intrusive — existing code unchanged
- Request context — uses `AsyncLocalStorage` to get the current user + IP from the JWT guard

### Request Context for Actor Info

```typescript
// AsyncLocalStorage stores request context (user, IP) per request
// The AuditSubscriber reads from this context to know WHO performed the action

export const RequestContext = new AsyncLocalStorage<{
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
}>();
```

Set in a NestJS middleware/guard, read in the subscriber.

### Audit Log Visibility (Scoped by Geographic Level)

| Role | Sees Audit Logs From |
|------|---------------------|
| `PEACE_SUPER_ADMIN` | Entire city |
| `PEACE_OFFICER_SUBCITY` | Their subcity only |
| `PEACE_OFFICER_WOREDA` | Their woreda only |
| `POLICE_COMMANDER_CITY` | Entire city |
| `POLICE_COMMANDER_SUBCITY` | Their subcity only |
| `POLICE_COMMANDER_WOREDA` | Their woreda only |

### API Endpoints

```
GET    /api/audit-logs                      List audit logs (scoped by caller's geo)
GET    /api/audit-logs/:id                  Get single audit log with full diff
GET    /api/audit-logs/entity/:type/:id     Get full audit trail for a specific record
```

**Query params:**
```
?entity=User                    Filter by entity type
?action=CREATE                  Filter by action
?actorId=uuid                   Filter by actor
?startDate=2025-01-01           Filter by date range
?endDate=2025-12-31
?page=1&limit=20                Pagination
```

### Dashboard Page

`/dashboard/audit-logs` — Audit log viewer:

- Filterable table (entity, action, actor, date range)
- Expandable rows showing full old/new value diffs (JSON viewer)
- Entity trail view — see complete history of any record
- Export to CSV

### New Permissions

```
AUDIT_LOG_VIEW        View audit logs (scoped by geographic level)
AUDIT_LOG_EXPORT      Export audit logs to CSV
```

Default: All admin/peace/police roles get `AUDIT_LOG_VIEW`. PATROL and CITIZEN do not.

### Sidebar Nav Item

```
Audit Logs              AUDIT_LOG_VIEW  (visible to all admin roles, scoped)
```

### Files to Create

| File | Purpose |
|------|---------|
| `apps/backend/src/modules/audit/entities/audit-log.entity.ts` | AuditLog entity |
| `apps/backend/src/modules/audit/audit.subscriber.ts` | TypeORM subscriber (auto-captures all CRUD) |
| `apps/backend/src/modules/audit/request-context.ts` | AsyncLocalStorage for actor info |
| `apps/backend/src/modules/audit/audit.service.ts` | Query/search audit logs |
| `apps/backend/src/modules/audit/audit.controller.ts` | REST endpoints |
| `apps/backend/src/modules/audit/audit.module.ts` | NestJS module |
| `apps/backend/src/common/enums/enums.ts` | Add `AuditAction` enum |
| `apps/peace-and-security-dashboard/lib/services/audit-service.ts` | Frontend API calls |
| `apps/peace-and-security-dashboard/lib/store/auditSlice.ts` | Redux state |
| `apps/peace-and-security-dashboard/app/dashboard/audit-logs/page.tsx` | Audit log viewer page |
| `apps/peace-and-security-dashboard/components/audit/audit-table.tsx` | Audit log table component |
| `apps/peace-and-security-dashboard/components/audit/audit-diff-viewer.tsx` | JSON diff viewer component |

### Files to Modify

| File | Changes |
|------|---------|
| `apps/backend/src/app.module.ts` | Register AuditModule |
| `apps/backend/src/main.ts` | Add RequestContext middleware |
| `apps/peace-and-security-dashboard/lib/enums.ts` | Add `AuditAction` |
| `apps/peace-and-security-dashboard/lib/permissions.ts` | Add `AUDIT_LOG_VIEW`, `AUDIT_LOG_EXPORT` |
| `apps/peace-and-security-dashboard/lib/api-config.ts` | Add audit endpoints |
| `apps/peace-and-security-dashboard/components/layouts/sidebar.tsx` | Add "Audit Logs" nav item |

---

## 16. Implementation Order

| Phase | Scope | Files |
|-------|-------|-------|
| **1** | Backend — Geographic entities | `geo/` module (entity, DTO, service, controller, module) |
| **2** | Backend — Enums + User entity | `enums.ts`, `user.entity.ts` |
| **3** | Backend — Patrol teams | `patrol-team.entity.ts`, update `patrol.entity.ts` |
| **4** | Backend — Chat module | `chat/` module (entity, gateway, service, controller) |
| **5** | Backend — Hierarchy guard | `hierarchy.guard.ts` |
| **6** | Backend — Report/User scoping | Update `reports.service.ts`, `user.service.ts` |
| **7** | Backend — Audit log system | `audit/` module (entity, subscriber, service, controller) |
| **8** | Frontend — Enums + Config | `enums.ts`, `permissions.ts`, `api-config.ts` |
| **9** | Frontend — Services | `geo-service.ts`, `chat-service.ts`, `patrol-team-service.ts`, `audit-service.ts` |
| **10** | Frontend — Redux slices | `geoSlice.ts`, `chatSlice.ts`, `patrolTeamsSlice.ts`, `auditSlice.ts` |
| **11** | Frontend — Pages | Cities, Subcities, Woredas, Teams, Chat, Audit Logs pages |
| **12** | Frontend — Components | Tables, forms, chat UI, audit diff viewer |
| **13** | Frontend — Sidebar + Forms | Navigation, user form geo selectors |
| **14** | Seed data | Default city, sample subcities/woredas |
| **15** | Testing + Validation | End-to-end flow verification |

---

## 17. Migration Strategy

- All new DB columns are **nullable** → zero downtime
- Existing `SYSTEM_SUPER_ADMIN` and `SYSTEM_ADMIN` roles preserved for backward compatibility
- New roles (`PEACE_*`, `POLICE_*`) added alongside existing ones
- New `audit_logs` table — append-only, no impact on existing data
- Seed script creates default "Addis Ababa" city with sample subcities/woredas
- No changes to Citizen App or Patrol App (deferred)
