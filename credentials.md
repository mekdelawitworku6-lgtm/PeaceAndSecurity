# Peace & Security - User Credentials

> City: **Addis Ababa** (ID: `ca0e82db-4e4f-441b-a074-295bde0d4687`)

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

## API Access

- **Base URL:** `http://localhost:52500/api`
- **Login:** `POST /api/auth/user/login` with `email` + `password`
- **Geo endpoints** are under `POST /api/geo/cities`, etc.

## Notes

- PATROL and CITIZEN roles use separate mobile app auth flows (phone + PIN), not dashboard login.
- All dashboard users above log in at the Peace & Security Dashboard via email + password.
