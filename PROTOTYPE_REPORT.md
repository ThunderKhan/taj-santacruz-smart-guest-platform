# Prototype Status Report

**Live Music Requests & Celebration Music Enquiries — Taj Santacruz, Mumbai**
Unofficial concept demonstration · frontend prototype · October 2026

> Refactored from the original all-services smart-guest prototype to focus on two
> connected experiences: **Live Music Requests** (guest QR page ↔ performer/DJ
> dashboard) and **Celebration Music & Entertainment Enquiries** (guest enquiry
> form ↔ events/banquet dashboard).

---

## 1. What was delivered

A high-fidelity, fully interactive frontend prototype of two connected hotel
experiences sharing **one live state** with no refresh anywhere in either flow:

- **Feature A — Live Music Requests.** A guest reaches the music screen from a
  venue QR card, searches the catalogue by title/artist/genre or by category
  (Bollywood, English Pop, Romantic, Jazz, Classics, Party Music), requests a
  track with an optional dedication, and votes on the approved queue. The
  performer/DJ console accepts, defers or rejects, manages the running order,
  moderates dedications, marks tracks `Playing → Played`, and adjusts demo rules
  (request limit, voting on/off, pause/resume). Statuses are `Submitted`,
  `Accepted` (+`Deferred`), `Queued`, `Playing`, `Played`, `Rejected` — all
  staff-managed.
- **Feature B — Celebration Music & Entertainment Enquiries.** A structured
  enquiry form (occasion, date + start time, duration, guest count, venue,
  entertainment preference, genre, special requests/songs/dedications/
  announcements, notes) returns a `CEL-…` reference and a confirmation that states
  plainly that **an enquiry is not a booking**. The Events & Banquets dashboard
  lists, searches and filters enquiries (occasion, event date window,
  entertainment, status), opens a detail drawer with internal notes, staff
  assignment, sample packages, and advances
  `New → Under Review → Need More Information → Proposal Sent → Confirmed / Closed`
  with full status history visible to the guest.

> **Disclosure.** Independent concept prototype. Not affiliated with, endorsed by,
> or connected to Taj Hotels / Indian Hotels Company Limited. No real guest data,
> payments, bookings, availability, PMS, SMS, authentication or AI services are
> used anywhere. All content is fictional sample data persisted to `localStorage`.

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
Recharts · React Router 7. **No dependencies were added or removed in this refactor.**

---

## 3. Routes

### Guest experience (QR / phone entry, mobile-first)

| Route | Screen |
| --- | --- |
| `/guest` | Guest home — the two focus experiences + shortcut to My requests |
| `/guest/music` | **Feature A** — categories, search, now playing, approved queue + votes, QR venue card, your-requests status strip, pause/limit/declined notices |
| `/guest/occasions` | **Feature B** — celebration enquiry form (alias `/guest/celebration` redirects here) |
| `/guest/my-requests` | This session's song requests **and** celebration enquiries with live statuses |
| `/guest/my-requests/:ref` | Full timeline, read-only (guests cannot change statuses) |

### Hotel tablet / kiosk

| Route | Screen |
| --- | --- |
| `/kiosk` | Tablet home — same two experiences, large touch targets |
| `/kiosk/music`, `/kiosk/occasions` | Same guest modules in tablet chrome |
| `/kiosk/:service` | Any other service → "Service not available" (focus gate) |
| `/kiosk/my-requests[/:ref]` | Tablet-mode request list / timeline |

### Staff dashboards (desktop-first, dark console)

| Route | Screen |
| --- | --- |
| `/staff` | Redirects to `/staff/entertainment` |
| `/staff/entertainment` | **Live Music Desk** — incoming / approved / deferred / on stage / queue (votes) / played history, dedication Hold–Approve, demo rules panel |
| `/staff/events` | **Events & Banquets** — pipeline list with search + filters, drawer (workflow actions, assignment, sample package, internal notes, status history) |
| `/staff/:department` | Five **retained legacy dashboards** (restaurant, housekeeping, maintenance, concierge, spa) — still render by URL, hidden from the nav rail |

### Management

| Route | Screen |
| --- | --- |
| `/admin` | Live KPIs, status mix, department charts, sample-history series, insights, scoreboard |

`*` → branded 404 page with links back into the demo.

---

## 4. The two workflows (as verified in-browser)

### Feature A — guest request → performer console → guest sees it live

1. `/guest/music` → search or pick a category → **Choose** a track → optional
   dedication → **Send request** → reference + success panel.
2. Presenter ribbon → **Staff dashboards** (`/staff/entertainment`).
3. Incoming row → **Accept** (or **Defer** / **Reject**) → **Add to queue**.
4. Queue row → **Play now** (disabled while another track plays) → on stage →
   **Mark as played**.
5. Back on the guest screen: the same request walks `Submitted → Queued →
   Playing → Played`; My requests and the detail timeline agree, no refresh.

Guest-side rule feedback: "requests are paused" notice and disabled sends when the
performer pauses; a request-limit notice at 2 open requests; a declined-requests
notice with each rejection's reason visible in the request detail.

### Feature B — enquiry form → events desk → guest sees it live

1. `/guest/occasions` → complete the form → inline validation on empty submit →
   success shows `CEL-3300` + live status card + "an enquiry is not a booking".
2. `/staff/events` → open the drawer → assign, add an internal note, attach a
   sample package, advance `New → Under Review → Proposal Sent`.
3. Guest My requests shows `CEL-3300 · Proposal Sent` immediately, with the
   matching workflow timeline; terminal states carry simulation-only wording.

---

## 5. What changed in this refactor

### 5.1 New files

| File | Purpose |
| --- | --- |
| `src/services/enquiryEngine.ts` | Enquiry lifecycle: allowed transitions, actions, labels, next-step hints, `CEL` references, `buildEnquiry` |
| `src/data/celebrations.ts` | Occasion/venue/entertainment/genre/duration options, 5 sample packages, 7 enquiry seeds (CEL-3210…3216) |
| `src/features/guest/CelebrationEnquiry.tsx` | **Feature B** guest form + confirmation (live status, disclaimers) |
| `src/features/entertainment/StageDashboard.tsx` | **Feature A** performer/DJ console |
| `src/features/events/EventsDashboard.tsx` | **Feature B** events/banquet dashboard |
| `src/features/events/EnquiryDrawer.tsx` | Enquiry detail: workflow actions, assignment, package, notes, timeline |

### 5.2 Substantially rewritten

| File | Change |
| --- | --- |
| `src/data/requests.ts` | Seeds rewritten: 14 music-focused requests covering all six statuses + deferred + hidden dedication + demo-guest Queued/Played/Rejected; 6 retained non-music records for the hidden dashboards; music/events notifications |
| `src/data/music.ts` | 6-category `SONG_CATEGORIES`, ~49-song `SONG_CATALOGUE`, `DEFAULT_MUSIC_RULES` |
| `src/features/guest/MusicRequests.tsx` | Categories, search, rules notices, status strip, QR card, dedication moderation markers, declined feedback |
| `src/features/guest/ServiceCatalogue.tsx` | Two focus cards + standalone "My requests" tile (old catalogue retained in data) |
| `src/App.tsx` | Focus-only guest routes, alias, two static staff routes, `/staff` → entertainment |
| `src/store/RequestsProvider.tsx` | `STATE_VERSION = 2`; new slice: enquiries, demo music rules, enquiry sequence; 8 new actions (create/status/note/assign/proposal/stage/dedication/music-rules) with notifications; `setStage`, `setDedicationHidden` |

### 5.3 Adapted (shared components/layouts touched)

| File | Change |
| --- | --- |
| `src/types/index.ts` | `DepartmentId` + `events`; `RequestStage` + `deferred`; `SongCategory`; `dedicationHidden`; enquiry types; `MusicRules` |
| `src/services/requestEngine.ts` | Music-aware `statusLabel` (Queued/Playing/Deferred/Rejected/Played) + next-step wording |
| `src/services/routing.ts` | Occasions rule → `events` department |
| `src/data/services.ts` | Music/occasions titles focused; `FOCUS_SERVICES`, `FOCUS_SERVICE_IDS` |
| `src/data/departments.ts` | Entertainment renamed "Live Music Desk"; new `events` entry; `FOCUS_DEPARTMENTS` |
| `src/features/departments/departmentMeta.ts` | Events icon/hero/accents/short labels |
| `src/components/ui/Badge.tsx` | `EnquiryStatusBadge` |
| `src/components/ui/Timeline.tsx` | `EnquiryTimeline` |
| `src/components/ui/Field.tsx` | `SelectInput` gained a `dark` variant (staff dashboards) |
| `src/components/ui/Feedback.tsx` | `SuccessPanel` gained optional `eyebrow` |
| `src/layouts/StaffLayout.tsx` | Rail shows the two focus desks; open-count includes open enquiries |
| `src/layouts/GuestLayout.tsx` | Nav "Home / My requests"; footer Experiences column |
| `src/layouts/KioskLayout.tsx`, `src/features/kiosk/*` | Copy + focus gate (`FOCUS_SERVICE_IDS`) |
| `src/hooks/useActiveDepartment.ts` | Default → `entertainment` |
| `src/components/PrototypeRibbon.tsx` | Ops path → staff dashboards; focus copy |
| `src/features/admin/AdminDashboard.tsx` | Legend `Declined → Rejected` |
| `src/features/guest/{MyRequests,RequestDetail,GuestHome,ServiceShell}.tsx` | Enquiry section; cancel action **removed**; focus copy |
| `src/utils/format.ts` | `isoDateLabel` helper |

### 5.4 Deleted (only what the plan superseded)

- `src/features/guest/OccasionRequests.tsx` — replaced by `CelebrationEnquiry.tsx`.

### 5.5 Retained but hidden from the journeys

| Surface | Retained | How to reach it |
| --- | --- | --- |
| Guest service forms: food/room-service, housekeeping, maintenance, concierge, spa, transport, reservations, feedback, billing | ✅ modules + data unchanged | by URL only (`/guest/spa`, …) — removed from home, catalogue, footer, kiosk |
| Staff dashboards: restaurant, housekeeping, maintenance, concierge, spa | ✅ routes + panels unchanged | by URL only (`/staff/housekeeping`, …) — hidden from the nav rail |
| `SERVICES`, routing rules (13), menu/spa/etc. data, `OCCASION_PACKAGES` | ✅ kept for reuse | internal data layer |
| Admin dashboard, presenter ribbon, kiosk, 404 | ✅ | `/admin`, ribbon, `/kiosk` |
| Restaurant/housekeeping/maintenance seeds (6 records) | ✅ | keep the hidden dashboards populated |

Nothing else was deleted: no duplicate components were introduced and no new
dependencies were added.

---

## 6. Working / simulated / future integration

| Capability | State |
| --- | --- |
| Both workflows, guest ↔ staff, shared live state, localStorage (v2), reset controls | **Working** (frontend-only demo) |
| Search, categories, voting, request limits, pause, dedication moderation, workflow transitions, assignment, internal notes, sample packages, filters | **Working** (on shared local state) |
| QR entry points | **Simulated** — illustrative QR codes that open this local prototype (no external encoder) |
| Staff access control | **Simulated only** — no authentication/authorization exists; every staff screen says so |
| Availability, pricing, quotations, booking confirmation | **Never claimed** — packages are sample data with indicative INR figures; no availability UI exists anywhere |
| Audio playback / licensed song content | **Not present** — song metadata only, stated on the guest page |
| Production backend, payments, PMS/channel integrations, SMS/email/push, real data, API keys, AI services | **Out of scope** — future production integration phase |
| Real authentication, role-based permissions, server-side authorization | **Out of scope** — required before any production use |

---

## 7. Verification results

| Check | Result |
| --- | --- |
| `npx tsc -b` | ✅ passes (strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`) |
| `npm run build` | ✅ passes — CSS ~71 kB, app/vendor/charts/icons chunked |
| Feature A end-to-end | ✅ request (TSH-4800) → Accept → Add to queue → Play now (disabled while occupied) → Mark as played → guest sees `Played`, no refresh |
| Feature B end-to-end | ✅ validation (7 field errors on empty submit) → `CEL-3300` + disclaimers → drawer assignment/note/package → `New → Under Review → Proposal Sent` → guest sees it live |
| Guest cannot change statuses | ✅ request detail has no cancel/accept controls; states statuses belong to staff |
| Demo rules | ✅ pausing on the stage desk blocks guest sends with an on-page notice; request limit enforced; voting toggles |
| Kiosk focus gate | ✅ `/kiosk/housekeeping` → "Service not available"; `/kiosk/occasions` renders the form |
| Retained dashboards | ✅ `/staff/housekeeping` renders while the rail shows only the two focus desks |
| `/staff` redirect | ✅ lands on Live Music Desk |
| Guest home / kiosk home focus | ✅ only the two experiences + My requests; no stray service links |
| Admin legend | ✅ `Rejected` (was `Declined`); 19 Recharts surfaces render |
| Horizontal overflow @ 800 px | ✅ none on `/guest`, `/guest/music`, `/guest/occasions`, `/guest/my-requests`, `/staff/entertainment`, `/staff/events` |
| Design tokens | ✅ Cormorant Garamond display + Inter UI, ivory `rgb(252,250,246)` / ink palette intact |
| `robots.txt` | ✅ present, noindexes the prototype |

Limitations / known gaps are listed in §6: this is a frontend demo; dashboards
are desktop-first (staff screens are not optimised for phone widths beyond
avoiding overflow); no automated test suite exists — verification was manual
browser E2E plus strict type-checking and production build.

---

## 8. Demo script (5 minutes)

1. Open `/guest` → two cards: **Live music tonight** and **Plan a celebration**.
2. `/guest/music` → pick category **Jazz** → search "Fly" → Choose → add a
   dedication → Send → note the reference.
3. Ribbon → **Staff dashboards** → Live Music Desk → Accept → Add to queue →
   (if the stage is busy, Mark as played first) → Play now → Mark as played.
4. Back to **Guest** → My requests → the same request now reads **Played**.
5. `/guest/occasions` → fill a birthday at the Banquet hall → send → note the
   `CEL-…` reference and the "not a booking" confirmation.
6. **Staff dashboards → Events & Banquets** → open the enquiry → assign,
   add a note, attach a sample package → Under Review → Proposal Sent.
7. Back to the guest → My requests → the enquiry reads **Proposal Sent** live.
8. Reset (ribbon) to restore the seeded data for the next run.
