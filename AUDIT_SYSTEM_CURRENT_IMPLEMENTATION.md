# AUDIT SYSTEM - CURRENT IMPLEMENTATION

> **Generated**: 2026-07-23
> **Version**: 3.0 (subscriber fix, business events, full controller coverage)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Three Audit Tables](#2-three-audit-tables)
3. [Entity Schema Definitions](#3-entity-schema-definitions)
4. [Audit Subscriber (Automatic Entity Mutations)](#4-audit-subscriber-automatic-entity-mutations)
5. [Request Context Middleware](#5-request-context-middleware)
6. [Append-Only Database Triggers](#6-append-only-database-triggers)
7. [Hash Chain (Tamper Evidence)](#7-hash-chain-tamper-evidence)
8. [Sensitive Field Redaction](#8-sensitive-field-redaction)
9. [Security Event Logging](#9-security-event-logging)
10. [Data Access Event Logging](#10-data-access-event-logging)
11. [Business Event Logging](#11-business-event-logging)
12. [REST API Endpoints](#12-rest-api-endpoints)
13. [Module Dependencies](#13-module-dependencies)
14. [Database State (Current Data)](#14-database-state-current-data)
15. [Sensitive Data Access Matrix](#15-sensitive-data-access-matrix)
16. [Gaps and Next Steps](#16-gaps-and-next-steps)

---

## 1. Architecture Overview

The audit system consists of **three independent PostgreSQL tables**, each append-only protected by database triggers, with SHA-256 hash chains for tamper detection.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INCOMING REQUEST                            │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  main.ts - RequestContext Middleware                                │
│  ─ Extracts JWT token (userId, userName, userRole)                 │
│  ─ Extracts device headers (x-device-id, x-device-platform, etc.) │
│  ─ Detects source (CITIZEN_APP / PATROL_APP / WEB)                 │
│  ─ Generates requestId (crypto.randomUUID())                       │
│  ─ Runs all subsequent code inside RequestContext.run()             │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  ENTITY MUTATION │ │  AUTH / LOGIN    │ │  READ ACCESS     │
│  (save/update/   │ │  (explicit       │ │  (explicit       │
│   delete)        │ │   call)          │ │   call)          │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ AuditSubscriber  │ │ AuditService     │ │ AuditService     │
│ (TypeORM hooks)  │ │ .logSecurityEvent│ │ .logDataAccess() │
│                  │ │ .logBusinessEvent│ │                  │
│ afterInsert()    │ │                  │ │                  │
│ beforeUpdate()   │ │ → security_events│ │ → data_access_   │
│ beforeRemove()   │ │ → audit_logs     │ │    events        │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Tables                            │
│  ┌──────────────┐ ┌──────────────────┐ ┌───────────────────────┐   │
│  │  audit_logs  │ │ security_events  │ │ data_access_events    │   │
│  │  (append-only)│ │ (append-only)   │ │ (append-only)         │   │
│  └──────────────┘ └──────────────────┘ └───────────────────────┘   │
│                                                                     │
│  All 3 tables protected by:                                        │
│  ─ prevent_audit_modification() PL/pgSQL function                  │
│  ─ BEFORE UPDATE trigger (raises EXCEPTION)                        │
│  ─ BEFORE DELETE trigger (raises EXCEPTION)                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Design Principles**:
- **Automatic**: Entity mutations are captured via TypeORM subscriber hooks (zero manual code in services)
- **Explicit**: Security events, business events, and data access events require explicit `AuditService` calls in controllers/services
- **Append-only**: PostgreSQL triggers prevent UPDATE and DELETE on all 3 tables (with exception for `recordHash`/`entityId` column-only updates in `audit_logs`)
- **Tamper-evident**: SHA-256 hash chain links each record to the previous one
- **Redacted**: Sensitive fields (passwords, PINs, tokens) are replaced with `[REDACTED]` in stored diffs

---

## 2. Three Audit Tables

| Table | Purpose | Capture Method | Record Count |
|-------|---------|----------------|-------------|
| `audit_logs` | Entity mutations (CREATE/UPDATE/DELETE) + business events | Automatic (TypeORM subscriber) + explicit (`logBusinessEvent()`) | ~35 |
| `security_events` | Auth events (login, OTP, password, PIN) | Explicit (`AuditService.logSecurityEvent()`) | ~19 |
| `data_access_events` | Sensitive data reads | Explicit (`AuditService.logDataAccess()`) | ~42 |

---

## 3. Entity Schema Definitions

### 3.1 `audit_logs` (30 columns, 8 indexes)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID (PK) | No | Auto-generated |
| `timestamp` | TIMESTAMP | No | `@CreateDateColumn` - auto-set on insert |
| `actorId` | VARCHAR | No | User ID who performed the action |
| `actorName` | VARCHAR | Yes | Display name of actor |
| `actorRole` | ENUM(UserRole) | Yes | Role of actor at time of action |
| `ipAddress` | VARCHAR | Yes | Client IP address |
| `entity` | VARCHAR | No | Entity name (e.g., "User", "Report") |
| `entityId` | VARCHAR | No | UUID of the affected record |
| `action` | ENUM(AuditAction) | No | CREATE / UPDATE / DELETE |
| `cityId` | VARCHAR | Yes | Geographic scope - city |
| `subcityId` | VARCHAR | Yes | Geographic scope - subcity |
| `woredaId` | VARCHAR | Yes | Geographic scope - woreda |
| `oldValues` | JSONB | Yes | Previous field values (redacted) |
| `newValues` | JSONB | Yes | New field values (redacted) |
| `changedFields` | TEXT[] | Yes | List of changed field names |
| `description` | TEXT | Yes | Human-readable description (e.g., `[REPORT_ASSIGNED] Report assigned to patrol`) |
| `requestId` | VARCHAR | Yes | UUID linking to the HTTP request |
| `source` | ENUM(AuditSource) | No | WEB / CITIZEN_APP / PATROL_APP / SYSTEM |
| `requestMethod` | VARCHAR | Yes | HTTP method (GET, POST, etc.) |
| `requestPath` | VARCHAR | Yes | Request URL path |
| `userAgent` | VARCHAR | Yes | Browser/app user agent string |
| `deviceId` | VARCHAR | Yes | Mobile device UUID |
| `devicePlatform` | VARCHAR | Yes | ANDROID / IOS / WEB |
| `appVersion` | VARCHAR | Yes | Mobile app version |
| `success` | BOOLEAN | No | Default: true |
| `errorCode` | VARCHAR | Yes | Error code if failed |
| `reason` | TEXT | Yes | Failure reason |
| `sessionId` | VARCHAR | Yes | Session identifier |
| `previousHash` | VARCHAR | Yes | SHA-256 hash of previous record |
| `recordHash` | VARCHAR | Yes | SHA-256 hash of this record |

**Indexes**: `(entity, entityId)`, `(actorId)`, `(timestamp)`, `(cityId)`, `(subcityId)`, `(woredaId)`, `(source)`, `(requestId)`

### 3.2 `security_events` (17 columns, 6 indexes)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID (PK) | No | Auto-generated |
| `timestamp` | TIMESTAMP | No | `@CreateDateColumn` |
| `eventType` | ENUM(SecurityEventType) | No | LOGIN_SUCCESS, PIN_CHANGED, OTP_VERIFIED, etc. |
| `actorId` | VARCHAR | Yes | User who triggered the event |
| `actorName` | VARCHAR | Yes | Display name |
| `actorRole` | ENUM(UserRole) | Yes | Role at time of event |
| `ipAddress` | VARCHAR | Yes | Client IP |
| `userAgent` | VARCHAR | Yes | User agent string |
| `source` | ENUM(AuditSource) | No | Default: SYSTEM |
| `targetUserId` | VARCHAR | Yes | Target user (if acting on another) |
| `targetUserName` | VARCHAR | Yes | Target user name |
| `success` | BOOLEAN | No | Default: true |
| `reason` | TEXT | Yes | Failure reason |
| `metadata` | JSONB | Yes | Additional context data |
| `sessionId` | VARCHAR | Yes | Session identifier |
| `previousHash` | VARCHAR | Yes | Hash chain |
| `recordHash` | VARCHAR | Yes | Hash chain |

**Indexes**: `(eventType)`, `(actorId)`, `(timestamp)`, `(targetUserId)`, `(success)`

### 3.3 `data_access_events` (14 columns, 4 indexes)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID (PK) | No | Auto-generated |
| `timestamp` | TIMESTAMP | No | `@CreateDateColumn` |
| `accessType` | ENUM(DataAccessType) | No | VIEW_PROFILE, VIEW_REPORT, etc. |
| `actorId` | VARCHAR | No | User who accessed the data |
| `actorName` | VARCHAR | Yes | Display name |
| `actorRole` | ENUM(UserRole) | Yes | Role at time of access |
| `ipAddress` | VARCHAR | Yes | Client IP |
| `source` | ENUM(AuditSource) | No | Default: WEB |
| `targetEntity` | VARCHAR | No | Entity type accessed (e.g., "Citizen") |
| `targetId` | VARCHAR | Yes | Specific record ID (if applicable) |
| `accessPath` | VARCHAR | Yes | API route that was called |
| `description` | TEXT | Yes | Human-readable description |
| `previousHash` | VARCHAR | Yes | Hash chain |
| `recordHash` | VARCHAR | Yes | Hash chain |

**Indexes**: `(accessType)`, `(actorId)`, `(timestamp)`, `(targetEntity, targetId)`

---

## 4. Audit Subscriber (Automatic Entity Mutations)

**File**: `apps/backend/src/modules/audit/audit.subscriber.ts`

The `AuditSubscriber` is a TypeORM event subscriber that automatically captures all entity mutations without any manual code in service files.

### 4.1 Audited Entities (17)

```typescript
const AUDITED_ENTITIES = new Set([
  "User", "Report", "Patrol", "PatrolTeam",
  "City", "Subcity", "Woreda", "Camera",
  "ReportType", "Citizen", "Message", "Conversation",
  "Setting", "Notification", "ReportLog", "CameraAlert",
  "PatrolTeamMember",
]);
```

### 4.2 Subscriber Hooks

| Hook | Triggered By | Action Logged |
|------|-------------|---------------|
| `afterLoad()` | Any entity load | Stores `__originalValues` snapshot |
| `afterInsert()` | `repo.save()` on new entity | `AuditAction.CREATE` with full `newValues` |
| `beforeUpdate()` | `repo.save()` on existing entity | `AuditAction.UPDATE` with `oldValues`/`newValues` diff, OR `AuditAction.DELETE` if `deletedAt` changed (soft delete) |
| `beforeRemove()` | `repo.remove()` / hard delete | `AuditAction.DELETE` with `oldValues` |

**Important**: `afterInsert` is used (not `beforeInsert`) because the entity ID is unknown before the save completes. This ensures `entityId` is set to the real UUID rather than `"pending"`.

### 4.3 Field Comparison Logic

```typescript
// Uses entity metadata for reliable column detection
const columns = event.metadata.columns.map(c => c.propertyName);

for (const key of columns) {
  if (EXCLUDED_FIELDS.has(key)) continue;
  const oldJson = JSON.stringify(databaseEntity[key]);
  const newJson = JSON.stringify(entity[key]);
  if (oldJson !== newJson) {
    oldValues[key] = databaseEntity[key];
    newValues[key] = entity[key];
    changedFields.push(key);
  }
}
```

### 4.4 Soft Delete Detection

```typescript
// deletedAt is NOT in EXCLUDED_FIELDS, so it is detected as a changed field
const isSoftDelete =
  changedFields.includes("deletedAt") &&
  !oldValues.deletedAt &&
  newValues.deletedAt;

if (isSoftDelete) {
  auditLog.action = AuditAction.DELETE;
  auditLog.oldValues = { deletedAt: null };
  auditLog.newValues = { deletedAt: newValues.deletedAt };
  auditLog.description = `Deleted ${entityName} (soft delete)`;
}
```

### 4.5 Excluded Fields (not stored in diffs)

```typescript
const EXCLUDED_FIELDS = new Set([
  "password", "pin", "fcmToken", "accessToken", "refreshToken",
  "registrationToken", "passwordResetToken", "otpCode", "otp",
  "__originalValues", "createdAt", "updatedAt",
]);
```

**Note**: `deletedAt` is intentionally NOT excluded — it is needed for soft delete detection.

### 4.6 Persistence Method

Uses `event.manager.getRepository(AuditLog).save(auditLog)` to persist within the same transaction. Since `afterInsert` provides the real entity ID, no post-save update is needed — the hash and `entityId` are computed correctly before the initial save.

---

## 5. Request Context Middleware

**File**: `apps/backend/src/modules/audit/request-context.ts`

```typescript
export interface RequestContextData {
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
  requestId: string;
  userAgent: string;
  deviceId: string;
  devicePlatform: string;
  appVersion: string;
  source: AuditSource;
  requestMethod: string;
  requestPath: string;
  sessionId: string;
}

export const RequestContext = new AsyncLocalStorage<RequestContextData>();
```

**How it works** (in `main.ts`):

1. Every HTTP request enters middleware
2. `requestId` = `crypto.randomUUID()` (unique per request)
3. JWT token decoded to extract `userId`, `userName`, `userRole`
4. Device headers extracted: `x-device-id`, `x-device-platform`, `x-app-version`, `x-session-id`
5. Source detected via `detectSource()`:
   - `x-device-id` present → `CITIZEN_APP`
   - `x-user-role: PATROL` → `PATROL_APP`
   - Otherwise → `WEB`
6. `RequestContext.run(data, callback)` wraps entire request lifecycle
7. All subscribers and services access context via `RequestContext.getStore()`

---

## 6. Append-Only Database Triggers

**Applied on startup** in `main.ts` via `DataSource.query()`:

```sql
-- Shared function (with recordHash/entityId update exception for audit_logs)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates that ONLY touch recordHash and entityId columns.
  -- Needed because the subscriber computes the hash after insert (entity ID unknown at beforeInsert).
  IF TG_TABLE_NAME = 'audit_logs'
    AND NEW."recordHash" IS DISTINCT FROM OLD."recordHash"
    AND NEW."entityId" IS DISTINCT FROM OLD."entityId"
    AND NEW."entity" = OLD."entity"
    AND NEW."action" = OLD."action"
    AND NEW."actorId" = OLD."actorId"
    AND NEW."previousHash" IS NOT DISTINCT FROM OLD."previousHash"
  THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Audit logs are append-only. UPDATE and DELETE are prohibited.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Triggers on all 3 tables** (6 triggers total):

| Table | Trigger Name | Event |
|-------|-------------|-------|
| `audit_logs` | `trg_audit_no_update` | BEFORE UPDATE |
| `audit_logs` | `trg_audit_no_delete` | BEFORE DELETE |
| `security_events` | `trg_security_event_no_update` | BEFORE UPDATE |
| `security_events` | `trg_security_event_no_delete` | BEFORE DELETE |
| `data_access_events` | `trg_data_access_no_update` | BEFORE UPDATE |
| `data_access_events` | `trg_data_access_no_delete` | BEFORE DELETE |

**Exception for `audit_logs`**: The trigger allows `recordHash`/`entityId` column-only updates to support legacy records created before the subscriber was fixed. All other updates and all operations on `security_events`/`data_access_events` are fully blocked.

---

## 7. Hash Chain (Tamper Evidence)

Each record in all 3 tables stores:
- `previousHash` — the `recordHash` of the preceding record (chronologically)
- `recordHash` — SHA-256 hash of this record's critical fields

**Hash computation (audit_logs subscriber)**:
```typescript
function computeRecordHash(id, timestamp, entity, entityId, action, actorId, previousHash): string {
  const data = `${id || ""}|${timestamp?.toISOString() || ""}|${entity}|${entityId}|${action}|${actorId}|${previousHash}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}
```

**Hash computation (security_events / data_access_events in AuditService)**:
```typescript
computeHash(`${accessType}|${targetEntity}|${targetId || ""}|${Date.now()}|${previousHash}`)
```

**Chain verification** (available via `GET /api/audit-logs/verify-chain`):
```typescript
async verifyAuditChain(): Promise<ServiceResponse> {
  const logs = await this.auditRepo.find({ order: { timestamp: "ASC", id: "ASC" } });
  let prevHash = "";
  for (const log of logs) {
    if (log.previousHash !== prevHash) {
      return { valid: false, brokenAt: log.id };
    }
    prevHash = log.recordHash || "";
  }
  return { valid: true, totalRecords: logs.length };
}
```

**Note**: Old records created before the subscriber fix (v2.0) may have broken hashes. New records (v3.0+) have valid hashes.

---

## 8. Sensitive Field Redaction

**File**: `audit.subscriber.ts`

```typescript
const AUDIT_REDACTED_FIELDS = new Set([
  "pin", "password", "otpCode", "otp",
  "fcmToken", "accessToken", "refreshToken",
  "registrationToken", "passwordResetToken",
]);
```

Applied to both `oldValues` and `newValues` in UPDATE audit logs:

```typescript
private redactSensitiveFields(values: Record<string, any> | null): Record<string, any> | null {
  if (!values) return null;
  const redacted = { ...values };
  for (const key of Object.keys(redacted)) {
    if (AUDIT_REDACTED_FIELDS.has(key)) {
      redacted[key] = "[REDACTED]";
    }
  }
  return redacted;
}
```

---

## 9. Security Event Logging

**Called from**: `auth.service.ts` (16 calls)

| Event Type | When | Method |
|-----------|------|--------|
| `LOGIN_SUCCESS` | Citizen login succeeds | `loginCitizen()` |
| `LOGIN_FAILURE` | Citizen login fails | `loginCitizen()` |
| `LOGIN_SUCCESS` | Patrol login succeeds | `loginPatrol()` |
| `LOGIN_FAILURE` | Patrol login fails | `loginPatrol()` |
| `LOGIN_SUCCESS` | Admin/user login succeeds | `loginUser()` |
| `LOGIN_FAILURE` | Admin/user login fails | `loginUser()` |
| `OTP_REQUESTED` | Resend OTP requested | `resendMobileOTP()` |
| `OTP_VERIFIED` | Mobile OTP verified | `verifyMobileOTP()` |
| `OTP_VERIFIED` | User OTP verified | `verifyUserOTP()` |
| `PIN_CHANGED` | Patrol PIN changed | `changePin()` |
| `PIN_CHANGED` | Mobile PIN set | `setMobilePinWithToken()` |
| `PIN_RESET_REQUESTED` | PIN reset requested | `requestPinReset()` |
| `PIN_RESET_COMPLETED` | PIN reset confirmed | `confirmPinReset()` |
| `PASSWORD_RESET_REQUESTED` | Password reset requested | `requestUserPasswordReset()` |
| `PASSWORD_RESET_COMPLETED` | Password reset confirmed | `resetUserPasswordWithToken()` |
| `PASSWORD_CHANGED` | Password changed | `changeUserPassword()` |
| `TOKEN_REFRESH` | Token refreshed (patrol) | `refreshUserToken()` |
| `TOKEN_REFRESH` | Token refreshed (citizen) | `refreshUserToken()` |
| `TOKEN_REFRESH` | Token refreshed (admin) | `refreshUserToken()` |

**SecurityEventType enum** (19 values):

```
LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, TOKEN_REFRESH,
OTP_REQUESTED, OTP_VERIFIED, OTP_FAILED, OTP_EXPIRED,
PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED,
PIN_CHANGED, PIN_RESET_REQUESTED, PIN_RESET_COMPLETED,
ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, ROLE_CHANGED,
PERMISSION_DENIED, TOKEN_REVOKED
```

**Not yet implemented**: `LOGOUT`, `OTP_FAILED`, `OTP_EXPIRED`, `ACCOUNT_LOCKED`, `ACCOUNT_UNLOCKED`, `ROLE_CHANGED`, `PERMISSION_DENIED`, `TOKEN_REVOKED`

---

## 10. Data Access Event Logging

**Called from**: 10 controllers (39 GET endpoints)

| Controller | File | Endpoints Logged | DataAccessType Values Used |
|-----------|------|-----------------|---------------------------|
| `CitizenController` | `citizen.controller.ts` | 3 | `VIEW_CITIZEN_LIST`, `VIEW_CITIZEN_PROFILE`, `VIEW_PROFILE` |
| `ReportsController` | `reports.controller.ts` | 8 | `VIEW_REPORT_LIST`, `VIEW_ASSIGNED_REPORTS`, `VIEW_NEARBY_REPORTS`, `VIEW_REPORT_DETAIL`, `VIEW_REPORT_HISTORY`, `VIEW_NEARBY_PATROLS`, `EXPORT_CSV` |
| `UserController` | `user.controller.ts` | 3 | `VIEW_USER_LIST`, `VIEW_PROFILE`, `VIEW_USER_PROFILE` |
| `PatrolController` | `patrol.controller.ts` | 4 | `VIEW_PATROL_LIST`, `VIEW_PATROL_PROFILE`, `VIEW_PROFILE` |
| `PatrolTeamController` | `patrol-team.controller.ts` | 2 | `VIEW_PATROL_TEAM_LIST` |
| `ChatController` | `chat.controller.ts` | 3 | `VIEW_CONVERSATION_LIST`, `VIEW_CONVERSATION_MESSAGES` |
| `DashboardController` | `dashboard.controller.ts` | 4 | `VIEW_DASHBOARD_STATS`, `VIEW_DASHBOARD_FLEET`, `VIEW_DASHBOARD_RECENT`, `VIEW_DASHBOARD_ANALYTICS` |
| `SettingsController` | `settings.controller.ts` | 1 | `VIEW_SETTINGS` |
| `CamerasController` | `cameras.controller.ts` | 3 | `VIEW_CAMERA_LIST`, `VIEW_CAMERA_ALERTS` |
| `AuditController` | `audit.controller.ts` | 8 | `VIEW_AUDIT_LOGS`, `EXPORT_CSV`, `EXPORT_PDF` |

**DataAccessType enum** (31 values):

```
VIEW_PROFILE, VIEW_REPORT, VIEW_EVIDENCE, VIEW_REPORT_DETAIL,
SEARCH_CITIZEN, SEARCH_REPORT, EXPORT_CSV, EXPORT_PDF,
DOWNLOAD_EVIDENCE, VIEW_DASHBOARD_STATS, VIEW_AUDIT_LOGS,
VIEW_CITIZEN_LIST, VIEW_CITIZEN_PROFILE, VIEW_REPORT_LIST,
VIEW_PATROL_LIST, VIEW_PATROL_PROFILE, VIEW_USER_LIST,
VIEW_USER_PROFILE, VIEW_CONVERSATION_LIST, VIEW_CONVERSATION_MESSAGES,
VIEW_PATROL_TEAM_LIST, VIEW_DASHBOARD_FLEET, VIEW_DASHBOARD_RECENT,
VIEW_DASHBOARD_ANALYTICS, VIEW_SETTINGS, VIEW_CAMERA_LIST,
VIEW_CAMERA_ALERTS, VIEW_REPORT_HISTORY, VIEW_NEARBY_REPORTS,
VIEW_ASSIGNED_REPORTS, VIEW_NEARBY_PATROLS
```

**Example call pattern** (in every controller):

```typescript
await this.auditService.logDataAccess({
  accessType: DataAccessType.VIEW_CITIZEN_LIST,
  targetEntity: "Citizen",
  accessPath: req.originalUrl,
  description: `Listed citizens (page ${query.page || 1}, limit ${query.limit || 20})`,
});
```

---

## 11. Business Event Logging

**Method**: `AuditService.logBusinessEvent()` — writes to `audit_logs` table with `[EVENT_TYPE]` prefix in description.

```typescript
async logBusinessEvent(params: {
  eventType: BusinessEventType;
  entity: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  cityId?: string;
  subcityId?: string;
  woredaId?: string;
}): Promise<void>
```

**BusinessEventType enum** (16 values):

```
REPORT_ASSIGNED, REPORT_UNASSIGNED, REPORT_ESCALATED,
REPORT_APPROVED, REPORT_REJECTED, REPORT_CLOSED,
REPORT_RESOLVED, PATROL_DISPATCHED, PATROL_ACCEPTED,
CITIZEN_VERIFIED, CITIZEN_REJECTED, EVIDENCE_UPLOADED,
EVIDENCE_DOWNLOADED, DATA_EXPORTED, USER_STATUS_TOGGLED,
USER_PASSWORD_RESET
```

**Currently implemented** (6 calls):

| Event Type | When | File:Line |
|-----------|------|-----------|
| `REPORT_ASSIGNED` | Patrol officer assigned to report | `reports.service.ts` (assignPatrol) |
| `PATROL_ACCEPTED` | Patrol officer accepts report | `reports.service.ts` (patrolAccept) |
| `REPORT_CLOSED` | Report closed | `reports.service.ts` (closeReport) |
| `REPORT_ESCALATED` | Report escalated | `reports.service.ts` (escalateReport) |
| `PATROL_DISPATCHED` | Patrol officer created/registered | `patrol.service.ts` (create) |
| `USER_STATUS_TOGGLED` | User activated/deactivated | `user.service.ts` (toggleUserStatus) |

**Not yet implemented** (10 event types):
`REPORT_UNASSIGNED`, `REPORT_APPROVED`, `REPORT_REJECTED`, `REPORT_RESOLVED`, `CITIZEN_VERIFIED`, `CITIZEN_REJECTED`, `EVIDENCE_UPLOADED`, `EVIDENCE_DOWNLOADED`, `DATA_EXPORTED`, `USER_PASSWORD_RESET`

---

## 12. REST API Endpoints

All endpoints are under `/api/audit-logs`:

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/` | 8 roles (geo-scoped) | List audit logs with filters (entity, action, actorId, cityId, dates, pagination) |
| `GET` | `/:id` | 8 roles | Single audit log with full diff |
| `GET` | `/entity/:type/:id` | 8 roles | Full audit trail for a specific record |
| `GET` | `/security-events` | 8 roles (geo-scoped) | Query security_events table with filters (eventType, actorId, success, dates) |
| `GET` | `/data-access-events` | 8 roles (geo-scoped) | Query data_access_events table with filters (accessType, actorId, targetEntity, dates) |
| `GET` | `/verify-chain` | SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN | Verify hash chain integrity |
| `GET` | `/export/csv` | SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN | Export filtered audit logs as CSV |
| `GET` | `/export/pdf` | SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN | Export filtered audit logs as printable HTML |

---

## 13. Module Dependencies

The `AuditModule` is imported by **9 feature modules**:

| Module | File | Purpose |
|--------|------|---------|
| `AuthModule` | `auth.module.ts` | `logSecurityEvent` (login, OTP, PIN, password) |
| `CitizenModule` | `citizen.module.ts` | `logDataAccess` (citizen endpoints) |
| `ReportsModule` | `reports.module.ts` | `logDataAccess` (report endpoints) |
| `UserModule` | `user.module.ts` | `logDataAccess` (user endpoints) + `logBusinessEvent` (status toggle) |
| `PatrolModule` | `patrol.module.ts` | `logDataAccess` (patrol endpoints) + `logBusinessEvent` (dispatch) |
| `ChatModule` | `chat.module.ts` | `logDataAccess` (chat endpoints) |
| `DashboardModule` | `dashboard.module.ts` | `logDataAccess` (dashboard endpoints) |
| `SettingsModule` | `settings.module.ts` | `logDataAccess` (settings endpoints) |
| `CamerasModule` | `cameras.module.ts` | `logDataAccess` (camera endpoints) |

**AuditModule itself**:
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, SecurityEvent, DataAccessEvent])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
```

---

## 14. Database State (Current Data)

As of 2026-07-23 (v3.0):

### audit_logs (~35 rows)

| Entity | CREATE | UPDATE | DELETE | Notes |
|--------|--------|--------|--------|-------|
| Camera | 1 | 1 | 1 | |
| City | 3+ | 2+ | 3+ | Multiple test cycles |
| Citizen | 1 | 1 | 1 | |
| PatrolTeam | 1 | 1 | 1 | |
| ReportType | 1 | 1 | 1 | |
| Subcity | 2 | 1 | 1 | |
| User | 1 | 1 | 1 | |
| Woreda | 1 | 1 | 1 | |

**Note**: Business events (e.g., `[REPORT_ASSIGNED]`) are stored in `audit_logs` with `[EVENT_TYPE]` prefix in `description`.

### security_events (~19 rows)

| eventType | count | Notes |
|-----------|-------|-------|
| LOGIN_SUCCESS | ~19 | One per API login during testing |

### data_access_events (~42 rows)

| accessType | targetEntity | count |
|-----------|-------------|-------|
| VIEW_CITIZEN_LIST | Citizen | ~5 |
| VIEW_REPORT_LIST | Report | ~5 |
| VIEW_USER_LIST | User | ~5 |
| VIEW_PATROL_LIST | Patrol | ~5 |
| VIEW_PATROL_TEAM_LIST | PatrolTeam | ~2 |
| VIEW_DASHBOARD_STATS | Dashboard | ~4 |
| VIEW_SETTINGS | Setting | ~4 |
| VIEW_AUDIT_LOGS | AuditLog/SecurityEvent/DataAccessEvent | ~12 |

---

## 15. Sensitive Data Access Matrix

Every GET endpoint that returns sensitive data, and whether DataAccessEvent logging is implemented:

| Endpoint | Sensitive Data Returned | DataAccessType | Logged? |
|----------|----------------------|----------------|---------|
| `GET /citizens` | Full name, phone, email, device info, profile image | `VIEW_CITIZEN_LIST` | ✅ |
| `GET /citizens/:id` | All citizen PII | `VIEW_CITIZEN_PROFILE` | ✅ |
| `GET /citizens/me/profile` | Own full profile | `VIEW_PROFILE` | ✅ |
| `GET /reports` | Report + citizen PII + patrol PII + evidence + IP | `VIEW_REPORT_LIST` | ✅ |
| `GET /reports/my-reports` | Own reports + patrol PII + evidence | `VIEW_REPORT_LIST` | ✅ |
| `GET /reports/assigned-to-me` | Citizen PII + evidence + IP | `VIEW_ASSIGNED_REPORTS` | ✅ |
| `GET /reports/nearby` | Citizen PII + patrol PII + evidence + IP | `VIEW_NEARBY_REPORTS` | ✅ |
| `GET /reports/:id` | Full report + citizen PII + patrol PII + IP | `VIEW_REPORT_DETAIL` | ✅ |
| `GET /reports/track/:caseId` | Full report + patrol PII (PUBLIC - no auth) | N/A (public) | ❌ |
| `GET /reports/:id/history` | Status changes + GPS coordinates + actor IDs | `VIEW_REPORT_HISTORY` | ✅ |
| `GET /reports/:id/nearby-patrols` | Patrol PII + real-time GPS | `VIEW_NEARBY_PATROLS` | ✅ |
| `GET /reports/export/csv` | Report descriptions + locations | `EXPORT_CSV` | ✅ |
| `GET /users/all` | Full name, phone, email, role, permissions | `VIEW_USER_LIST` | ✅ |
| `GET /users/profile` | Own full profile | `VIEW_PROFILE` | ✅ |
| `GET /users/:id` | Any user's full profile | `VIEW_USER_PROFILE` | ✅ |
| `GET /patrols` | Full name, phone, email, GPS, office address | `VIEW_PATROL_LIST` | ✅ |
| `GET /patrols/nearby` | Patrol PII + real-time GPS | `VIEW_PATROL_LIST` | ✅ |
| `GET /patrols/:id` | Full patrol profile | `VIEW_PATROL_PROFILE` | ✅ |
| `GET /patrols/me/profile` | Own full profile | `VIEW_PROFILE` | ✅ |
| `GET /patrol-teams` | Team members' PII + GPS | `VIEW_PATROL_TEAM_LIST` | ✅ |
| `GET /patrol-teams/:id` | Team members' PII + GPS | `VIEW_PATROL_TEAM_LIST` | ✅ |
| `GET /chat/conversations` | All conversations (no filtering) | `VIEW_CONVERSATION_LIST` | ✅ |
| `GET /chat/conversations/report/:reportId` | Conversation for report | `VIEW_CONVERSATION_MESSAGES` | ✅ |
| `GET /chat/conversations/:id/messages` | Full message content + sender info | `VIEW_CONVERSATION_MESSAGES` | ✅ |
| `GET /dashboard/stats` | Citizen count, report counts, trends | `VIEW_DASHBOARD_STATS` | ✅ |
| `GET /dashboard/fleet-locations` | Real-time patrol GPS + phone numbers | `VIEW_DASHBOARD_FLEET` | ✅ |
| `GET /dashboard/recent-reports` | Latest reports + patrol PII + evidence | `VIEW_DASHBOARD_RECENT` | ✅ |
| `GET /dashboard/analytics` | Aggregated report data + locations | `VIEW_DASHBOARD_ANALYTICS` | ✅ |
| `GET /settings` | System settings (potentially API keys) | `VIEW_SETTINGS` | ✅ |
| `GET /cameras` | Camera locations | `VIEW_CAMERA_LIST` | ✅ |
| `GET /cameras/alerts` | AI detection alerts + evidence URLs | `VIEW_CAMERA_ALERTS` | ✅ |
| `GET /cameras/:id` | Camera detail | `VIEW_CAMERA_LIST` | ✅ |
| `GET /audit-logs` | Audit diffs + actor info | `VIEW_AUDIT_LOGS` | ✅ |
| `GET /audit-logs/export/csv` | Audit log export | `EXPORT_CSV` | ✅ |
| `GET /audit-logs/export/pdf` | Audit log export | `EXPORT_PDF` | ✅ |
| `GET /audit-logs/entity/:type/:id` | Entity audit trail | `VIEW_AUDIT_LOGS` | ✅ |
| `GET /audit-logs/:id` | Single audit log | `VIEW_AUDIT_LOGS` | ✅ |
| `GET /audit-logs/security-events` | Security events (login, OTP, PIN) | `VIEW_AUDIT_LOGS` | ✅ |
| `GET /audit-logs/data-access-events` | Data access events | `VIEW_AUDIT_LOGS` | ✅ |
| `GET /audit-logs/verify-chain` | Hash chain integrity | `VIEW_AUDIT_LOGS` | ✅ |

**Unlogged endpoints**: 1 (`GET /reports/track/:caseId` — public, no JWT)

---

## 16. Gaps and Next Steps

### 16.1 Security Event Logging — 10 Event Types Still Missing

| Event Type | Where It Should Be Called |
|-----------|--------------------------|
| `LOGOUT` | Auth service logout endpoint |
| `OTP_FAILED` | OTP service verify method (failure branch) |
| `OTP_EXPIRED` | OTP service expired check |
| `ACCOUNT_LOCKED` | Account lockout after failed attempts |
| `ACCOUNT_UNLOCKED` | Account unlock |
| `ROLE_CHANGED` | User service role change |
| `PERMISSION_DENIED` | RolesGuard rejection |
| `TOKEN_REVOKED` | Token revocation |

### 16.2 Business Event Logging — 10 Event Types Still Missing

| Event Type | Where It Should Be Called |
|-----------|--------------------------|
| `REPORT_UNASSIGNED` | Reports service patrol unassign |
| `REPORT_APPROVED` | Reports service review/approve |
| `REPORT_REJECTED` | Reports service review/reject |
| `REPORT_RESOLVED` | Reports service mark resolved |
| `CITIZEN_VERIFIED` | Citizen service verify |
| `CITIZEN_REJECTED` | Citizen service reject |
| `EVIDENCE_UPLOADED` | Reports service evidence upload |
| `EVIDENCE_DOWNLOADED` | Reports service evidence download |
| `DATA_EXPORTED` | Reports/analytics export |
| `USER_PASSWORD_RESET` | Auth service password reset |

### 16.3 Unlogged Data Access

| Endpoint | Why Not Logged |
|----------|---------------|
| `GET /reports/track/:caseId` | Public endpoint (`@Public()`), no auth token → no RequestContext actor info. Needs anonymous access logging approach. |

### 16.4 Report Entity Audit Records

The `Report` entity IS in `AUDITED_ENTITIES`. The subscriber now correctly captures CREATE/UPDATE/DELETE. However, reports are typically created via the public citizen app endpoint (`OptionalJwtAuthGuard`) which may not trigger the subscriber correctly in all cases. Reports created through the dashboard should be fully audited.

### 16.5 Source Detection Improvements

Current source detection is basic:
- `x-device-id` header → `CITIZEN_APP`
- `x-user-role: PATROL` → `PATROL_APP`
- Default → `WEB`

Could be improved with:
- Explicit `x-app-source` header from mobile apps
- Device platform + app version correlation
- Distinguishing `ADMIN_PANEL` from `WEB`

---

## File Inventory

| File | Path | Purpose |
|------|------|---------|
| `audit.subscriber.ts` | `modules/audit/audit.subscriber.ts` | TypeORM entity subscriber (automatic mutation logging) |
| `audit.service.ts` | `modules/audit/audit.service.ts` | Service: logSecurityEvent, logDataAccess, logBusinessEvent, queries, export, verify |
| `audit.controller.ts` | `modules/audit/audit.controller.ts` | REST API: 8 endpoints (logs, security-events, data-access-events, verify-chain, export) |
| `audit.module.ts` | `modules/audit/audit.module.ts` | Module: imports 3 entities, exports AuditService |
| `request-context.ts` | `modules/audit/request-context.ts` | AsyncLocalStorage for request-scoped context |
| `audit-log.entity.ts` | `modules/audit/entities/audit-log.entity.ts` | Entity: 30 columns, 8 indexes |
| `security-event.entity.ts` | `modules/audit/entities/security-event.entity.ts` | Entity: 17 columns, 6 indexes |
| `data-access-event.entity.ts` | `modules/audit/entities/data-access-event.entity.ts` | Entity: 14 columns, 4 indexes |
| `enums.ts` | `common/enums/enums.ts` | AuditAction, AuditSource, SecurityEventType (19), DataAccessType (31), BusinessEventType (16) |
| `main.ts` | `main.ts` | RequestContext middleware, append-only trigger creation |
| `auth.service.ts` | `modules/auth/auth.service.ts` | 19 logSecurityEvent() calls |
| `reports.service.ts` | `modules/reports/reports.service.ts` | 4 logBusinessEvent() calls |
| `patrol.service.ts` | `modules/patrol/patrol.service.ts` | 1 logBusinessEvent() call |
| `user.service.ts` | `modules/user/user.service.ts` | 1 logBusinessEvent() call |
