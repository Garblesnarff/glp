# Hetzner Deployment Runbook

This runbook is specific to the current GLP stack and the known Hetzner host layout:

- Host OS: Ubuntu 24.04
- Repo path: `/var/www/glp`
- Reverse proxy: `nginx`
- Frontend: static Vite build
- Auth: WorkOS
- Database: self-hosted Supabase stack under `/var/www/glp/supabase-docker/docker`
- Notification worker: Bun script managed by `pm2`

## Architecture

Production shape for GLP should be:

1. `nginx` terminates TLS on `80/443`
2. `nginx` serves the frontend build from `/var/www/glp/dist`
3. WorkOS handles auth in the browser app
4. The frontend talks to the GLP Supabase gateway at `localhost:8004` through the configured public URL
5. `pm2` runs the notification worker on a cron schedule

This app does not need a long-running Bun web server in production unless that decision changes later.

## 1. Required Inputs Before First Deploy

- Final public domain: `glp.infiniterealms.tech`
- WorkOS production client ID / redirect URI / hostname
- Supabase public URL for the GLP stack
- Supabase anon key
- Supabase service role key for the worker
- Optional notification provider secrets:
  - `RESEND_API_KEY`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`

## 2. Server Prerequisites

The server already has:

- `bun`
- `node`
- `docker`
- `docker compose`
- `nginx`

Confirm `pm2` is installed. If not:

```bash
npm install -g pm2
pm2 startup systemd
```

Run the printed `sudo` command from `pm2 startup` if prompted.

## 3. Repo Setup

```bash
cd /var/www
git clone git@github.com:Garblesnarff/glp.git
cd /var/www/glp
bun install
```

For updates:

```bash
cd /var/www/glp
git pull --ff-only origin main
bun install
```

## 4. Environment File

Create:

```bash
/var/www/glp/.env.production
```

Recommended starting point:

```bash
cp /var/www/glp/deploy/hetzner/.env.production.example /var/www/glp/.env.production
```

Notes:

- `VITE_*` values are embedded into the browser build.
- `SUPABASE_SERVICE_ROLE_KEY` is only for the Bun worker and must never be exposed publicly.
- Only set `VITE_NOTIFICATION_EMAIL_AVAILABLE=true` or `VITE_NOTIFICATION_SMS_AVAILABLE=true` when those transports are actually ready.
- Fill in the copied file before the first production build.

## 5. Supabase Stack

The GLP Supabase stack already follows the existing multi-project server pattern.

Expected GLP ports from the provided server state:

- Kong HTTP: `8004`
- Kong HTTPS: `8447`
- PostgreSQL: `54324`
- Pooler: `5435`
- Supavisor: `6546`

Bring the stack up from:

```bash
cd /var/www/glp/supabase-docker/docker
docker compose up -d
```

If migrations are managed manually, apply all SQL files in:

```bash
/var/www/glp/supabase/migrations
```

Recommended migration process:

1. take a DB backup
2. apply pending migrations in order
3. verify `user_profiles`, `daily_logs`, `meal_planner_state`, `notification_jobs`, and `notification_deliveries`

## 6. Frontend Build

Build with the production env file loaded:

```bash
cd /var/www/glp
set -a
source ./.env.production
set +a
bun run build
```

Output lands in:

```bash
/var/www/glp/dist
```

## 7. Nginx Site

Use the template in:

```bash
/var/www/glp/deploy/hetzner/nginx.glp.conf.example
```

Install it as:

```bash
/etc/nginx/sites-available/glp.infiniterealms.tech
```

Then:

```bash
ln -s /etc/nginx/sites-available/glp.infiniterealms.tech /etc/nginx/sites-enabled/glp.infiniterealms.tech
nginx -t
systemctl reload nginx
```

After DNS is pointing correctly, issue TLS:

```bash
certbot --nginx -d glp.infiniterealms.tech
```

## 8. PM2 Worker

Use the template in:

```bash
/var/www/glp/deploy/hetzner/ecosystem.config.cjs
```

This config runs the notification worker every 5 minutes via `cron_restart`.

Start it:

```bash
cd /var/www/glp
pm2 start deploy/hetzner/ecosystem.config.cjs --env production
pm2 save
```

Useful commands:

```bash
pm2 status
pm2 logs glp-notification-worker
pm2 restart glp-notification-worker
```

## 9. Deploy Procedure

For each deploy:

```bash
cd /var/www/glp
git pull --ff-only origin main
bun install
set -a
source ./.env.production
set +a
bun run typecheck
bun run lint
bun test
bun run build
systemctl reload nginx
pm2 restart glp-notification-worker
```

## 10. Verification Checklist

After deploy, verify:

- homepage loads at `https://glp.infiniterealms.tech`
- app routes work on refresh:
  - `/`
  - `/today`
  - `/history`
  - `/medication`
  - `/notifications`
- WorkOS login redirects correctly
- Supabase-backed save/load works
- planner/grocery persistence works
- inbox route loads
- notification worker logs show successful execution

Manual worker test:

```bash
cd /var/www/glp
set -a
source ./.env.production
set +a
bun run notifications:deliver
```

## 11. Backups and Safety

Before the first real-user launch, define:

- PostgreSQL backup schedule for the GLP Supabase database
- restore drill process
- secret rotation process for:
  - WorkOS
  - Supabase
  - Resend
  - Twilio

## 12. Known Remaining Gaps

This runbook deploys the current app correctly, but these are still product/infrastructure follow-ups:

- live Resend send execution is not yet wired
- live Twilio send execution is not yet wired
- push notifications are not implemented
- worker is cron-driven, not queue-driven
- no central error monitoring is configured yet
