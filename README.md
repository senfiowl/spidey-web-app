# 🕷 Spidey – Spider Manager

A personal tarantula collection management app. Browse your spiders, track feeding schedules and moults, and manage your collection via a password-protected admin panel.

![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## Features

- **Collection overview** – responsive 4-column grid with search and filters (all / female / male / hungry)
- **Detail page** – full care sheet per spider: origin, habitat, temperature, humidity, feeding progress bar, moult timeline, notes
- **Feeding & moult quick-actions** – one-click update directly from the grid (admin only)
- **Admin panel** – add new spiders with photo upload, delete existing ones
- **In-place editing** – edit all spider fields directly on the detail page
- **Supabase Auth** – password-protected admin area
- **Photo storage** – spider photos stored in Supabase Storage, SVG placeholder generated per sex if no photo is uploaded

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties (oklch color tokens) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (spider photos) |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone git@github.com:senfiowl/spidey-web-app.git
cd spidey-web-app
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) to create the table, RLS policies and storage bucket
3. Optionally run [`supabase/seed.sql`](supabase/seed.sql) to load the 12 sample spiders
4. In **Authentication → Users**, create an admin user with the email you'll use for `NEXT_PUBLIC_ADMIN_EMAIL`

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the project at [vercel.com](https://vercel.com) → **Add New Project**
3. Add the three environment variables from `.env.local`
4. Click **Deploy**

Every subsequent `git push` to `main` triggers an automatic redeploy.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Home – spider grid (Server Component)
│   ├── spiders/[id]/page.tsx    # Detail page (Server Component)
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── actions.ts           # Server Actions (add, update, delete, feed, moult)
│   │   └── login/page.tsx       # Login page
│   └── globals.css              # Design tokens (oklch), fonts, responsive grid
├── components/
│   ├── Navbar.tsx               # Auth-aware navigation
│   ├── SpiderGrid.tsx           # Client-side search + filter
│   ├── SpiderCard.tsx           # Card with hover effects + admin quick-actions
│   ├── SpiderDetail.tsx         # Detail view + inline edit mode
│   ├── SpiderPlaceholder.tsx    # SVG spider illustration (per-sex color)
│   └── AdminDashboard.tsx       # Add form + spider list with delete
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client (cookies)
│   └── utils.ts                 # daysSince, toxBadgeColor, getSpiderColor
├── middleware.ts                 # Route protection for /admin
└── types/index.ts
supabase/
├── schema.sql                   # Table definition, RLS policies, storage bucket
└── seed.sql                     # 12 sample tarantulas
```

---

## Routes

| Route | Description | Auth |
|---|---|---|
| `/` | Spider grid with search & filter | Public |
| `/spiders/[id]` | Detail page with care sheet | Public |
| `/admin/login` | Admin login | Public |
| `/admin` | Add / edit / delete spiders | Admin only |

---

## Design

The app uses a custom dark theme built with `oklch()` color tokens for wide-gamut display support. Typography pairs **Cormorant Garamond** (headings) with **Space Grotesk** (body). Spider accent colors are fixed by sex: rose for females, blue for males.
