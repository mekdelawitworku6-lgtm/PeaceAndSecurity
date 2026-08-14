# Who Sees Whose Work Reports?

> Work reports = daily shift/work submissions from patrol officers and staff.
> API: `GET /api/work-reports` (list), `GET /api/work-reports/:id` (detail).

## Visibility Rule: TOP-TO-BOTTOM + HORIZONTAL

A staff role sees work reports **from its own level and below** — never from above.

```
Level 0 (city/top)   SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN, PEACE_SUPER_ADMIN, POLICE_COMMANDER_CITY
Level 1 (subcity)    PEACE_OFFICER_SUBCITY, POLICE_COMMANDER_SUBCITY
Level 2 (woreda)     PEACE_OFFICER_WOREDA, POLICE_COMMANDER_WOREDA
```

Every role has a matching `*_VIEWER` (read-only) at the same level, with the same visibility.

| Reporter's level ↓ | Who can read it |
|---|---|
| Level 0 (city) report | Level 0 roles only (super admin, admin, peace super admin, police commander city + their viewers) |
| Level 1 (subcity) report | Level 0 + Level 1 roles |
| Level 2 (woreda) report | Level 0 + Level 1 + Level 2 roles (everyone) |
| Patrol / citizen report | Reporter only |

So: a woreda officer reads **woreda reports only** (all woredas, horizontal) and their own — they **cannot** read subcity or city-level reports. A subcity officer reads subcity + woreda. Top-level reads everything.

## Full Matrix

| Role | Level | Sees | Can Submit | Can Approve/Reject | Can Edit | Can Delete |
|---|---|---|---|---|---|---|
| SYSTEM_SUPER_ADMIN | 0 | **All reports** | ✓ | ✓ | own only | ✓ (only role that can delete) |
| SYSTEM_ADMIN | 0 | All reports | ✓ | ✓ | own only | ✗ |
| PEACE_SUPER_ADMIN | 0 | All reports | ✓ | ✓ | own only | ✗ |
| POLICE_COMMANDER_CITY | 0 | All reports | ✓ | ✓ | own only | ✗ |
| SYSTEM_SUPER_ADMIN_VIEWER | 0 | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| SYSTEM_ADMIN_VIEWER | 0 | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| PEACE_SUPER_ADMIN_VIEWER | 0 | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| POLICE_COMMANDER_CITY_VIEWER | 0 | All reports (read-only) | ✗ | ✗ | ✗ | ✗ |
| PEACE_OFFICER_SUBCITY | 1 | Subcity + woreda reports | ✓ | same scope | own only | ✗ |
| POLICE_COMMANDER_SUBCITY | 1 | Subcity + woreda reports | ✓ | same scope | own only | ✗ |
| PEACE_OFFICER_SUBCITY_VIEWER | 1 | Subcity + woreda (read-only) | ✗ | ✗ | ✗ | ✗ |
| POLICE_COMMANDER_SUBCITY_VIEWER | 1 | Subcity + woreda (read-only) | ✗ | ✗ | ✗ | ✗ |
| PEACE_OFFICER_WOREDA | 2 | Woreda reports only | ✓ | woreda scope only | own only | ✗ |
| POLICE_COMMANDER_WOREDA | 2 | Woreda reports only | ✓ | woreda scope only | own only | ✗ |
| PEACE_OFFICER_WOREDA_VIEWER | 2 | Woreda (read-only) | ✗ | ✗ | ✗ | ✗ |
| POLICE_COMMANDER_WOREDA_VIEWER | 2 | Woreda (read-only) | ✗ | ✗ | ✗ | ✗ |
| PATROL | — | **Own reports only** | ✓ | ✗ | own while SUBMITTED | ✗ |
| CITIZEN | — | Own reports only | ✗ | ✗ | ✗ | ✗ |

## Rules

- **Review follows the same scope**: a woreda officer can approve/reject woreda-level reports only; subcity can review subcity + woreda; top-level can review everything.
- **Woreda officer cannot read subcity/city reports** — no top-down leak.
- **Own report is always visible to its author**, even if scope would exclude it.
- **Delete**: only `SYSTEM_SUPER_ADMIN` (via API; the dashboard does not expose a delete button).
- Dashboard page: `/dashboard/work-reports` — shown to every logged-in role; only staff see actions (viewers/patrol see read-only lists).
- Citizen app: citizens do not use work reports at all.

## Who can SUBMIT a work report

`POST /api/work-reports` is allowed for:
- PATROL (mobile app)
- All staff roles at every level: SYSTEM_SUPER_ADMIN, SYSTEM_ADMIN, PEACE_SUPER_ADMIN, PEACE_OFFICER_SUBCITY, PEACE_OFFICER_WOREDA, POLICE_COMMANDER_CITY, POLICE_COMMANDER_SUBCITY, POLICE_COMMANDER_WOREDA

Not allowed: all `*_VIEWER` roles and CITIZEN.

## Future option (not built)

True subcity/woreda filtering by geographic unit (e.g., only your own woreda's reports, not other woredas') needs a `subcityId`/`woredaId` on the work report, captured from the reporter's assignment at submit time. Current scope is by **role level only** — all woredas' reports are visible to any woreda officer (horizontal). Say the word and I'll build geographic scoping.