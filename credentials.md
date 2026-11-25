# Peace & Security - Seeded Test Credentials

## Offline dashboard demo (no backend)

Deploy only `apps/peace-and-security-dashboard` with `NEXT_PUBLIC_DEMO_MODE=true`. Sign in on the deployed URL with **any staff or viewer email below** and password `admin123`.

| Use | Email | Password |
|---|---|---|
| Admin (full access) | `admin@example.com` | `admin123` |
| Viewer (read-only) | `viewer.super@peace.gov.et` | `admin123` |

The login page also has **Fill admin** and **Fill viewer** buttons. Patrol/citizen PINs below are for the mobile apps only and are not used by the offline dashboard.

---

## Admin / Staff Roles (Dashboard & API)
- **Login URL (Dashboard):** `http://localhost:8001`
- **Login API:** `POST http://localhost:5001/api/auth/user/login`
- **Default Password for all below:** `admin123`

| # | Role | Full Name | Email | Phone Number | Password |
|---|------|-----------|-------|--------------|----------|
| 1 | `SYSTEM_SUPER_ADMIN` | System Super Admin | admin@example.com | +251900000000 | `admin123` |
| 2 | `SYSTEM_ADMIN` | System Admin | sysadmin@peace.gov.et | +251911000001 | `admin123` |
| 3 | `PEACE_SUPER_ADMIN` | Peace Super Admin | peace.admin@peace.gov.et | +251911000002 | `admin123` |
| 4 | `PEACE_OFFICER_SUBCITY` | Peace Officer Subcity | peace.subcity@peace.gov.et | +251911000003 | `admin123` |
| 5 | `PEACE_OFFICER_WOREDA` | Peace Officer Woreda | peace.woreda@peace.gov.et | +251911000004 | `admin123` |
| 6 | `POLICE_COMMANDER_CITY` | Police Commander City | police.city@peace.gov.et | +251911000005 | `admin123` |
| 7 | `POLICE_COMMANDER_SUBCITY` | Police Commander Subcity | police.subcity@peace.gov.et | +251911000006 | `admin123` |
| 8 | `POLICE_COMMANDER_WOREDA` | Police Commander Woreda | police.woreda@peace.gov.et | +251911000007 | `admin123` |

---

## Viewer Roles (Read-Only)
- **Login URL (Dashboard):** `http://localhost:8001`
- **Default Password for all below:** `admin123`

| # | Role | Full Name | Email | Phone Number | Password |
|---|------|-----------|-------|--------------|----------|
| 1 | `SYSTEM_SUPER_ADMIN_VIEWER` | Super Admin Viewer | viewer.super@peace.gov.et | +251911000020 | `admin123` |
| 2 | `SYSTEM_ADMIN_VIEWER` | Admin Viewer | viewer.admin@peace.gov.et | +251911000021 | `admin123` |
| 3 | `PEACE_SUPER_ADMIN_VIEWER` | Peace Super Admin Viewer | viewer.peace@peace.gov.et | +251911000022 | `admin123` |
| 4 | `PEACE_OFFICER_SUBCITY_VIEWER` | Peace Subcity Viewer | viewer.peace.sub@peace.gov.et | +251911000023 | `admin123` |
| 5 | `PEACE_OFFICER_WOREDA_VIEWER` | Peace Woreda Viewer | viewer.peace.wor@peace.gov.et | +251911000024 | `admin123` |
| 6 | `POLICE_COMMANDER_CITY_VIEWER` | Police City Viewer | viewer.police.city@peace.gov.et | +251911000025 | `admin123` |
| 7 | `POLICE_COMMANDER_SUBCITY_VIEWER` | Police Subcity Viewer | viewer.police.sub@peace.gov.et | +251911000026 | `admin123` |
| 8 | `POLICE_COMMANDER_WOREDA_VIEWER` | Police Woreda Viewer | viewer.police.wor@peace.gov.et | +251911000027 | `admin123` |

---

## Patrol Officers (Patrol Mobile App)
- **Login API:** `POST http://localhost:5001/api/auth/patrol/login`
- **Default PIN for all below:** `1234`

| # | Role | Full Name | Phone Number | Email | PIN |
|---|------|-----------|--------------|-------|-----|
| 1 | `PATROL` | Patrol Officer 1 | +251911000011 | officer1@peace.gov.et | `1234` |
| 2 | `PATROL` | Patrol Officer 2 | +251911000012 | officer2@peace.gov.et | `1234` |
| 3 | `PATROL` | Patrol Officer 3 | +251911000013 | officer3@peace.gov.et | `1234` |

---

## Citizens (Citizen Mobile App)
- **Login API:** `POST http://localhost:5001/api/auth/citizen/login`
- **Default PIN for all below:** `1234`

| # | Role | Full Name | Phone Number | Email | PIN |
|---|------|-----------|--------------|-------|-----|
| 1 | `CITIZEN` | Abebe Kebede | +251911000031 | abebe.kebede@gmail.com | `1234` |
| 2 | `CITIZEN` | Hiwot Tesfaye | +251911000032 | hiwot.tesfaye@gmail.com | `1234` |
| 3 | `CITIZEN` | Dawit Mekonnen | +251911000033 | dawit.mekonnen@gmail.com | `1234` |

