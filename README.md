# Live Music Requests & Celebration Enquiries (concept prototype)

**Unofficial concept demonstration · frontend only**

> **VSPH SSO integration (optional, not yet deployed here):** A separate Vercel Functions receiver, encrypted session cookies and central VSPH staff/musician sign-in are available on the `feat/vsph-sso-vercel-receiver` branch. These are **disabled until configured**. The prototype still uses browser-only sample data; SSO does not turn it into a production database. See [docs/VSPH_SSO.md](docs/VSPH_SSO.md) for the handshake, environment variables, role mapping and validation limits. The `vsph-music-system.vercel.app` deployment has not been verified as linked to this repository.\n\n

A high-fidelity, fully interactive frontend prototype of two connected hotel
experiences:

1. **Live Music Requests** — a guest scans a QR code at their table, searches the
   song catalogue, requests a track with an optional dedication, and votes for the
   approved queue. A **singer/performer console** accepts, defers or rejects,
   manages the running order, moderates dedications, and marks tracks
   `Playing → Played`.
2. **Celebration Music & Entertainment Enquiries** — a guest submits a structured
   celebration enquiry (occasion, date, timing, guests, venue, entertainment
   preference, genre, special requests). The **staff events desk** works it
   through `New → Under Review → Need More Information → Proposal Sent →
   Confirmed / Closed`, assigns a performer, and attaches internal notes and
   sample packages.

Both experiences share **one live state** with the presenter tools — status
changes appear on every connected screen without a refresh.

> **Disclosure.** Independent concept prototype prepared for demonstration.
> Not affiliated with, endorsed by, or connected to any hotel brand. No real
> guest data, payments, bookings, availability, PMS, SMS, authentication or AI
> services are used anywhere. Everything is fictional sample data persisted to
> `localStorage`. The sign-in screens are a browser-only demo convenience, not
> real authentication.

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

### 3 — Sign-in (two back-of-house roles)

Guests never sign in — they scan a table QR code. Staff and performers do:

| Route | What it shows |
| --- | --- |
| `/login` | Two panels: **Staff** (username `staff`) and **Musician** (e.g. `aarav`, `nisha`, `kabir`, `rohan`, plus any account staff create). Shared demo password `demo1234`, shown on screen. Unknown, disabled or wrong-password attempts are rejected with an inline message. |

The session is stored in `localStorage` (`smart-guest-platform:auth`) and
persists across reloads. `/staff/*` and `/musician/*` are guarded: with no
session they redirect to `/login`; a session of the wrong role is sent to its
own console.

### 4 — Staff console (signed in as staff)

| Route | What it shows |
| --- | --- |
| `/staff` | Redirects to `/staff/events` |
| `/staff/events` | **Events & Banquets**: enquiry pipeline, search/filter (occasion, date window, entertainment, status), drawer with workflow, **colleague + performer assignment**, sample packages, internal notes, status history |
| `/staff/musicians` | **Musicians**: list performer accounts, **add** a musician (name + stage role → derived sign-in username), **delete** one (two-step confirm). Shows who has upcoming events. |
| `/staff/:department` | The five retained legacy dashboards (restaurant, housekeeping, maintenance, concierge, spa) still render by URL — hidden from the rail |

Staff control **everything except the live music queue** — `/staff/entertainment`
redirects to the events desk because live music belongs to the performers.

### 5 — Singer console (signed in as a musician)

| Route | What it shows |
| --- | --- |
| `/musician` | Redirects to `/musician/live` |
| `/musician/live` | **Live music requests**: incoming (Accept / Defer / Reject), approved, on hold, on stage, votable queue, played history, **dedication moderation**, **demo rules** (pause, request limit, voting). Staff never see this queue. |
| `/musician/events` | **My events**: the celebration enquiries the events desk assigned to this performer — read-only (facts, special requests, proposed package, status history; no workflow controls or internal notes). |

### Anything else

`*` → a branded 404 page with links back into the demo (including the staff &
singer sign-in).

---

## The two workflows

### Feature A — Live Music Requests (guest → singer console)

1. Scan the table-tent QR (`/guest/music?loc=table-08`) — the screen opens
   already sitting at **your table**. Search first, or browse by category
   (**Bollywood, English Pop, Romantic, Jazz, Classics, Party Music**).
2. Choose a track, optionally write a dedication, press **Send request** →
   you get a `TSH-…` reference and the status **Submitted**.
   *Demo rules apply: max 2 open requests per guest, and the performer can pause
   incoming requests — the screen explains this when it blocks you.*
3. Sign in at `/login` as a **musician** (e.g. `aarav` / `demo1234`) and open the
   **Live music** section of the singer console.
4. Accept / Defer / Reject the incoming request, then **Add to queue** → the
   guest sees **Queued** and the track appears in the public vote queue.
5. **Play now** (disabled while another track plays) → **Playing**;
   **Mark as played** → **Played**. The guest's screen and My requests update live.
6. Dedications are visible to the performer with a **Hold / Approve** toggle; a
   held dedication shows as "held for review" on the public queue while the guest
   keeps their own text.

Status vocabulary (performer-managed only): `Submitted → Accepted → Queued →
Playing → Played`, plus `Rejected` (guest-facing explanation) and `Deferred`
(accepted, held). The guest follows it on a **five-step progress indicator** —
compact dots in the music page's “Your requests” list and the full labelled
stepper on each request's detail page (a declined request shows *Submitted →
Declined*).

### Feature B — Celebration Enquiries (guest → events desk → performer)

1. On `/guest/occasions` fill in occasion, date + start time, duration, guest
   count, venue, entertainment preference (singer / band / DJ / instrumental /
   background), genre, special requests, notes → **Send the enquiry**.
2. Validation runs inline; on success you receive a `CEL-…` reference, a
   confirmation with the disclaimer **"an enquiry is not a booking"**, and a live
   status card with its own timeline.
3. Sign in as **staff** (`staff` / `demo1234`) → **Events & Banquets**: the
   enquiry appears as **New**. Search/filter by occasion, event date window,
   entertainment preference or workflow status; open the drawer.
4. In the drawer: assign a colleague, **assign a performer** (from the Musicians
   desk roster), add internal notes (staff-only), attach a **sample package**
   (indicative figures), and advance the workflow:
   `New → Under Review → Need More Information → Proposal Sent → Confirmed / Closed`.
5. The assigned performer now sees the event, read-only, under
   **Singer console → My events** — date, venue, requested music and status,
   but never the workflow controls or the desk's internal notes.
6. The guest sees every status change in My requests / on their confirmation
   screen — confirmed and closed are end states, and "Confirmed" is explicitly
   labelled a simulation (no signed proposal, deposit or calendar hold exists).

---

## What is working, simulated, hidden or future work

| Area | State |
| --- | --- |
| Both workflows above, guest ↔ performer ↔ staff, live shared state, `localStorage` persistence (v4) | **Working** (frontend only) |
| Two demo log-ins (staff / musician), role-guarded consoles, musician account CRUD, performer assignment | **Working** (browser-only session, **not** authentication) |
| Staff own the enquiry pipeline + musician accounts; performers own the live music queue | **Working** (ownership split enforced by routes and rail) |
| Voting, request limits, pause, dedication hold/approve, workflow transitions, assignment, internal notes, sample packages | **Working** (demo rules on shared local state) |
| Presenter ribbon switcher, kiosk mode, reset controls | **Working** |
| Production authentication / role-based permissions / server-side authorisation | **Simulated only** — no auth exists; the demo password is checked in the browser and the UI says so |
| Restaurant, housekeeping, maintenance, concierge, spa dashboards + their guest service forms | **Retained but hidden** — removed from guest navigation and the staff rail; routes still resolve by URL (`/guest/spa`, `/staff/housekeeping`, …) and their modules remain in the codebase for reuse |
| Hotel management dashboard (`/admin`) | **Removed** — route, rail entry and module deleted; the analytics dependency (`recharts`) was dropped with it |
| Availability checks, pricing, quotations, booking confirmation | **Never claimed** — packages are sample data with indicative INR figures; no availability is ever displayed |
| Production backend · payments · PMS/channel integrations · SMS/email/push · real data · API keys · AI services | **Out of scope by design** — would be the production integration phase |
| Real audio streaming / song licensing | **Not present** — metadata only, stated in the UI |

---

## Architecture

```
src/
├── App.tsx                 Route map for all experiences + RequireRole guard
├── main.tsx                Router + providers (Requests, Auth) + toaster
├── types/                  Shared domain types (ServiceRequest, CelebrationEnquiry,
│                           Musician, …)
├── data/                   Mock data: property, departments, services, music catalogue,
│                           musicians (seed accounts + demo credentials), celebrations
│                           (packages + enquiry seeds), requests (seeds)
├── services/
│   ├── routing.ts          Configurable service→department routing rules
│   ├── requestEngine.ts    buildRequest / canTransition / applyTransition / labels
│   └── enquiryEngine.ts    enquiry workflow: transitions, actions, labels, references
├── store/
│   ├── RequestsProvider    Reducer + context: requests, enquiries, musicians, demo music
│   │                       rules, notifications, toasts, localStorage persistence (v4)
│   └── AuthProvider        Demo sign-in for the staff / musician roles (localStorage)
├── hooks/                  useDepartmentQueue, useActiveDepartment, useHomePath, …
├── components/             Brand, imagery, QR, bell, ribbon, location switcher,
│                           request progress steps (RequestSteps)
│   └── ui/                 Button, Badge (Status/Enquiry), Panel, Field, Overlay,
│                           Timeline (Request/Enquiry), Feedback, Toaster
├── layouts/                GuestLayout, KioskLayout, StaffLayout, MusicianLayout
├── features/
│   ├── guest/              MusicRequests, CelebrationEnquiry, MyRequests, home, catalogue
│   ├── kiosk/              KioskHome, KioskService (reuses guest modules, focus-gated)
│   ├── entertainment/      StageDashboard (singer console — live music queue)
│   ├── events/             EventsDashboard + EnquiryDrawer (staff + read-only modes)
│   ├── staff/              MusiciansDashboard (account CRUD)
│   ├── musician/           MusicianEvents (assigned celebrations, read-only)
│   └── departments/        DepartmentRoute + department-specific panels (retained)
└── pages/                  LoginPage, NotFound
```

**State model.** Guest submissions go through `buildRequest()`; enquiries through
`buildEnquiry()`. Request statuses are forward-only with a `stage` field for
department wording (`queued`, `playing`, `played`, `deferred`, `preparing`, …).
Enquiries have their own engine (`enquiryEngine.ts`) because their lifecycle and
actor vocabulary differ from hotel requests. One localStorage key
(`smart-guest-platform:v1`, `STATE_VERSION = 4`) holds requests, enquiries,
**musician accounts** and the demo music rules; the bump to v4 re-seeds older
stored demos with the musician roster, and seed timestamps re-anchor after 14
idle hours. Reset controls (ribbon, kiosk restart, footer) restore the seeded
state. The demo sign-in session lives in a separate key
(`smart-guest-platform:auth`).

**Presenter ribbon.** A discreet, collapsible bar carries the prototype
disclosure, the Guest / Staff / Singer switcher, tablet mode and reset. The
Staff and Singer buttons go straight to their console when you are signed in for
that role, otherwise to `/login`. Layouts compensate via `useRibbonOffset()`.

---

## Design system

- **Palette:** midnight navy (`ink-*`), warm ivory/cream (`ivory-*`, `cream-*`),
  champagne gold (`gold-*`), muted sage (`sage-*`), warm grey (`warm-*`).
  No neon, no decorative gradients, no glassmorphism.
- **Type:** Cormorant Garamond for display, Inter for UI (with system fallbacks).
- **Surfaces:** Guest = ivory + serif + gold, mobile-first; Staff and Singer
  consoles = midnight navy, desktop-first.
- **States:** every screen provides loading/empty/success/validation/error
  treatments (`EmptyState`, `Notice`, `SuccessPanel`, inline field errors).
- **Accessibility:** focus-visible outlines, labelled controls, dialog focus
  handling, `aria-pressed` states, keyboard-operable overlays (Esc to close).

---

## Verification status (this refactor)

- `npx tsc -b` — passes with strict options (`noUnusedLocals`,
  `noUnusedParameters`, `verbatimModuleSyntax`).
- `npm run build` — passes (vendor/icons split into separate chunks; the charts
  chunk is gone with the removed management dashboard).
- Browser end-to-end on the dev server:
  - **Sign-in & guards:** `/staff` and `/musician` with no session redirect to
    `/login`; a wrong password is rejected with an inline error; `staff` /
    `demo1234` lands on `/staff/events`; `aarav` / `demo1234` lands on the singer
    console. **Sign out** returns to `/login` and clears the session.
  - **Singer console:** live queue populated (2 awaiting, 4 queued, on-stage,
    played); **Accept** moves *Tere Bina* into the approved pool; demo rules,
    dedication moderation and the queue controls are present; the rail shows
    **Live music** and **My events** only.
  - **Staff console:** rail shows **Event enquiries + Musicians** (no live music
    section); `/staff/entertainment` redirects to the events desk; the header
    shows the signed-in staff identity with a sign-out control.
  - **Musicians desk:** all four seeded accounts listed with their sign-in
    usernames and upcoming-event counts; creating *Tara Menon* derives the
    username `taramenon` and clears the form; deleting is two-step (Delete →
    Yes, delete) and removes only that account.
  - **Performer assignment:** the events drawer assigns a performer; the event
    then appears under **Singer console → My events** for that musician and not
    for others (CEL-3213 shows for Aarav only).
  - **Read-only for performers:** the musician's event drawer shows the facts,
    special requests, proposed package and status history, but **no** workflow
    buttons, **no** internal notes and **no** proposal controls.
  - **Feature A** and **Feature B** guest journeys, the progress stepper, the
    table-first QR entry (`?loc=…`), the kiosk gate, the demo rules and the
    legacy dashboards by URL were verified in the previous pass and are
    unchanged by this refactor.
  - **No `Taj` / `Santacruz` string anywhere** — confirmed by grep across
    `src/`, `index.html`, `package.json` and the docs, and by `innerText` checks
    on the login, guest, staff and musician screens.
- `public/robots.txt` noindexes the prototype.

See `PROTOTYPE_REPORT.md` for the full report: changed files, retained/hidden
services, limitations and the demo script.
