# Audit Logging System — Peace & Security

## Overview

Every database write operation (CREATE, UPDATE, DELETE) across all audited entities is automatically recorded in the `audit_logs` table. The system uses a **TypeORM Entity Subscriber** that intercepts database events at the entity level — no manual logging required in services.

---

## Architecture

```
┌──────────────┐     beforeInsert      ┌─────────────────┐     INSERT/UPDATE/DELETE     ┌──────────────┐
│  Service      │ ──────────────────── │  AuditSubscriber │ ──────────────────────────── │  audit_logs   │
│  (save/soft)  │     beforeUpdate     │  (intercepts     │      (persists via            │  (PostgreSQL) │
│               │     beforeRemove     │       events)     │       repo.save)              │               │
└──────────────┘                       └─────────────────┘                                └──────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `apps/backend/src/modules/audit/audit.subscriber.ts` | Entity subscriber — intercepts all INSERT, UPDATE, DELETE events |
| `apps/backend/src/modules/audit/entities/audit-log.entity.ts` | Audit log entity (16 columns, 6 indexes) |
| `apps/backend/src/modules/audit/audit.service.ts` | Query service — filtering, pagination, CSV/PDF export |
| `apps/backend/src/modules/audit/audit.controller.ts` | REST API for audit log queries |
| `apps/backend/src/modules/audit/request-context.ts` | AsyncLocalStorage — carries user info through request |
| `apps/backend/src/main.ts` | Middleware — decodes JWT, stores user context per request |

---

## Audited Entities (17)

| # | Entity | CREATE | UPDATE | DELETE (soft) | Notes |
|---|--------|--------|--------|---------------|-------|
| 1 | **User** | ✅ | ✅ | ✅ | Admin/officer accounts |
| 2 | **Citizen** | ✅ | ✅ | ✅ | Citizen reporter accounts |
| 3 | **Report** | ✅ | ✅ | ✅ | Crime/incident reports |
| 4 | **ReportType** | ✅ | ✅ | ✅ | Crime categories |
| 5 | **City** | ✅ | ✅ | ✅ | Geographic — top level |
| 6 | **Subcity** | ✅ | ✅ | ✅ | Geographic — mid level |
| 7 | **Woreda** | ✅ | ✅ | ✅ | Geographic — lowest level |
| 8 | **Patrol** | ✅ | ✅ | ✅ | Patrol officer accounts |
| 9 | **PatrolTeam** | ✅ | ✅ | ✅ | Patrol team groupings |
| 10 | **PatrolTeamMember** | ✅ | ✅ | ✅ | Team membership junction |
| 11 | **Camera** | ✅ | ✅ | ✅ | IP cameras |
| 12 | **CameraAlert** | ✅ | ✅ | ✅ | Camera violation alerts |
| 13 | **ReportLog** | ✅ | ✅ | ✅ | Report status change history |
| 14 | **Setting** | ✅ | ✅ | ✅ | Bureau settings |
| 15 | **Notification** | ✅ | ✅ | ✅ | Push notification records |
| 16 | **Conversation** | ✅ | ✅ | ✅ | Citizen-officer chat threads |
| 17 | **Message** | ✅ | ✅ | ✅ | Chat messages |

### Not Audited (Intentional)

| Entity | Reason |
|--------|--------|
| OTP | Ephemeral verification codes, no audit value |
| BaseEntity relations (createdBy, approvedBy, updatedBy) | Referential only |

---

## What Each Audit Log Records

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `timestamp` | timestamp | When the action occurred |
| `actorId` | string | User ID who performed the action |
| `actorName` | string | Display name of the actor |
| `actorRole` | enum | Role: SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN, PATROL, etc. |
| `ipAddress` | string | Client IP address |
| `entity` | string | Entity name (e.g., "User", "Report", "Subcity") |
| `entityId` | UUID | ID of the affected record |
| `action` | enum | CREATE, UPDATE, DELETE |
| `cityId` | UUID | Geographic scope — city |
| `subcityId` | UUID | Geographic scope — subcity |
| `woredaId` | UUID | Geographic scope — woreda |
| `oldValues` | jsonb | Field values before change |
| `newValues` | jsonb | Field values after change |
| `changedFields` | text[] | List of changed field names |
| `description` | text | Human-readable description |

### Indexes

- `entity + entityId` — fast lookups for entity trail
- `actorId` — find all actions by a user
- `timestamp` — chronological queries
- `cityId`, `subcityId`, `woredaId` — geographic filtering

---

## How It Works

### 1. Request Context (main.ts)

Every HTTP request flows through middleware that decodes the JWT token and stores the user's identity in `AsyncLocalStorage`:

```typescript
RequestContext.run({
  userId: decoded.sub,
  userName: decoded.fullName || decoded.email,
  userRole: decoded.role,
  ipAddress: req.ip,
}, () => next());
```

### 2. Subscriber Intercepts Events

The `AuditSubscriber` hooks into TypeORM's entity lifecycle:

- **`afterLoad`** — stores original values on the entity for comparison
- **`beforeInsert`** — logs CREATE with full entity snapshot
- **`beforeUpdate`** — compares entity columns using metadata, logs changed fields
- **`beforeRemove`** — logs hard DELETE (currently unused, soft delete used instead)

### 3. Soft Delete Detection

When `beforeUpdate` detects that `deletedAt` changed from `null` to a timestamp, it logs the action as DELETE (soft delete) instead of UPDATE.

### 4. Change Detection (UPDATE)

For UPDATE events, the subscriber uses TypeORM's entity metadata to iterate only over real columns (not computed or `__`-prefixed properties). It compares each column value using `JSON.stringify()` for deep equality:

```typescript
const columns = event.metadata.columns.map(c => c.propertyName);
for (const key of columns) {
  if (oldJson !== newJson) {
    changedFields.push(key);
  }
}
```

---

## API Endpoints

### Base URL: `/api/audit-logs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin+ | List audit logs with filters |
| GET | `/:id` | Admin+ | Get single audit log with full diff |
| GET | `/entity/:type/:id` | Admin+ | Get full audit trail for a specific record |
| GET | `/export/csv` | Super Admin/Admin | Export filtered logs as CSV |
| GET | `/export/pdf` | Super Admin/Admin | Export filtered logs as printable HTML/PDF |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entity` | string | Filter by entity name (e.g., "User", "Report") |
| `action` | string | Filter by action: CREATE, UPDATE, DELETE |
| `actorId` | UUID | Filter by actor user ID |
| `cityId` | UUID | Filter by city |
| `subcityId` | UUID | Filter by subcity |
| `woredaId` | UUID | Filter by woreda |
| `startDate` | ISO date | Filter from date |
| `endDate` | ISO date | Filter to date |
| `page` | number | Pagination page (default: 1) |
| `limit` | number | Results per page (default: 20) |

### Access Roles

Audit logs are accessible to: SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN, PEACE_SUPER_ADMIN, PEACE_OFFICER_SUBCITY, PEACE_OFFICER_WOREDA, POLICE_COMMANDER_CITY, POLICE_COMMANDER_SUBCITY, POLICE_COMMANDER_WOREDA.

---

## How Entities Are Audited

### Soft Delete Pattern

All entities use soft delete — never hard delete (except OTP). The service sets `deletedAt` on the entity and calls `save()`, which triggers the subscriber:

```typescript
// Correct — triggers subscriber
entity.deletedAt = new Date();
await this.repo.save(entity);

// WRONG — bypasses subscribers
await this.repo.delete(id);
await this.repo.softDelete(id);
```

### UPDATE Pattern

Services must load the entity, modify it, then save — NOT use raw `.update()`:

```typescript
// Correct — triggers subscriber
const entity = await this.repo.findOne({ where: { id } });
Object.assign(entity, dto);
await this.repo.save(entity);

// WRONG — bypasses subscribers
await this.repo.update(id, dto);
```

---

## Sample Audit Log Output

```
 entity  | action |          description                    | changedFields
---------|--------|------------------------------------------|------------------
 User    | CREATE | Created User                             |
 User    | UPDATE | Updated User: fullName                   | {fullName}
 User    | DELETE | Deleted User (soft delete)               |
 City    | CREATE | Created City                             |
 City    | UPDATE | Updated City: name                       | {name}
 City    | DELETE | Deleted City (soft delete)               |
 Subcity | CREATE | Created Subcity                          |
 Subcity | UPDATE | Updated Subcity: isActive                | {isActive}
 Subcity | DELETE | Deleted Subcity (soft delete)            |
 Citizen | CREATE | Created Citizen                          |
 Citizen | UPDATE | Updated Citizen: fullName, email, ...    | {fullName,email,verificationStatus}
 Citizen | DELETE | Deleted Citizen (soft delete)            |
 Camera  | CREATE | Created Camera                           |
 Camera  | UPDATE | Updated Camera: locationName             | {locationName}
 Camera  | DELETE | Deleted Camera (soft delete)             |
```

---

## Data Model: Expanded Entities

### Citizen (22 columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `fullName` | string | Citizen full name |
| `phoneNumber` | string | Ethiopian phone (+251...) |
| `email` | string | Optional email |
| `pin` | string | Hashed PIN for mobile login |
| `userCode` | string | Unique 8-char code |
| `profileImage` | string | Profile photo URL |
| `status` | enum | PENDING/ACTIVE/DISABLED |
| `preferredLanguage` | enum | AMHARIC/AFFINNO/OROMO/TIGRINYA/SOMALI/ENGLISH |
| `verificationStatus` | enum | PENDING/VERIFIED/REJECTED |
| `devicePlatform` | enum | ANDROID/IOS/WEB |
| `appVersion` | string | Citizen app version |
| `deviceId` | string | App-generated UUID (NOT IMEI) |
| `lastLoginAt` | timestamp | Last login tracking |
| `fcmToken` | string | Firebase push token |

### Report (48 columns)

| Column | Type | Description |
|--------|------|-------------|
| `caseId` | string | Auto-generated case number (REP-XXXXXX) |
| `reporterId` | UUID | Linked citizen |
| `reporterPhoneNumber` | string | Phone at time of report |
| `reportTypeId` | UUID | Crime category |
| `violationType` | string | Crime type name |
| `reportDescription` | text | What happened |
| `latitude/longitude` | decimal | Incident GPS coordinates |
| `address/area` | string | Human-readable location |
| `imageUrls/videoUrls/audioUrls` | text[] | Evidence by media type |
| `evidenceUrls` | text[] | Combined evidence (legacy) |
| `decibelLevel` | float | For noise reports |
| `noiseAreaType` | enum | RESIDENTIAL/COMMERCIAL |
| `status` | enum | SUBMITTED→ASSIGNED→IN_PROGRESS→RESOLVED |
| `assignedPatrolId` | UUID | Assigned patrol officer |
| `patrolNotes` | text | Officer inspection notes |
| `patrolImageUrls/videoUrls/audioUrls` | text[] | Officer evidence |
| `incidentDateTime` | timestamp | **When the crime happened** |
| `isOngoing` | boolean | **Is crime still happening?** |
| `isEmergency` | boolean | **Needs immediate response** |
| `suspectInfo` | text | **Suspect description** |
| `victimInfo` | text | **Victim info if different from reporter** |
| `witnessInfo` | text | **Voluntary witness info** |
| `deviceId` | string | **Device UUID that submitted report** |
| `devicePlatform` | enum | **ANDROID/IOS/WEB** |
| `appVersion` | string | **App version** |
| `ipAddress` | string | **Server-captured IP address** |
| `assignedDepartmentId` | UUID | **Department assignment** |
| `investigationNotes` | text | **Investigation tracking** |
| `resolvedAt` | timestamp | **When exactly it was resolved** |

---

## Play Store / App Store Compliance

| Data Type | Collection | Requirement |
|-----------|------------|-------------|
| **App-generated UUID** | `deviceId` | Disclose in privacy policy |
| **IP Address** | `ipAddress` (server-side) | Automatically available |
| **Phone Number** | `phoneNumber` | Explicit consent required |
| **GPS Location** | `latitude/longitude` | Request permission at time of use |
| **Audio Recording** | `audioUrls` | Request permission at time of use |
| **Photos/Videos** | `imageUrls/videoUrls` | Request permission at time of use |
| **IMEI / Serial Number** | ❌ NOT COLLECTED | Prohibited by both stores |

---

## Adding a New Audited Entity

1. Add the entity name to `AUDITED_ENTITIES` in `audit.subscriber.ts`
2. Ensure the entity uses `save()` for all writes (not `.update()` or `.delete()`)
3. Ensure the entity extends `BaseEntity` for `deletedAt` support
4. Ensure all write operations go through the service (not raw QueryBuilder)
5. Rebuild and test: CREATE → UPDATE → DELETE → verify 3 audit log rows
