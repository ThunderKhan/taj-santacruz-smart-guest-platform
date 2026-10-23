# Smart Hotel Guest Service Platform — concept prototype

**Taj Santacruz, Mumbai · unofficial concept demonstration**

A high-fidelity, fully interactive frontend prototype of a QR / in-room-tablet guest
service platform: a guest raises a request, the request is routed automatically to
the right department, six department dashboards work it through
`Submitted → Accepted → In Progress → Completed`, and a management dashboard shows the
impact — all three experiences sharing **one live request state**, with no refresh.

> **Disclosure.** Independent concept prototype prepared for demonstration.
> Not affiliated with, endorsed by, or connected to Taj Hotels / Indian Hotels Company
> Limited. No real guest data, payments, bookings, PMS, SMS, authentication or AI
> services are used anywhere. All content is mock data persisted to `localStorage`.

---

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default <http://localhost:5173>).

Other scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server (recommended for the demo) |
| `npm run build` | Type-check (`tsc -b`) + production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only, no emit |

---

## Main routes

### 1 — Guest experience (QR / phone entry)

| Route | What it shows |
| --- | --- |
| `/guest` | Guest home: hero, service directory, recent requests, demo QR |
| `/guest/food` | In-room dining: sample menu, tray, review & send |
| `/guest/music` | Live music: now playing, vote queue, catalogue search, dedications |
| `/guest/housekeeping` | Towels/linen/amenities with quantity stepper, notes, urgency |
| `/guest/maintenance` | Fault categories, severity, description → engineering ticket |
| `/guest/concierge` | Quick answers, Mumbai recommendations, message to the desk |
| `/guest/spa` | Treatments, time slots, therapist preference |
| `/guest/transport` | Vehicle options, pickup/destination, timing, party size |
| `/guest/reservations` | Tables, events & activities (dining routes to the restaurant) |
| `/guest/occasions` | Celebration packages, setting, timing, note |
| `/guest/feedback` | Compliment vs concern (concerns route with high priority) |
| `/guest/billing` | Sample folio review — **no payment flow exists** |
| `/guest/my-requests` | Live list of this session's requests with filters |
| `/guest/my-requests/:ref` | Full timeline, detail, cancel action |

### 2 — Hotel tablet / kiosk

| Route | What it shows |
| --- | --- |
| `/kiosk` | Tablet home: large touch targets, persistent Back / Service home |
| `/kiosk/:service` | The *same* service modules as `/guest/*`, in tablet chrome |
| `/kiosk/my-requests` | Tablet-mode request list (self-contained, never leaves the kiosk) |
| `/kiosk/my-requests/:ref` | Tablet-mode request timeline |

### 3 — Department operations

| Route | What it shows |
| --- | --- |
| `/staff` | Redirects to `/staff/restaurant` |
| `/staff/restaurant` | Kitchen pass board (new / acknowledged / preparing / served) + reservations |
| `/staff/housekeeping` | Floor board, room status, attendant workload |
| `/staff/maintenance` | Priority triage, fault categories, asset watchlist |
| `/staff/entertainment` | Stage strip, vote leaderboard, approval backlog |
| `/staff/concierge` | Transport board, guest-relations follow-ups, workstream counts |
| `/staff/spa` | Today's schedule, therapist workload, treatment mix |

All six share one operational frame (header, live KPIs, filterable queue, detail
drawer with Accept / Start / Complete / Decline + assignment) and then add their own
department-specific panel.

### 4 — Management

| Route | What it shows |
| --- | --- |
| `/admin` | Live KPIs, status mix, department charts, sample-history series, insights, scoreboard |

### Anything else

`*` → a branded 404 page with links back into the demo.

---

## The scripted demo (Room 502 · two towels)

1. Open `/guest/housekeeping` (location defaults to **Room 502**).
2. Keep **Bath towels × 2**, optionally add a note, press **Send request**.
3. From the presenter ribbon switch to **Operations → Housekeeping**.
4. Open the new `TSH-…` ticket → **Accept request** → **Start work** → **Mark complete**.
5. Switch back to the guest experience: the confirmation screen, My Requests and the
   request timeline all update instantly — no refresh — and `/admin` KPIs/charts move with it.

Seeded scenarios also cover a restaurant order, a song request with votes, an urgent
maintenance issue, an airport transfer, a guest concern and a spa booking.

---

## Architecture

```
src/
├── App.tsx                 Route map for all four experiences
├── main.tsx                Router + provider + toaster
├── types/                  Shared domain types (ServiceRequest, statuses, …)
├── data/                   Mock data layer: property, departments, services, menu,
│                           music, spa, guest-services, history (sample series),
│                           requests (28 seeded demo records)
├── services/
│   ├── routing.ts          Configurable service→department routing rules (13)
│   └── requestEngine.ts    buildRequest / canTransition / applyTransition / labels
├── store/RequestsProvider  Reducer + context: single source of truth, localStorage
│                           persistence (v1), re-anchoring, toasts, notifications
├── hooks/                  useDepartmentQueue, useActiveDepartment, useHomePath,
│                           useServicePath, useRibbonOffset, useScrollToTop
├── components/             Brand, imagery, QR, bell, ribbon, location switcher
│   └── ui/                 Button, Badge, Panel, Field, Overlay, Timeline,
│                           Feedback, Toaster
├── layouts/                GuestLayout, KioskLayout, StaffLayout, AdminLayout
├── features/
│   ├── guest/              13 service modules + home, catalogue, success, detail
│   ├── kiosk/              KioskHome, KioskService (reuses guest modules)
│   ├── departments/        DepartmentRoute + six DepartmentPanels
│   └── admin/              AdminDashboard (Recharts)
└── pages/NotFound.tsx
```

**State model.** Every guest submission goes through `buildRequest()` (routing,
reference numbering, history), and every status change goes through a forward-only
transition guard: `Submitted → Accepted → In Progress → Completed`, plus `Rejected`
and `Cancelled`. Departments may display finer wording through the `stage` field
("Preparing", "Ready", "In the queue", "Now playing") without breaking the canonical
model.

**Persistence.** State is written to `localStorage` under `smart-guest-platform:v1`.
Seed timestamps re-anchor uniformly if the prototype has been idle for more than 14
hours, so relative ages always look sensible. A **Reset** control (presenter ribbon,
kiosk restart, footer) restores the seeded state.

**Presenter ribbon.** A discreet, collapsible bar at the top of every screen carries
the prototype disclosure, the Guest / Operations / Management switcher, tablet mode
and the reset control. Layouts compensate for it via `useRibbonOffset()`.

---

## Design system

- **Palette:** midnight navy/charcoal (`ink-*`), warm ivory/cream (`ivory-*`, `cream-*`),
  champagne gold/brass (`gold-*`, `brass-*`), muted sage (`sage-*`, `forest-*`),
  warm grey (`warm-*`). No neon, gradients-as-decoration or glassmorphism.
- **Type:** Cormorant Garamond for display, Inter for UI (with system fallbacks).
- **Surfaces:** Guest = ivory + serif + gold; Staff = midnight navy console;
  Management = light with a dark navy header.
- **Photography:** 39 curated hospitality images in `public/images/`, all with an
  art-directed fallback surface if a file is missing (`ImageWithFallback`).
- **Motion:** restrained, with a full `prefers-reduced-motion` override.
- **Accessibility:** focus-visible outlines, labelled controls, dialog focus handling,
  `aria-pressed` / `aria-expanded` states, keyboard-operable overlays (Esc to close).

---

## Not included (by design)

Production backend · payments · real PMS/channel integrations · authentication or
role-based authorisation · SMS/email/push · real availability or pricing · AI keys ·
real guest or staff data. Staff access in the prototype is explicitly simulated and
labelled as such.

---

## Verification status

- `npx tsc -b` — passes with strict options (`noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`).
- `npm run build` — passes (vendor/charts/icons split into separate chunks).
- Flows verified in-browser: guest submission → department status changes → guest
  timeline/KPI updates without refresh, across guest, kiosk, department and
  management views; responsive layouts checked at phone/tablet/desktop widths; image
  fallbacks exercised.
- Kiosk links verified self-contained: every tile, cross-link and "Track this
  request" stays on `/kiosk/*` routes (tablet chrome is never dropped mid-flow).
- Lighthouse (dev-server, desktop): **accessibility 1.00, best practices 1.00,
  SEO 1.00** on `/guest`; a custom WCAG contrast sweep over the live DOM
  (including dark ink surfaces and the photo-overlay hero worst case) reports zero
  failing text on `/guest`, `/kiosk`, `/admin` and `/staff/*`.
- `public/robots.txt` noindexes the prototype; the wordmark link is named by its
  visible content (no `aria-label` override).
