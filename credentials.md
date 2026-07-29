# Peace & Security - User Credentials

> City: **Addis Ababa** (ID: `ca0e82db-4e4f-441b-a074-295bde0d4687`)
> Subcity: **Bole** (ID: `790fb777-b42c-4a2e-8318-f8b83284adef`)
> Woreda: **Woreda 01** (ID: `ff8304ae-0e58-4ff9-9978-4e1b0d353304`)

## Admin Roles

| # | Role | Full Name | Email | Phone | Password |
|---|------|-----------|-------|-------|----------|
| 1 | `SYSTEM_SUPER_ADMIN` | System Super Admin | admin@possibletechplc.com | +251900000000 | Admin@2024 |
| 2 | `SYSTEM_ADMIN` | System Admin | sysadmin@peace.gov.et | +251911000001 | Admin@123 |
| 3 | `PEACE_SUPER_ADMIN` | Peace Super Admin | peace.admin@peace.gov.et | +251911000002 | Peace@123 |
| 4 | `PEACE_OFFICER_SUBCITY` | Peace Officer Subcity | peace.subcity@peace.gov.et | +251911000003 | Peace@123 |
| 5 | `PEACE_OFFICER_WOREDA` | Peace Officer Woreda | peace.woreda@peace.gov.et | +251911000004 | Peace@123 |
| 6 | `POLICE_COMMANDER_CITY` | Police Commander City | police.city@peace.gov.et | +251911000005 | Police@123 |
| 7 | `POLICE_COMMANDER_SUBCITY` | Police Commander Subcity | police.subcity@peace.gov.et | +251911000006 | Police@123 |
| 8 | `POLICE_COMMANDER_WOREDA` | Police Commander Woreda | police.woreda@peace.gov.et | +251911000007 | Police@123 |

## Viewer Roles (Read-Only)

| # | Role | Full Name | Email | Phone | Password |
|---|------|-----------|-------|-------|----------|
| 1 | `SYSTEM_SUPER_ADMIN_VIEWER` | Super Admin Viewer | viewer.super@peace.gov.et | +251911000020 | View@123 |
| 2 | `SYSTEM_ADMIN_VIEWER` | Admin Viewer | viewer.admin@peace.gov.et | +251911000021 | View@123 |
| 3 | `PEACE_SUPER_ADMIN_VIEWER` | Peace Super Admin Viewer | viewer.peace@peace.gov.et | +251911000022 | View@123 |
| 4 | `PEACE_OFFICER_SUBCITY_VIEWER` | Peace Subcity Viewer | viewer.peace.sub@peace.gov.et | +251911000023 | View@123 |
| 5 | `PEACE_OFFICER_WOREDA_VIEWER` | Peace Woreda Viewer | viewer.peace.wor@peace.gov.et | +251911000024 | View@123 |
| 6 | `POLICE_COMMANDER_CITY_VIEWER` | Police City Viewer | viewer.police.city@peace.gov.et | +251911000025 | View@123 |
| 7 | `POLICE_COMMANDER_SUBCITY_VIEWER` | Police Subcity Viewer | viewer.police.sub@peace.gov.et | +251911000026 | View@123 |
| 8 | `POLICE_COMMANDER_WOREDA_VIEWER` | Police Woreda Viewer | viewer.police.wor@peace.gov.et | +251911000027 | View@123 |

## Patrol Team

**Alpha Team** (ID: `1455d79c-9e5e-40d9-8f57-864d4eccdcad`)
- **Woreda:** Woreda 01 (Bole Subcity, Addis Ababa)
- **Leader:** Patrol Officer 1
- **Members:** Patrol Officer 1 (Leader), Patrol Officer 2, Patrol Officer 3

### Patrol Officers

| # | Name | Phone | Email |
|---|------|-------|-------|
| 1 | Patrol Officer 1 | +251911000011 | officer1@peace.gov.et |
| 2 | Patrol Officer 2 | +251911000012 | officer2@peace.gov.et |
| 3 | Patrol Officer 3 | +251911000013 | officer3@peace.gov.et |

## API Access

- **Base URL:** `http://localhost:52500/api`
- **Login:** `POST /api/auth/user/login` with `email` + `password`
- **Geo endpoints:** `GET/POST /api/geo/cities`, `/api/geo/subcities`, `/api/geo/woredas`
- **Patrol endpoints:** `GET/POST /api/patrols`, `/api/patrol-teams`

## Notes

- PATROL and CITIZEN roles use separate mobile app auth flows (phone + PIN), not dashboard login.
- Viewer roles can only read data — they cannot create, update, or delete records.
- All dashboard users log in at the Peace & Security Dashboard via email + password.
