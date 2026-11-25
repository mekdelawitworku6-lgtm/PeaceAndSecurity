# Peace & Security — Portfolio Demo Guide

This guide deploys the full stack to **Railway** with public `*.up.railway.app` URLs, loads a realistic demo dataset, and connects both Flutter apps to the live API.

```
                    ┌──────────────────────────────┐
   Browser  ───────▶ │ Dashboard (Next.js, Railway) │
                    └──────────────┬───────────────┘
                                   │ REST + Socket.IO
                                   ▼
   Flutter  ───────▶ ┌──────────────────────────────┐
   (device)          │ Backend (NestJS, Railway)    │
                    │  /api   ·   /docs   ·   /chat │
                    └───┬────────────────┬──────────┘
                        │                │
                 ┌──────▼──────┐  ┌──────▼──────┐
                 │  PostgreSQL │  │    Redis    │
                 └─────────────┘  └─────────────┘
```

Replace `<api-domain>` and `<dashboard-domain>` below with the domains Railway generates for you.

---

## Offline dashboard demo (no backend)

You can deploy **only** `apps/peace-and-security-dashboard` and skip sections 1–4 entirely. No database, Redis, backend, or Firebase project is required.

1. Create a hosting project (Vercel, Railway, Netlify, etc.) with **Root Directory** `apps/peace-and-security-dashboard` and package manager **pnpm**.
2. Set one environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_DEMO_MODE` | `true` |

   Do **not** set `NEXT_PUBLIC_API_URL` for the offline demo. If no API URL is present, demo mode is enabled automatically.
3. Deploy and open the generated URL. The login page shows demo credentials; click **Fill admin** (`admin@example.com`) or **Fill viewer** (`viewer.super@peace.gov.et`) and sign in with password `admin123`. Any staff/viewer email in `credentials.md` also works.
4. Every page is backed by local fixtures: 8 reports, 3 chat conversations, 6 cameras with alerts, users, notifications, audit logs, settings, and analytics. Sockets are no-ops and no push-notification permission is requested.

Deploying to **Render**? Use the included blueprint `apps/peace-and-security-dashboard/render.yaml` or follow `RENDER.md`. A local-only credentials copy is kept in `credentials.local.md` (git-ignored).

To return to the live API later, set `NEXT_PUBLIC_DEMO_MODE=false` and `NEXT_PUBLIC_API_URL=https://<api-domain>/api`, then redeploy.

---

## 1. Deploy the backend

1. Create a Railway project → **New → Empty Project**.
2. **Add infrastructure:** `+ New → Database → Add PostgreSQL`, then `+ New → Database → Add Redis`.
3. **Add the backend service:** `+ New → GitHub Repo → <your repo>`, then open its **Settings**:
   - **Root Directory:** `/apps/backend`
   - Railway detects `apps/backend/Dockerfile` and `apps/backend/railway.json` automatically.
4. **Variables** (Settings → Variables → Raw Editor). Generate each secret with:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DB_HOST` | `${{Postgres.PGHOST}}` |
   | `DB_PORT` | `${{Postgres.PGPORT}}` |
   | `DB_USERNAME` | `${{Postgres.PGUSER}}` |
   | `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
   | `DB_NAME` | `${{Postgres.PGDATABASE}}` |
   | `DB_SSL` | `true` |
   | `REDIS_HOST` | `${{Redis.REDIS_HOST}}` |
   | `REDIS_PORT` | `${{Redis.REDIS_PORT}}` |
   | `REDIS_PASSWORD` | `${{Redis.REDIS_PASSWORD}}` (if your Redis has one) |
   | `OTP_SECRET` | `<random hex, 32+ chars>` |
   | `JWT_ACCESS_SECRET` | `<random hex, 32+ chars>` |
   | `JWT_REFRESH_SECRET` | `<random hex, 32+ chars>` |
   | `JWT_REG_SECRET` | `<random hex, 32+ chars>` |
   | `JWT_SET_PASSWORD_SECRET` | `<random hex, 32+ chars>` |
   | `JWT_PASSWORD_RESET_SECRET` | `<random hex, 32+ chars>` |
   | `BASE_URL` | `https://<api-domain>/api` |
   | `ALLOWED_ORIGINS` | `https://<dashboard-domain>` |

   > `PORT` is injected by Railway automatically — do **not** set it.

5. **Persistent uploads** (optional but recommended): Settings → Volumes → **Add Volume** → mount path `/app/uploads`. Without this, images uploaded during the demo disappear on redeploy. Seeded demo images use external URLs, so the dashboard still looks complete without it.
6. **Public domain:** Settings → Networking → **Generate Domain**. Copy it as `<api-domain>`.
7. Verify:
   - `https://<api-domain>/api/health` → `{"status":"ok",...}`
   - `https://<api-domain>/docs` → Swagger UI

> On first boot TypeORM creates the schema (`synchronize: true`) and seeds the geo hierarchy, 11 report types, all staff/patrol/citizen accounts, and 13 settings. No migration step is needed.

---

## 2. Load the rich demo dataset

The backend already contains a full demo dataset (8 realistic reports with photos/video/audio, status variety, patrol follow-ups, 3 chat conversations, 6 cameras + alerts, notifications, audit logs), but it is not loaded on boot by default.

After the backend is healthy, open the backend service in Railway → `⋮` → **Run Command** and run:

```bash
npm run db:seed:demo:prod
```

Wait for `✔ Full demo dataset ready`. The command is idempotent — re-running it skips anything already seeded.

---

## 3. Deploy the dashboard

1. `+ New → GitHub Repo → <your repo>` → Settings → **Root Directory:** `/apps/peace-and-security-dashboard`.
2. Railway detects `Dockerfile` + `railway.json`.
3. **Variables** — set these **before the first build** (they are compiled into the browser bundle):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<api-domain>/api` |
   | `NEXT_PUBLIC_DEMO_MODE` | `true` |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(optional — see limitations)* |

   > The URL **must include `/api`**. Changing it later requires a redeploy.

4. Settings → Networking → **Generate Domain** → copy as `<dashboard-domain>`.
5. Go back to the **backend** service and make sure `ALLOWED_ORIGINS` is exactly `https://<dashboard-domain>` (no trailing slash), then redeploy the backend if you changed it.
6. Open `https://<dashboard-domain>` — the login page shows a **Demo access** box with a "Fill demo credentials" button.

---

## 4. Connect the Flutter apps

No code changes are needed. Both apps read `API_URL` at compile time and derive the socket origin automatically.

```powershell
# Citizen app
cd apps\citizen_app_flutter
flutter run -d <device-id> --dart-define=API_URL=https://<api-domain>/api

# Patrol app
cd ..\patrol_app_flutter
flutter run -d <device-id> --dart-define=API_URL=https://<api-domain>/api
```

Use an Android emulator/device; Chrome and Linux are not first-class targets here. For a built artifact, pass the same `--dart-define` to `flutter build apk --debug` (build it yourself — do not ask the agent to produce APKs).

Verify `flutter analyze` is clean in both apps before wrapping up.

---

## 5. Demo credentials

| Surface | Login | Credential |
|---|---|---|
| Dashboard | `admin@example.com` | `admin123` |
| Dashboard (read-only viewer) | `viewer.super@peace.gov.et` | `admin123` |
| Patrol app | `+251911000011` (also `...012`, `...013`) | PIN `1234` |
| Citizen app | `+251911000031` (also `...032`, `...033`) | PIN `1234` |

Full role list: [`credentials.md`](credentials.md).

**Use the seeded logins.** Citizen self-registration is not usable in this demo: SMS OTP is not configured, and the current `POST /api/auth/citizen/register` contract returns tokens directly instead of the `registrationToken` the app expects.

---

## 6. Verification checklist

- [ ] `GET /api/health` returns `status: ok`
- [ ] `GET /docs` shows Swagger with the production server URL
- [ ] Dashboard login works and redirects to `/dashboard/reports`
- [ ] Reports page shows 8 seeded cases across SUBMITTED → CLOSED statuses with evidence thumbnails
- [ ] Map page renders report markers around Addis Ababa
- [ ] Chat page shows seeded citizen ↔ patrol conversations
- [ ] Analytics and Audit Logs pages render data
- [ ] Patrol app logs in and shows only its assigned cases
- [ ] Citizen app logs in and shows only its own reports
- [ ] Submit a new report in the citizen app → it appears in the dashboard (real-time via Socket.IO)

---

## 7. Limitations & security notes

- **Public credentials are intentional.** Every backend restart resets the seeded passwords to `admin123` / PIN `1234`. Never point this demo at real data, and don't reuse these secrets elsewhere.
- **OTP registration is disabled in practice** (no SMS provider). The `devOtp` helper only appears when `NODE_ENV=development`, which a public demo should not use.
- **Uploads need the volume** from step 1.5 to survive redeploys; seeded media uses external URLs and is unaffected.
- **Google Maps:** the citizen Android app has a key hardcoded in `android/app/src/main/AndroidManifest.xml`; the `GOOGLE_MAPS_API_KEY` dart-define is currently unused. iOS has no key. If maps are blank, replace that manifest key.
- **Android cleartext** is only allowed for `10.0.2.2`/`localhost`. Always use the HTTPS Railway URL for a physical device or emulator.
- **Free-tier cold starts:** Railway services may sleep on trial plans; the first request after idle can take a few seconds.

---

## 8. Local Docker alternative

```powershell
Copy-Item apps\backend\.env.example .env
# set DB_SSL=false and NEXT_PUBLIC_API_URL=http://localhost:5001/api in .env
docker compose up -d --build
docker compose exec backend npm run db:seed:demo:prod
```

Dashboard: `http://localhost:8001` · API: `http://localhost:5001/api` · Swagger: `http://localhost:5001/docs`.

---

## 9. Render instead of Railway (same app, more manual)

Render has no blueprint support for Redis, so create the resources in the dashboard:

1. Create **PostgreSQL** and **Key Value (Redis)** instances.
2. Create a **Web Service → Docker** from your repo with Root Directory `apps/backend`. Use the same variables, but take DB/Redis values from the Render resource pages and set `DB_SSL=true`. Enable "TCP keepalive" if offered.
3. Create a second **Web Service → Docker** for `apps/peace-and-security-dashboard` with the `NEXT_PUBLIC_*` variables from step 3. Add build args in the Render UI if it does not pass service variables to Docker `ARG`s automatically.
4. Run the demo seed with **Shell → `npm run db:seed:demo:prod`**.
5. Render's free web services spin down when idle — expect a slow first load. Use a paid instance if the first-click experience matters for your portfolio.
