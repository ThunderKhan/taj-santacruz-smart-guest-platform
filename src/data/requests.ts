import type {
  AppNotification,
  DepartmentId,
  Priority,
  RequestLineItem,
  RequestStage,
  RequestStatus,
  ServiceId,
  ServiceRequest,
  StatusEvent,
} from '@/types';
import { PROPERTY } from '@/data/property';
import { resolveRoute } from '@/services/routing';
import { FIRST_REFERENCE_NUMBER } from '@/services/requestEngine';

/**
 * Realistic first-launch demonstration data, focused on the live music and
 * celebration experiences.
 *
 * Every record is fictional. Room numbers, guest references, staff names,
 * prices and timings exist only to make the prototype presentable.
 */

const MINUTE = 60_000;

export const DEMO_GUEST_REF = 'G-502-8KQ';
export const DEMO_GUEST_NAME = 'Aarohi Desai';

interface SeedSpec {
  ref: string;
  service: ServiceId;
  topic?: string;
  title: string;
  description: string;
  locationId: string;
  location: string;
  guestRef: string;
  /** Latest known age in minutes — also sets updatedAt. */
  minutesAgo: number;
  status: RequestStatus;
  stage?: RequestStage;
  priority?: Priority;
  assignedTo?: string;
  meta?: Record<string, string>;
  lineItems?: RequestLineItem[];
  value?: number;
  guestNote?: string;
  resolutionNote?: string;
  votes?: number;
  guestVoted?: boolean;
  /** Entertainment: dedication held back from the public queue view. */
  dedicationHidden?: boolean;
  /** `[status, minutesAgo, actor, note]` from oldest to newest. */
  history: Array<[RequestStatus, number, string, string?]>;
}

const SPECS: SeedSpec[] = [
  /* ------------------------------- Live music ----------------------------- */
  {
    ref: 'TSH-4732',
    service: 'music',
    title: 'Song request — Kesariya',
    description: 'On stage now, requested from Table 08.',
    locationId: 'table-08',
    location: 'Table 08',
    guestRef: 'G-TBL08-3RD',
    minutesAgo: 10,
    status: 'in_progress',
    stage: 'playing',
    assignedTo: 'Kabir Malhotra',
    votes: 18,
    meta: { Track: 'Kesariya', Artist: 'Arijit Singh', Genre: 'Hindi' },
    history: [
      ['submitted', 10, 'Guest · Table 08'],
      ['accepted', 9, 'Entertainment · Kabir Malhotra'],
      ['in_progress', 3, 'Entertainment · Kabir Malhotra', 'Now playing'],
    ],
  },
  {
    ref: 'TSH-4709',
    service: 'music',
    title: 'Song request — Gerua',
    description: 'Slow romantic request for the 9:15 PM set.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 18,
    status: 'in_progress',
    stage: 'queued',
    assignedTo: 'Nisha Fernandes',
    votes: 12,
    guestVoted: true,
    meta: { Track: 'Gerua', Artist: 'Arijit Singh', Genre: 'Hindi · Slow' },
    history: [
      ['submitted', 18, 'Guest · Room 502'],
      ['accepted', 15, 'Entertainment · Nisha Fernandes', 'Approved for the queue'],
      ['in_progress', 14, 'Entertainment · Nisha Fernandes', 'Added to the vote queue'],
    ],
  },
  {
    ref: 'TSH-4729',
    service: 'music',
    title: 'Song request — Kun Faya Kun',
    description: 'Most-voted request of the evening.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 30,
    status: 'in_progress',
    stage: 'queued',
    assignedTo: 'Nisha Fernandes',
    votes: 21,
    meta: { Track: 'Kun Faya Kun', Artist: 'A.R. Rahman', Genre: 'Sufi' },
    history: [
      ['submitted', 30, 'Guest · Lobby Lounge'],
      ['accepted', 25, 'Entertainment · Nisha Fernandes'],
      ['in_progress', 22, 'Entertainment · Nisha Fernandes', 'Added to the vote queue'],
    ],
  },
  {
    ref: 'TSH-4728',
    service: 'music',
    title: 'Song request with dedication — Channa Mereya',
    description: 'Dedication held back from the public queue view.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 26,
    status: 'in_progress',
    stage: 'queued',
    assignedTo: 'Rohan Bhatt',
    votes: 14,
    guestNote: 'For Rohan — from your sister. Break a leg tonight.',
    dedicationHidden: true,
    meta: { Track: 'Channa Mereya', Artist: 'Arijit Singh', Genre: 'Hindi' },
    history: [
      ['submitted', 26, 'Guest · Lobby Lounge'],
      ['accepted', 23, 'Entertainment · Rohan Bhatt', 'Dedication flagged for review'],
      ['in_progress', 20, 'Entertainment · Rohan Bhatt', 'Added to the vote queue'],
    ],
  },
  {
    ref: 'TSH-4696',
    service: 'music',
    title: 'Song request with dedication — Fly Me to the Moon',
    description: 'Anniversary dedication requested from Room 314.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 20,
    status: 'in_progress',
    stage: 'queued',
    assignedTo: 'Nisha Fernandes',
    votes: 9,
    guestNote: 'For Maya — happy anniversary, from both of us.',
    meta: { Track: 'Fly Me to the Moon', Artist: 'Frank Sinatra', Genre: 'Jazz standard' },
    history: [
      ['submitted', 20, 'Guest · Room 314'],
      ['accepted', 17, 'Entertainment · Nisha Fernandes', 'Dedication approved for the 9:15 PM set'],
      ['in_progress', 15, 'Entertainment · Nisha Fernandes', 'Added to the vote queue'],
    ],
  },
  {
    ref: 'TSH-4724',
    service: 'music',
    title: 'Song request — Shape of You',
    description: 'Approved and waiting for the running order.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 12,
    status: 'accepted',
    assignedTo: 'Kabir Malhotra',
    votes: 2,
    meta: { Track: 'Shape of You', Artist: 'Ed Sheeran', Genre: 'Pop' },
    history: [
      ['submitted', 12, 'Guest · Room 401'],
      ['accepted', 9, 'Entertainment · Kabir Malhotra', 'Approved — joins the queue when the next set opens'],
    ],
  },
  {
    ref: 'TSH-4730',
    service: 'music',
    title: 'Song request — Uptown Funk',
    description: 'Held back for a later, louder set.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 26,
    status: 'accepted',
    stage: 'deferred',
    votes: 3,
    meta: { Track: 'Uptown Funk', Artist: 'Mark Ronson ft. Bruno Mars', Genre: 'Funk pop' },
    history: [
      ['submitted', 26, 'Guest · Lobby Lounge'],
      ['accepted', 24, 'Entertainment · Nisha Fernandes', 'Deferred — held for a later, louder set'],
    ],
  },
  {
    ref: 'TSH-4725',
    service: 'music',
    title: 'Song request — Senorita',
    description: 'Awaiting the performer’s approval.',
    locationId: 'table-08',
    location: 'Table 08',
    guestRef: 'G-TBL08-3RD',
    minutesAgo: 7,
    status: 'submitted',
    votes: 4,
    meta: { Track: 'Senorita', Artist: 'Farhan Akhtar', Genre: 'Hindi · Upbeat' },
    history: [['submitted', 7, 'Guest · Table 08']],
  },
  {
    ref: 'TSH-4727',
    service: 'music',
    title: 'Song request with dedication — Tere Bina',
    description: 'New incoming request with a dedication to review.',
    locationId: 'room-208',
    location: 'Room 208',
    guestRef: 'G-208-5WT',
    minutesAgo: 4,
    status: 'submitted',
    votes: 1,
    guestNote: 'For Ishita — congratulations on the promotion, from all of us.',
    meta: { Track: 'Tere Bina', Artist: 'A.R. Rahman & Chinmayi', Genre: 'Hindi · Slow' },
    history: [['submitted', 4, 'Guest · Room 208']],
  },
  {
    ref: 'TSH-4703',
    service: 'music',
    title: 'Song request — Take Five',
    description: 'Jazz instrumental performed in the opening set.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 52,
    status: 'completed',
    stage: 'played',
    votes: 17,
    meta: { Track: 'Take Five', Artist: 'Dave Brubeck', Genre: 'Jazz instrumental' },
    history: [
      ['submitted', 60, 'Guest · Lobby Lounge'],
      ['accepted', 56, 'Entertainment · Kabir Malhotra'],
      ['in_progress', 55, 'Entertainment · Kabir Malhotra'],
      ['completed', 52, 'Entertainment · Kabir Malhotra', 'Performed in the 8:15 PM set'],
    ],
  },
  {
    ref: 'TSH-4726',
    service: 'music',
    title: 'Song request — Ilahi',
    description: 'Performed in the opening set.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 40,
    status: 'completed',
    stage: 'played',
    votes: 8,
    meta: { Track: 'Ilahi', Artist: 'Arijit Singh', Genre: 'Hindi' },
    history: [
      ['submitted', 40, 'Guest · Room 502'],
      ['accepted', 36, 'Entertainment · Nisha Fernandes'],
      ['in_progress', 33, 'Entertainment · Nisha Fernandes'],
      ['completed', 31, 'Entertainment · Nisha Fernandes', 'Performed in the 8:15 PM set'],
    ],
  },
  {
    ref: 'TSH-4704',
    service: 'music',
    title: 'Song request — Raataan Lambiyan',
    description: 'Anniversary couple’s request, performed earlier.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 66,
    status: 'completed',
    stage: 'played',
    votes: 6,
    meta: { Track: 'Raataan Lambiyan', Artist: 'Jubin Nautiyal', Genre: 'Hindi' },
    history: [
      ['submitted', 74, 'Guest · Room 314'],
      ['accepted', 70, 'Entertainment · Nisha Fernandes'],
      ['in_progress', 69, 'Entertainment · Nisha Fernandes'],
      ['completed', 66, 'Entertainment · Nisha Fernandes', 'Performed in the 8:15 PM set'],
    ],
  },
  {
    ref: 'TSH-4719',
    service: 'music',
    title: 'Song request — Blinding Lights',
    description: 'Polite decline — outside the acoustic set.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 33,
    status: 'rejected',
    votes: 2,
    resolutionNote:
      'Outside the acoustic set — try one of the party mixes from 10 PM, or request another track.',
    meta: { Track: 'Blinding Lights', Artist: 'The Weeknd', Genre: 'Pop' },
    history: [
      ['submitted', 33, 'Guest · Room 502'],
      ['rejected', 28, 'Entertainment · Kabir Malhotra', 'Outside the acoustic set — suggested a party mix later'],
    ],
  },

  /* --------------- Retained queues (hidden, staff-only by URL) -------------- */
  {
    ref: 'TSH-4695',
    service: 'food',
    title: 'In-room dining — supper for two',
    description: 'Late supper order for in-room delivery.',
    locationId: 'room-220',
    location: 'Room 220',
    guestRef: 'G-220-9HB',
    minutesAgo: 14,
    status: 'in_progress',
    stage: 'preparing',
    assignedTo: 'Deepa Rao',
    value: 1890,
    lineItems: [
      { label: 'Butter Chicken', qty: 1, price: 850 },
      { label: 'Garlic Naan', qty: 2, price: 180 },
      { label: 'Masala Chai', qty: 2, price: 190 },
    ],
    history: [
      ['submitted', 14, 'Guest · Room 220'],
      ['accepted', 11, 'Restaurant · Deepa Rao'],
      ['in_progress', 9, 'Restaurant · Deepa Rao', 'Preparing'],
    ],
  },
  {
    ref: 'TSH-4712',
    service: 'food',
    title: 'Table order — 4 covers',
    description: 'Dinner order placed from Table 12.',
    locationId: 'table-12',
    location: 'Table 12',
    guestRef: 'G-TBL12-4QF',
    minutesAgo: 16,
    status: 'accepted',
    assignedTo: 'Imran Shaikh',
    value: 4320,
    lineItems: [
      { label: 'Tandoori Prawns', qty: 2, price: 1350 },
      { label: 'Dal-e-Marina', qty: 1, price: 620 },
      { label: 'Butter Naan', qty: 4, price: 180 },
    ],
    history: [
      ['submitted', 16, 'Guest · Table 12'],
      ['accepted', 13, 'Restaurant · Imran Shaikh'],
    ],
  },
  {
    ref: 'TSH-4698',
    service: 'housekeeping',
    title: 'Toiletries replenishment',
    description: 'Additional toiletries requested through turndown.',
    locationId: 'room-208',
    location: 'Room 208',
    guestRef: 'G-208-5WT',
    minutesAgo: 60,
    status: 'completed',
    assignedTo: 'Anjali Deshmukh',
    history: [
      ['submitted', 66, 'Guest · Room 208'],
      ['accepted', 64, 'Housekeeping · Anjali Deshmukh'],
      ['completed', 60, 'Housekeeping · Anjali Deshmukh', 'Toiletries replenished and bathroom refreshed'],
    ],
  },
  {
    ref: 'TSH-4710',
    service: 'housekeeping',
    title: 'Extra linen & bath towels',
    description: 'Two extra bath towels and a bath mat requested.',
    locationId: 'room-220',
    location: 'Room 220',
    guestRef: 'G-220-9HB',
    minutesAgo: 19,
    status: 'in_progress',
    assignedTo: 'Vaishali Patil',
    history: [
      ['submitted', 19, 'Guest · Room 220'],
      ['accepted', 16, 'Housekeeping · Vaishali Patil'],
      ['in_progress', 12, 'Housekeeping · Vaishali Patil', 'Linen being collected from the linen room'],
    ],
  },
  {
    ref: 'TSH-4713',
    service: 'maintenance',
    title: 'Air conditioning not cooling',
    description: 'AC running but the room stays warm.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 22,
    status: 'submitted',
    priority: 'urgent',
    history: [['submitted', 22, 'Guest · Room 401']],
  },
  {
    ref: 'TSH-4716',
    service: 'maintenance',
    title: 'Bathroom geyser inspection',
    description: 'Geyser temperature fluctuating during showers.',
    locationId: 'room-509',
    location: 'Room 509',
    guestRef: 'G-509-1KJ',
    minutesAgo: 48,
    status: 'in_progress',
    assignedTo: 'Imran Shaikh',
    history: [
      ['submitted', 48, 'Guest · Room 509'],
      ['accepted', 44, 'Maintenance · Imran Shaikh'],
      ['in_progress', 35, 'Maintenance · Imran Shaikh', 'Technician on the way'],
    ],
  },
];

function buildHistory(
  spec: SeedSpec,
  submittedAt: number,
): StatusEvent[] {
  return spec.history.map(([status, minutesAgo, by, note]) => ({
    status,
    at: submittedAt - minutesAgo * MINUTE + spec.minutesAgo * MINUTE,
    by,
    note,
    stage: status === spec.status ? spec.stage : undefined,
  }));
}

function buildSeedRequest(spec: SeedSpec, now: number): ServiceRequest {
  const route = resolveRoute(spec.service, spec.topic);
  const submittedAt = now - spec.minutesAgo * MINUTE;
  const history = buildHistory(spec, submittedAt);
  const updatedAt = history.length ? history[history.length - 1].at : submittedAt;

  return {
    id: `seed_${spec.ref.replace('TSH-', '')}`,
    ref: spec.ref,
    service: spec.service,
    type: route.type,
    department: route.department,
    property: PROPERTY.name,
    locationId: spec.locationId,
    location: spec.location,
    guestRef: spec.guestRef,
    guestLabel: spec.location.startsWith('Room')
      ? spec.location
      : `Guest · ${spec.location}`,
    title: spec.title,
    description: spec.description,
    meta: spec.meta ?? {},
    lineItems: spec.lineItems ?? [],
    priority: spec.priority ?? route.priority,
    status: spec.status,
    stage: spec.stage,
    source: 'qr',
    submittedAt,
    updatedAt,
    assignedTo: spec.assignedTo ?? null,
    history,
    guestNote: spec.guestNote,
    resolutionNote: spec.resolutionNote,
    value: spec.value,
    seeded: true,
    votes: spec.votes ?? 0,
    guestVoted: spec.guestVoted ?? false,
    dedicationHidden: spec.dedicationHidden,
  };
}

export interface SeedState {
  requests: ServiceRequest[];
  sequence: number;
  notifications: AppNotification[];
}

/** Build a complete, internally consistent demo state for a given instant. */
export function buildSeed(now: number): SeedState {
  const requests = SPECS.map((spec) => buildSeedRequest(spec, now)).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const notifications: AppNotification[] = [
    {
      id: 'n-seed-1',
      title: 'New urgent ticket in Room 401',
      body: 'Air conditioning not cooling — awaiting acceptance.',
      at: now - 22 * MINUTE,
      read: false,
      audience: 'staff',
      department: 'maintenance',
      ref: 'TSH-4713',
    },
    {
      id: 'n-seed-2',
      title: 'New song request from Table 08',
      body: '“Senorita” is awaiting your approval.',
      at: now - 7 * MINUTE,
      read: false,
      audience: 'staff',
      department: 'entertainment',
      ref: 'TSH-4725',
    },
    {
      id: 'n-seed-3',
      title: 'TSH-4709 · Queued',
      body: 'Your request for “Gerua” is in the queue — votes move it up.',
      at: now - 14 * MINUTE,
      read: false,
      audience: 'guest',
      guestRef: DEMO_GUEST_REF,
      ref: 'TSH-4709',
    },
    {
      id: 'n-seed-4',
      title: 'New celebration enquiry CEL-3211',
      body: 'Birthday · Banquet hall · DJ',
      at: now - 25 * MINUTE,
      read: false,
      audience: 'staff',
      department: 'events',
      ref: 'CEL-3211',
    },
    {
      id: 'n-seed-5',
      title: 'CEL-3210 · Proposal Sent',
      body: 'A sample package has been proposed for your anniversary enquiry.',
      at: now - 240 * MINUTE,
      read: true,
      audience: 'guest',
      guestRef: DEMO_GUEST_REF,
      ref: 'CEL-3210',
    },
    {
      id: 'n-seed-6',
      title: 'Housekeeping completed TSH-4698',
      body: 'Toiletries replenishment in Room 208 was completed.',
      at: now - 60 * MINUTE,
      read: true,
      audience: 'staff',
      department: 'housekeeping',
      ref: 'TSH-4698',
    },
  ];

  return {
    requests,
    sequence: FIRST_REFERENCE_NUMBER,
    notifications,
  };
}

export const SEED_REFERENCE_COUNT = SPECS.length;

/** Departments represented in the seed — used by admin empty-state logic. */
export const SEED_DEPARTMENTS: DepartmentId[] = Array.from(
  new Set(SPECS.map((spec) => resolveRoute(spec.service, spec.topic).department)),
);
