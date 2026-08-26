# Peace & Security Platform — Complete Feature Description

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Citizen App Features](#2-citizen-app-features)
3. [Patrol App Features](#3-patrol-app-features)
4. [Admin Dashboard Features](#4-admin-dashboard-features)
5. [Backend System Features](#5-backend-system-features)
6. [Cross-Cutting Features](#6-cross-cutting-features)

---

## 1. Platform Overview

The Peace & Security Platform is an integrated incident management system for Addis Ababa's Police and Security Bureau. It connects citizens, field patrol officers, and administrators through three client applications backed by a unified NestJS API.

**Three Clients:**

| Client | Users | Technology |
|---|---|---|
| Citizen Mobile App | Addis Ababa residents | Flutter + BLoC |
| Patrol Mobile App | Patrol officers and police | Flutter + BLoC |
| Admin Dashboard | Administrators and commanders | Next.js + Redux Toolkit |

**Core Capabilities:**
- Incident reporting with multimedia evidence
- Real-time case tracking and status updates
- Bidirectional chat between citizens and response teams
- Push notifications for case updates
- Fleet tracking and patrol management
- Analytics, audit trails, and reporting

---

## 2. Citizen App Features

### 2.1 Onboarding & First Launch

**Screens:** Splash → Onboarding → Welcome

When a citizen opens the app for the first time:

1. **Splash Screen** — Displays the app logo and "Peace & Security" branding for 1.8 seconds.
2. **Onboarding Screen** — Three animated ticker cards simulating live incident alerts (e.g., "Noise complaint reported in Bole", "Vandalism incident resolved"). Two buttons: "Get Started" (→ Register) and "Continue as Guest" (→ Guest Mode).
3. **Welcome Screen** — Dark branded page with the full logo, tagline "Protecting Our Community Together", and two buttons: "Login" and "Create Account".

**Design:** Dark navy primary color (#0d2d82), Material 3, circular logo with shield icon.

---

### 2.2 Authentication

#### 2.2.1 Registration

**Screen:** Register

Citizens create an account with:
- **Full name** — Minimum 3 characters
- **Phone number** — Ethiopian format (+251 prefix, 9 digits, total 13 characters)
- **PIN** — 4-6 digit numeric code
- **Confirm PIN** — Must match
- **Profile photo** — Optional, from camera or gallery

**Flow:**
1. Client validates all fields locally
2. Sends `POST /api/auth/citizen/register` (multipart with optional profileImage)
3. If OTP verification is required: navigates to OTP screen with `registrationToken`
4. If direct registration: user is signed in immediately

#### 2.2.2 OTP Verification

**Screen:** Verify OTP

When required after registration:
1. User receives OTP via SMS to their phone number
2. Enters 4-6 digit code on screen
3. Client sends `POST /api/auth/citizen/verify`
4. Backend validates OTP, returns `setPinToken`
5. Client sends `POST /api/auth/citizen/set-pin` with token and chosen PIN
6. User is now fully authenticated

**Features:**
- Resend code button (with cooldown timer)
- Dev mode: OTP displayed on screen for testing
- Automatic code detection from SMS (when supported)

#### 2.2.3 Login

**Screen:** Login

- Phone number input (+251 prefix, 9 digits)
- PIN input (4-6 digits, secure with show/hide toggle)
- "Login" button
- "Don't have an account? Create one" link

**API:** `POST /api/auth/citizen/login` with `{phoneNumber, pin, deviceId}`

**Response:** JWT access token + refresh token + user object → session saved → navigate to Home.

#### 2.2.4 Guest Mode

Citizens can use the app without creating an account:

**Available as Guest:**
- View incident map with all reports
- Track cases by case ID
- Browse onboarding screens

**Restricted as Guest:**
- Cannot submit reports (prompted to sign in)
- Cannot view "My Reports" (login prompt shown)
- Cannot access notifications (login prompt shown)
- Cannot participate in chats

**Implementation:** `SessionManager.isGuest = true`, state becomes `signedIn` with `isGuest = true`. Navigation guard allows access to limited routes.

---

### 2.3 Home Screen

**Screen:** Home (main tab)

The home screen is the citizen's dashboard, showing:

**Header:**
- Time-based greeting ("Good Morning, John")
- Notification bell icon with unread count badge (max "9+")
- Language switcher badge (shows current language code)

**Quick Actions:**
- "Report Incident" card — Large button with camera icon, navigates to report creation
- "View Incident Map" card — Map icon, navigates to map screen

**Recent Reports:**
- List of the user's most recent reports
- Each shows: case ID, status badge (colored pill), type, address, time ago
- "See All" link → full "My Reports" screen

**Impact Statistics:**
- "Reports This Month" — Count with delta percentage vs last month
- "Avg Response Time" — Minutes with delta percentage

**API Calls:**
- `GET /api/reports/my-reports` (recent 5)
- `GET /api/reports/stats` (statistics)

---

### 2.4 Report Submission

**Screen:** Create Report

A comprehensive multi-step form for submitting incident reports:

#### Step 1: Incident Type Selection
- Radio button list of 11 report types (fetched from API, with hardcoded fallback)
- Types: Noise, Littering, Vandalism, Air Pollution, Water Pollution, Soil Contamination, Illegal Dumping, Deforestation, Hazardous Waste, Wildlife Poaching, Others
- Required field

#### Step 2: Description
- Multiline text input
- Min 5 chars, max 500 chars
- Character counter displayed

#### Step 3: Location
- Embedded Google Maps with current GPS location
- Draggable pin for precise location adjustment
- "Change" button to re-fetch GPS
- Address auto-populated via reverse geocoding
- Default fallback: Meskel Square, Addis Ababa (9.0107, 38.7612)

#### Step 4: Media Attachments
- **Photos:** Up to 4 images from gallery (quality 80%). Each shows as thumbnail with remove button.
- **Video:** One video from gallery. Shown as attached pill with remove button.
- **Audio:** In-app recording using device microphone. Records as AAC LC 128kbps/44.1kHz .m4a. Shows recording timer. Start/stop/re-record controls.

#### Step 5: Optional Fields
- **Anonymous toggle** — "Report anonymously — Your name won't be visible to others"
- **Emergency mode toggle** — When enabled:
  - Severity slider appears (Minor / Moderate / Severe)
  - Larger camera button
  - Danger-colored UI elements
  - Two submit buttons: "Submit Emergency Report" (red) and "Submit Report" (outline)

#### Step 6: Submit
- Validation: type required, description ≥5 chars, location required
- Creates multipart FormData with all fields + files
- API: `POST /api/reports`
- Shows loading spinner during submission

#### Success Screen
**Screen:** Create Report Success

After successful submission:
- Animated check mark
- "Report Submitted Successfully" message
- Case ID displayed prominently
- Status badge (SUBMITTED — blue)
- Address and submission date
- Assigned security unit (if auto-assigned)
- Action buttons:
  - "Share Report" — Copies case ID to clipboard
  - "View on Map" — Opens Google Maps external link
  - "Return Home" — Navigates to home screen

---

### 2.5 My Reports

**Screen:** My Reports (tab)

A list of all reports submitted by the citizen:

**Features:**
- Pull-to-refresh
- Status badges with color coding (8 status colors)
- Each report card shows:
  - Case ID
  - Report type
  - Status badge
  - Address/area
  - Time ago
  - Emergency flag indicator
- "Report Incident" button in header
- Guest mode: Shows login prompt instead of reports
- Empty state: "No Reports Yet — Start reporting incidents in your area"

**Tapping a report** → navigates to Report Detail screen.

---

### 2.6 Report Detail

**Screen:** Report Detail

Full view of a single report with all information:

**Header Section:**
- Status badge (colored pill)
- Emergency flag (if applicable)

**Reporter Info:**
- Avatar, full name, phone number (hidden if anonymous)

**Media Sections:**
- **Photo Grid:** Thumbnails of all submitted images, tappable for full view
- **Video Grid:** Video thumbnails with play icon
- **Audio Players:** For each audio recording, shows:
  - Play/pause button
  - Progress bar
  - Duration display (M:SS format)
  - Uses `just_audio` package

**Detail Card:**
- Report type
- Full address
- Area (neighborhood)
- Incident date/time
- Reported date/time
- Anonymous status
- Noise level (for noise reports)
- Ongoing flag
- Emergency flag

**Description Card:**
- Full report description text

**People Involved Card:**
- Suspect information
- Victim information
- Witness information

**Assigned Patrol Card:**
- Officer name and badge
- Assignment timestamp

**Timeline:**
- Vertical stepper with status changes
- Each entry shows: status, note, changed by (name + role), timestamp
- No timeline entries shown as "No timeline events recorded yet"

**Action Button:**
- "Chat about this report" — Opens/creates a chat conversation for this report

---

### 2.7 Incident Map

**Screen:** Map (tab)

Interactive Google Maps showing all nearby incidents:

**Map Features:**
- Google Maps centered on Addis Ababa (9.03, 38.74)
- Color-coded markers:
  - **Red** — Crime, robbery, emergency incidents
  - **Orange** — Illegal activity, vandalism, dumping
  - **Blue** — Security threats, weapons
  - **Green** — Other/environmental reports
- Selected marker highlighted in violet with higher z-index
- Default markers use distinct hues for differentiation

**Filter Controls:**
- Horizontal filter chips: All, Emergency, Illegal Activity, Security Threat
- Active filter highlighted with primary color
- Bottom bar shows count of filtered incidents + color legend

**Search:**
- Search bar at top (UI — allows text input)

**Marker Interaction:**
- Tap marker → bottom sheet with report summary
- Tap bottom sheet → navigates to Report Detail

---

### 2.8 Track Case

**Screen:** Track Case

Allows anyone (including guests) to track a report by case ID:

**Input:**
- Case ID text field (e.g., "CASE-2026-XXXXX")
- "Submit" button

**Result:**
- Report card showing: status badge, type, location, timestamps
- Signed-in users can tap to open full report detail
- Guests see basic tracking info only

**API:** `GET /api/reports/track/:caseId` (optional authentication)

---

### 2.9 Chat & Messaging

#### 2.9.1 Conversations List

**Screen:** Conversations

Lists all chat conversations linked to reports:

**Each conversation row shows:**
- Title (e.g., "CASE-2026-12345 — Noise Pollution")
- Last message preview with sender name
- Relative timestamp ("5m ago", "2h ago")
- Unread count badge (red pill, shows "9+" for 9+ unread)
- Pull-to-refresh

**Empty state:** "No conversations yet — Start chatting with the response team from any of your reports"

#### 2.9.2 Chat Screen

**Screen:** Chat

Real-time messaging within a report-scoped conversation:

**Message Display:**
- Citizen messages: Blue background, right-aligned, rounded corners
- Other messages (patrol/admin): White background, left-aligned, rounded corners
- Sender name shown for consecutive messages from different senders
- Timestamp under each message

**Input Bar:**
- Multi-line text field (max 1000 characters)
- Send button (circular blue with arrow icon)
- Typing state: Shows "X is typing..." indicator above input

**Real-Time Features:**
- Messages appear instantly via Socket.IO
- Optimistic UI: pending message shown immediately, replaced on server confirmation
- Typing indicator: emits `chat:typing` events while user types (debounced)
- Auto-scroll to bottom on new messages
- Read receipts: `chat:read` event sent when conversation opened

**Socket.IO Integration:**
- Joins conversation room on screen open
- Leaves room on screen dispose
- Falls back to REST API if socket send fails

---

### 2.10 Notifications

**Screen:** Notifications

Full-page notification list:

**Notification Types:**
| Type | Icon | Trigger |
|---|---|---|
| `REPORT_SUBMITTED` | Message envelope | Report submitted |
| `REPORT_ASSIGNED` | Police officer | Report assigned to patrol |
| `REPORT_STATUS_UPDATED` | Cycle/refresh | Report status changed |
| `PATROL_FOLLOW_UP` | Memo | Patrol submitted follow-up |

**Display:**
- Unread notifications: Bold title, blue left border, blue dot indicator
- Read notifications: Normal styling
- Time relative ("just now", "5m ago", "3h ago", "2d ago")
- Pull-to-refresh

**Actions:**
- Tap notification → marks as read + navigates to report detail (if `data.reportId` exists)
- "Mark all read" button in header (visible when unread > 0)

**Real-Time:**
- New notifications appear instantly via Socket.IO
- Unread count badge updates in real-time across Home, Settings, and Notifications screens

---

### 2.11 Settings & Profile

**Screen:** Settings (tab)

Three-tab layout with profile header:

**Profile Header:**
- User avatar (from `profileImage` URL or default person icon)
- Full name
- Phone number
- Guest mode shows: "Guest" / "Reporting anonymously" with Login button

**Tab 1: Reports**
- List of user's reports (same as My Reports)
- Summary stats at top: Total, Active, Resolved

**Tab 2: Preferences**
- **Language Selection:** 4 options (English, Amharic, Afaan Oromoo, Tigrinya) with radio-style selection and checkmark for active language
- **Change PIN** → navigates to Change PIN screen
- **Track Case** → navigates to Track Case screen
- **Log Out** → confirmation dialog → signs out

**Tab 3: Notifications**
- Inline notification list (same data as Notifications screen)

---

### 2.12 Change PIN

**Screen:** Change PIN

- Current PIN input (secure)
- New PIN input (secure, 4-6 digits)
- Confirm new PIN input (secure)
- Validation: PINs must match, regex `^\d{4,6}$`
- "Update PIN" button
- Success alert on completion

---

### 2.13 Language Support

**4 Languages:** English (`en`), Amharic (`am`), Afaan Oromoo (`om`), Tigrinya (`ti`)

**85+ translated strings** covering all UI text:
- App identity and branding
- Navigation labels
- Authentication screens
- Report forms
- Chat interface
- Notification labels
- Settings and profile
- Status labels
- Error messages
- Empty states

**Language Switching:**
- Home screen: Tap language badge → bottom sheet with 4 options
- Settings: Preferences tab with radio-style list
- Changes apply immediately across the entire app
- Persisted to SharedPreferences, restored on app restart

---

## 3. Patrol App Features

### 3.1 Authentication

**Screen:** Splash → Login

**Splash Screen:** Branded splash with shield icon, auto-navigates to login after 1.8 seconds.

**Login Screen:**
- Phone number input (+251 prefix)
- PIN input (4-6 digits)
- "Login" button
- Phone normalization: strips non-digits, removes leading 0 or 251, prepends +251

**API:** `POST /api/auth/patrol/login`

**Session Management:**
- Access + refresh tokens stored in SharedPreferences
- Device ID generated as `pat-<uuid>` (per install)
- Profile fetched from `GET /patrols/me/profile` on hydrate
- Socket.IO connected on successful login

---

### 3.2 Home Dashboard

**Screen:** Home (tab 1)

Patrol officer's main dashboard:

**Header:**
- Time-based greeting with officer name
- Profile avatar

**Stats Grid:**
- Total assigned reports
- Active (in-progress) reports
- Resolved reports
- Escalated reports

**Team Card:**
- Team name and woreda
- Number of online members
- "View Team" link

**Recent Assigned Reports:**
- Last 5 assigned reports
- Each shows: case ID, description preview, status badge, time ago
- "See All" link → Assigned Reports tab

**Quick Actions:**
- "Nearby Reports" — Radius-based search
- "Submit Work Report" — Daily report submission

---

### 3.3 Assigned Reports

**Screen:** Assigned Reports (tab 2)

Filterable list of all reports assigned to the officer:

**Filter Chips:** All, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED

**Each Report Card Shows:**
- Case ID
- Description (2 lines max)
- Status badge (colored pill)
- Address/area
- Distance from officer (km)
- Timestamp
- Emergency flag indicator

**Features:**
- Pull-to-refresh
- Tap → Report Detail screen

---

### 3.4 Report Detail & Actions

**Screen:** Report Detail

Full report view with all information (same sections as citizen app) plus patrol-specific actions:

**Report Information Displayed:**
- Status badge + emergency flag
- Reporter info (avatar, name, phone) if not anonymous
- Photo grid, video thumbnails, audio players
- Patrol-submitted evidence (photos, audio from follow-ups)
- Detail card (type, address, area, dates, flags)
- Description text
- People involved (suspect, victim, witness)
- Patrol notes (from previous follow-ups)
- Timeline (vertical stepper)
- Action message/error banners

**Action Buttons (Contextual by Status):**

| Current Status | Available Actions |
|---|---|
| SUBMITTED or ASSIGNED | Accept Report |
| IN_PROGRESS or RESOLVED | Submit Follow-up, Close Report |
| IN_PROGRESS or ASSIGNED | Escalate Report |

#### 3.4.1 Accept Report
- Confirmation dialog
- API: `PATCH /api/reports/:id/accept`
- Status changes from ASSIGNED to IN_PROGRESS
- Updates inspection start timestamp

#### 3.4.2 Submit Follow-up
- Navigates to Follow-Up Screen
- **Required:** Inspection notes (multiline text)
- **Auto-captured:** GPS location (with retry button)
- **Optional:** Up to 5 photos (from gallery)
- **Optional:** Audio recording (start/stop/re-record)
- API: `PATCH /api/reports/:id/follow-up` (multipart with `patrolEvidence` files)
- Creates ReportLog entry with notes and timestamp

#### 3.4.3 Escalate Report
- Navigates to Escalate Screen
- **Required:** Escalation notes
- Info text: "Escalating sends this report to your supervising office for review."
- API: `PATCH /api/reports/:id/escalate` with `{notes}`
- Status changes to ESCALATED
- Danger-styled submit button

#### 3.4.4 Close Report
- Confirmation dialog
- API: `PATCH /api/reports/:id/close`
- Status changes to CLOSED
- Updates inspection completion timestamp

---

### 3.5 Nearby Reports

**Screen:** Nearby Reports

Radius-based search for reports near the officer's patrol area:

**Controls:**
- Slider for search radius (1-50 km, default 10 km)
- Current radius displayed
- "Search" button

**Results:**
- List of reports within radius
- Each shows: case ID, description, status, distance in km, emergency flag
- Pull-to-refresh

**API:** `GET /api/reports/nearby?radiusKm={km}`

---

### 3.6 Work Reports

**Screen:** Work Reports (tab 3)

Daily work report management:

#### 3.6.1 Work Report List
- Filter chips: All, SUBMITTED, APPROVED, REJECTED
- FAB "Submit" button → Submit Work Report screen
- Each card shows: title, description (3 lines), status badge, report date, created timestamp
- Pull-to-refresh

#### 3.6.2 Submit Work Report
**Screen:** Submit Work Report

- **Title** field (required)
- **Description** field (required, 6 lines)
- **Date picker** (optional, defaults to today)
- **GPS location** capture (optional, with loading state)
- "Submit Work Report" button
- API: `POST /api/work-reports` with `{title, description, reportDate, latitude, longitude}`
- On success: pops back, shows snackbar, list reloads

---

### 3.7 Chat & Messaging (Patrol)

**Screen:** Conversations (tab 4 — "Inbox")

Identical to citizen app chat features:

**Conversations List:**
- Title (case ID + report type)
- Last message preview
- Unread count badge
- Pull-to-refresh

**Chat Screen:**
- Real-time messaging via Socket.IO
- Own messages: primary color, right-aligned
- Others' messages: card color, left-aligned
- Typing indicator
- Auto-scroll
- Optimistic message insertion
- REST fallback

---

### 3.8 Notifications (Patrol)

**Screen:** Notifications (tab 5 — "Alerts")

Same as citizen notifications:

- Type-specific icons
- Read/unread styling
- "Mark all read" button
- Tap → report detail
- Real-time via Socket.IO

---

### 3.9 Team Management

**Screen:** Team

View patrol team details and members:

**Team Card:**
- Team name
- Woreda name
- Team code badge
- Leader name

**Member List:**
- Each member shows:
  - Avatar (profile image or initials)
  - Full name
  - Phone number
  - Online/offline status indicator (green/gray dot)
- Leader badge on leader's row

**Online Detection:** Status is `ONLINE`, `ON_DUTY`, or `ACTIVE`

**Empty State:** "No team assigned" with retry button

**API:** `GET /patrol-teams/my`

---

### 3.10 Settings (Patrol)

**Screen:** Settings (tab 6 — "Profile")

**Profile Card:**
- Avatar with initials fallback
- Full name
- User code (ID)
- Phone number
- Assigned area

**Office Address Card:**
- Business icon + address text (if available)

**Menu Items:**
- **Change PIN** → Change PIN screen
- **Language** → Bottom sheet with 4 language options
- **About** → Flutter AboutDialog with app info
- **Log Out** → Confirmation dialog

**Footer:** "Peace & Security Patrol v1.0.0"

---

### 3.11 Change PIN (Patrol)

Same as citizen app:
- Current PIN, New PIN, Confirm New PIN
- Validation and success alert

---

## 4. Admin Dashboard Features

### 4.1 Authentication & Login

**Page:** `/` (root)

**Login Form:**
- Email or phone (+251 prefix) input
- Password input
- "Sign In" button
- "Forgot Password?" link (simulated)
- Redux Toolkit backed form state

**API:** `POST /api/auth/user/login`

**Token Management:**
- Access token stored in `localStorage('accessToken')`
- Refresh token stored in `localStorage('refreshToken')`
- Automatic token refresh on 401 responses
- Request queueing during refresh to prevent race conditions
- `ProtectedRoute` component wraps all `/dashboard/*` routes

---

### 4.2 Main Dashboard

**Page:** `/dashboard`

Executive overview with key metrics:

**Stat Cards (4):**
- Total Reports
- High Priority (emergency)
- Average Response Time
- Top Incident Location

**Charts:**
- **Bar Chart:** Reports by status over time (Recharts)
- **Line Chart:** Report trends over time
- **Donut Chart:** Reports by category

**Recent Activity Feed:**
- Latest report submissions
- Status changes
- Patrol assignments

**Export:**
- CSV export button
- PDF export button

**API:** `GET /api/dashboard/stats`, `GET /api/dashboard/reports`

---

### 4.3 Report Management

**Page:** `/dashboard/reports`

Full report lifecycle management:

#### 4.3.1 Report Listing
- Paginated table with columns: Case ID, Type, Status, Reporter, Assigned To, Location, Date, Actions
- Status filter dropdown
- Search by case ID or description
- Status badges with color coding
- Action buttons: View, Edit, Assign, Delete

#### 4.3.2 Report Detail
**Page:** `/dashboard/reports/[id]`

Complete report view with:
- All report information (same as mobile apps)
- Patrol assignment modal
- Action buttons (Accept, Follow-up, Escalate, Close)
- Timeline/history
- Chat entry

#### 4.3.3 Report Creation
**Page:** `/dashboard/reports/create`

Admin can create reports on behalf of citizens:
- Report type selection
- Severity/emergency toggle
- Address and location
- Description
- Reporter phone and name (optional — for anonymous reports)
- Media uploads
- Noise decibel gauge (for noise reports)

#### 4.3.4 Report Editing
**Page:** `/dashboard/reports/[id]/edit`

Edit existing report details.

#### 4.3.5 Patrol Assignment

Modal to assign patrol officers:
- Searchable dropdown of available patrol officers
- Shows officer name, assigned area, current workload
- Assignment creates notification to the patrol officer

---

### 4.4 Patrol Officer Management

**Page:** `/dashboard/patrols`

Field officer administration:

**Listing:**
- Paginated table: Avatar, Name, Phone, Area, Status, Team, Actions
- Search by name or phone
- Status filter (Active/Inactive)
- Date range filter

**Create/Edit Form:**
- Full name, email, phone
- Assigned area (city → subcity → woreda dropdown cascade)
- Office address and coordinates (MapPicker)
- Patrol team assignment
- Commander assignment
- Profile image upload
- Status toggle

**Actions:**
- View detail
- Edit profile
- Toggle status (enable/disable)
- Delete (with confirmation)

**API:** CRUD on `/api/patrols/*`

---

### 4.5 Citizen Management

**Page:** `/dashboard/citizens`

Citizen account administration:

**Listing:**
- Paginated table: Avatar, Name, Phone, Status, Registration Date, Actions
- Search by name or phone
- Status filter
- Date range filter

**Detail View:**
**Page:** `/dashboard/citizens/[id]`

- Full citizen profile
- Report history
- Status management

**Actions:**
- View detail
- Edit profile
- Toggle status
- Delete

**API:** CRUD on `/api/citizens/*`

---

### 4.6 User Management (Staff/Admin)

**Page:** `/dashboard/user-management`

System user and role administration:

**Role Hierarchy Visualization:**
- Visual tree showing role hierarchy
- Permission matrix display

**User Listing:**
- Table: Avatar, Name, Email, Phone, Role (badge), Geographic Scope, Status
- Role filter, status filter, search
- Pagination

**Create/Edit User Form:**
- Full name, email, phone (+251 prefix)
- Role selection (filtered by current user's role — can only create roles at or below their level)
- Geographic assignment:
  - City-level roles: City selection
  - Subcity-level roles: City → Subcity cascade
  - Woreda-level roles: City → Subcity → Woreda cascade
- Patrol-specific fields (if role is patrol):
  - Station, office address, coordinates (MapPicker)
  - Commander assignment
- Permissions (searchable grouped permission picker with category toggles):
  - Reports: VIEW, CREATE, EDIT, DELETE, ASSIGN, STATUS_CHANGE
  - Users: VIEW, CREATE, EDIT, DELETE, STATUS_CHANGE
  - Patrols: VIEW, CREATE, EDIT, DELETE
  - Citizens: VIEW, CREATE, EDIT, DELETE
  - Cameras: VIEW, CREATE, EDIT, DELETE
  - Geo: VIEW, CREATE, EDIT, DELETE
  - Report Types: VIEW, CREATE, EDIT, DELETE
  - Chat: VIEW, SEND
  - Analytics: VIEW
  - Audit: VIEW
  - Settings: VIEW, EDIT
- Profile image upload

**Actions:**
- Toggle status (enable/disable)
- Reset password
- Delete (with confirmation)

**API:** CRUD on `/api/users/*`

---

### 4.7 Report Type Management

**Page:** `/dashboard/report-types`

Manage incident category definitions:

**Listing:**
- Paginated table: Name, Description, Status, Decibel Thresholds, Actions
- Search by name
- Create button

**Create/Edit Form:**
- Name (unique identifier)
- Description (human-readable)
- Active toggle
- Residential decibel threshold (for noise types)
- Commercial decibel threshold (for noise types)

**Actions:**
- Edit
- Toggle active status
- Delete

**API:** CRUD on `/api/report-types/*`

---

### 4.8 Camera Management

**Page:** `/dashboard/cameras`

Surveillance camera administration:

**Grid View:**
- Table/card layout showing all cameras
- Columns: Camera ID, Location, Status, Stream URL, Actions

**Map View:**
- Google Maps with camera markers
- InfoWindows on marker click showing camera details
- Location visualization for coverage analysis

**Create/Edit Form:**
- Camera ID (unique)
- Location description
- Latitude/Longitude (MapPicker)
- Stream URL
- Active toggle

**Actions:**
- Edit
- Toggle status
- Delete

**API:** CRUD on `/api/cameras/*`

---

### 4.9 Geographic Management

**Page:** `/dashboard/geo`

Three-level geographic hierarchy management:

**Tab-Based Navigation:**
- Tab visibility is role-based:
  - City-level officers: See Cities tab
  - Subcity-level officers: See Subcities tab
  - Woreda-level officers: See Woredas tab
  - Super admins: See all tabs

**Cities Tab:**
- List of cities with name, code, coordinates
- Create/edit/delete

**Subcities Tab:**
- List of subcities with name, parent city, coordinates
- City filter dropdown
- Create/edit/delete

**Woredas Tab:**
- List of woredas with name, parent subcity, coordinates
- Subcity filter dropdown
- Create/edit/delete

**Map Picker:**
- Interactive map for selecting coordinates during create/edit
- Click to place marker
- Drag to adjust

**API:** CRUD on `/api/geo/cities`, `/api/geo/subcities`, `/api/geo/woredas`

---

### 4.10 Patrol Team Management

**Page:** `/dashboard/patrol-teams`

Patrol team administration:

**Access Restriction:** Only Woreda Police Commanders can manage patrol teams.

**Listing:**
- Table: Team Name, Code, Woreda, Leader, Member Count, Actions
- Search and filter

**Create/Edit Form:**
- Team name
- Team code
- Woreda selection
- Leader assignment (from available patrol officers in the woreda)
- Member management (add/remove patrol officers)

**Member Management:**
- Searchable list of available patrol officers
- Add member button
- Remove member button (with confirmation)
- Online/offline status indicator

**API:** CRUD on `/api/patrol-teams/*`

---

### 4.11 Work Report Management

**Page:** `/dashboard/work-reports`

Review patrol officer daily work reports:

**Listing:**
- Paginated table: Title, Reporter, Date, Status, Actions
- Status filter (All, SUBMITTED, APPROVED, REJECTED)
- Search by title

**Detail View:**
- Full work report content
- Reporter information
- GPS location (if provided)
- Review actions

**Review Actions:**
- **Approve** — Sets status to APPROVED
- **Reject** — Sets status to REJECTED with optional review note

**API:** `GET /api/work-reports`, `PATCH /api/work-reports/:id/approve`, `PATCH /api/work-reports/:id/reject`

---

### 4.12 Real-Time Chat (Dashboard)

**Page:** `/dashboard/chat`, `/dashboard/chat/[id]`

Admin/patrol chat interface:

**Conversation List:**
- Left panel with all conversations
- Each shows: title, last message preview, timestamp, unread badge
- Search/filter conversations

**Message Pane:**
- Right panel with message thread
- Message bubbles (own = primary, others = white)
- Sender name and role badges
- Timestamps
- Typing indicator
- Read receipts
- Pagination for message history

**Socket.IO Integration:**
- Join/leave conversation rooms
- Send/receive messages in real-time
- Typing indicators
- Auto-refresh on new messages

---

### 4.13 Analytics

**Page:** `/dashboard/analytics`

Detailed analytics and reporting:

**Time Range Selection:**
- Dropdown: Last 7 days, 30 days, 90 days, 1 year

**KPI Cards (4):**
- Total Reports
- High Priority Reports
- Average Response Time
- Top Incident Location

**Charts:**
- **Status Bar Chart:** Reports by status over selected time range
- **Monthly Line Chart:** Report volume trends
- **Category Donut Chart:** Reports by incident type

**Export:**
- CSV export of analytics data
- PDF export with charts

**API:** `GET /api/analytics?timeRange={range}`

---

### 4.14 Audit Trail

**Page:** `/dashboard/audit-logs`

Three-tab audit system:

#### Tab 1: Audit Trail
- Complete log of all system actions
- Columns: Timestamp, Actor, Action, Entity, Details, IP Address
- Entity type filter
- Date range filter
- Actor filter

#### Tab 2: Security Events
- Login attempts (success/failure)
- Permission changes
- Password resets
- Account lockouts

#### Tab 3: Data Access Events
- Who accessed what data
- When data was accessed
- What operations were performed

**Features:**
- Pagination with rows-per-page selector
- CSV export
- PDF export
- Chain integrity verification button (checks SHA-256 hash chain)

**API:**
- `GET /api/audit` — Audit logs
- `GET /api/audit/security-events` — Security events
- `GET /api/audit/data-access` — Data access events
- `GET /api/audit/verify-chain` — Verify hash chain

---

### 4.15 Fleet Map

**Page:** `/dashboard/map`

Live tracking of patrol officers and incidents:

**Map Features:**
- Google Maps showing:
  - **Patrol officer markers** — Current GPS positions
  - **Citizen markers** — Registered citizen locations
  - **Report markers** — Incident locations with status colors
- InfoWindows on marker click showing entity details
- Auto-refresh every 15 seconds
- Zoom and pan controls

**Overlay Controls:**
- Toggle patrol visibility
- Toggle citizen visibility
- Toggle report visibility
- Filter by report status

**API:** `GET /api/dashboard/fleet` (patrol locations), report and citizen data from respective endpoints

---

### 4.16 Notification Management

**Page:** `/dashboard/notifications`

Notification administration and testing:

**Features:**
- Notification broadcast simulator (send test notifications)
- Notification log viewer (history of all sent notifications)
- Real-time notification bell in dashboard header with unread count

**Dashboard Header Integration:**
- Bell icon with red dot badge (unread count)
- Dropdown panel showing latest notifications
- "Mark all read" button
- Click notification → navigate to relevant entity

---

### 4.17 System Settings

**Page:** `/dashboard/settings`

General system configuration:

**General Settings:**
- Bureau name
- Bureau code
- Timezone
- Other configuration parameters

**Team & Roles Management:**
- Invite new users via email
- Toggle user status
- Quick role assignment

---

### 4.18 Forgot Password

**Page:** `/forgot-password`

Password reset flow (simulated):
- Email input
- "Send Reset Link" button
- Simulated with setTimeout (no real API call in current implementation)

---

## 5. Backend System Features

### 5.1 Authentication System

**Three separate auth flows:**

| User Type | Auth Flow | Login Endpoint |
|---|---|---|
| Citizen | Register → OTP → Set PIN → Login with Phone+PIN | `/auth/citizen/*` |
| Patrol | Login with Phone+PIN (pre-configured accounts) | `/auth/patrol/login` |
| Admin/Staff | Login with Email/Phone+Password | `/auth/user/login` |

**JWT Implementation:**
- Access tokens: Short-lived (configurable via `JWT_EXPIRY`)
- Refresh tokens: Longer-lived, rotated on use
- Token payload: `{sub: userId, role: userType, email}`
- Global prefix: `/api`

**Guards:**
- `JwtAuthGuard` — Validates JWT, attaches user to request
- `RolesGuard` — Checks role against `@Roles()` decorator
- `HierarchyGuard` — Enforces geographic scope
- `OptionalJwtAuthGuard` — Optional authentication

### 5.2 Rate Limiting

- Global: 100 requests per 60 seconds per IP
- OTP endpoints: Additional cooldown between resend attempts
- Failed login attempts: Tracked for lockout

### 5.3 File Processing Pipeline

1. Receive multipart upload via Multer
2. Validate file type and size
3. Process images with `sharp`:
   - Resize to maximum dimensions
   - Generate thumbnails (smaller versions)
   - Optimize quality
4. Store files in `/uploads/` directory
5. Serve files at `GET /uploads/{filename}` (no `/api` prefix)
6. Return relative URLs in database records

### 5.4 Audit Trail System

**Implementation:**
- Every significant action creates an `AuditLog` entry
- Each entry includes SHA-256 hash of: `{entityType, entityId, action, actorId, timestamp, previousHash}`
- Creates an immutable hash chain
- Chain verification endpoint detects any tampering

**Logged Actions:**
- Report creation, update, deletion, status changes
- User creation, update, deletion
- Patrol creation, update
- Login attempts (success/failure)
- Data access events

### 5.5 Geographic Seeding

**GeoSeederService** automatically seeds on application start:
- **City:** Addis Ababa (code: `AA`)
- **Subcities:** Bole, Kirkos, Yeka, Addis Ketema
- **Woredas:** Bole Michael, Bole Medhanealem (both in Bole subcity)

### 5.6 Admin Seeding

**AdminSeederService** creates default accounts:

| Role | Email/Phone | Password/PIN |
|---|---|---|
| SYSTEM_SUPER_ADMIN | admin@example.com | admin123 |
| SYSTEM_ADMIN | (15 additional users) | admin123 |
| PEACE_SUPER_ADMIN | (viewer variants) | admin123 |
| PATROL | +2519111111111 (3 officers) | PIN: 1234 |
| CITIZEN | +2519222222222 (3 citizens) | PIN: 1234 |

### 5.7 Report Type Seeding

**ReportTypeSeederService** creates 11 report types:
- NOISE (with residential/commercial decibel thresholds)
- LITTERING, VANDALISM, AIR_POLLUTION, WATER_POLLUTION
- SOIL_CONTAMINATION, ILLEGAL_DUMPING, DEFORESTATION
- HAZARDOUS_WASTE, WILDLIFE_POACHING, OTHERS

### 5.8 SMS Integration

External SMS service for OTP delivery:
- Configured via `SMS_URL`, `SMS_TOKEN`, `SMS_SENDER` environment variables
- Used for OTP delivery during citizen registration
- PIN reset OTP delivery

### 5.9 Response Envelope

All API responses wrapped in consistent envelope:
```json
{
  "success": true|false,
  "message": "Description",
  "statusCode": 200|400|401|403|404|500,
  "data": { ... },
  "total": 100,        // paginated only
  "page": 1,           // paginated only
  "limit": 20,         // paginated only
  "totalPages": 5      // paginated only
}
```

---

## 6. Cross-Cutting Features

### 6.1 Real-Time Communication

**Socket.IO Implementation:**

| Namespace | Purpose | Events |
|---|---|---|
| `/` (root) | Notifications | `authenticate`, `notification`, `unread_count` |
| `/chat` | Messaging | `chat:join`, `chat:leave`, `chat:send`, `chat:typing`, `chat:read`, `chat:message`, `chat:conversation_created` |

**Client Implementation (Flutter):**
- `SocketService` singleton manages both connections
- Streams exposed via `StreamController`
- BLoC subscribes to streams for state updates
- Automatic reconnection handling

**Client Implementation (Dashboard):**
- Socket.IO client via React hooks
- Context providers for notifications and chat
- Real-time updates without page refresh

### 6.2 Internationalization

**4 Languages:** English, Amharic, Afaan Oromoo, Tigrinya

**Mobile Apps:**
- Custom `AppLocalizations` class with 85+ keys
- `AppLocalizationsScope` InheritedWidget
- `LanguageBloc` (Cubit) manages state
- Language persisted to SharedPreferences
- All strings translated in all 4 languages
- Parameterized strings: `goodMorning: "Good Morning, {name}"`

**Dashboard:**
- English only (no i18n implemented)

### 6.3 State Management

**Flutter Apps (BLoC Pattern):**

| BLoC | Purpose | Key Events |
|---|---|---|
| `AuthBloc` | Authentication | Hydrate, Login, Register, Verify OTP, Change PIN, Logout |
| `ReportsBloc` | Report management | Fetch, Create, Track, Stats |
| `ChatBloc` | Messaging | Fetch conversations, Send message, Typing, Socket events |
| `NotificationsBloc` | Notifications | Fetch, Mark read, Socket events |
| `LanguageBloc` | Language | Set language, Persist |

**Dashboard (Redux Toolkit):**

| Slice | Purpose |
|---|---|
| `authSlice` | Authentication state |
| `reportsSlice` | Reports data |
| `usersSlice` | User management |
| `camerasSlice` | Camera management |
| `reportTypesSlice` | Report type management |
| `geoSlice` | Geographic data |
| `chatSlice` | Chat data |
| `dashboardSlice` | Dashboard statistics |
| `analyticsSlice` | Analytics data |
| `auditSlice` | Audit logs |
| `patrolTeamsSlice` | Team management |
| `notificationSlice` | Notifications |
| `workReportSlice` | Work reports |

### 6.4 Reusable UI Components

**Mobile Apps (12 widgets):**
| Widget | Description |
|---|---|
| `Screen` | Scaffold wrapper with SafeArea, scroll, keyboard handling, pull-to-refresh |
| `AppHeader` | Top bar with title, subtitle, back button, right widget slot |
| `AppButton` | 4 variants (primary, outline, danger, ghost) with loading state |
| `AppInput` | Text field with label, hint, error, prefix, secure toggle, multiline |
| `AppCard` | White card with shadow, rounded corners, optional tap |
| `StatusBadge` | Colored pill badge showing report status with dot |
| `EmptyState` | Centered placeholder with icon, title, subtitle, action |
| `Loader` | Centered circular progress with optional label |
| `MediaThumb` | Thumbnail for images, videos, or audio |
| `AudioPlayerWidget` | Full audio player with play/pause, progress bar, time |
| `IncidentMap` | Google Maps with color-coded markers (citizen only) |
| `AppSwitch` | Custom animated toggle switch |

**Dashboard (50+ components):**
Standard shadcn/ui components plus custom components for:
- Tables (ReusableTable, UserTable, PatrolTable, CitizenTable)
- Forms (LoginForm, UserForm, ReportForm, ReportTypeForm, CameraForm)
- Maps (EcoGoogleMap, MapPicker)
- Charts (StatusBarChart, MonthlyLineChart, CategoryDonutChart)
- Analytics (AnalyticsStats, DecibelGauge)
- Layout (Sidebar, DashboardHeader, ProtectedRoute, PageHeader)

### 6.5 Design System

**Color Palette:**
| Name | Hex | Usage |
|---|---|---|
| Primary | `#0d2d82` | Headers, primary actions |
| Primary Dark | `#081a4d` | Splash branding |
| Primary Light | `#eef1fb` | Light backgrounds |
| Background | `#f6f8fc` | Scaffold background |
| Card | `#FFFFFF` | Card surfaces |
| Success | `#16a34a` | Success, resolved |
| Danger | `#dc2626` | Errors, emergencies, rejection |
| Accent | `#f59e0b` | Amber accent, assigned status |
| Info | `#2563eb` | Info badges, submitted status |

**Typography:** Material Design 3 type scale (h1-h3, body, small, caption, label)

**Border Radii:** Card 16px, Button 12px, Input 12px, Chip pill (999px)

### 6.6 Error Handling

**Mobile Apps:**
- `ApiException` with statusCode, message, isUnauthorized
- 401 on non-auth routes triggers session clear
- DioException types mapped to user-friendly messages
- Timeout handling (connect 20s, receive 45s)
- Connection error messages

**Dashboard:**
- Axios interceptor handles 401 with automatic token refresh
- Request queueing during refresh
- Toast notifications via Sonner for success/error feedback
- Loading states on all async operations

### 6.7 Data Models

**Key Models (shared across clients):**

| Model | Fields | Used By |
|---|---|---|
| `Citizen` | id, userCode, fullName, phoneNumber, role, profileImage, status | Citizen App |
| `PatrolUser` | id, userCode, fullName, phoneNumber, role, assignedArea, officeAddress, lat/lng | Patrol App |
| `Report` | 30+ fields (see SRS) | All clients |
| `ReportType` | id, name, description, isActive, decibelThresholds | All clients |
| `ReportLog` | id, status, note, changedBy, createdAt | All clients |
| `Message` | id, conversationId, senderId/Type/Name, content, isRead, createdAt | Chat |
| `Conversation` | id, reportId, lastMessage, unreadCount | Chat |
| `AppNotification` | id, title, message, type, data, isRead | Notifications |
| `WorkReport` | id, title, description, reportDate, status | Patrol App |
| `PatrolTeam` | id, name, code, woredaId, leader, members | Patrol App |

### 6.8 Navigation Architecture

**Mobile Apps (GoRouter):**
- `ShellRoute` wraps main tabs with `BottomNavigationBar`
- Citizen: 4 tabs (Home, Map, Reports, Settings)
- Patrol: 6 tabs (Home, Assigned, Work Reports, Inbox, Alerts, Profile)
- Auth redirect guard: unauthenticated users → splash
- Stack navigation for detail screens above shell

**Dashboard (Next.js App Router):**
- `/` — Login (public)
- `/forgot-password` — Password reset (public)
- `/dashboard/*` — Protected routes (requires authentication)
- Sidebar navigation with permission-filtered menu items
- Breadcrumb navigation on detail pages

---

**End of Feature Description Document**
