# AI Kids Video Factory

Foundation for a modular video production application. Laravel is the versioned API and system of record, Vue is a separate SPA, and Python worker processes will own resource intensive AI and media workloads. This setup intentionally does not include business modules.

## Requirements

- PHP 8.3+, Composer 2
- MySQL 8+, Redis 7+
- Node.js 22.18+ or 24.12+, npm
- Python 3.11+ for future worker services
- FFmpeg and FFprobe on worker `PATH`; ComfyUI reachable over a private network when enabled

## Local development

1. Copy `backend/.env.example` to `backend/.env`, then set unique database credentials and allowed frontend origins. Copy `frontend/.env.example` to `frontend/.env.local` if the API is not at its default URL.
2. Start MySQL and Redis. `docker compose up -d mysql redis` starts development instances with persistent named volumes. If the configured ports are occupied, adjust the host ports.
3. Install backend dependencies and prepare the Laravel application:

   ```powershell
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate
   ```

4. In separate terminals, start the API, Redis queue worker, and scheduler:

   ```powershell
   cd backend
   php artisan serve
   php artisan queue:work redis --tries=3 --timeout=120
   php artisan schedule:work
   ```

5. Start the SPA:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The API health check is `GET /api/v1/health`. Configure `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, and `CORS_ALLOWED_ORIGINS` for the exact browser hostnames used by the SPA. For browser sessions, request `/sanctum/csrf-cookie` before authenticated state-changing requests. Use bearer tokens for non-browser clients and scope abilities narrowly.

## Phase 1: authentication and accounts

- Registration and login create a Laravel session protected by Sanctum's CSRF cookie. The SPA keeps no authentication token in local storage; Axios sends the session cookie and XSRF header.
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, and `POST /api/v1/auth/logout` manage the browser session. `GET /api/v1/user` returns the signed-in user's public account data.
- `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` use Laravel's password broker and time-limited, single-use reset tokens. Reset requests return a generic response that does not reveal whether an email is registered.
- `GET /api/v1/auth/email/verify/{id}/{hash}` requires an authenticated matching user and a signed, expiring URL. Verification and password reset messages link back to the SPA; configure a real mail transport before production use.
- `PATCH /api/v1/user` updates name, email, and an optional HTTPS avatar URL. Changing email clears verification and sends a new verification email. `PUT /api/v1/user/password` requires the current password and revokes other Sanctum tokens.
- Account status defaults to `active`. The `active` middleware protects account routes. RBAC uses roles, permissions, `permission_role`, and `role_user`; authorization is enforced through policies, Laravel gates, and the `permission:<resource.action>` middleware.
- Login, registration, password recovery, reset, and verification routes are rate limited. Passwords require 12 characters with mixed case, a number, and a symbol.
- Auth routes in Vue are `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/verify-email/:id/:hash`; signed-in pages use `/profile`. Guest-only and protected routes are enforced by the router guard.

The verification and reset email URLs use `FRONTEND_URL`. For local testing with the log mailer, inspect `backend/storage/logs/laravel.log` for generated links.

## Role based access control

Run `php artisan migrate` and `php artisan db:seed` after configuring the database. The seeder creates the Super Admin, Admin, Producer, Script Writer, Artist, Voice Artist, Video Editor, and QC Manager roles, plus the initial granular permission catalog. The default role-permission assignments are starter templates and can be changed in the access management UI.

Create a user through registration, then grant the first administrator with `php artisan rbac:assign-super-admin user@example.com`. Only a Super Admin can assign the Super Admin role to another account. Sign in and open `/admin/access` to manage role permission sets, permission definitions, and user role assignments. The API routes live under `/api/v1/admin`; role and permission management is protected by Laravel policies, and other feature routes can use `permission:projects.view` or another registered permission key.

The local XAMPP database may still have earlier migrations pending; inspect `php artisan migrate:status` and make a database backup before applying migrations to an existing database.

## Production dashboard

The signed-in dashboard is `/dashboard` and requires `projects.view`. `GET /api/v1/dashboard` returns project/video aggregates, stage work item counts, recent project and activity records, live queue counters, and system probes. Dashboard records are persisted in the `projects`, `production_work_items`, `videos`, `production_activities`, `queue_job_metrics`, and `queue_worker_heartbeats` tables; no sample production records are seeded.

Set `DASHBOARD_QUEUES` to a comma-separated list of Redis queue names used by workers. Queue lifecycle events record completed/failed history, and Laravel queue workers publish a database heartbeat while polling. Configure `PYTHON_WORKER_HEALTH_URL` to the worker's real health endpoint; an unset endpoint is shown as not configured. FFmpeg is checked by running `FFMPEG_BINARY -version`, and storage health performs a temporary write/delete on the configured default disk.

The Phase 3 migration adds dashboard and queue tracking tables. Run it only after checking the earlier pending migrations and backing up an existing database.

## Structure and conventions

- `backend/app/Http/Requests/Api`: validation belongs in Form Requests. The API base request denies authorization by default, so concrete requests must explicitly authorize access. Return Laravel's standard JSON validation errors (`422`, `message`, `errors`) and keep policies explicit.
- `backend/app/Http/Resources/Api`: stable JSON resource boundary for API representations.
- `backend/routes/api.php`: only `/api/v1` routes; new API versions should be introduced deliberately.
- `frontend/src/services/api`: typed Axios client and endpoint services. `getApiError` normalizes request and application errors for UI presentation.
- `frontend/src/stores`: Pinia stores grouped by application concern; avoid network calls in view components as modules are added.
- `frontend/src/components/ui`: reusable, accessible UI primitives. Feature components belong with future feature modules.
- `backend/storage/app/media`: private local media disk. Serve protected media via authorized API responses; do not expose source or generated files directly from a public web root.
- `workers/`: integration boundary documentation for future Python services. Keep AI credentials and GPU runtime off the API and frontend processes.

## Operations

- Queue connection defaults to Redis. The example retry-after (180 seconds) exceeds the documented worker timeout (120 seconds). Monitor failed jobs with `php artisan queue:failed` and retry intentionally.
- Laravel's scheduler is invoked by one scheduler process/container using `php artisan schedule:work` locally or `php artisan schedule:run` once per minute in production.
- Logs use Laravel's daily rotating channel. Set `LOG_LEVEL=info` or higher in production and ship logs to a centralized provider with retention and alerting.
- Keep `.env` and credentials out of version control. Use deployment secrets and rotate credentials after exposure.
- Configure regular MySQL backups and media-volume backups before storing user content. Redis is operational state and should not be the only copy of durable business records.

## Checks

```powershell
cd backend
php artisan test
php artisan migrate --pretend

cd ..\frontend
npm run type-check
npm run build
```

The test suite uses an in-memory SQLite database and does not require MySQL or Redis. Production migration verification should run against the configured MySQL version in CI or a disposable environment.
