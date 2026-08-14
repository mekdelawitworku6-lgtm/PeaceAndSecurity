# Peace & Security Platform — Agent Guide

## Overview
Environmental/community safety platform with three client apps and one backend:

| Directory | What it is |
|---|---|
| `apps/backend` | NestJS 10 + TypeORM + PostgreSQL + Redis + Socket.IO API |
| `apps/citizen_app_flutter` | Citizen mobile app (Flutter 3.44 + Bloc), en/am/om |
| `apps/patrol_app_flutter` | Patrol mobile app (Flutter 3.44 + Bloc), en/am/om |
| `apps/peace-and-security-dashboard` | Admin dashboard (Next.js 16 + pnpm) |
| `apps/citizen_app`, `apps/patrol_app` | Legacy React Native apps (reference only — do not modify) |
| `docker-compose.yml` | Full stack: postgres, redis, backend, dashboard |

## Commands

### Backend (`apps/backend`)
- Build: `npm run build` (nest build) — Dockerfile uses `pnpm install`
- Dev: `npm run start:dev`
- DB: `npm run db:run` / `db:revert` / `db:seed` (typeorm migrations)
- Always rebuild image after dependency changes: `docker compose up -d --build backend`

### Flutter apps (`apps/citizen_app_flutter`, `apps/patrol_app_flutter`)
- Analyze (MUST be clean before finishing): `flutter analyze`
- Run: `flutter run -d <device>` (Chrome/Linux are NOT first-class; use Android emulator/device)
- **NEVER build APKs for the user** — user runs `flutter build apk --debug` locally
- Both apps are identical in architecture; patrol was derived from citizen. Changes to shared patterns must be mirrored in both.
- API URL override at runtime: `--dart-define=API_URL=...`

### Dashboard (`apps/peace-and-security-dashboard`)
- Dev: `pnpm dev` (port 4000) · Build: `pnpm build` (next build, output standalone)
- pnpm is the package manager (has `pnpm-lock.yaml`)

## Docker Stack
- Ports: backend `5001` (container 5000), dashboard `8001` (container 4000), postgres `5433`, redis `6380`
- Root `.env` required (backend service uses `env_file`). Contains `PORT=5001`, `NEXT_PUBLIC_API_URL=http://localhost:5001/api`, DB creds, JWT secrets, `ALLOWED_ORIGINS`.
- **CORS**: `main.ts` allows all origins when `NODE_ENV=development`; otherwise only `ALLOWED_ORIGINS` list.
- Seeded super admin (admin-seeder): email `admin@example.com`, phone `+251900000000`, password `admin123` (override via `SEED_ADMIN_*` env). Login: `POST /api/auth/user/login`.
- Addis Ababa city (code `AA`) is always seeded by `GeoSeederService` (`src/database/seeds/geo-seeder.service.ts`).

## API Conventions
- Global prefix: `/api` — every route is `http://host:5001/api/...`. The dashboard's `NEXT_PUBLIC_API_URL` must include `/api`.
- Response envelope: `{ success, message, statusCode, data }` (+ `total/page/limit/totalPages` for lists).
- Headers: `Authorization: Bearer <jwt>`, `x-device-id`, `x-device-platform`, `x-app-version`, `x-user-role` (`CITIZEN` | `PATROL`).
- Uploads served at `/uploads` (no `/api` prefix).
- Auth: citizen `register → verify OTP → set-pin`; login `POST /api/auth/citizen/login`; patrol `POST /api/auth/patrol/login` (phoneNumber + pin).
- Socket.IO: root namespace `authenticate {userId, role}` → rooms `user:{id}` / `role:{role}`, events `notification`, `unread_count`; `/chat` namespace emits `chat:join/send/typing/read`, listens `chat:message`, `chat:typing`, `chat:conversation_created`.
- Reports: `POST /api/reports` multipart — `images` (max 15), `video` (10), `audio` (10); patrol actions: `accept`, `follow-up` (multipart `notes/latitude/longitude/patrolEvidence`), `escalate`, `close`, `assigned-to-me`, `nearby?radiusKm`.

## Roles & Access
- `SYSTEM_SUPER_ADMIN`, `SYSTEM_ADMIN`, `PEACE_SUPER_ADMIN`, `PEACE_OFFICER_SUBCITY`, `PEACE_OFFICER_WOREDA`, `POLICE_COMMANDER_CITY/SUBCITY/WOREDA`, plus `*_VIEWER` for each (read-only).
- `POST /api/users/register` (multipart, optional profileImage): super admin can create any role; each role can create its own role + its own viewer + descendants (peace: super→subcity→woreda; police: city→subcity→woreda). Patrol/Citizen must NOT be created here.
- Scope rule: a woreda officer creates only `PEACE_OFFICER_WOREDA(_VIEWER)` users, city commander creates city/subcity/woreda police users, etc. See `user.service.ts` `CREATE_ACCESS` map.

## Known Environment Quirks (this machine)
- npm/pnpm network is flaky inside Docker: registry.npmjs.org works with retries; **npmmirror serves corrupted tarballs** (e.g. `@swc/helpers` missing `esm/`) — never switch to it.
- `.npmrc` in backend + dashboard pins `registry=https://registry.npmjs.org` with `fetch-retries=8`.
- Dashboard Dockerfile build uses `network: host` (10x faster, avoids docker DNS flakiness).
- pnpm does NOT hoist — any transitive import must be declared in `package.json` (e.g. `express`, `mime-types`, `moment`, `dotenv`, `jsonwebtoken` were added to backend).
- Next standalone output prunes `@swc/helpers/esm` — runner stage installs prod deps directly instead of copying standalone (do not revert).
- Long docker builds: run detached (`setsid nohup ... &`) and poll the log file, or the shell timeout kills them.

## Conventions
- No code comments unless asked. Match existing file style.
- Flutter apps: features/ directory with bloc pattern, `core/i18n` for en/am/om strings — new UI strings must be added to the dictionary for translation.
- Backend: DTOs with class-validator, envelope responses via `successResponse`, guards: `JwtAuthGuard` + `RolesGuard` + `@Roles(...)`.