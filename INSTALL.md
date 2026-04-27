# Installation & Deployment Guide
# Meet HaSammie Suah — Full Stack

**Developer:** Frandy Slueue — [github.com/frandycode](https://github.com/frandycode)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option A — Docker (Recommended)](#option-a--docker)
3. [Option B — Manual Local Setup](#option-b--manual-local-setup)
4. [Option C — Netlify + Railway (Free Tier)](#option-c--netlify--railway)
5. [Option D — Hostinger VPS (Production)](#option-d--hostinger-vps)
6. [CI/CD with GitHub Actions](#cicd-with-github-actions)
7. [Database Backups](#database-backups)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Admin Dashboard](#admin-dashboard)
10. [Database Migrations](#database-migrations)
11. [Updating the Site](#updating-the-site)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Docker (Option A & D)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — Windows/Mac
- Docker Engine + Docker Compose — Linux/VPS

### For Manual Setup (Option B)
- Node.js 20+ — [nodejs.org](https://nodejs.org)
- PostgreSQL 16+ — [postgresql.org](https://www.postgresql.org/download/)
- npm 9+

### Check your versions
```bash
node --version       # should be 20+
npm --version        # should be 9+
docker --version     # should be 24+
```

---

## Option A — Docker

The fastest way to run the entire stack locally.

### 1. Unzip the project
```bash
unzip MeetHaSammieSuah-Fullstack.zip
cd MeetHaSammieSuah-Fullstack
```

### 2. Configure environment
```bash
cp meet-hasammie-suah_backend/.env.example meet-hasammie-suah_backend/.env
cp meet-hasammie-suah_frontend/.env.example meet-hasammie-suah_frontend/.env
```

Edit `meet-hasammie-suah_backend/.env`:
```env
POSTGRES_PASSWORD=choose_a_strong_password
JWT_SECRET=choose_a_long_random_string_at_least_32_characters
ADMIN_PASSWORD=sammie2009        # change this!
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

### 3. Start the full stack
```bash
docker compose up --build
```

Wait for:
```
sammie_api      | 🚀 GraphQL ready at http://localhost:4000/graphql
sammie_frontend | Configuration complete; ready for start up
```

### 4. Run migrations and seed (first time only)
```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx tsx prisma/seed.ts
```

### 5. Open the site
| URL | Description |
|---|---|
| http://localhost:3000 | Public website |
| http://localhost:3000/press-kit | Press kit page |
| http://localhost:3000/admin | Admin dashboard |
| http://localhost:4000/graphql | GraphQL playground |

### Stop the stack
```bash
docker compose down          # stops containers, keeps data
docker compose down -v       # stops + deletes all data (fresh start)
```

---

## Option B — Manual Local Setup

### 1. Set up PostgreSQL

**Mac (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb sammie_site
```

**Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/) and create a database named `sammie_site`.

**Linux (Ubuntu):**
```bash
sudo apt install postgresql
sudo -u postgres createdb sammie_site
sudo -u postgres psql -c "CREATE USER sammie WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL ON DATABASE sammie_site TO sammie;"
```

### 2. Backend setup
```bash
cd meet-hasammie-suah_backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://sammie:yourpassword@localhost:5432/sammie_site
JWT_SECRET=your_long_secret_here_minimum_32_characters
ADMIN_PASSWORD=sammie2009
PORT=4000
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

Run migrations and seed:
```bash
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
```

Start the backend:
```bash
npm run dev
# Running at http://localhost:4000/graphql
```

### 3. Frontend setup (new terminal)
```bash
cd meet-hasammie-suah_frontend
npm install
cp .env.example .env
# VITE_API_URL is already set to http://localhost:4000/graphql
npm run dev
# Running at http://localhost:3000
```

---

## Option C — Netlify + Railway

### Backend on Railway
1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add a **PostgreSQL** plugin
4. Set environment variables:
   ```
   DATABASE_URL    = (auto-filled by Railway PostgreSQL plugin)
   JWT_SECRET      = your_secret_here
   ADMIN_PASSWORD  = sammie2009
   PORT            = 4000
   BASE_URL        = https://your-railway-app.up.railway.app
   FRONTEND_URL    = https://your-netlify-site.netlify.app
   NODE_ENV        = production
   ```
5. Deploy — Railway auto-detects the Dockerfile
6. After deploy, run in Railway shell:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

### Frontend on Netlify
1. Set `VITE_API_URL` in `meet-hasammie-suah_frontend/.env`:
   ```
   VITE_API_URL=https://your-app.up.railway.app/graphql
   ```
2. Build:
   ```bash
   cd meet-hasammie-suah_frontend && npm run build
   ```
3. Drag the `dist/` folder to [netlify.com/drop](https://netlify.com/drop)

---

## Option D — Hostinger VPS (Production)

### 1. Get a VPS on Hostinger
- Plan: **KVM 2** or higher (2 CPU, 8GB RAM recommended)
- OS: **Ubuntu 22.04**

### 2. SSH into your server
```bash
ssh root@your.server.ip
```

### 3. Install Docker
```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y
```

### 4. Point your domain DNS
In Hostinger DNS panel:
```
A record:  meethasammiesuah.com      → your.server.ip
A record:  www.meethasammiesuah.com  → your.server.ip
```

### 5. Install Certbot and get SSL
```bash
apt install certbot -y
certbot certonly --standalone \
  -d meethasammiesuah.com \
  -d www.meethasammiesuah.com \
  --email your@email.com --agree-tos --non-interactive
```

### 6. Upload the project
```bash
# Via scp from your local machine:
scp -r MeetHaSammieSuah-Fullstack root@your.server.ip:/var/www/

# Or clone from GitHub:
cd /var/www && git clone https://github.com/your-username/your-repo.git MeetHaSammieSuah-Fullstack
```

### 7. Configure environment
```bash
cd /var/www/MeetHaSammieSuah-Fullstack
cp meet-hasammie-suah_backend/.env.example meet-hasammie-suah_backend/.env
nano meet-hasammie-suah_backend/.env
```

Set production values:
```env
POSTGRES_USER=sammie
POSTGRES_PASSWORD=very_strong_password_here
POSTGRES_DB=sammie_site
DATABASE_URL=postgresql://sammie:very_strong_password_here@db:5432/sammie_site
JWT_SECRET=very_long_random_string_minimum_64_characters
ADMIN_PASSWORD=change_this_strong_password
PORT=4000
NODE_ENV=production
BASE_URL=https://meethasammiesuah.com
FRONTEND_URL=https://meethasammiesuah.com

# Optional — contact form emails (sign up free at resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_TO_EMAIL=your@email.com
CONTACT_FROM_EMAIL=noreply@meethasammiesuah.com
```

### 8. Enable the production nginx proxy
In `docker-compose.yml`, uncomment the `proxy` service block (look for `# proxy:`).

### 9. Start the stack
```bash
docker compose up -d --build
docker compose exec api npx prisma migrate deploy
docker compose exec api npx tsx prisma/seed.ts
```

### 10. Verify
```bash
docker compose ps                            # all containers should be Up
curl https://meethasammiesuah.com/health     # should return {"status":"ok"}
```

---

## CI/CD with GitHub Actions

The project includes three workflows in `.github/workflows/`:

### `ci.yml` — runs on every push and pull request
- TypeScript type-check (backend + frontend)
- Vite production build
- Docker smoke test (builds both images)
- Playwright E2E tests

### `deploy.yml` — runs after CI passes on `main`
Auto-deploys to your VPS: pulls latest code, rebuilds containers, runs pending migrations.

**Required GitHub Secrets** (Repo → Settings → Secrets → Actions):
| Secret | Value |
|---|---|
| `SERVER_HOST` | Your server IP or domain |
| `SERVER_USER` | SSH username (e.g. `root`) |
| `SERVER_SSH_KEY` | Contents of your private SSH key |
| `SERVER_APP_PATH` | Path on server (e.g. `/var/www/MeetHaSammieSuah-Fullstack`) |

### `backup.yml` — runs daily at 2 AM UTC
Automatically backs up the database to `$SERVER_APP_PATH/backups/` and keeps the last 30 days.

---

## Database Backups

### Automatic (via GitHub Actions)
The `backup.yml` workflow runs nightly. Backups are stored on your server at `backups/`.

### Manual backup
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
# Saved to: backups/sammie_backup_2025-03-15_14-30-00.sql.gz
```

### Restore from backup
```bash
./scripts/backup.sh restore backups/sammie_backup_2025-03-15_14-30-00.sql.gz
```

---

## Environment Variables Reference

### `meet-hasammie-suah_backend/.env`

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_USER` | ✅ | Database username |
| `POSTGRES_PASSWORD` | ✅ | Database password |
| `POSTGRES_DB` | ✅ | Database name |
| `DATABASE_URL` | ✅ | Full PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing admin tokens (32+ chars) |
| `ADMIN_PASSWORD` | ✅ | Password to log into `/admin` |
| `PORT` | — | API port (default: 4000) |
| `NODE_ENV` | — | `development` or `production` |
| `BASE_URL` | — | Public URL of the API server |
| `FRONTEND_URL` | — | Frontend URL (used for CORS) |
| `UPLOADS_DIR` | — | Path for storing uploaded images |
| `CLOUDINARY_CLOUD_NAME` | — | Optional Cloudinary integration |
| `CLOUDINARY_API_KEY` | — | Optional |
| `CLOUDINARY_API_SECRET` | — | Optional |
| `RESEND_API_KEY` | — | Contact form emails — sign up free at resend.com |
| `CONTACT_TO_EMAIL` | — | Inbox that receives contact form messages |
| `CONTACT_FROM_EMAIL` | — | "From" address (must match verified Resend domain) |

### `meet-hasammie-suah_frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/graphql` | GraphQL API endpoint |
| `VITE_POSTHOG_KEY` | _(blank)_ | Optional Posthog analytics key |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` | Posthog host |

---

## Admin Dashboard

### Access
- URL: `yourdomain.com/admin`
- Default password: `sammie2009` — **change this before going live**

### Change the admin password
Edit `ADMIN_PASSWORD` in `.env`, then re-run the seed:
```bash
docker compose exec api npx tsx prisma/seed.ts
```

### What you can manage
| Section | What to update |
|---|---|
| Hero & Branding | Profile photo, background photo, tagline, quote |
| Biography | Intro, full story, coach quote and name |
| Stats | Personal bests, rankings, years competing |
| Achievements | Add/edit/delete with Gold/Silver/Bronze medals |
| Gallery | Upload photos (drag & drop, paste, or URL), crop/zoom/rotate |
| **Videos** | Add YouTube/Vimeo highlights by URL — auto-fills embed + thumbnail |
| Events | Add upcoming meets and championships |
| Donations | CashApp, Venmo, Zelle, GoFundMe handles |
| Social & Contact | Instagram, Twitter, TikTok, contact emails |
| **Sponsors** | Gold/Silver/Community tier sponsors with logo and website |
| **Press Kit** | Press biography, media contact, downloadable photos and docs |
| Analytics | Live traffic stats — page views, sessions, top pages, 7-day chart |

---

## Database Migrations

Every time a new feature is added, a migration is needed to update the database schema.

### Run pending migrations
```bash
# Docker:
docker compose exec api npx prisma migrate deploy

# Manual:
cd meet-hasammie-suah_backend && npx prisma migrate deploy
```

### Migrations added since initial release
```bash
# Run these in order if setting up from scratch with this version:
npx prisma migrate dev --name add_page_views        # Analytics
npx prisma migrate dev --name add_press_kit         # Press kit
npx prisma migrate dev --name add_sponsors          # Sponsors section
npx prisma migrate dev --name add_video_highlights  # Video highlights
```

Or run all at once with deploy (recommended):
```bash
npx prisma migrate deploy
```

---

## Updating the Site

### Update content (no code changes needed)
Log into `/admin` — all changes are live instantly.

### Update code and redeploy

**With Docker:**
```bash
docker compose down
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
```

**With GitHub CI/CD (recommended):**
Push to `main` — GitHub Actions handles the rest automatically.

---

## Running E2E Tests

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test              # headless
npx playwright test --ui         # interactive UI mode
npx playwright show-report       # view last report
```

Test files:
- `tests/homepage.spec.ts` — public site loads, sections present, no JS errors
- `tests/contact.spec.ts` — form validation, loading states
- `tests/admin-auth.spec.ts` — login errors, protected routes, password toggle
- `tests/responsive-seo.spec.ts` — mobile layout, meta tags, sitemap/robots
- `tests/press-kit.spec.ts` — press kit page, navbar/footer links

---

## Troubleshooting

### Site won't load / blank page
```bash
docker compose ps                    # check all containers are Up
docker logs sammie_frontend          # check for build errors
docker logs sammie_api               # check for API errors
```
Make sure `VITE_API_URL` in the frontend `.env` points to the correct API address.

### Admin login fails
```bash
# Check the password in .env matches what you're typing
docker logs sammie_api | grep "admin"
# Re-seed if needed:
docker compose exec api npx tsx prisma/seed.ts
```

### Images not loading on other devices
Make sure `BASE_URL` in `.env` is set to the public domain (not `localhost`). Rebuild after changing env vars.

### Database connection error
```bash
# Confirm DATABASE_URL matches POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
docker compose exec db pg_isready    # check DB is healthy
```

### Port already in use
```bash
lsof -i :3000    # find what's using port 3000
lsof -i :4000    # find what's using port 4000
# Change ports in docker-compose.yml if needed
```

### Reset everything (fresh start)
```bash
docker compose down -v              # removes containers AND all data
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
docker compose exec api npx tsx prisma/seed.ts
```

---

*Built with love by [Frandy Slueue](https://github.com/frandycode)*
*"Every stride is a story." — HaSammie Suah*
