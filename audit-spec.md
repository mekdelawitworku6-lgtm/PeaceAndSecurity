# Audit System — Implementation Specification (Security Grade)

## Status

| Area | Status | Gap |
|------|--------|-----|
| Entity CRUD (TypeORM subscriber) | ✅ Implemented | Needs requestId/source enrichment |
| Bypass-safe writes | ❌ Not done | 7 raw `.update()`/`.delete()` calls found |
| Sensitive read auditing | ❌ Not done | No tracking of who views profiles/reports |
| Auth event auditing | ❌ Not done | 18+ auth endpoints have no audit trail |
| Business action auditing | ❌ Not done | Assign, escalate, approve, reject, export |
| Sensitive field redaction | ❌ Partial | `pin` excluded, but `password`, `otp`, `fcmToken` not redacted |
| Append-only / tamper-evident | ❌ Not done | audit_logs is plain table, no protection |
| Request correlation | ❌ Not done | No requestId, userAgent, deviceId on logs |
| Background job auditing | ❌ Not done | No system/cron action logging |

---

## Part 1: AuditLog Entity Enhancement

### New columns on `audit_logs`

```sql
ALTER TABLE audit_logs ADD COLUMN "requestId" varchar;
ALTER TABLE audit_logs ADD COLUMN "source" varchar DEFAULT 'SYSTEM';
ALTER TABLE audit_logs ADD COLUMN "requestMethod" varchar;
ALTER TABLE audit_logs ADD COLUMN "requestPath" varchar;
ALTER TABLE audit_logs ADD COLUMN "userAgent" varchar;
ALTER TABLE audit_logs ADD COLUMN "deviceId" varchar;
ALTER TABLE audit_logs ADD COLUMN "devicePlatform" varchar;
ALTER TABLE audit_logs ADD COLUMN "appVersion" varchar;
ALTER TABLE audit_logs ADD COLUMN "success" boolean DEFAULT true;
ALTER TABLE audit_logs ADD COLUMN "errorCode" varchar;
ALTER TABLE audit_logs ADD COLUMN "reason" text;
ALTER TABLE audit_logs ADD COLUMN "sessionId" varchar;
ALTER TABLE audit_logs ADD COLUMN "previousHash" varchar;
ALTER TABLE audit_logs ADD COLUMN "recordHash" varchar;
```

### Source enum values
`WEB`, `CITIZEN_APP`, `PATROL_APP`, `ADMIN_PANEL`, `SYSTEM`, `CRON`, `API`

### Request context enrichment (`main.ts` middleware)

```typescript
RequestContext.run({
  userId, userName, userRole, ipAddress,
  requestId: crypto.randomUUID(),
  userAgent: req.headers['user-agent'],
  deviceId: req.headers['x-device-id'],
  devicePlatform: req.headers['x-device-platform'],
  appVersion: req.headers['x-app-version'],
  source: detectSource(req),   // CITIZEN_APP if x-device-id present, else WEB
  requestMethod: req.method,
  requestPath: req.originalUrl,
  sessionId: req.headers['x-session-id'],
}, () => next());
```

---

## Part 2: Sensitive Field Redaction

### Fields never stored in oldValues/newValues

```typescript
const AUDIT_REDACTED_FIELDS = new Set([
  'pin', 'password', 'otpCode', 'otp',
  'fcmToken', 'accessToken', 'refreshToken',
  'registrationToken', 'passwordResetToken',
]);
```

### Sanitization behavior

When a redacted field is detected in changedFields:
- `oldValues[field]` = `"[REDACTED]"` (never the real value)
- `newValues[field]` = `"[REDACTED]"` (never the real value)
- `changedFields` still includes the field name (so we know it changed)

---

## Part 3: Append-Only + Tamper-Evident

### 3a. PostgreSQL REVOKE

```sql
-- Revoke UPDATE and DELETE from the application role
REVOKE UPDATE, DELETE ON audit_logs FROM postgres;
-- (In production, revoke from the app's DB user)
```

### 3b. Trigger to prevent UPDATE/DELETE

```sql
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only. UPDATE and DELETE are prohibited.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_audit_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

### 3c. Hash chain

Each audit log record includes:
- `previousHash`: SHA-256 hash of the previous audit log entry (by timestamp)
- `recordHash`: SHA-256 of `id + timestamp + entity + entityId + action + actorId + previousHash`

Any modification to a previous record breaks the chain. Verification:

```typescript
async function verifyAuditChain(repo: Repository<AuditLog>): Promise<boolean> {
  const logs = await repo.find({ order: { timestamp: 'ASC' } });
  let prevHash = '';
  for (const log of logs) {
    if (log.previousHash !== prevHash) return false;
    const expected = computeHash(log, prevHash);
    if (log.recordHash !== expected) return false;
    prevHash = log.recordHash;
  }
  return true;
}
```

---

## Part 4: SecurityEvent Entity (Auth Events)

New table `security_events` for authentication and security-sensitive operations.

### Schema

```typescript
@Entity('security_events')
class SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;  // LOGIN_SUCCESS, LOGIN_FAILURE, OTP_REQUESTED, etc.
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  ipAddress: string;
  userAgent: string;
  source: string;
  targetUserId: string;        // who was acted upon (if different from actor)
  success: boolean;
  reason: string;              // "Invalid password", "Account disabled", etc.
  metadata: jsonb;             // additional context
  previousHash: string;
  recordHash: string;
}
```

### SecurityEventType enum

```
LOGIN_SUCCESS          LOGIN_FAILURE
LOGOUT                 TOKEN_REFRESH
OTP_REQUESTED          OTP_VERIFIED
OTP_FAILED             OTP_EXPIRED
PASSWORD_CHANGED       PASSWORD_RESET_REQUESTED
PASSWORD_RESET_COMPLETED
PIN_CHANGED            PIN_RESET_REQUESTED
PIN_RESET_COMPLETED
ACCOUNT_LOCKED         ACCOUNT_UNLOCKED
ROLE_CHANGED           PERMISSION_DENIED
TOKEN_REVOKED
```

### Where to instrument

| File | Method | Event |
|------|--------|-------|
| `auth.service.ts` | `citizenLogin` | LOGIN_SUCCESS / LOGIN_FAILURE |
| `auth.service.ts` | `userLogin` | LOGIN_SUCCESS / LOGIN_FAILURE |
| `auth.service.ts` | `patrolLogin` | LOGIN_SUCCESS / LOGIN_FAILURE |
| `auth.service.ts` | `citizenRegister` | (covered by Citizen CREATE subscriber) |
| `auth.service.ts` | `citizenVerifyOtp` | OTP_VERIFIED / OTP_FAILED |
| `auth.service.ts` | `userVerifyOtp` | OTP_VERIFIED / OTP_FAILED |
| `auth.service.ts` | `citizenSetPin` | PIN_CHANGED |
| `auth.service.ts` | `userSetPassword` | PASSWORD_CHANGED |
| `auth.service.ts` | `patrolSetPin` | PIN_CHANGED |
| `auth.service.ts` | `citizenPinResetConfirm` | PIN_RESET_COMPLETED |
| `auth.service.ts` | `passwordResetConfirm` | PASSWORD_RESET_COMPLETED |
| `auth.service.ts` | `changePassword` | PASSWORD_CHANGED |
| `auth.service.ts` | `changePin` | PIN_CHANGED |
| `otp.service.ts` | `createOtp` | OTP_REQUESTED |

---

## Part 5: DataAccessEvent Entity (Sensitive Reads)

New table `data_access_events` for tracking who accessed sensitive data.

### Schema

```typescript
@Entity('data_access_events')
class DataAccessEvent {
  id: string;
  timestamp: Date;
  accessType: DataAccessType;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  ipAddress: string;
  source: string;
  targetEntity: string;       // "Citizen", "Report", etc.
  targetId: string;           // the record viewed
  accessPath: string;         // the API path accessed
  description: string;        // "Viewed citizen profile"
  previousHash: string;
  recordHash: string;
}
```

### DataAccessType enum

```
VIEW_PROFILE          VIEW_REPORT
VIEW_EVIDENCE         VIEW_REPORT_DETAIL
SEARCH_CITIZEN        SEARCH_REPORT
EXPORT_CSV            EXPORT_PDF
DOWNLOAD_EVIDENCE     VIEW_DASHBOARD_STATS
VIEW_AUDIT_LOGS       VIEW_CITIZEN_LIST
```

### Where to instrument (controller-level)

| Controller | Endpoint | accessType |
|-----------|----------|------------|
| `user.controller.ts` | `GET /users/:id` | VIEW_PROFILE |
| `citizen.controller.ts` | `GET /citizens/:id` | VIEW_PROFILE |
| `reports.controller.ts` | `GET /reports/:id` | VIEW_REPORT |
| `reports.controller.ts` | `GET /reports/track/:caseId` | VIEW_REPORT |
| `reports.controller.ts` | `GET /reports/export/csv` | EXPORT_CSV |
| `audit.controller.ts` | `GET /audit-logs/export/csv` | EXPORT_CSV |
| `audit.controller.ts` | `GET /audit-logs/export/pdf` | EXPORT_PDF |
| `media.controller.ts` | `POST /media/upload` | (already tracked via Report) |

Implementation: create a `@AuditAccess(accessType, description)` decorator + interceptor.

---

## Part 6: Business Event Audit Logging

Not every database write = a business action. Separate business events need explicit logging.

### BusinessEventType enum

```
REPORT_ASSIGNED        REPORT_UNASSIGNED
REPORT_ESCALATED       REPORT_APPROVED
REPORT_REJECTED        REPORT_CLOSED
REPORT_RESOLVED
PATROL_DISPATCHED      PATROL_ACCEPTED
CITIZEN_VERIFIED       CITIZEN_REJECTED
EVIDENCE_UPLOADED      EVIDENCE_DOWNLOADED
DATA_EXPORTED
USER_STATUS_TOGGLED    USER_PASSWORD_RESET
```

### Implementation: `AuditService.logBusinessEvent()`

```typescript
async logBusinessEvent(event: {
  eventType: BusinessEventType;
  entity: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
}): Promise<void>;
```

Called explicitly from service methods for business-level actions.

---

## Part 7: Bypass Elimination

### Raw .update()/.delete() calls to fix

| # | File | Line | Current | Fix |
|---|------|------|---------|-----|
| 1 | `notifications.service.ts:133` | `.update(id, { isRead: true })` | Load entity, save |
| 2 | `notifications.service.ts:143` | `.update(where, { isRead: true })` | Loop + save (or accept — low-risk) |
| 3 | `cameras.service.ts:87` | `.alertRepo.update(id, { status })` | Load entity, save |
| 4 | `chat.service.ts:84` | `.messageRepo.update(...)` | Load entity, save |
| 5 | `reports.service.ts:789` | `.patrolRepo.update(patrolId, ...)` | Load entity, save |
| 6 | `reports.service.ts:907` | `.logRepo.delete({ reportId })` | Intentional cleanup, acceptable |
| 7 | `otp.service.ts:130-134` | `.otpRepository.delete(...)` | Intentional OTP cleanup, acceptable |
| 8 | `patrol-team.service.ts:91` | `.patrolRepo.update({ teamId }, { teamId: null })` | Loop + save |

Items 6 and 7 are acceptable (OTP cleanup, report log cascade delete) — not audited intentionally.

---

## Part 8: Test Matrix

### A. Entity CRUD Audit Tests

| Entity | CREATE logged | UPDATE logged | DELETE logged | changedFields correct | actorName correct | IP logged |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|
| User | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Citizen | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Report | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ReportType | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| City | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subcity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Woreda | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Patrol | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PatrolTeam | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Camera | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| CameraAlert | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Setting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notification | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Conversation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Message | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ReportLog | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### B. Security Event Tests

| Scenario | Event Type | Logged? | actorId | success | reason |
|----------|-----------|:---:|:---:|:---:|:---:|
| User login success | LOGIN_SUCCESS | ✓ | ✓ | true | - |
| User login wrong password | LOGIN_FAILURE | ✓ | ✓ | false | "Invalid credentials" |
| Citizen login success | LOGIN_SUCCESS | ✓ | ✓ | true | - |
| Citizen login wrong PIN | LOGIN_FAILURE | ✓ | ✓ | false | "Invalid credentials" |
| Patrol login success | LOGIN_SUCCESS | ✓ | ✓ | true | - |
| OTP requested | OTP_REQUESTED | ✓ | ✓ | true | - |
| OTP verified | OTP_VERIFIED | ✓ | ✓ | true | - |
| OTP wrong code | OTP_FAILED | ✓ | ✓ | false | "Invalid OTP" |
| Password changed | PASSWORD_CHANGED | ✓ | ✓ | true | - |
| PIN changed | PIN_CHANGED | ✓ | ✓ | true | - |
| Permission denied | PERMISSION_DENIED | ✓ | ✓ | false | "Insufficient role" |

### C. Data Access Event Tests

| Scenario | accessType | actorId | targetEntity | targetId |
|----------|-----------|:---:|:---:|:---:|
| View citizen profile | VIEW_PROFILE | ✓ | Citizen | ✓ |
| Open report detail | VIEW_REPORT | ✓ | Report | ✓ |
| Export reports CSV | EXPORT_CSV | ✓ | Report | - |
| Export audit PDF | EXPORT_PDF | ✓ | AuditLog | - |
| Search citizen | SEARCH_CITIZEN | ✓ | Citizen | - |

### D. Tamper Resistance Tests

| Test | Expected |
|------|----------|
| DELETE FROM audit_logs | PostgreSQL error: trigger prevents |
| UPDATE audit_logs SET ... | PostgreSQL error: trigger prevents |
| Hash chain integrity check | All records pass |
| Insert with wrong previousHash | Chain breaks, detection possible |
| Application cannot DELETE audit_logs | REVOKE effective |

### E. Bypass Elimination Tests

| Service Method | Was bypass | Now audited? |
|---------------|:---:|:---:|
| `notifications.service.markRead` | Yes | ✓ after fix |
| `cameras.service.updateAlertStatus` | Yes | ✓ after fix |
| `chat.service` message update | Yes | ✓ after fix |
| `reports.service` patrol reassign | Yes | ✓ after fix |
| `patrol-team.service` removeMember | Yes | ✓ after fix |

### F. Redaction Tests

| Field | Stored in oldValues? | Stored in newValues? | Stored in changedFields? |
|-------|:---:|:---:|:---:|
| pin | [REDACTED] | [REDACTED] | ✓ (field name present) |
| password | [REDACTED] | [REDACTED] | ✓ |
| fcmToken | [REDACTED] | [REDACTED] | ✓ |
| otpCode | [REDACTED] | [REDACTED] | ✓ |
| phoneNumber | actual value | actual value | ✓ |

### G. Request Correlation Tests

| Field | Present in all logs? | Value source |
|-------|:---:|:---|
| requestId | ✓ | crypto.randomUUID() per request |
| source | ✓ | CITIZEN_APP / WEB / PATROL_APP / SYSTEM |
| requestMethod | ✓ | GET / POST / PATCH / DELETE |
| requestPath | ✓ | /api/reports/:id |
| userAgent | ✓ | Browser / App string |
| sessionId | ✓ | x-session-id header |

---

## Implementation Order

1. Enhance AuditLog entity + RequestContext (Part 1 + Part 8)
2. Sensitive field redaction (Part 2)
3. SecurityEvent entity + auth instrumentation (Part 4)
4. DataAccessEvent entity + controller decorators (Part 5)
5. Business event logging (Part 6)
6. Bypass elimination — fix all raw .update()/.delete() (Part 7)
7. PostgreSQL append-only triggers + hash chain (Part 3)
8. Rebuild, test all matrix items
