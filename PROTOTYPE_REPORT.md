# Prototype Status Report

**Smart Hotel Guest Service Platform — Taj Santacruz, Mumbai**
Unofficial concept demonstration · frontend prototype · October 2026

---

## 1. What was delivered

A high-fidelity, fully interactive frontend prototype of a QR / in-room-tablet guest
service platform. A guest raises a request, the platform routes it automatically to
the right department, six department dashboards work it through
`Submitted → Accepted → In Progress → Completed` (plus `Rejected` / `Cancelled`),
and a management dashboard shows the property-wide impact — all three experiences
sharing **one live request state**, with no page refresh anywhere in the flow.

> **Disclosure.** Independent concept prototype. Not affiliated with, endorsed by, or
> connected to Taj Hotels / Indian Hotels Company Limited. No real guest data,
> payments, bookings, PMS, SMS, authentication or AI services are used anywhere. All
> content is mock data persisted to `localStorage`.

---

## 2. How to run it

```bash
npm install
npm run dev
```

Open the printed local URL (default <http://localhost:5173>; 5174+ if the port is busy).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (recommended for the demo) |
| `npm run build` | `tsc -b` type-check + production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only, no emit |

Stack: React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS v4 · Lucide icons ·
Recharts · React Router 7.

---

## 3. Main routes

### Guest experience (QR / phone entry)

| Route | Screen |
| --- | --- |
| `/guest` | Guest home — hero, service directory (A–L), recent requests, demo QR |
| `/guest/food` | In-room dining: sample menu, tray, review & send |
| `/guest/music` | Live music: now playing, vote queue, catalogue search, dedications |
| `/guest/housekeeping` | Towels / linen / amenities with quantity stepper, notes, urgency |
| `/guest/maintenance` | Fault categories, severity, description → engineering ticket |
| `/guest/concierge` | Quick answers, Mumbai recommendations, message to the desk |
| `/guest/spa` | Treatments, time slots, therapist preference |
| `/guest/transport` | Vehicle options, pickup / destination, timing, party size |
| `/guest/reservations` | Tables, events & activities (dining routes to the restaurant) |
| `/guest/occasions` | Celebration packages, setting, timing, note |
| `/guest/feedback` | Compliment vs concern (concerns route with high priority) |
| `/guest/billing` | Sample folio review — **no payment flow exists** |
| `/guest/my-requests` | Live list of this session's requests with filters |
| `/guest/my-requests/:ref` | Full timeline, detail, cancel action |

### Hotel tablet / kiosk

| Route | Screen |
| --- | --- |
| `/kiosk` | Tablet home — large touch targets, persistent Back / Service home |
| `/kiosk/:service` | Same service modules as `/guest/*` in tablet chrome |
| `/kiosk/my-requests` | Tablet-mode request list (self-contained) |
| `/kiosk/my-requests/:ref` | Tablet-mode request timeline |

### Department operations

| Route | Distinct panel |
| --- | --- |
| `/staff` | Redirects to `/staff/restaurant` |
| `/staff/restaurant` | Kitchen pass board (new / acknowledged / preparing / served) + reservations |
| `/staff/housekeeping` | Floor board, room status, attendant workload |
| `/staff/maintenance` | Priority triage, fault categories, SLA watch, asset list |
| `/staff/entertainment` | Stage strip, vote leaderboard, approval queue |
| `/staff/concierge` | Transport board, guest-relations follow-ups, workstream counts |
| `/staff/spa` | Therapist schedule, treatment mix, slot board |

All six share one operational frame (header, live KPIs, filterable queue, detail
drawer with Accept / Start / Complete / Decline + assignment) and then add their own
department-specific panel, so each dashboard is visually and operationally distinct.

### Management

| Route | Screen |
| --- | --- |
| `/admin` | Live KPIs, 14-day history area chart, status donut, department bars, baseline bars, CSAT trend, insights, team scoreboard |

### Everything else

`*` → a branded 404 page with links back into the demo.

---

## 4. Implementation report

### 4.1 Architecture

```
src/
├── App.tsx                 Route map for all four experiences
├── main.tsx                Router + provider + toaster + prototype ribbon
├── types/                  Shared domain types (ServiceRequest, statuses, stages)
├── data/                   Mock layer: property, departments, services, menu, music,
│                           spa, guest-services, sample history, 28 seeded requests
├── services/
│   ├── routing.ts          Configurable service→department routing rules (13)
│   └── requestEngine.ts    buildRequest / canTransition / applyTransition / labels
├── store/RequestsProvider  Reducer + context — single source of truth,
│                           localStorage persistence (v1), re-anchoring, toasts
├── hooks/                  useDepartmentQueue, useActiveDepartment, useHomePath,
│                           useServicePath, useRibbonOffset, useScrollToTop
├── components/             Brand, imagery, QR, bell, ribbon, location switcher
│   └── ui/                 Button, Badge, Panel, Field, Overlay, Timeline,
│                           Feedback, Toaster
├── layouts/                GuestLayout, KioskLayout, StaffLayout, AdminLayout
├── features/
│   ├── guest/              13 service modules + home, catalogue, success, detail
│   ├── kiosk/              KioskHome, KioskService (reuse guest modules)
│   ├── departments/        DepartmentRoute + six DepartmentPanels
│   └── admin/              AdminDashboard (Recharts)
└── pages/NotFound.tsx
```

65 TypeScript files · ~11,000 lines · strict compiler options
(`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`).

### 4.2 One shared live state

Every experience reads the same `RequestsProvider` context. A request submitted on a
phone, kiosk or department dashboard appears instantly in all the others — queue
counters, KPI tiles, charts and timelines move together with no refresh and no
backend. State persists to `localStorage` (`smart-guest-platform:v1`); seed
timestamps re-anchor if the prototype has been idle >14 hours so relative ages stay
believable. **Reset** controls (presenter ribbon, kiosk restart, footer) restore the
seeded state.

### 4.3 Routing and status model

- Service → department routing is data-driven (`data/routing.ts`, 13 rules) —
  categories, priorities and target teams are configuration, not hard-coded branches.
- Canonical lifecycle: `Submitted → Accepted → In Progress → Completed`, plus
  `Rejected` and `Cancelled`, enforced by a forward-only transition guard
  (`canTransition` / `applyTransition`). Departments add finer wording via the
  `stage` field ("Preparing", "Ready", "In the queue", "Now playing") without
  breaking the canonical model.
- Reference numbers (`TSH-48xx`) are minted per submission; every transition appends
  a timeline entry visible to the guest.

### 4.4 The scripted demo

Room 502 requests two towels → housekeeping accepts → starts → completes → the guest
timeline shows the full history and management KPIs update — all without a refresh.
Verified end-to-end in-browser (`TSH-4800`). Seeded scenarios also cover a restaurant
order, a song request with votes, an urgent maintenance issue, an airport transfer, a
guest concern and a spa booking (28 seeded records), plus live-session submissions
observed moving between dashboards (`TSH-4801` cross-sync guest ↔ housekeeping
verified).

### 4.5 Presentation layer

- **Guest / kiosk** — ivory surfaces, Cormorant Garamond display, gold hairlines,
  hospitality photography.
- **Departments** — midnight navy console chrome, dense operational boards.
- **Management** — light analytical surface with a dark photographic header.
- **Presenter ribbon** — collapsible bar on every screen with the prototype
  disclosure, Guest / Operations / Management switcher, tablet-mode toggle and reset;
  layouts compensate via `useRibbonOffset()`.
- **Kiosk isolation** — tablet mode never leaves `/kiosk/*`; every tile, cross-link
  and "Track this request" action stays in tablet chrome (`useHomePath` /
  `useServicePath`).

### 4.6 Design system & accessibility

- Palette limited to midnight navy/charcoal, ivory/cream, champagne gold/brass,
  muted sage and warm grey; no neon, decorative gradients or glassmorphism.
- Tokens tuned for WCAG AA: `gold-600`/`warm-500`/`warm-600` darkened for light
  surfaces, with a scoped override that lifts muted tokens inside `.bg-ink-*` panels
  so the same component classes stay legible on dark chrome; `StatTile` tones and
  `CountChip` are dark-aware.
- Focus-visible outlines, labelled controls, dialog focus handling, `aria-pressed` /
  `aria-expanded`, Esc-closable overlays, `prefers-reduced-motion` override.
- `ImageWithFallback` degrades every photo to an art-directed surface; 39 curated
  images ship in `public/images/`.

---

## 5. Verification results

| Check | Result |
| --- | --- |
| `npx tsc -b` | ✅ passes (strict) |
| `npm run build` | ✅ passes — CSS 71.6 kB (11.8 kB gz), app+vendor+charts+icons split into chunks |
| Guest → staff → guest live flow | ✅ verified end-to-end, no refresh |
| Kiosk self-containment | ✅ all links stay on `/kiosk/*` |
| Six department dashboards | ✅ each renders its distinct panel |
| Management dashboard | ✅ 14 Recharts surfaces; KPIs move with live session data |
| Lighthouse `/guest` (desktop) | ✅ accessibility **1.00**, best practices **1.00**, SEO **1.00** |
| Custom WCAG contrast sweep (live DOM, worst-case photo overlay included) | ✅ zero failing text on `/guest`, `/kiosk`, `/admin`, `/staff/restaurant` |
| Horizontal overflow @ narrow widths | ✅ none (presenter ribbon fixed) |
| Console errors | ✅ none (React DevTools info line only) |
| `robots.txt` | ✅ present, noindexes the prototype |

---

## 6. Explicitly out of scope

Production backend · payments · real PMS/channel integrations · authentication or
role-based authorisation · SMS/email/push notifications · real availability or
pricing · AI service keys · real guest or staff data. Staff access is explicitly
simulated and labelled as such; the billing screen is a read-only sample folio with
no payment capability of any kind.
