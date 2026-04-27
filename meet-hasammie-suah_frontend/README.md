# Meet HaSammie Suah — Frontend

> Personal athlete website for HaSammie Suah — Top 5 Track Runner in the State of Oklahoma.

![Version](https://img.shields.io/badge/version-3.0.0-D4AF37?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![Apollo](https://img.shields.io/badge/Apollo-4-311C87?style=flat-square&logo=apollographql)

---

## Developer

**Frandy Slueue** — Full-Stack Developer
- GitHub:   [github.com/frandycode](https://github.com/frandycode)
- LinkedIn: [linkedin.com/in/frandyslueuewebdevitpro](https://www.linkedin.com/in/frandyslueuewebdevitpro)

---

## About

A fully polished, professionally designed personal website built for **HaSammie Suah** — a 16-year-old track runner ranked in the **Top 5 in the State of Oklahoma**, attending Union High School in Tulsa, Oklahoma.

All site content is managed through a **hidden admin dashboard** (`/admin`) and persisted to a PostgreSQL database via a GraphQL API. Images are stored directly on the server — no mandatory third-party dependency.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Apollo Client | 4 | GraphQL state & data fetching |
| React Router | 7 | Client-side routing |
| Lucide React | 0.577 | UI icon library |
| React Icons | 5.6 | Brand icons (SiInstagram, SiTiktok, SiX) + gift icons (GiRose, GiTrophyCup, etc.) |
| React Easy Crop | 5.5 | In-admin image cropping |

---

## Features

### Public Site

| Section | Description |
|---|---|
| **Hero** | Animated typing effect, floating profile photo, animated SVG running figure |
| **About** | Full biography, quick facts, personality tags, coach quote |
| **Stats Dashboard** | Personal bests + 4 interactive charts: 100m progression, season bests, event PRs, meets-won sparkline |
| **Achievements** | Gold/silver/bronze medal cards |
| **Race Results Timeline** | Scroll-triggered performance graph strip, hover-to-inspect dots, PR pulse ring |
| **Gallery** | Flip cards, lightbox viewer, category filters |
| **Video Highlights** | YouTube/Vimeo embeds, lightbox, category filters |
| **News / Blog** | Category-filtered post grid + full `/blog/:slug` reader with reading progress bar |
| **Meet Countdown** | Live banner (slides from top within 30 days) + hero clock (visible within 60 days) |
| **Recruiting CTA** | Coach inquiry form, stat grid, recruiting profile PDF slot — targeted at college scouts |
| **Social Feed** | Platform tabs: All / Instagram / TikTok / X — manual grid or live Behold.so feed per tab |
| **Events** | Upcoming meets, championships, training sessions |
| **Donate** | Cash App, Venmo, Zelle, GoFundMe with copy & deep links |
| **Supporter Wall** | Digital gift picker (flowers, trophies, medals), message wall, admin moderation |
| **Digital Postcards** | 4 illustrated canvas designs, live preview, PNG download, email delivery |
| **Sponsors** | Three-tier wall: Gold featured, Silver logo grid, Community pills |
| **Contact** | Email cards, social media links, contact form |
| **Press Kit** | `/press-kit` — official bio, quick facts, downloadable photos and documents |

### Admin Dashboard (`/admin`)

| Page | Route | What you manage |
|---|---|---|
| Dashboard | `/admin/dashboard` | Quick stats overview |
| Hero & Branding | `/admin/hero` | Profile photo (upload/crop/URL), hero bg, tagline, quote |
| Biography | `/admin/bio` | Intro, full story, coach quote and name |
| Stats | `/admin/stats` | Personal bests, state ranking, years competing |
| Achievements | `/admin/achievements` | Gold/Silver/Bronze medal cards |
| Gallery | `/admin/gallery` | Upload photos, crop/zoom/rotate, or add by URL |
| Videos | `/admin/videos` | YouTube/Vimeo by URL — auto-fills embed + thumbnail |
| Events | `/admin/events` | Upcoming meets and championships |
| Donations | `/admin/donate` | CashApp, Venmo, Zelle, GoFundMe handles |
| Social & Contact | `/admin/social` | Instagram, Twitter, TikTok handles, contact emails |
| Social Feed | `/admin/social-feed` | Manual posts per platform — image, caption, likes, reorder |
| Sponsors | `/admin/sponsors` | Three-tier sponsor management |
| Press Kit | `/admin/press-kit` | Press bio, media contact, downloadable assets |
| Blog / News | `/admin/blog` | Full post CRUD — markdown content, categories, tags, publish |
| Supporter Wall | `/admin/supporter-wall` | Approve / feature / pin / delete messages and gifts |
| Analytics | `/admin/analytics` | Page views, sessions, avg duration, 7-day chart |

---

## Quick Start

> Requires the backend API running. See root `INSTALL.md` or `meet-hasammie-suah_backend/README.md`.

```bash
cd meet-hasammie-suah_frontend
npm install
cp .env.example .env
# Set VITE_API_URL if backend is not on localhost:4000
npm run dev   # http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/graphql` | GraphQL API endpoint |
| `VITE_BEHOLD_WIDGET_ID` | *(unset)* | Instagram live feed widget ID — activates live Instagram tab |
| `VITE_BEHOLD_TIKTOK_ID` | *(unset)* | TikTok live feed widget ID — activates live TikTok tab |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

---

## Project Structure

```
src/
├── lib/
│   ├── apolloClient.ts           Apollo Client config + JWT auth link
│   ├── queries.ts                All GraphQL queries & mutations
│   └── videoUtils.ts             YouTube/Vimeo URL parsing helpers
├── context/
│   ├── SiteContext.tsx           Site data — GraphQL-backed global state
│   └── AuthContext.tsx           Admin auth — JWT-backed
├── hooks/
│   ├── useTypingEffect.ts        Typing animation hook
│   ├── useImageDrop.ts           Drag & drop / paste image hook
│   └── usePageView.ts            Analytics page view tracker
├── components/
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── StatsSection.tsx          Stats dashboard with 4 interactive charts
│   ├── AchievementsSection.tsx
│   ├── RaceResultsTimeline.tsx   Performance graph + timeline (v3)
│   ├── NewsSection.tsx           Blog post grid with category filters
│   ├── MeetCountdown.tsx         Live banner + hero clock (2 exports)
│   ├── RecruitingSection.tsx     Coach/scout CTA with inquiry form
│   ├── SocialFeedSection.tsx     Platform tabs + Behold.so slots (v2)
│   ├── SupporterWall.tsx         Digital gifts + message wall (v2)
│   ├── PostcardSection.tsx       4 illustrated postcard designs + canvas
│   ├── GallerySection.tsx
│   ├── VideoSection.tsx
│   ├── EventsContact.tsx
│   ├── DonateSection.tsx
│   ├── SponsorsSection.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── RunningPerson.tsx         Animated SVG stick-figure runner
│   ├── ImageEditor.tsx           Crop/zoom/rotate modal
│   ├── LazyImage.tsx             Intersection Observer lazy loader
│   ├── ScrollToTop.tsx           Mobile scroll-to-top button
│   ├── ErrorBoundary.tsx         React error boundary
│   └── ProtectedRoute.tsx        Admin route guard
├── pages/
│   ├── HomePage.tsx
│   ├── PressKitPage.tsx
│   ├── BlogPostPage.tsx          Full post reader at /blog/:slug
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── AdminLayout.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminHero.tsx
│       ├── AdminBio.tsx
│       ├── AdminStats.tsx
│       ├── AdminAchievements.tsx
│       ├── AdminGallery.tsx
│       ├── AdminVideos.tsx
│       ├── AdminEvents.tsx
│       ├── AdminDonate.tsx
│       ├── AdminSocial.tsx
│       ├── AdminSocialFeed.tsx   Manual social post management
│       ├── AdminSponsors.tsx
│       ├── AdminPressKit.tsx
│       ├── AdminBlog.tsx         Blog/news post management
│       ├── AdminSupporterWall.tsx Supporter message moderation
│       └── AdminAnalytics.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Color Reference

| Name | Hex | Usage |
|---|---|---|
| Track Gold | `#D4AF37` | Primary accent, buttons, highlights |
| Golden Green | `#7A9B00` | Secondary accent, PRs, live indicators |
| Lime Gold | `#9AB800` | Performance graph, gift sparkle |
| Forest Dark | `#0F1A08` | Background |
| Cream | `#F5F0E8` | Body text |

---

## Icon Libraries

| Library | Used for |
|---|---|
| `lucide-react` | All general UI icons (timers, maps, calendars, chevrons, etc.) |
| `react-icons/si` | Brand icons: `SiInstagram`, `SiTiktok`, `SiX`, `SiCashapp`, `SiVenmo`, `SiGofundme` |
| `react-icons/gi` | Gift icons: `GiRose`, `GiSunflower`, `GiTulip`, `GiFlowerPot`, `GiLaurelCrown`, `GiTrophyCup`, `GiMedal`, `GiRunningShoe`, `GiSparkles`, `GiDiamondRing` |
| `react-icons/fa` | `FaHeart` |
| `react-icons/md` | `MdOutlineAccountBalance` (Zelle) |

---

## License & Credits

© 2026 HaSammie Suah. All rights reserved.

Built with love by **[Frandy Slueue](https://github.com/frandycode)**

*"Every stride is a story." — HaSammie Suah*
