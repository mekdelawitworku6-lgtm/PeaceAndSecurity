# Who Sees Whose Work Reports?

> Work reports = daily shift/work submissions from patrol officers and staff.
> API: `GET /api/work-reports` (list), `GET /api/work-reports/:id` (detail).

## Visibility Matrix

| Role | Sees | Can Submit | Can Approve/Reject | Can Edit | Can Delete |
|---|---|---|---|---|---|
| SYSTEM_SUPER_ADMIN | **All reports (city-wide)** | ✓ | ✓ | own only | ✓ (only role that can delete) |
| SYSTEM_ADMIN | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| SYSTEM_SUPER_ADMIN_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| SYSTEM_ADMIN_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| PEACE_SUPER_ADMIN | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| PEACE_SUPER_ADMIN_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| PEACE_OFFICER_SUBCITY | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| PEACE_OFFICER_SUBCITY_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| PEACE_OFFICER_WOREDA | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| PEACE_OFFICER_WOREDA_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| POLICE_COMMANDER_CITY | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| POLICE_COMMANDER_CITY_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| POLICE_COMMANDER_SUBCITY | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| POLICE_COMMANDER_SUBCITY_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| POLICE_COMMANDER_WOREDA | All reports (city-wide) | ✓ | ✓ | own only | ✗ |
| POLICE_COMMANDER_WOREDA_VIEWER | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| PATROL | **Own reports only** | ✓ | ✗ | own while SUBMITTED | ✗ |
| CITIZEN | Own reports only | ✗ | ✗ | ✗ | ✗ |

## Rules

- **Every staff role** (peace + police + system) sees **every** work report in the city — there is no subcity/woreda filtering yet. Work reports do not carry a subcity/woreda field.
- **Every `*_VIEWER` role** (all 8) also reads **all** reports, read-only — they cannot submit, approve, reject, edit, or delete. Implementation: any role ending in `_VIEWER` gets read-all access.
- **Patrol officers** only see their own submissions (dashboard UI hides the submit button for them; patrol submits from the mobile app).
- **Review flow**: a report starts `SUBMITTED` → any staff role approves (`APPROVED`) or rejects (`REJECTED`) with an optional note. A rejected report can be edited by its author only while still `SUBMITTED`.
- **Delete**: only `SYSTEM_SUPER_ADMIN` (via API; the dashboard does not expose a delete button).
- Dashboard page: `/dashboard/work-reports` — shown to every logged-in role, but only staff see the actions (viewers/patrol see read-only lists).
- Citizen app: citizens do not use work reports at all.

## Who can SUBMIT a work report

`POST /api/work-reports` is allowed for:
- PATROL (mobile app)
- All staff roles: SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN, PEACE_SUPER_ADMIN, PEACE_OFFICER_SUBCITY, PEACE_OFFICER_WOREDA, POLICE_COMMANDER_CITY, POLICE_COMMANDER_SUBCITY, POLICE_COMMANDER_WOREDA

Not allowed: all `*_VIEWER` roles and CITIZEN.

## Future option (not built)

If you want woreda/subcity scoping (e.g., PEACE_OFFICER_WOREDA sees only its woreda's reports, POLICE_COMMANDER_CITY sees the whole city), the work report entity needs a `subcityId`/`woredaId` captured from the reporter's assignment at submit time, and the `findAll` query must filter by hierarchy. Say the word and I'll build it.