# Peace & Security — Roles, Hierarchy & Accounts

> Live data from the production database (`157.180.114.86`, peace_and_security).
> Generated 2026-08-14.

## 1. All Roles (18)

### System (top level)
| Role | Purpose |
|---|---|
| SYSTEM_SUPER_ADMIN | Full access — creates any staff role, deletes work reports |
| SYSTEM_ADMIN | System-level administration |
| SYSTEM_SUPER_ADMIN_VIEWER | Read-only (sees all reports) |
| SYSTEM_ADMIN_VIEWER | Read-only (sees all reports) |

### Peace & Security hierarchy
| Role | Purpose |
|---|---|
| PEACE_SUPER_ADMIN | Peace & Security city-level |
| PEACE_OFFICER_SUBCITY | Peace officer at subcity level |
| PEACE_OFFICER_WOREDA | Peace officer at woreda level |
| PEACE_SUPER_ADMIN_VIEWER | Read-only |
| PEACE_OFFICER_SUBCITY_VIEWER | Read-only |
| PEACE_OFFICER_WOREDA_VIEWER | Read-only |

### Police hierarchy
| Role | Purpose |
|---|---|
| POLICE_COMMANDER_CITY | City police commander — sees all |
| POLICE_COMMANDER_SUBCITY | Subcity commander — sees subcity + woreda reports |
| POLICE_COMMANDER_WOREDA | Woreda commander — sees woreda reports only, can register patrols + teams |
| POLICE_COMMANDER_CITY_VIEWER | Read-only |
| POLICE_COMMANDER_SUBCITY_VIEWER | Read-only |
| POLICE_COMMANDER_WOREDA_VIEWER | Read-only |

### Mobile (no dashboard access)
| Role | Purpose |
|---|---|
| PATROL | Patrol officer (mobile app) |
| CITIZEN | Citizen (mobile app) |

## 2. City

### Addis Ababa (AA)
Capital city of Ethiopia — root geographic unit.

## 3. Subcities

| Subcity | Code | Police Commander |
|---|---|---|
| **Bole** | BOLE | Miss lideta |
| **Trust** | trust-01 | Miss Liddeta Police Commander |

### 3.1 Bole Subcity
| Name | Role |
|---|---|
| Miss lideta (lideta@gov.et, +251909090909) | POLICE_COMMANDER_SUBCITY |

**Woredas:**
| Woreda | Code |
|---|---|
| Woreda 01 | WRD-01 |

**Woreda 01** — no peace/police officer assigned yet.

### 3.2 Trust Subcity
| Name | Role |
|---|---|
| Miss Liddeta Police Commander (lidetas@gov.et, +251932893992) | POLICE_COMMANDER_SUBCITY |

**Woredas:** none yet.

## 4. All Accounts by Role

### SYSTEM_SUPER_ADMIN
| Name | Email | Phone |
|---|---|---|
| System Super Admin | admin@possibletechplc.com | +251900000000 |

### SYSTEM_ADMIN
| Name | Email | Phone |
|---|---|---|
| System Admin | sysadmin@peace.gov.et | +251911000001 |

### PEACE_SUPER_ADMIN
| Name | Email | Phone |
|---|---|---|
| Peace Super Admin | peace.admin@peace.gov.et | +251911000002 |

### PEACE_OFFICER_SUBCITY
| Name | Email | Phone | Area |
|---|---|---|---|
| Peace Officer Subcity | peace.subcity@peace.gov.et | +251911000003 | unassigned |

### PEACE_OFFICER_WOREDA
| Name | Email | Phone | Area |
|---|---|---|---|
| Peace Officer Woreda | peace.woreda@peace.gov.et | +251911000004 | unassigned |

### POLICE_COMMANDER_CITY
| Name | Email | Phone |
|---|---|---|
| Police Commander City | police.city@peace.gov.et | +251911000005 |

### POLICE_COMMANDER_SUBCITY
| Name | Email | Phone | Area |
|---|---|---|---|
| Police Commander Subcity | police.subcity@peace.gov.et | +251911000006 | unassigned |
| Miss lideta | lideta@gov.et | +251909090909 | Bole |
| Miss Liddeta Police Commander | lidetas@gov.et | +251932893992 | Trust |

### POLICE_COMMANDER_WOREDA
| Name | Email | Phone | Area |
|---|---|---|---|
| Police Commander Woreda | police.woreda@peace.gov.et | +251911000007 | unassigned |

### Viewers (read-only)
| Role | Name | Email |
|---|---|---|
| SYSTEM_SUPER_ADMIN_VIEWER | Super Admin Viewer | viewer.super@peace.gov.et |
| SYSTEM_ADMIN_VIEWER | Admin Viewer | viewer.admin@peace.gov.et |
| PEACE_SUPER_ADMIN_VIEWER | Peace Super Admin Viewer | viewer.peace@peace.gov.et |
| PEACE_OFFICER_SUBCITY_VIEWER | Peace Subcity Viewer | viewer.peace.sub@peace.gov.et |
| PEACE_OFFICER_WOREDA_VIEWER | Peace Woreda Viewer | viewer.peace.wor@peace.gov.et |
| POLICE_COMMANDER_CITY_VIEWER | Police City Viewer | viewer.police.city@peace.gov.et |
| POLICE_COMMANDER_SUBCITY_VIEWER | Police Subcity Viewer | viewer.police.sub@peace.gov.et |
| POLICE_COMMANDER_WOREDA_VIEWER | Police Woreda Viewer | viewer.police.wor@peace.gov.et |

## 5. Patrol Officers & Teams

| Name | Team |
|---|---|
| Patrol Officer 1 | — |
| Patrol Officer 2 | Alpha Team |
| Patrol Officer 3 | Alpha Team |

**Teams:** Alpha Team (2 members)

## 6. Citizens
3 citizen accounts exist (mobile app users).

## 7. Summary

| Item | Count |
|---|---|
| Roles | 18 (6 staff + 6 peace + 6 police/viewers… see §1) |
| User accounts | 18 staff + 3 patrols + 3 citizens |
| Cities | 1 (Addis Ababa) |
| Subcities | 2 (Bole, Trust) |
| Woredas | 1 (Woreda 01 under Bole) |
| Patrol teams | 1 (Alpha Team) |

> Note: most demo accounts (created by the seeder) are **not** assigned to a subcity/woreda. Assign them in User Management to complete the hierarchy.