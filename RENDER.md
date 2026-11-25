# Deploy the offline dashboard demo to Render

No backend, database, Redis, or Firebase project is required. Only the dashboard is deployed.

## Option A — Blueprint (recommended)

`render.yaml` is at the **repository root** (this is where Render looks by default).

1. Go to <https://dashboard.render.com> → **New** → **Blueprint**.
2. Connect this GitHub repo: `mekdelawitworku6-lgtm/PeaceAndSecurity`.
3. Render detects the root `render.yaml` and creates the web service. Its `rootDir` points at `apps/peace-and-security-dashboard`.
4. Deploy. The only environment variable it sets is `NEXT_PUBLIC_DEMO_MODE=true`.
5. Open the generated `onrender.com` URL and sign in.

## Option B — Manual web service

1. **New** → **Web Service** → connect the same GitHub repo.
2. Settings:
   - **Root Directory:** `apps/peace-and-security-dashboard`
   - **Runtime:** `Node`
   - **Build Command:** `npx --yes pnpm@10.14.0 install --frozen-lockfile && npx --yes pnpm@10.14.0 build`
   - **Start Command:** `./node_modules/.bin/next start -p $PORT`
   - **Health Check Path:** `/`
3. Environment variables:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_DEMO_MODE` | `true` |

   Do **not** add `NEXT_PUBLIC_API_URL`. If you ever add it, set `NEXT_PUBLIC_DEMO_MODE=true` anyway so the offline adapter stays enabled.
4. Click **Create Web Service** and wait for the first deploy.

## Login

| Use | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| Viewer | `viewer.super@peace.gov.et` | `admin123` |

The login page has **Fill admin** and **Fill viewer** buttons. Any staff/viewer email in `credentials.md` also works. Full local-only copy: `credentials.local.md`.

## Notes

- The first build on Render can take several minutes because pnpm installs ~600 packages.
- Do **not** use `corepack enable` on Render — it tries to modify `/usr/bin/pnpm` and fails with `EROFS: read-only file system`. The `npx pnpm@10.14.0` command above is the working alternative.
- `NEXT_PUBLIC_*` variables are compiled into the browser bundle, so changing them requires a redeploy.
- The free plan sleeps after inactivity; the first request after a sleep may take a few seconds.
- Patrol/citizen PINs are not used by this dashboard demo.
