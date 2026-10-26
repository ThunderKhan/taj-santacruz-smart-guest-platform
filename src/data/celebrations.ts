import type { CelebrationEnquiry, EnquiryEvent, EnquiryNote, EnquiryStatus } from '@/types';
import { DEMO_GUEST_REF } from '@/data/requests';

/**
 * Celebration music & entertainment enquiry sample data.
 *
 * Every record, package and price is fictional and exists only to demonstrate
 * the enquiry workflow. Nothing here reflects real Taj availability, pricing or
 * confirmed bookings.
 */

const MINUTE = 60_000;
const DAY = 86_400_000;

/* -------------------------------------------------------------------------- */
/* Form options                                                               */
/* -------------------------------------------------------------------------- */

export const OCCASION_TYPES = [
  'Birthday',
  'Anniversary',
  'Engagement',
  'Private party',
  'Corporate event',
  'Other celebration',
] as const;

export const EVENT_VENUES = [
  'All Day Dining — restaurant',
  'Banquet hall',
  'Private dining room',
  'Lobby Lounge',
  'Poolside lawn',
] as const;

export const ENTERTAINMENT_TYPES = [
  'Live singer',
  'Live band',
  'DJ',
  'Instrumental music',
  'Background music',
] as const;

export const EVENT_GENRES = [
  'Bollywood',
  'English pop',
  'Romantic',
  'Jazz',
  'Classics',
  'Party music',
  'Indo-western fusion',
  'Acoustic & chill',
] as const;

export const DURATION_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Approx. 1 hour' },
  { value: 1.5, label: 'Approx. 1.5 hours' },
  { value: 2, label: 'Approx. 2 hours' },
  { value: 2.5, label: 'Approx. 2.5 hours' },
  { value: 3, label: 'Approx. 3 hours' },
  { value: 4, label: '4 hours or more' },
];

/* -------------------------------------------------------------------------- */
/* Sample event packages                                                      */
/* -------------------------------------------------------------------------- */

export interface EventPackage {
  id: string;
  name: string;
  entertainment: string;
  duration: string;
  /** Illustrative price in INR — sample data only, not a quotation. */
  indicative: number;
  includes: string[];
}

export const EVENT_PACKAGES: EventPackage[] = [
  {
    id: 'pkg-vocalist',
    name: 'Solo Vocalist · Warm Acoustic Set',
    entertainment: 'Live singer',
    duration: '90 minutes',
    indicative: 35000,
    includes: [
      'One vocalist with backing tracks',
      'Two 40-minute sets',
      'Up to 12 songs chosen in advance',
    ],
  },
  {
    id: 'pkg-band-five',
    name: 'Five-Piece Celebration Band',
    entertainment: 'Live band',
    duration: '2 hours',
    indicative: 125000,
    includes: [
      'Vocals, guitar, keys, bass and drums',
      'Two 50-minute sets with a break',
      'Dedicated sound engineer',
    ],
  },
  {
    id: 'pkg-dj-night',
    name: 'DJ & Dance Floor',
    entertainment: 'DJ',
    duration: '3 hours',
    indicative: 65000,
    includes: [
      'Resident DJ with a pre-agreed set list',
      'Dance-floor lighting',
      'Microphone for announcements',
    ],
  },
  {
    id: 'pkg-instrumental-duo',
    name: 'Instrumental Duo · Sitar & Flute',
    entertainment: 'Instrumental music',
    duration: '60 minutes',
    indicative: 28000,
    includes: [
      'Two instrumentalists',
      'Cocktail-hour background repertoire',
      'Self-contained amplification',
    ],
  },
  {
    id: 'pkg-background',
    name: 'Background Piano & Strings',
    entertainment: 'Background music',
    duration: 'Per hour',
    indicative: 12000,
    includes: [
      'Solo pianist with optional violin',
      'Low-volume dinner repertoire',
      'Hourly billing with a two-hour minimum',
    ],
  },
];

/** Label stored on an enquiry when a package is proposed. */
export function packageLabel(id: string): string {
  const pack = EVENT_PACKAGES.find((entry) => entry.id === id);
  return pack ? `${pack.name} · ${pack.duration} · indicative ${pack.indicative}` : id;
}

/* -------------------------------------------------------------------------- */
/* Seeded enquiries                                                           */
/* -------------------------------------------------------------------------- */

interface EnquirySeedSpec {
  ref: string;
  occasion: string;
  /** Event date, days from today. */
  daysAhead: number;
  startTime: string;
  durationHours: number;
  guests: number;
  venue: string;
  entertainment: string;
  genre: string;
  specialRequests?: string;
  notes?: string;
  locationId: string;
  location: string;
  guestRef: string;
  minutesAgo: number;
  status: EnquiryStatus;
  assignedTo?: string;
  proposedPackage?: string;
  /** `[status, absoluteMinutesAgo, actor, note]` from oldest to newest. */
  history: Array<[EnquiryStatus, number, string, string?]>;
  internalNotes?: Array<[number, string, string]>;
}

function isoDay(now: number, daysAhead: number): string {
  const date = new Date(now + daysAhead * DAY);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const SPECS: EnquirySeedSpec[] = [
  {
    ref: 'CEL-3210',
    occasion: 'Anniversary',
    daysAhead: 21,
    startTime: '20:00',
    durationHours: 2.5,
    guests: 24,
    venue: 'Private dining room',
    entertainment: 'Live singer',
    genre: 'Romantic',
    specialRequests:
      'Our first-dance song is “Tum Hi Ho”. A short anniversary announcement before dessert would mean a lot.',
    notes: 'One guest is vegetarian — no onion or garlic at the table, please.',
    locationId: 'table-08',
    location: 'Table 08',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 1800,
    status: 'proposal_sent',
    assignedTo: 'Sanya Kapoor',
    proposedPackage: packageLabel('pkg-vocalist'),
    history: [
      ['new', 1800, 'Guest · Table 08', 'Enquiry received — not a confirmed booking'],
      ['under_review', 1700, 'Events desk · Sanya Kapoor', 'Checked the private dining layout for 24 guests'],
      ['proposal_sent', 240, 'Events desk · Sanya Kapoor', 'Sample package shared for consideration'],
    ],
    internalNotes: [
      [
        250,
        'Sanya Kapoor',
        'Private dining seats 24 comfortably — confirm whether the adjoining lounge can open for overflow before promising a band.',
      ],
    ],
  },
  {
    ref: 'CEL-3211',
    occasion: 'Birthday',
    daysAhead: 9,
    startTime: '19:30',
    durationHours: 3,
    guests: 60,
    venue: 'Banquet hall',
    entertainment: 'DJ',
    genre: 'Party music',
    specialRequests: 'A brief birthday announcement around 10 PM, and a Bollywood-to-English mix.',
    locationId: 'table-12',
    location: 'Table 12',
    guestRef: 'G-TBL12-4XA',
    minutesAgo: 25,
    status: 'new',
    history: [['new', 25, 'Guest · Table 12', 'Enquiry received — not a confirmed booking']],
  },
  {
    ref: 'CEL-3212',
    occasion: 'Corporate event',
    daysAhead: 34,
    startTime: '18:00',
    durationHours: 4,
    guests: 150,
    venue: 'Banquet hall',
    entertainment: 'Background music',
    genre: 'Classics',
    specialRequests:
      'Cocktail hour followed by a short awards segment — background music must stay low during speeches.',
    notes: 'Company branding will be supplied by our events co-ordinator.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 240,
    status: 'under_review',
    assignedTo: 'Devika Rao',
    history: [
      ['new', 240, 'Guest · Lobby Lounge', 'Enquiry received — not a confirmed booking'],
      ['under_review', 200, 'Events desk · Devika Rao', 'Reviewing banquet capacity and AV requirements'],
    ],
    internalNotes: [
      [195, 'Devika Rao', '150 pax with a stage — check AV package availability with banquet ops.'],
    ],
  },
  {
    ref: 'CEL-3213',
    occasion: 'Engagement',
    daysAhead: 14,
    startTime: '20:30',
    durationHours: 2,
    guests: 40,
    venue: 'Lobby Lounge',
    entertainment: 'Live band',
    genre: 'Bollywood',
    specialRequests: 'Ring ceremony at 8:30 PM sharp — the band should build from soft to upbeat right after.',
    locationId: 'table-01',
    location: 'Table 01',
    guestRef: 'G-TBL01-5WT',
    minutesAgo: 480,
    status: 'needs_info',
    assignedTo: 'Sanya Kapoor',
    history: [
      ['new', 480, 'Guest · Table 01', 'Enquiry received — not a confirmed booking'],
      ['under_review', 450, 'Events desk · Sanya Kapoor'],
      ['needs_info', 300, 'Events desk · Sanya Kapoor', 'Please confirm whether the lounge can be reserved exclusively after 9:30 PM'],
    ],
  },
  {
    ref: 'CEL-3214',
    occasion: 'Private party',
    daysAhead: 7,
    startTime: '21:00',
    durationHours: 3,
    guests: 35,
    venue: 'Poolside lawn',
    entertainment: 'DJ',
    genre: 'English pop',
    specialRequests: 'Sunset cocktails first, dancing from 10 PM. Playlist leans disco and current pop.',
    locationId: 'pool-table-03',
    location: 'Poolside Table 03',
    guestRef: 'G-POOL3-2CY',
    minutesAgo: 2600,
    status: 'confirmed',
    assignedTo: 'Imran Qureshi',
    proposedPackage: packageLabel('pkg-dj-night'),
    history: [
      ['new', 2600, 'Guest · Poolside Table 03', 'Enquiry received — not a confirmed booking'],
      ['under_review', 2500, 'Events desk · Imran Qureshi'],
      ['proposal_sent', 1900, 'Events desk · Imran Qureshi', 'DJ package proposed with dance-floor lighting'],
      ['confirmed', 600, 'Events desk · Imran Qureshi', 'Confirmed in prototype only — no real booking created'],
    ],
    internalNotes: [
      [590, 'Imran Qureshi', 'Demo confirmation only. Production would require a signed proposal here.'],
    ],
  },
  {
    ref: 'CEL-3215',
    occasion: 'Birthday',
    daysAhead: 60,
    startTime: '19:00',
    durationHours: 2,
    guests: 20,
    venue: 'All Day Dining — restaurant',
    entertainment: 'Instrumental music',
    genre: 'Jazz',
    locationId: 'lounge-table-04',
    location: 'Lounge Table 04',
    guestRef: 'G-LNG04-2LM',
    minutesAgo: 4300,
    status: 'closed',
    assignedTo: 'Devika Rao',
    history: [
      ['new', 4300, 'Guest · Lounge Table 04', 'Enquiry received — not a confirmed booking'],
      ['under_review', 4200, 'Events desk · Devika Rao'],
      ['closed', 4000, 'Events desk · Devika Rao', 'Guest moved the celebration to next season — closed with thanks'],
    ],
  },
  {
    ref: 'CEL-3216',
    occasion: 'Other celebration',
    daysAhead: 45,
    startTime: '17:00',
    durationHours: 1.5,
    guests: 12,
    venue: 'Private dining room',
    entertainment: 'Instrumental music',
    genre: 'Acoustic & chill',
    specialRequests: 'A small retirement farewell — one special song requested for the toast.',
    locationId: 'table-08',
    location: 'Table 08',
    guestRef: 'G-TBL08-3RD',
    minutesAgo: 90,
    status: 'new',
    history: [['new', 90, 'Guest · Table 08', 'Enquiry received — not a confirmed booking']],
  },
];

function buildSeedEnquiry(spec: EnquirySeedSpec, now: number): CelebrationEnquiry {
  const history: EnquiryEvent[] = spec.history.map(([status, minutesAgo, by, note]) => ({
    status,
    at: now - minutesAgo * MINUTE,
    by,
    note,
  }));
  const internalNotes: EnquiryNote[] = (spec.internalNotes ?? []).map(
    ([minutesAgo, by, body], index) => ({
      id: `note_${spec.ref}_${index}`,
      at: now - minutesAgo * MINUTE,
      by,
      body,
    }),
  );

  return {
    id: `seed_${spec.ref.replace('CEL-', '')}`,
    ref: spec.ref,
    occasion: spec.occasion,
    eventDate: isoDay(now, spec.daysAhead),
    startTime: spec.startTime,
    durationHours: spec.durationHours,
    guests: spec.guests,
    venue: spec.venue,
    entertainment: spec.entertainment,
    genre: spec.genre,
    specialRequests: spec.specialRequests ?? '',
    notes: spec.notes ?? '',
    guestRef: spec.guestRef,
    guestLabel: spec.location.startsWith('Room') ? spec.location : `Guest · ${spec.location}`,
    location: spec.location,
    source: 'qr',
    status: spec.status,
    submittedAt: history.length ? history[0].at : now - spec.minutesAgo * MINUTE,
    updatedAt: history.length ? history[history.length - 1].at : now - spec.minutesAgo * MINUTE,
    assignedTo: spec.assignedTo ?? null,
    proposedPackage: spec.proposedPackage ?? null,
    internalNotes,
    history,
    seeded: true,
  };
}

/** Seeded celebration enquiries, newest activity first. */
export function buildEnquirySeed(now: number): CelebrationEnquiry[] {
  return SPECS.map((spec) => buildSeedEnquiry(spec, now)).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}
