# Meet HaSammie Suah — Backend API

> GraphQL API powering the Meet HaSammie Suah athlete website.

![Version](https://img.shields.io/badge/version-3.0.0-D4AF37?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Apollo](https://img.shields.io/badge/Apollo_Server-4-311C87?style=flat-square&logo=apollographql)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)

---

## Developer

**Frandy Slueue** — Full-Stack Developer
- GitHub:   [github.com/frandycode](https://github.com/frandycode)
- LinkedIn: [linkedin.com/in/frandyslueuewebdevitpro](https://www.linkedin.com/in/frandyslueuewebdevitpro)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 | Runtime |
| TypeScript | 5.7 | Type safety |
| Apollo Server | 4 | GraphQL server |
| Express | 4 | HTTP server |
| Prisma | 5 | ORM / database client |
| PostgreSQL | 16 | Primary database |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9 | JWT authentication |
| sharp | 0.33 | Image processing + WebP conversion |
| multer | 1.4 | Multipart file handling |
| Resend | 4 | Email delivery (contact form + postcards) |
| Docker | — | Containerisation |
| Nginx | alpine | Reverse proxy |

---

## Architecture

```
Client Request
      │
      ▼
Express HTTP Server (port 4000)
      │
      ├── GET  /health          → Health check
      ├── GET  /uploads/:file   → Serve local images (static)
      ├── POST /track           → Analytics page view (rate-limited)
      └── POST /graphql         → Apollo GraphQL
                                       │
                              Auth Middleware (JWT)
                                       │
                                  Resolvers
                                       │
                              ┌────────┴────────┐
                         Prisma ORM        Image Service
                              │                  │
                         PostgreSQL         Local FS  or
                                            Cloudinary (optional)
```

---

## Database Models

### Core site content
| Model | Purpose |
|---|---|
| `Admin` | Admin authentication |
| `SiteHero` | Hero tagline, subtitle, quote |
| `SiteBio` | Full biography, coach quote |
| `SiteSocial` | Instagram, Twitter, TikTok handles |
| `SiteContact` | Contact and media email addresses |
| `SiteDonate` | CashApp, Venmo, Zelle, GoFundMe |
| `SiteImage` | Profile and hero background images |
| `Stat` | Personal bests and rankings |
| `Achievement` | Gold/silver/bronze achievements |
| `GalleryPhoto` | Gallery images (local or URL) |
| `Event` | Upcoming meets and championships |
| `VideoHighlight` | YouTube/Vimeo video highlights |
| `Sponsor` | Three-tier sponsor entries |
| `PressKitAsset` | Downloadable press kit files |
| `PressKitMeta` | Press bio and media contact |
| `PageView` | Analytics — page view tracking |

### New models (migrate to add)
| Model | Purpose | Migration |
|---|---|---|
| `BlogPost` | News and blog articles with markdown content, categories, tags | `add-blog` |
| `SocialPost` | Manual social feed posts (Instagram / TikTok / X) | `add-social-posts` |
| `SupporterMessage` | Supporter wall messages, gift keys, moderation flags | `add-supporter-wall` |

Run new migrations:
```bash
npx prisma migrate dev --name add-blog
npx prisma migrate dev --name add-social-posts
npx prisma migrate dev --name add-supporter-wall
```

---

## API Reference

### Endpoint

```
POST http://localhost:4000/graphql
Authorization: Bearer <jwt_token>   # required for mutations
```

### Key Queries

```graphql
# Load all site data in one request (powers entire frontend)
query {
  siteData {
    hero { tagline subtitle quote }
    bio { intro story coachNote coachName }
    stats { label value unit }
    achievements { title description date medal }
    gallery { caption category publicUrl }
    events { title date location type }
    donate { cashapp venmo zelle gofundme message }
    social { instagram twitter tiktok }
    contact { email forMedia }
    sponsors { name tier logoUrl website }
    videos { title embedUrl thumbnail category featured }
    blogPosts { id title slug excerpt category publishedAt }
    socialPosts { id platform imageUrl caption postUrl likes featured }
    supporterMessages { id name message emoji featured pinned }
    profileImage { publicUrl }
    heroImage { publicUrl }
  }
}

# Blog
query { blogPost(slug: "race-recap-2025") { title content tags publishedAt } }
query { blogPosts(publishedOnly: true, category: NEWS) { id title slug } }

# Social feed
query { socialPosts(publishedOnly: true) { id platform caption imageUrl } }

# Supporter wall
query { supporterMessages(approvedOnly: true) { id name message emoji pinned } }
```

### Authentication

```graphql
mutation {
  login(password: "your_password") {
    token
    message
  }
}
```

All admin mutations require `Authorization: Bearer <token>` header.

---

## Quick Start

```bash
cd meet-hasammie-suah_backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, RESEND_API_KEY, etc.

# Development
npm run dev

# Run migrations
npx prisma migrate dev

# Seed database
npx tsx prisma/seed.ts
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing (min 32 chars) |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `RESEND_API_KEY` | No | Resend API key for email delivery |
| `CONTACT_TO_EMAIL` | No | Inbox address for contact form + postcards |
| `CONTACT_FROM_EMAIL` | No | From address for outgoing emails |
| `CLOUDINARY_URL` | No | Cloudinary connection string (optional image hosting) |
| `PORT` | No | API port (default: 4000) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: http://localhost:3000) |

---

## Rate Limiting

Custom in-memory rate limiting, no Redis required:

| Endpoint | Limit |
|---|---|
| `POST /graphql` | 120 req/min per IP |
| `POST /graphql` (auth mutations) | 10 req/min per IP |
| `POST /track` | 60 req/min per IP |

---

## Email Delivery

Contact form submissions, recruiting inquiries, and digital postcards all route through the same `sendContactEmail` service using the **Resend API**.

Setup:
1. Sign up at [resend.com](https://resend.com) — free tier: 3,000 emails/month
2. Verify your domain in the Resend dashboard
3. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in `.env`

If `RESEND_API_KEY` is not set, emails are logged to console — safe for local development.

---

## License

© 2026 HaSammie Suah. All rights reserved.
Built with love by **[Frandy Slueue](https://github.com/frandycode)**

*"Every stride is a story." — HaSammie Suah*
