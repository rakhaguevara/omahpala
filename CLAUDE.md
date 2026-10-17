# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Omah Pala — a bilingual (ID/EN) marketing site + demo admin panel for a TOGA (herbal/spice)
farming cooperative. All application code lives in `web/`; the repo root only holds planning docs:

- `PRD.md` — product requirements (sitemap, page requirements, data model, tech stack as originally
  planned, phasing, open questions). Referenced throughout the code as `PRD §N`.
- `design.md` — design system source of truth (colors, type scale, spacing/radius, component specs,
  motion tokens). Referenced throughout the code as `design.md §N`.
- `UX-WRITING.md` — copy/microcopy guidelines.

**These three docs are the source of truth.** Code comments point back to specific sections (e.g.
`// PRD §7.6 A-02`, `// design.md §6`) — when a comment and the doc disagree, the doc wins and the
code is the bug. `web/README.md` (in Indonesian) documents where the actual build deliberately
diverged from the PRD and why — read it before assuming PRD §10/§11 describe the real stack.

## Commands

All commands run from `web/`:

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # tsc -b (typecheck) + vite build -> dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
npm test           # vitest: Find My Polo frontend utils + SQL migration tests (PGlite)
```

Tests exist only for Find My Polo (`npm test`); the rest of the site is covered by type-checking
(`npm run build`) and `npm run lint`.

Demo admin login (`/admin/login`):

| Role | Email | Password |
|---|---|---|
| admin (full access) | `admin@omahpala.id` | `omahpala2025` |
| pengurus (products & orders only) | `pengurus@omahpala.id` | `togaberdaya` |

## Architecture

**Stack**: Vite + React 19 + TypeScript, react-router-dom v7, framer-motion, react-i18next,
react-helmet-async, Tailwind v4 (via `@theme`, no config file — tokens live in `src/index.css`).
This is a deliberate deviation from PRD §10 (which specified Next.js 15 App Router + Postgres/Prisma +
Auth.js) — see `web/README.md` for the full mapping of "PRD plan" → "what's actually here" and why.

**No backend — except Find My Polo.** The marketing site and admin panel have no server, API, or database;
everything there is client-side. The one exception is the Find My Polo QR game (`web/src/features/find-my-polo/`,
`web/supabase/`), which uses real Supabase (Auth + Postgres + RLS + RPC) because stamps and rewards must be
decided server-side. Read `web/supabase/README.md` before touching it; it is Supabase-only by decision (no
localStorage/demo mode — don't add one). `npm test` runs its tests (vitest; the SQL migration runs in PGlite).
The rest of this section describes everything *else*:

- **Data layer** (`src/lib/storage.ts`): a localStorage-backed store with an in-memory `cache` Map
  keyed by collection name. Reads/writes go through `getCollection`/`setCollection`; a pub/sub
  (`subscribeCollection`/`notify`) lets components react to changes. The in-memory cache exists
  specifically so `useSyncExternalStore`'s `getSnapshot()` returns a referentially stable value
  between renders — re-parsing JSON from localStorage on every call previously caused an infinite
  render loop. Keep that invariant if you touch this file.
- **`src/lib/useCollection.ts`**: generic reactive CRUD hook (`items`, `add`, `update`, `remove`) built
  on `useSyncExternalStore` + `storage.ts`.
- **`src/lib/useEntities.ts`**: thin per-entity wrappers (`useProducts`, `usePlots`, `useFarmers`,
  `useInquiries`) that bind `useCollection` to a specific localStorage key and seed data from
  `src/data/*.ts`. This is the layer to extend when adding a new admin-managed collection.
- **`src/data/*.ts`**: seed/demo data (products, plots, farmers, program content, page content).
  Marked `// Data contoh` — placeholder content (prices, certifications, photos) that must be verified
  before any real launch.
- **`src/lib/auth.ts`**: hardcoded credential list + session object in localStorage. Explicitly marked
  unsafe for production (`// TIDAK aman untuk produksi`) — never put real credentials here.
- If/when a real backend is wired in, the intended migration path (per `web/README.md`) is Supabase,
  swapping the internals of `storage.ts`/`auth.ts` only — page/component code shouldn't need to change
  since all data access already goes through the hooks above.

**Routing** (`src/App.tsx`): public routes are eager-loaded under `PublicLayout`
(`/`, `/produk`, `/produk/:slug`, `/program`, `/kebun`, `/kontak`). Everything under `/admin` is
`React.lazy`-loaded so public visitors never download admin code — this is intentional for the
LCP < 2.5s target in PRD §9; don't convert admin routes to eager imports.

**i18n** (`src/i18n/`): `react-i18next` with `i18next-browser-languagedetector`. Language is detected
from `localStorage` then `navigator`, and falls back to `en`. There are no locale-prefixed routes
(`/en/...`, `/id/...`) — the same URL serves both languages via a navbar toggle that persists to
localStorage under `omahpala_locale`. Translation strings live in
`src/i18n/locales/{id,en}.json`; data-model text uses paired fields instead (`nameId`/`nameEn`,
`descriptionId`/`descriptionEn`, etc. — see `src/types/index.ts`) so bilingual content is enforced at
the type level.

**Motion** (`src/lib/motion.ts`): a single easing curve and three durations (`fast`/`base`/`slow`) are
the only motion tokens allowed, per design.md §6 — don't introduce new eases or durations ad hoc.
Reusable motion primitives (`Reveal`, `Stagger`, `Marquee`, `CountUp`, `TabPanel` in
`src/components/motion/`) all respect `prefers-reduced-motion`; use them instead of raw
`framer-motion` calls in page/block components.

**Design tokens** (`web/src/index.css`): Tailwind v4 `@theme` block mapped directly from design.md
§2–4 — colors, exactly four border-radius values (`pill`/`lg`/`md`/`sm`), and the type/spacing scale.
Treat `design.md` as canonical if a token here looks wrong; don't invent new radius/color values
outside this token set.

### Directory layout (`web/src/`)

```
components/
  ui/        Button, Chip, Badge, Field, Container, Section, Icons — low-level primitives
  motion/    Reveal, Stagger, Marquee, CountUp, TabPanel (all prefers-reduced-motion aware)
  layout/    Navbar, Footer, PublicLayout, AdminLayout, Seo, LanguageSwitch
  blocks/    Page-level sections: Hero, IntroBlock, PillarTabs, ProductCard/Grid, StatBand, WhyPala,
             CtaBand, EcosystemDiagram
  admin/     RequireAuth (route guard using auth.ts + can()), ImageUploader (base64 data URL)
pages/
  public/    Home, Catalog, ProductDetail, Program, Kebun, Contact, NotFound
  admin/     Login, Dashboard, ProductsAdmin, OrdersAdmin, KebunAdmin, ContentAdmin
data/        Seed data — see "// Data contoh" comments
lib/         storage.ts, useCollection.ts, useEntities.ts, auth.ts, motion.ts, utils.ts, useLocale.ts
i18n/        react-i18next setup + locales/{id,en}.json
types/       Data model (mirrors PRD §8)
```

### Known limitations (intentional, not bugs to silently "fix")

Per `web/README.md`, these are known/accepted gaps for the current phase — don't refactor around them
without confirming with the user first, since they trace back to explicit product decisions:

- No SSR — `<title>`/meta tags are set client-side via `react-helmet-async`.
- `hreflang` points both locales at the same URL (no `/id`/`/en` route split).
- `public/sitemap.xml` is hand-written from `src/data/products.ts`; admin-added products aren't added
  automatically.
- Contact form spam protection (`Contact.tsx`) is a client-side honeypot + delay only — cosmetic, not
  a real defense.
- Auth is mock/demo only (see `src/lib/auth.ts` above).
