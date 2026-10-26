# Taj Santacruz — Live Music Requests & Celebration Enquiries (concept prototype)

**Unofficial concept demonstration · frontend only**

A high-fidelity, fully interactive frontend prototype of two connected hotel
experiences:

1. **Live Music Requests** — a guest scans a QR code at their table, searches the
   song catalogue, requests a track with an optional dedication, and votes for the
   approved queue. A performer/DJ dashboard accepts, defers or rejects, manages the
   running order, moderates dedications, and marks tracks `Playing → Played`.
2. **Celebration Music & Entertainment Enquiries** — a guest submits a structured
   celebration enquiry (occasion, date, timing, guests, venue, entertainment
   preference, genre, special requests). The Events & Banquets dashboard works it
   through `New → Under Review → Need More Information → Proposal Sent →
   Confirmed / Closed` with assignment, internal notes and sample packages.

Both experiences share **one live state** with the management dashboard and the
presenter tools — status changes appear on every connected screen without a refresh.

> **Disclosure.** Independent concept prototype prepared for demonstration.
> Not affiliated with, endorsed by, or connected to Taj Hotels / Indian Hotels
> Company Limited. No real guest data, payments, bookings, availability, PMS,
> SMS, authentication or AI services are used anywhere. Everything is fictional
> sample data persisted to `localStorage`.

---

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default <http://localhost:5173>).
If port 5173 is busy, Vite picks the next free port (e.g. `5174`) and prints it.

Other scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server (recommended for the demo) |
| `npm run build` | Type-check (`tsc -b`) + production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only, no emit |

---

## Main routes

### Table-first QR entry

Guests arrive by scanning the QR code printed on their **table tent**, so the
demo session always starts at a table — never a hotel room:

| Location id | Label | Where |
| --- | --- | --- |
| `table-01`, `table-08`, `table-12` | Table 01 / 08 / 12 | All Day Dining |
| `lounge-table-04` | Lounge Table 04 | Lobby Lounge · live music |
| `lobby-lounge` | Lobby Lounge | Ground level · venue QR |
| `pool-table-03` | Poolside Table 03 | Level 6 · open air |

- **Scanning = opening any guest URL with `?loc=<id>`**, e.g.
  `http://localhost:5173/guest/music?loc=table-12`. The session switches to that
  table and the parameter is cleared from the address bar. Unknown ids fall back
  to the default table (`table-08`).
- The music page carries the QR for your current table
  (`/guest/music?loc=…`), a **“You’re at Table 08”** heading, and a control in
  the page header to change table (demo tool).
- Room numbers live only in the code as **hidden legacy records** for the
  archived service dashboards — no guest screen, focus staff screen or QR shows
  them.

### 1 — Guest experience (QR / phone entry)

| Route | What it shows |
| --- | --- |
| `/guest` | Guest home: gold **“Request a song”** CTA, the two focus experiences + shortcut to My requests |
| `/guest/music` | **Feature A**: search first (title / artist / genre + category chips), now playing, your requests with progress steps, approved queue + votes, table QR card, pause / limit / declined notices |
| `/guest/occasions` | **Feature B**: celebration enquiry form (alias: `/guest/celebration` → redirects here) |
| `/guest/my-requests` | Live list of this session's song requests **and** celebration enquiries |
| `/guest/my-requests/:ref` | Full timeline and detail — **read-only for guests** (no status controls) |

### 2 — Hotel tablet / kiosk

| Route | What it shows |
| --- | --- |
| `/kiosk` | Tablet home with the same two experiences |
| `/kiosk/music`, `/kiosk/occasions` | The *same* guest modules in tablet chrome |
| `/kiosk/:service` | Any other service reports "Service not available" (gate) |
| `/kiosk/my-requests`, `/kiosk/my-requests/:ref` | Tablet-mode request list / timeline |

### 3 — Staff dashboards

| Route | What it shows |
| --- | --- |
| `/staff` | Redirects to `/staff/entertainment` |
| `/staff/entertainment` | **Live Music Desk (performer/DJ console)**: incoming, approved, deferred, on-stage, votable queue, played history, dedication moderation, demo rules |
| `/staff/events` | **Events & Banquets**: enquiry pipeline, search/filter (occasion, date window, entertainment, status), detail drawer with workflow, assignment, sample packages, internal notes, status history |
| `/staff/:department` | The five retained legacy dashboards (restaurant, housekeeping, maintenance, concierge, spa) still render by URL — hidden from the nav rail |

### 4 — Management

| Route | What it shows |
| --- | --- |
| `/admin` | Live KPIs, status mix, department charts, sample-history series, insights, scoreboard |

### Anything else

`*` → a branded 404 page with links back into the demo.

---

## The two workflows

### Feature A — Live Music Requests (guest → performer)

1. Scan the table-tent QR (`/guest/music?loc=table-08`) — the screen opens
   already sitting at **your table**. Search first, or browse by category
   (**Bollywood, English Pop, Romantic, Jazz, Classics, Party Music**).
2. Choose a track, optionally write a dedication, press **Send request** →
   you get a `TSH-…` reference and the status **Submitted**.
   *Demo rules apply: max 2 open requests per guest, and the performer can pause
   incoming requests — the screen explains this when it blocks you.*
3. Switch (presenter ribbon) to **Staff dashboards → Live Music Desk**.
4. Accept / Defer / Reject the incoming request, then **Add to queue** → the
   guest sees **Queued** and the track appears in the public vote queue.
5. **Play now** (disabled while another track plays) → **Playing**;
   **Mark as played** → **Played**. The guest's screen and My requests update live.
6. Dedications are visible to staff with a **Hold / Approve** toggle; a held
   dedication shows as "held for review" on the public queue while the guest
   keeps their own text.

Status vocabulary (staff-managed only): `Submitted → Accepted → Queued → Playing →
Played`, plus `Rejected` (guest-facing explanation) and `Deferred` (accepted, held).
The guest follows it on a **five-step progress indicator** — compact dots in the
music page's “Your requests” list and the full labelled stepper on each request's
detail page (a declined request shows *Submitted → Declined*).

### Feature B — Celebration Enquiries (guest → events desk)

1. On `/guest/occasions` fill in occasion, date + start time, duration, guest
   count, venue, entertainment preference (singer / band / DJ / instrumental /
   background), genre, special requests, notes → **Send the enquiry**.
2. Validation runs inline; on success you receive a `CEL-…` reference, a
   confirmation with the disclaimer **"an enquiry is not a booking"**, and a live
   status card with its own timeline.
3. Open **Staff dashboards → Events & Banquets**: the enquiry appears as **New**.
   Search/filter by occasion, event date window, entertainment preference or
   workflow status; open the drawer.
4. In the drawer: assign a colleague, add internal notes (staff-only), attach a
   **sample package** (indicative figures), and advance the workflow:
   `New → Under Review → Need More Information → Proposal Sent → Confirmed / Closed`.
5. The guest sees every status change in My requests / on their confirmation
   screen — confirmed and closed are end states, and "Confirmed" is explicitly
   labelled a simulation (no signed proposal, deposit or calendar hold exists).

---

## What is working, simulated, hidden or future work

| Area | State |
| --- | --- |
| Both workflows above, guest ↔ staff, live shared state, `localStorage` persistence (v3) | **Working** (frontend only) |
| Voting, request limits, pause, dedication hold/approve, workflow transitions, assignment, internal notes, sample packages | **Working** (demo rules on shared local state) |
| Presenter ribbon switcher, kiosk mode, reset controls, management dashboard | **Working** |
| Staff authentication / role-based permissions | **Simulated only** — no auth exists; staff access is explicitly labelled as demonstration |
| Restaurant, housekeeping, maintenance, concierge, spa dashboards + their guest service forms | **Retained but hidden** — removed from guest navigation and the staff rail; routes still resolve by URL (`/guest/spa`, `/staff/housekeeping`, …) and their modules remain in the codebase for reuse |
| Availability checks, pricing, quotations, booking confirmation | **Never claimed** — packages are sample data with indicative INR figures; no availability is ever displayed |
| Production backend · payments · PMS/channel integrations · SMS/email/push · real data · API keys · AI services | **Out of scope by design** — would be the production integration phase |
| Real audio streaming / song licensing | **Not present** — metadata only, stated in the UI |

---

## Architecture

```
src/
├── App.tsx                 Route map for all four experiences
├── main.tsx                Router + provider + toaster
├── types/                  Shared domain types (ServiceRequest, CelebrationEnquiry, …)
├── data/                   Mock data: property, departments, services, music catalogue,
│                           celebrations (packages + enquiry seeds), requests (seeds)
├── services/
│   ├── routing.ts          Configurable service→department routing rules
│   ├── requestEngine.ts    buildRequest / canTransition / applyTransition / labels
│   └── enquiryEngine.ts    enquiry workflow: transitions, actions, labels, references
├── store/RequestsProvider  Reducer + context: requests, enquiries, demo music rules,
│                           notifications, toasts, localStorage persistence (v3)
├── hooks/                  useDepartmentQueue, useActiveDepartment, useHomePath, …
├── components/             Brand, imagery, QR, bell, ribbon, location switcher,
│                           request progress steps (RequestSteps)
│   └── ui/                 Button, Badge (Status/Enquiry), Panel, Field, Overlay,
│                           Timeline (Request/Enquiry), Feedback, Toaster
├── layouts/                GuestLayout, KioskLayout, StaffLayout, AdminLayout
├── features/
│   ├── guest/              MusicRequests, CelebrationEnquiry, MyRequests, home, catalogue
│   ├── kiosk/              KioskHome, KioskService (reuses guest modules, focus-gated)
│   ├── entertainment/      StageDashboard (performer/DJ console)
│   ├── events/             EventsDashboard + EnquiryDrawer
│   ├── departments/        DepartmentRoute + department-specific panels (retained)
│   └── admin/              AdminDashboard (Recharts)
└── pages/NotFound.tsx
```

**State model.** Guest submissions go through `buildRequest()`; enquiries through
`buildEnquiry()`. Request statuses are forward-only with a `stage` field for
department wording (`queued`, `playing`, `played`, `deferred`, `preparing`, …).
Enquiries have their own engine (`enquiryEngine.ts`) because their lifecycle and
actor vocabulary differ from hotel requests. One localStorage key
(`smart-guest-platform:v1`, `STATE_VERSION = 3`) holds both slices plus the demo
music rules; the bump to v3 re-seeds older stored demos with the table-first
location data, and seed timestamps re-anchor after 14 idle hours. Reset controls
(ribbon, kiosk restart, footer) restore the seeded state.

**Presenter ribbon.** A discreet, collapsible bar carries the prototype
disclosure, the Guest / Staff / Management switcher, tablet mode and reset.
Layouts compensate via `useRibbonOffset()`.

---

## Design system

- **Palette:** midnight navy (`ink-*`), warm ivory/cream (`ivory-*`, `cream-*`),
  champagne gold (`gold-*`), muted sage (`sage-*`), warm grey (`warm-*`).
  No neon, no decorative gradients, no glassmorphism.
- **Type:** Cormorant Garamond for display, Inter for UI (with system fallbacks).
- **Surfaces:** Guest = ivory + serif + gold, mobile-first; Staff = midnight navy
  console, desktop-first; Management = light with a dark navy header.
- **States:** every screen provides loading/empty/success/validation/error
  treatments (`EmptyState`, `Notice`, `SuccessPanel`, inline field errors).
- **Accessibility:** focus-visible outlines, labelled controls, dialog focus
  handling, `aria-pressed` states, keyboard-operable overlays (Esc to close).

---

## Verification status (this refactor)

- `npx tsc -b` — passes with strict options (`noUnusedLocals`,
  `noUnusedParameters`, `verbatimModuleSyntax`).
- `npm run build` — passes (vendor/charts/icons split into separate chunks).
- Browser end-to-end, both workflows verified on the dev server:
  - **Table-first entry:** `…/guest?loc=table-12` switches the session to Table 12
    and clears the parameter; the location control lists only the six tables /
    venues (no rooms); no `Room …` string appears on any guest route, on the
    Live Music Desk or on Events & Banquets.
  - **Feature A:** search → category filter → request with dedication →
    `Submitted` on the guest screen → Accept → Add to queue (`Queued`) →
    Play now (disabled while another track plays) → Mark as played (`Played`) →
    guest sees `Played` in My requests, all without refresh.
  - **Progress stepper:** the request detail walks `Submitted → Accepted →
    Queued → Playing → Played` as staff act, the music page's list shows the
    compact form (including a *Declined* marker for a rejected request).
  - **Feature B:** form → empty-submit validation (all 7 field errors) → filled
    submission → `CEL-3300` reference + confirmation + disclaimers → events
    dashboard → drawer: assignment, internal note, sample package →
    `New → Under Review → Proposal Sent` → guest sees the update live.
  - Guests cannot change statuses: the request detail page has no
    cancel/accept/complete controls and states that statuses belong to staff.
  - Kiosk gate: `/kiosk/housekeeping` reports "Service not available";
    `/kiosk/occasions` renders the enquiry form.
  - Legacy dashboards still render by URL (`/staff/housekeeping`) while the rail
    shows only the two focus desks; `/staff` redirects to the Live Music Desk.
  - Demo rules: pausing requests on the stage desk blocks guest submissions with
    an on-page notice; voting increments/decrements correctly.
  - **No horizontal overflow at 390 px** (mobile) on `/guest`, `/guest/music`,
    `/guest/occasions`, `/guest/my-requests`, `/guest/my-requests/:ref`,
    `/staff/entertainment`, `/staff/events`, `/kiosk/housekeeping` — the guest
    header's location chip now shrinks instead of pushing the page sideways.
- `public/robots.txt` noindexes the prototype.

See `PROTOTYPE_REPORT.md` for the full report: changed files, retained/hidden
services, limitations and the demo script.
