# Meet HaSammie Suah — Full Stack

> Personal athlete website for HaSammie Suah — Top 5 Track Runner in the State of Oklahoma.
> Built and maintained by **Frandy Slueue**.

---

## Developer

**Frandy Slueue** — Full-Stack Developer
- GitHub:   [github.com/frandycode](https://github.com/frandycode)
- LinkedIn: [linkedin.com/in/frandyslueuewebdevitpro](https://www.linkedin.com/in/frandyslueuewebdevitpro)

---

## Project Structure

```
MeetHaSammieSuah-Fullstack/
├── meet-hasammie-suah_frontend/   React + TypeScript + Vite + Tailwind + Apollo
├── meet-hasammie-suah_backend/    Node.js + Apollo GraphQL + Prisma + PostgreSQL
├── e2e/                           Playwright end-to-end tests
├── nginx/                         Production nginx reverse proxy config
├── scripts/                       backup.sh — manual DB backup/restore
├── .github/workflows/             CI (ci.yml), CD (deploy.yml), Backup (backup.yml)
├── docker-compose.yml             Runs the full stack with one command
├── INSTALL.md                     Complete setup and deployment guide
└── README.md                      This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 3 |
| **Client data** | Apollo Client 4 (GraphQL) |
| **Icons** | Lucide React 0.577 + React Icons 5.6 (brand + gift icons) |
| **Analytics** | Posthog + custom in-house tracker |
| **Backend** | Node.js 20, TypeScript, Express 4 |
| **API** | Apollo Server 4 (GraphQL) |
| **Database** | PostgreSQL 16 via Prisma ORM |
| **Auth** | JWT + bcrypt |
| **Validation** | Zod (runtime input validation) |
| **Email** | Resend API (contact form + postcard delivery) |
| **Images** | Local filesystem (default) + optional Cloudinary |
| **Image processing** | Sharp (auto WebP conversion) |
| **Social feeds** | Behold.so (Instagram + TikTok live wall — optional) |
| **Containers** | Docker + Docker Compose |
| **Web server** | Nginx (with SSL via Let's Encrypt) |
| **CI/CD** | GitHub Actions |
| **Testing** | Playwright E2E |

---

## Quick Start

```bash
# 1. Configure environment
cp meet-hasammie-suah_backend/.env.example meet-hasammie-suah_backend/.env
# Edit the .env — set passwords and URLs

# 2. Start everything
docker compose up --build

# 3. Run DB migrations (first time only)
docker compose exec api npx prisma migrate deploy

# 4. Seed the database (first time only)
docker compose exec api npx tsx prisma/seed.ts

# 5. Open the site
# Public site  → http://localhost:3000
# Admin panel  → http://localhost:3000/admin
# Press kit    → http://localhost:3000/press-kit
# Blog post    → http://localhost:3000/blog/:slug
# GraphQL API  → http://localhost:4000/graphql
```

> See `INSTALL.md` for complete setup, configuration, and deployment instructions.

---

## What's Included

### Public website
- Animated hero section with typing effect and SVG stick-figure runner
- About, Stats Dashboard (with progression charts), Achievements, Gallery, Video Highlights
- **Race Results Timeline** — scroll-triggered performance graph, 100m progression line
- **News / Blog** — category-filtered post grid with full `/blog/:slug` reader pages
- **Meet Countdown** — live banner + hero clock, auto-selects next event from DB
- **Recruiting / Scouting CTA** — coach inquiry form, stat grid, downloadable profile PDF slot
- Events, Donate, Sponsors, Contact
- **Social Feed** — platform tabs (All / Instagram / TikTok / X), Behold.so live feed slot
- **Supporter Wall** — digital gift picker (flowers, trophies, medals), message wall, moderated
- **Digital Postcards** — 4 illustrated designs, live canvas preview, PNG download, email delivery
- Press Kit page at `/press-kit` — official bio and downloadable assets for media
- Filterable gallery with flip cards and folder burst animation
- Video section with YouTube/Vimeo embeds, lightbox player, and category filters
- Three-tier sponsors wall (Gold featured cards, Silver logo grid, Community pills)
- Contact form with email delivery via Resend
- Lazy-loaded images with shimmer placeholder
- Mobile-responsive, scroll-to-top, full SEO + Open Graph + JSON-LD

### Admin dashboard (`/admin`)
| Section | What you can manage |
|---|---|
| Hero & Branding | Profile photo, hero background, tagline, quote |
| Biography | Intro, full story, coach quote and name |
| Stats | Personal bests, rankings, years competing |
| Achievements | Add/edit/delete with Gold/Silver/Bronze medals |
| Gallery | Upload photos, crop/zoom/rotate, or add by URL |
| Videos | Add YouTube/Vimeo by URL — auto-fills embed + thumbnail |
| Events | Upcoming meets and championships |
| Donations | CashApp, Venmo, Zelle, GoFundMe handles |
| Social & Contact | Instagram, Twitter, TikTok, contact emails |
| **Social Feed** | Manage manual posts per platform with image, caption, likes |
| Sponsors | Three-tier sponsor management with logo, website, description |
| Press Kit | Press bio, media contact, downloadable photos and documents |
| **Blog / News** | Full CRUD for posts — title, slug, content (markdown), category, tags, publish toggle |
| **Supporter Wall** | Approve / feature / pin / delete supporter messages and gifts |
| Analytics | Page views, unique sessions, avg time on page, 7-day chart |

### Backend
- GraphQL API with full CRUD for all site sections
- `POST /track` endpoint for analytics (rate-limited, Zod-validated)
- Custom in-memory rate limiting (60 req/min tracking, 120 req/min GraphQL, 10 req/min auth)
- JWT-secured admin endpoints
- Zod runtime validation on all mutations
- Images stored on your server — zero third-party dependency by default
- Optional Cloudinary support
- Auto WebP conversion via Sharp

### New DB models (add via prisma migrate)
| Model | Purpose |
|---|---|
| `BlogPost` | News and blog articles with markdown content |
| `SocialPost` | Manual social feed posts (Instagram / TikTok / X) |
| `SupporterMessage` | Supporter wall messages with gift keys, moderation flags |

### DevOps
- GitHub Actions CI: TypeScript checks, Vite production build, Docker smoke test, Playwright E2E
- GitHub Actions CD: auto-deploy to VPS on push to `main` (runs migrations automatically)
- Scheduled daily DB backups via GitHub Actions SSH + `pg_dump`
- Manual backup/restore script at `scripts/backup.sh`
- Production nginx config with SSL (Let's Encrypt / Certbot) at `nginx/production.conf`

---

## Social Feed — Live Integration

The social feed ships with a manual grid that Sammie manages via admin. To activate live feeds:

**Instagram:**
```bash
VITE_BEHOLD_WIDGET_ID=your_instagram_widget_id
```

**TikTok:**
```bash
VITE_BEHOLD_TIKTOK_ID=your_tiktok_widget_id
```

Sign up at [behold.so](https://behold.so), connect the account, copy the widget ID. The manual grid is replaced automatically per platform tab — no code changes needed.

---

## Environment Variables

### Frontend (`.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/graphql` | GraphQL API endpoint |
| `VITE_BEHOLD_WIDGET_ID` | *(unset)* | Instagram live feed widget ID (Behold.so) |
| `VITE_BEHOLD_TIKTOK_ID` | *(unset)* | TikTok live feed widget ID (Behold.so) |

### Backend (`.env`)
See `meet-hasammie-suah_backend/.env.example` for full reference.

---

## Deployment

Designed for **Hostinger VPS** (or any Docker-capable server).

Also runs on:
- **Netlify** (frontend) + **Railway / Render** (backend) — free tier
- Any server with Docker installed

See `INSTALL.md` for step-by-step Hostinger deployment.

---

## License

© 2026 HaSammie Suah. All rights reserved.
Built with love by **[Frandy Slueue](https://github.com/frandycode)**

*"Every stride is a story." — HaSammie Suah*
