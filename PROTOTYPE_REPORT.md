# Prototype Status Report

**Live Music Requests & Celebration Music Enquiries**
Unofficial concept demonstration · frontend prototype · October 2026

> Refactored from the original all-services smart-guest prototype to focus on two
> connected experiences: **Live Music Requests** (guest QR page ↔ singer console)
> and **Celebration Music & Entertainment Enquiries** (guest enquiry form ↔ staff
> events desk ↔ assigned performer), with **two demo log-ins** (staff / musician)
> and no hotel-brand naming anywhere.

---

## 1. What was delivered

A high-fidelity, fully interactive frontend prototype of two connected hotel
experiences sharing **one live state** with no refresh anywhere in either flow:

- **Feature A — Live Music Requests.** A guest reaches the music screen by
  scanning the QR code on their **table tent** — the link's `?loc=` value opens
  the page already sitting at that table — then searches the catalogue by
  title/artist/genre or by category (Bollywood, English Pop, Romantic, Jazz,
  Classics, Party Music), requests a track with an optional dedication, and votes
  on the approved queue. A five-step progress indicator
  (`Submitted → Accepted → Queued → Playing → Played`) shows where each request
  stands. A signed-in **musician** works the queue in their own console —
  accepting, deferring or rejecting, managing the running order, moderating
  dedications, marking tracks `Playing → Played`, and adjusting demo rules
  (request limit, voting on/off, pause/resume). Statuses are all
  performer-managed; staff never see this queue.
- **Feature B — Celebration Music & Entertainment Enquiries.** A structured
  enquiry form (occasion, date + start time, duration, guest count, venue,
  entertainment preference, genre, special requests/songs/dedications/
  announcements, notes) returns a `CEL-…` reference and a confirmation that states
  plainly that **an enquiry is not a booking**. Signed-in **staff** list, search
  and filter enquiries (occasion, event date window, entertainment, status), open
  a detail drawer with internal notes, colleague **and performer** assignment,
  sample packages, and advance
  `New → Under Review → Need More Information → Proposal Sent → Confirmed / Closed`
  with full status history visible to the guest. The assigned performer sees the
  event **read-only** in their own console.

> **Disclosure.** Independent concept prototype. Not affiliated with, endorsed by,
> or connected to any hotel brand. No real guest data, payments, bookings,
> availability, PMS, SMS, authentication or AI services are used anywhere. All
> content is fictional sample data persisted to `localStorage`. The staff and
> musician sign-in screens check a demo password in the browser and are not real
> authentication.

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
React Router 7. **`recharts` was removed** with the deleted management
dashboard; no dependencies were added.

---

## 3. Routes

### Guest experience (QR / phone entry, mobile-first)

Entry is **table-first**: the demo session starts at a restaurant or lounge
table (`table-08` by default), and any guest URL accepts `?loc=<table-id>` the
way a scanned table-tent QR would — e.g. `/guest/music?loc=table-12` opens at
Table 12 and clears the parameter. Guest-visible locations are `table-01`,
`table-08`, `table-12`, `lounge-table-04`, `lobby-lounge` and `pool-table-03`;
room records remain in the code only as hidden legacy entries for the archived
service dashboards and appear on no guest or focus staff screen.

| Route | Screen |
| --- | --- |
| `/guest` | Guest home — gold **“Request a song”** CTA, the two focus experiences + shortcut to My requests |
| `/guest/music` | **Feature A** — search first (title/artist/genre + category chips), now playing, your requests with progress steps, approved queue + votes, table QR card, pause/limit/declined notices |
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

### Sign-in (two back-of-house roles)

Guests never sign in — they scan a table QR code. The two consoles are guarded:

| Route | Screen |
| --- | --- |
| `/login` | Two panels — **Staff** (`staff`) and **Musician** (`aarav`, `nisha`, `kabir`, `rohan`, plus accounts staff create). Shared demo password `demo1234`, shown on screen. Wrong password, unknown or disabled accounts are rejected inline. |
| `/staff/*`, `/musician/*` | No session → redirect to `/login`; wrong role → redirected to that role's own console. Session persists in `localStorage` (`smart-guest-platform:auth`). |

### Staff console (signed in as staff, desktop-first dark console)

| Route | Screen |
| --- | --- |
| `/staff` | Redirects to `/staff/events` |
| `/staff/events` | **Events & Banquets** — pipeline list with search + filters, drawer (workflow actions, colleague **and performer** assignment, sample package, internal notes, status history) |
| `/staff/musicians` | **Musicians** — performer accounts: list (role, sign-in username, upcoming-event counts), **add** (name + stage role → derived username), **delete** (two-step confirm) |
| `/staff/:department` | Five **retained legacy dashboards** (restaurant, housekeeping, maintenance, concierge, spa) — still render by URL, hidden from the rail |
| `/staff/entertainment` | Redirects to `/staff/events` — live music is owned by performers, not staff |

### Singer console (signed in as a musician, desktop-first dark console)

| Route | Screen |
| --- | --- |
| `/musician` | Redirects to `/musician/live` |
| `/musician/live` | **Live music requests** — incoming / approved / on hold / on stage / queue (votes) / played history, dedication Hold–Approve, demo rules panel. Staff have no access to this queue. |
| `/musician/events` | **My events** — celebration enquiries assigned to this performer, **read-only** (facts, special requests, proposed package, status history; no workflow controls or internal notes) |

`*` → branded 404 page with links back into the demo (including the sign-in).

---

## 4. The two workflows (as verified in-browser)

### Feature A — guest request → singer console → guest sees it live

1. `/guest/music` → search or pick a category → **Choose** a track → optional
   dedication → **Send request** → reference + success panel.
2. `/login` → sign in as a **musician** (e.g. `aarav` / `demo1234`) →
   **Live music** in the singer console.
3. Incoming row → **Accept** (or **Defer** / **Reject**) → **Add to queue**.
4. Queue row → **Play now** (disabled while another track plays) → on stage →
   **Mark as played**.
5. Back on the guest screen: the same request walks `Submitted → Queued →
   Playing → Played`; My requests, the detail timeline **and the five-step
   progress indicator** agree, no refresh.

Guest-side rule feedback: "requests are paused" notice and disabled sends when the
performer pauses; a request-limit notice at 2 open requests; a declined-requests
notice with each rejection's reason visible in the request detail.

### Feature B — enquiry form → events desk → performer → guest sees it live

1. `/guest/occasions` → complete the form → inline validation on empty submit →
   success shows `CEL-3300` + live status card + "an enquiry is not a booking".
2. `/login` → sign in as **staff** (`staff` / `demo1234`) → `/staff/events` →
   open the drawer → assign a colleague, **assign a performer**, add an internal
   note, attach a sample package, advance `New → Under Review → Proposal Sent`.
3. Sign in as the assigned **musician** → **My events** shows the celebration
   read-only; the desk's internal notes are never visible there.
4. Guest My requests shows `CEL-3300 · Proposal Sent` immediately, with the
   matching workflow timeline; terminal states carry simulation-only wording.

---

## 5. What changed in this refactor

### 5.1 New files

| File | Purpose |
| --- | --- |
| `src/services/enquiryEngine.ts` | Enquiry lifecycle: allowed transitions, actions, labels, next-step hints, `CEL` references, `buildEnquiry` |
| `src/data/celebrations.ts` | Occasion/venue/entertainment/genre/duration options, 5 sample packages, 7 enquiry seeds (CEL-3210…3216), seeded performer assignments |
| `src/data/musicians.ts` | Seeded performer accounts, stage roles, demo credentials (`staff` / `demo1234`), username helpers |
| `src/store/AuthProvider.tsx` | Demo sign-in session for the staff / musician roles (`localStorage`) |
| `src/pages/LoginPage.tsx` | The two-panel staff / musician sign-in screen |
| `src/layouts/MusicianLayout.tsx` | Dark console chrome for the signed-in performer (Live music + My events) |
| `src/features/musician/MusicianEvents.tsx` | Assigned celebrations, read-only, with search and the read-only drawer |
| `src/features/staff/MusiciansDashboard.tsx` | Staff CRUD for performer accounts (list, add, delete) |
| `src/features/guest/CelebrationEnquiry.tsx` | **Feature B** guest form + confirmation (live status, disclaimers) |
| `src/features/entertainment/StageDashboard.tsx` | **Feature A** singer console (live music queue) |
| `src/features/events/EventsDashboard.tsx` | **Feature B** events/banquet dashboard |
| `src/features/events/EnquiryDrawer.tsx` | Enquiry detail: workflow actions, colleague + performer assignment, package, notes, timeline — plus a **read-only mode** reused by the singer console |
| `src/components/RequestSteps.tsx` | Five-step guest progress indicator (compact dots + full stepper, `Declined` treatment) |

### 5.2 Substantially rewritten

| File | Change |
| --- | --- |
| `src/data/requests.ts` | Seeds rewritten: 14 music-focused requests covering all six statuses + deferred + hidden dedication, **all at tables/venues** (demo guest sits at Table 08); 6 retained non-music records (rooms, hidden dashboards); music/events notifications |
| `src/data/property.ts` | **Table-first locations**: `LOCATIONS` rewritten to six tables/venues, rooms retained as `hidden` entries, `GUEST_LOCATIONS`, `DEFAULT_LOCATION_ID = 'table-08'`, `locationFromSearch()` for `?loc=` QR entry |
| `src/data/music.ts` | 6-category `SONG_CATEGORIES`, ~49-song `SONG_CATALOGUE`, `DEFAULT_MUSIC_RULES` |
| `src/features/guest/MusicRequests.tsx` | **Search-first order** (search + categories directly under Now playing), table chip in the header, table-aware QR card (`/guest/music?loc=…`), compact progress steps in "Your requests", rules notices, dedication moderation markers, declined feedback |
| `src/features/guest/ServiceCatalogue.tsx` | Two focus cards + standalone "My requests" tile (old catalogue retained in data) |
| `src/App.tsx` | Focus-only guest routes, alias, **`RequireRole` guard**, staff routes (events + musicians, `/staff/entertainment` → events), musician routes (live + events), `/login`; management routes removed |
| `src/store/RequestsProvider.tsx` | `STATE_VERSION = 4` (re-seeds older demos with the musician roster); reads `?loc=` on load to set the scanned table and clears the parameter; slices: enquiries, **musicians**, demo music rules; actions for enquiries + **musician CRUD** + **performer assignment** (`createMusician`, `deleteMusician`, `assignMusician`) with notifications; `setStage`, `setDedicationHidden`, `setLocation` restricted to guest locations |
| `src/layouts/StaffLayout.tsx` | Rewritten for the signed-in staff role: rail = **Event enquiries + Musicians** (live music removed), signed-in identity + **sign-out** in the header |
| `src/features/events/EnquiryDrawer.tsx` | Added **performer assignment** control (staff mode) and a **`readOnly` mode** used by the singer console (no workflow buttons, no internal notes, no proposal controls) |
| `src/components/PrototypeRibbon.tsx` | Switcher = Guest / **Staff** / **Singer** (management removed); Staff and Singer go to their console when signed in for that role, otherwise to `/login`; role-aware last-visited paths |

### 5.3 Adapted (shared components/layouts touched)

| File | Change |
| --- | --- |
| `src/types/index.ts` | `DepartmentId` + `events`; `RequestStage` + `deferred`; `SongCategory`; `dedicationHidden`; enquiry types (+ `assignedMusicianId` / `assignedMusician`); **`Musician`**; `MusicRules` |
| `src/services/requestEngine.ts` | Music-aware `statusLabel` (Queued/Playing/Deferred/Rejected/Played) + next-step wording |
| `src/services/enquiryEngine.ts` | `buildEnquiry` initialises the performer-assignment fields |
| `src/services/routing.ts` | Occasions rule → `events` department |
| `src/data/services.ts` | Music/occasions titles focused; `FOCUS_SERVICES`, `FOCUS_SERVICE_IDS` |
| `src/data/departments.ts` | Entertainment renamed "Live Music Desk"; new `events` entry; `FOCUS_DEPARTMENTS` reduced to `events` (the staff rail now lists desks explicitly) |
| `src/data/celebrations.ts` | Seeds assign performers (CEL-3210 → Nisha, 3212 → Rohan, 3213 → Aarav, 3214 → Kabir) |
| `src/data/property.ts` | Brand-neutral: `PROPERTY.name = 'Live Music & Celebrations'`, generic descriptor and disclosure (no hotel name) |
| `src/features/departments/departmentMeta.ts` | Events icon/hero/accents/short labels |
| `src/components/ui/Badge.tsx` | `EnquiryStatusBadge` |
| `src/components/ui/Timeline.tsx` | `EnquiryTimeline` |
| `src/components/ui/Field.tsx` | `SelectInput` gained a `dark` variant (staff dashboards) |
| `src/components/ui/Feedback.tsx` | `SuccessPanel` gained optional `eyebrow` |
| `src/layouts/GuestLayout.tsx` | Nav "Home / My requests"; footer Experiences column; mobile header cluster now shrinks instead of overflowing narrow phones; brand-neutral footer |
| `src/components/LocationSwitcher.tsx` | Table/venue-only list (`GUEST_LOCATIONS`), "Your table or venue" wording, shrinkable chip |
| `src/layouts/KioskLayout.tsx`, `src/features/kiosk/*` | Copy + focus gate (`FOCUS_SERVICE_IDS`); brand-neutral |
| `src/hooks/useActiveDepartment.ts` | Default → `events` |
| `src/pages/NotFound.tsx` | Copy + links updated: management link replaced by **staff & singer sign-in** |
| `src/components/Brand.tsx` | Wordmark now renders `PROPERTY.name` (brand-neutral) |
| `src/features/guest/{MyRequests,RequestDetail,GuestHome,ServiceShell}.tsx` | Enquiry section; cancel action **removed**; focus copy; full progress stepper on music request details; gold "Request a song" hero CTA; `LocationControl` in the music page header; request detail points musicians at the **singer console** |
| `src/main.tsx` | `AuthProvider` wraps the app |
| `src/utils/format.ts` | `isoDateLabel` helper |

### 5.4 Deleted (what the requirements superseded)

- `src/features/guest/OccasionRequests.tsx` — replaced by `CelebrationEnquiry.tsx`.
- `src/layouts/AdminLayout.tsx` and `src/features/admin/` — the hotel
  management panel was removed at the client's request (route, ribbon entry,
  links and module). Git history retains them.
- The `recharts` dependency — its only consumer was the deleted admin panel.

### 5.5 Retained but hidden from the journeys

| Surface | Retained | How to reach it |
| --- | --- | --- |
| Guest service forms: food/room-service, housekeeping, maintenance, concierge, spa, transport, reservations, feedback, billing | ✅ modules + data unchanged | by URL only (`/guest/spa`, …) — removed from home, catalogue, footer, kiosk |
| Staff dashboards: restaurant, housekeeping, maintenance, concierge, spa | ✅ routes + panels unchanged | by URL only (`/staff/housekeeping`, …) — hidden from the rail |
| `SERVICES`, routing rules (13), menu/spa/etc. data, `OCCASION_PACKAGES` | ✅ kept for reuse | internal data layer |
| Presenter ribbon, kiosk, 404 | ✅ | ribbon, `/kiosk`, `*` |
| Restaurant/housekeeping/maintenance seeds (6 records) | ✅ | keep the hidden dashboards populated |

Nothing else was deleted: no duplicate components were introduced and no new
dependencies were added (`recharts` was removed with the admin panel it served).

---

## 6. Working / simulated / future integration

| Capability | State |
| --- | --- |
| Both workflows, guest ↔ performer ↔ staff, shared live state, localStorage (v4), reset controls | **Working** (frontend-only demo) |
| Two demo log-ins (staff / musician), role-guarded consoles, musician CRUD, performer assignment, read-only performer view | **Working** (browser-only session, **not** authentication) |
| Search, categories, voting, request limits, pause, dedication moderation, workflow transitions, assignment, internal notes, sample packages, filters | **Working** (on shared local state) |
| Table-tent QR entry (`?loc=<table-id>` sets the session table) | **Working** (frontend simulation — no external encoder, no guest identity) |
| QR entry points | **Simulated** — illustrative QR codes that open this local prototype (no external encoder) |
| Sign-in | **Simulated only** — the demo password is checked in the browser; no server, no hashing, no real identity. Every console says so. |
| Availability, pricing, quotations, booking confirmation | **Never claimed** — packages are sample data with indicative INR figures; no availability UI exists anywhere |
| Audio playback / licensed song content | **Not present** — song metadata only, stated on the guest page |
| Production backend, payments, PMS/channel integrations, SMS/email/push, real data, API keys, AI services | **Out of scope** — future production integration phase |
| Real authentication, role-based permissions, server-side authorization | **Out of scope** — required before any production use |

---

## 7. Verification results

| Check | Result |
| --- | --- |
| `npx tsc -b` | ✅ passes (strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`) |
| `npm run build` | ✅ passes — CSS ~72 kB, app/vendor/icons chunked (charts chunk removed with the admin panel) |
| Sign-in guards | ✅ `/staff` and `/musician` with no session redirect to `/login`; wrong password rejected inline; `staff` / `demo1234` → `/staff/events`; `aarav` / `demo1234` → singer console; sign-out returns to `/login` |
| Singer console | ✅ live queue populated; **Accept** moves *Tere Bina* into the approved pool; demo rules + dedication moderation present; rail shows **Live music + My events** only |
| Staff console | ✅ rail shows **Event enquiries + Musicians** (no live music); `/staff/entertainment` redirects to the events desk; header shows the signed-in staff identity with sign-out |
| Musicians desk | ✅ 4 seeded accounts with usernames + upcoming-event counts; creating *Tara Menon* derives `taramenon` and clears the form; delete is two-step and removes only that account |
| Performer assignment + read-only | ✅ assigning a performer surfaces the event under **that** musician's **My events** (CEL-3213 → Aarav only); the musician's drawer shows facts, special requests, proposed package and status history but **no** workflow buttons, internal notes or proposal controls |
| Feature A end-to-end | ✅ request → Accept → Add to queue → Play now (disabled while occupied) → Mark as played → guest sees `Played`, no refresh |
| Feature B end-to-end | ✅ validation (7 field errors on empty submit) → `CEL-3300` + disclaimers → drawer assignment/note/package → `New → Under Review → Proposal Sent` → guest sees it live |
| Guest cannot change statuses | ✅ request detail has no cancel/accept controls; states statuses belong to performers |
| Demo rules | ✅ pausing on the singer console blocks guest sends with an on-page notice; request limit enforced; voting toggles |
| Kiosk focus gate | ✅ `/kiosk/housekeeping` → "Service not available"; `/kiosk/occasions` renders the form |
| Retained dashboards | ✅ `/staff/housekeeping` renders while the rail shows only the two staff desks |
| `/staff` redirect | ✅ lands on the events desk |
| Brand removal | ✅ **no `Taj` / `Santacruz` string anywhere** — grep across `src/`, `index.html`, `package.json` and both docs; `innerText` checks on the login, guest, staff and musician screens |
| Management panel removed | ✅ `/admin` no longer routes; the ribbon, the 404 page and the code carry no management entry |
| Horizontal overflow @ 390 px (mobile) | ✅ none on `/guest`, `/guest/music`, `/guest/occasions`, `/guest/my-requests`, `/guest/my-requests/:ref`, `/staff/events`, `/kiosk/housekeeping` |
| Design tokens | ✅ Cormorant Garamond display + Inter UI, ivory `rgb(252,250,246)` / ink palette intact |
| `robots.txt` | ✅ present, noindexes the prototype |

Limitations / known gaps are listed in §6: this is a frontend demo; the consoles
are desktop-first (not optimised for phone widths beyond avoiding overflow); the
sign-in is a demo convenience, not security; no automated test suite exists —
verification was manual browser E2E plus strict type-checking and production
build.

---

## 8. Demo script (5 minutes)

1. Open `/guest` (or scan the table QR — `…/guest?loc=table-08`) → gold
   **Request a song** button + two cards: **Live music tonight** and **Plan a
   celebration**.
2. `/guest/music` → the search box is right under Now playing → pick category
   **Jazz** → search "Fly" → Choose → add a dedication → Send → note the
   reference.
3. Ribbon → **Singer** → you land on `/login` → sign in as `aarav` / `demo1234`
   → **Live music** → Accept → Add to queue → (if the stage is busy, Mark as
   played first) → Play now → Mark as played.
4. Ribbon → **Guest** → My requests → the same request now reads **Played**, with
   every step of the progress indicator filled.
5. `/guest/occasions` → fill a birthday at the Banquet hall → send → note the
   `CEL-…` reference and the "not a booking" confirmation.
6. Ribbon → **Staff** → sign in as `staff` / `demo1234` → **Events & Banquets**
   → open the enquiry → assign a colleague **and a performer** → add a note,
   attach a sample package → Under Review → Proposal Sent.
7. Ribbon → **Singer** (still signed in as `aarav`) → **My events** → the
   celebration appears **read-only** with its status and requested music.
8. Back to the guest → My requests → the enquiry reads **Proposal Sent** live.
9. **Musicians** desk → add a new performer and note the derived sign-in
   username; delete it again (two-step).
10. Sign out (header) → the consoles return to `/login`. Reset (ribbon) to
    restore the seeded data for the next run.
