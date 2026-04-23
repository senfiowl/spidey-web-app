# Handoff: Spidey – Spider Manager Web App

## Overview
A personal spider collection management app for a keeper of 12 tarantulas. Users can browse all spiders in a grid, view detailed species and care information per spider, and an admin can log in to add or remove spiders from the collection.

## About the Design Files
`Spider Manager.html` is a **high-fidelity interactive design prototype** built in HTML/React. It is a design reference — not production code. The task is to **recreate this design in a proper web application** (recommended stack below), using the visual design, interactions, and data model described here as the source of truth.

## Fidelity
**High-fidelity.** Colors, typography, spacing, component shapes, hover states, and interactions are all final. Implement pixel-accurately using the design tokens listed below.

---

## Recommended Tech Stack
- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS (map the design tokens below to a custom Tailwind theme)
- **Database:** Supabase (Postgres) — for spider records and image uploads
- **Auth:** Supabase Auth (simple password-based admin login)
- **Image Upload:** Supabase Storage (replace placeholder SVGs with real spider photos)
- **Deployment:** Vercel

---

## Design Tokens

### Colors
All colors use `oklch()` — supported in all modern browsers. Use CSS custom properties on `:root`.

```css
:root {
  --bg:           oklch(0.08 0.025 150);   /* page background, very dark green-black */
  --bg2:          oklch(0.11 0.03 148);    /* card / panel background */
  --bg3:          oklch(0.14 0.035 148);   /* elevated surfaces, code blocks */
  --card-bg:      oklch(0.10 0.028 150);   /* spider card background */
  --card-border:  oklch(0.20 0.04 148);    /* default border color */
  --accent:       oklch(0.58 0.16 145);    /* primary accent: deep green */
  --accent2:      oklch(0.72 0.13 75);     /* secondary accent: warm amber (used for "hungry" warning) */
  --fg:           oklch(0.92 0.01 120);    /* primary text */
  --fg2:          oklch(0.65 0.02 140);    /* secondary text, labels */
  --fg3:          oklch(0.40 0.02 140);    /* tertiary text, placeholders */
  --danger:       oklch(0.6 0.18 25);      /* error / delete states */
}
```

### Toxicity Badge Colors
```
sehr mild  → oklch(0.62 0.16 145)   green
mild       → oklch(0.65 0.14 95)    yellow-green
mittel     → oklch(0.65 0.15 55)    amber
stark      → oklch(0.60 0.18 25)    red-orange
```

### Typography
```
--font-head: 'Cormorant Garamond', Georgia, serif
--font-body: 'Space Grotesk', sans-serif
```

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Grotesk:wght@300;400;500;600&display=swap
```

### Type Scale
| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page title | Cormorant Garamond | 42px | 300 | letter-spacing: -0.01em |
| Spider name (card) | Cormorant Garamond | 22px | 400 | |
| Spider name (detail) | Cormorant Garamond | 56px | 300 | letter-spacing: -0.01em |
| Species (italic) | Space Grotesk | 11–14px | 400 | font-style: italic |
| Section headings | Cormorant Garamond | 16–22px | 400 | color: --accent |
| Body / labels | Space Grotesk | 12–14px | 400 | |
| Metadata / badges | Space Grotesk | 10–11px | 400 | letter-spacing: 0.05–0.12em, uppercase |
| Navbar brand | Space Grotesk | 18px | 600 | letter-spacing: 0.18em |

### Spacing & Shape
```
--radius:      4px   /* inputs, buttons, small elements */
--card-radius: 6px   /* cards, panels */
Navbar height: 60px
Page max-width: 1400px (home), 1100px (detail), 1200px (admin)
Page padding:  40px 32px
Grid gap:      20px
Card gap:      16px (admin info cards)
```

### Shadows
```
Card default:  0 2px 8px rgba(0,0,0,0.3)
Card hover:    0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px {spiderColor}22
Modal/panel:   0 8px 40px rgba(0,0,0,0.6)
```

---

## Screens / Views

### 1. Home – Spider Grid

**Purpose:** Browse the full collection at a glance.

**Layout:**
- Sticky top navbar (60px height)
- Content area: max-width 1400px, centered, padding 40px 32px
- Page title "Meine Sammlung" + subtitle with counts (total / female / male)
- Controls row: search input (240px wide) + filter buttons (flex row)
- Grid: 4 columns (default), gap 20px. Each card is square-ratio image + info block

**Spider Card:**
- Background: `--card-bg`, border `1px solid --card-border`
- On hover: border-color transitions to spider's individual accent color; `translateY(-3px)`; shadow with color glow
- Transition: `border-color 0.25s, transform 0.2s, box-shadow 0.2s`
- Image area: `aspect-ratio: 1/1`, contains spider photo (or placeholder). Gradient overlay at bottom (transparent → --card-bg, 50% height)
- Sex badge: top-right, `--bg` background, spider color text (`♀` / `♂`), 10px, letter-spacing 0.08em
- Name: Cormorant Garamond 22px, weight 400
- "Days since feeding" label: top-right of info block, 10px, amber color if > 10 days
- Species italic: 11px, `--fg2`
- Common name: 11px, `--fg3`, uppercase tracking
- Tag row: age badge + toxicity badge (colored border matching toxicity level)

**Search & Filter:**
- Search: `--bg2` background, `1px solid --card-border` border, 13px text, 9px 16px padding
- Filter buttons: same styling, active state has `--accent` border + text color, `--bg3` background

### 2. Detail Page

**Purpose:** Full care sheet and log for one spider.

**Layout:**
- Back button (← Zurück zur Übersicht), 12px, `--fg3` color
- Hero grid: `380px` image column + `1fr` info column, 40px gap
- Info grid below: 2-column, 16px gap. "Notizen" card spans full width (`grid-column: 1 / -1`)

**Hero image:** 380×380px, `aspect-ratio: 1/1`, `border: 1px solid --card-border`, card-radius

**Hero info block:**
- Sex + toxicity badges (row)
- Name: 56px Cormorant Garamond, weight 300
- Species italic: 14px
- Common name: 12px uppercase tracking, `--fg3`
- Stats row (3 stats: Alter, Körperlänge, Spannweite): flex row, 32px gap, separated by `border-top: 1px solid --card-border`, padding-top 24px. Each stat: large value (24px Cormorant), tiny uppercase label below

**Info cards** (background `--bg2`, border, 20px 22px padding):
- Card title: 16px Cormorant Garamond, `--accent` color, margin-bottom 14px
- Row pairs: label (10px uppercase `--fg3`) + value (13px `--fg`) — space-between layout
- "Häutungsprotokoll": timeline dots (8px circles, `--accent` color) + date text. Last entry tagged "LETZTE" in accent color
- Fütterung card: progress bar showing days since last feeding (0–14 day range). Bar color: `--accent` if ≤ 10 days, `--accent2` (amber) if > 10 days

### 3. Admin Login

**Purpose:** Gated entry to admin features.

**Layout:** Centered card, `max-width: 360px`, `--bg2` background, 48px 40px padding

- Logo mark SVG (spider web icon, `--accent` color), 40px
- Title: 28px Cormorant Garamond
- Subtitle: 12px `--fg3`, letter-spacing 0.06em
- Password field: full-width, same input styling as global
- Submit button: full-width, `--accent` background, `--bg` text color, 600 weight, 11px border-radius, 12px
- Error message: 12px `--danger` color
- Demo hint: 11px `--fg3` with monospace password in `--accent`

**Auth logic:** password is `admin123` (hardcoded for prototype; replace with Supabase Auth in production)

### 4. Admin – Manage Collection

**Purpose:** Add new spiders, delete existing ones.

**Layout:** 2-column grid — form (1fr) + sidebar list (360px)

**Add Spider Form** (inside `--bg2` card):
Sections (each separated by `border-bottom: 1px solid --card-border`):
1. **Grunddaten:** Name*, Wissenschaftl. Name*, Gemeiner Name, Geschlecht (select), Alter
2. **Herkunft:** Herkunftsland, Habitat
3. **Maße & Giftigkeit:** Körperlänge, Spannweite, Giftigkeit (select: sehr mild / mild / mittel / stark)
4. **Haltungsbedingungen:** Temp Min/Max (°C), Luftfeuchtigkeit Min/Max (%), Letzte Fütterung (date)
5. **Notizen:** Textarea, 90px height

Section titles: 16px Cormorant Garamond, `--accent` color
Field labels: 11px uppercase `--fg3`, letter-spacing 0.08em
Success state: `--bg3` panel with `--accent` border showing "✓ Spinne erfolgreich hinzugefügt!" after submit

**Sidebar list:** Existing spiders as rows (thumbnail + name + species + delete button). Delete button: small, `--card-border` border, `--fg3` text.

---

## Data Model

### Spider Object
```typescript
interface Spider {
  id: number | string;
  name: string;               // Personal name, e.g. "Helene"
  species: string;            // Scientific name, e.g. "Theraphosa blondi"
  commonName: string;         // e.g. "Goliath Bird Eater"
  origin: string;             // e.g. "Venezuela, Brasilien, Guyana"
  habitat: string;            // e.g. "Tropischer Regenwald"
  size: {
    body: string;             // e.g. "13 cm"
    span: string;             // e.g. "30 cm"
  };
  toxicity: 'sehr mild' | 'mild' | 'mittel' | 'stark';
  sex: 'Weibchen' | 'Männchen' | 'Unbekannt';
  age: string;                // e.g. "6 Jahre"
  conditions: {
    temp: string;             // e.g. "26–28 °C"
    humidity: string;         // e.g. "80–85 %"
  };
  lastFed: string;            // ISO date string, e.g. "2026-04-18"
  molts: string[];            // Array of "YYYY-MM" strings
  notes: string;
  imageUrl?: string;          // URL to photo in Supabase Storage
  color: string;              // oklch() string for UI accent (auto-generated or user-picked)
}
```

### Supabase Table: `spiders`
```sql
CREATE TABLE spiders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  species     text NOT NULL,
  common_name text,
  origin      text,
  habitat     text,
  body_size   text,
  span        text,
  toxicity    text,
  sex         text,
  age         text,
  temp_range  text,
  humidity_range text,
  last_fed    date,
  molts       text[],         -- array of "YYYY-MM" strings
  notes       text,
  image_url   text,
  color       text,
  created_at  timestamptz DEFAULT now()
);
```

---

## Navigation & Routing

| Route | Page | Auth required |
|---|---|---|
| `/` | Home – Spider Grid | No |
| `/spiders/[id]` | Detail page | No |
| `/admin/login` | Admin login | No |
| `/admin` | Admin dashboard | Yes (admin session) |

---

## Interactions & Behavior

### Spider Card hover
- `border-color` → spider's individual `color` value
- `transform: translateY(-3px)`
- box-shadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px {color}22`
- Transition: `0.2–0.25s ease`

### Feeding status
- `daysSince(lastFed)` = days between `lastFed` ISO date and today
- If > 10 days: show in `--accent2` (amber) on card and in admin list
- Progress bar in detail page: `min(100%, days/14 * 100%)` width

### Admin form submit
- Client-side validation: name + scientific name are required
- On success: show success banner for 3 seconds, reset form
- On delete: immediate removal with confirmation (add a confirmation dialog in production)

---

## Assets

| Asset | Description | Source |
|---|---|---|
| Spider photos | Real photos per spider | To be photographed by owner, uploaded to Supabase Storage |
| Spider placeholder | SVG spider silhouette with web pattern and per-spider color | See prototype HTML for SVG generation code |
| Logo mark | SVG spider web icon (concentric circles + radial lines + center dot) | Inline SVG in prototype, ~30 lines |

---

## Files in this package

| File | Description |
|---|---|
| `Spider Manager.html` | Full hi-fi interactive prototype — the design reference |
| `README.md` | This document |

---

## Notes for the Developer

1. **Images:** The prototype uses generated SVG placeholders. In production, the admin form should include a photo upload field (Supabase Storage). The detail page hero and grid cards should show real photos.

2. **Color per spider:** Each spider has an individual accent color (`color` field) used for card hover glows and the detail page accents. For new spiders, generate a random `oklch()` hue or let the admin pick a color.

3. **Molts log:** The prototype shows molts as a simple timeline. In production, consider a dedicated `molts` table with timestamps and notes per moult.

4. **Language:** The app is in German (DE). Keep all UI copy in German.

5. **Admin password:** The prototype uses `admin123` as a hardcoded password. Replace with Supabase Auth (email/password or magic link).

6. **Grid columns:** Default is 4 columns on desktop. Consider making this responsive: 1 col (mobile < 640px), 2 col (tablet < 1024px), 4 col (desktop).
