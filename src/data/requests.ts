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
 * Realistic first-launch demonstration data.
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
  /** `[status, minutesAgo, actor, note]` from oldest to newest. */
  history: Array<[RequestStatus, number, string, string?]>;
}

const SPECS: SeedSpec[] = [
  /* ---------------------- Restaurant / Room Service ---------------------- */
  {
    ref: 'TSH-4705',
    service: 'food',
    title: 'In-room dining — 2 items',
    description: 'Evening à la carte order for in-room delivery.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 24,
    status: 'in_progress',
    stage: 'preparing',
    assignedTo: 'Deepa Rao',
    value: 2145,
    lineItems: [
      { label: 'Kasundi Grilled Prawns', qty: 1, price: 1350 },
      { label: 'Virgin Passionfruit Mojito', qty: 2, price: 450 },
      { label: 'Warm Chocolate Fondant', qty: 1, price: 650, note: 'Birthday candle, please' },
    ],
    guestNote: 'Please keep the desserts chilled until you arrive. No chilli in the prawns.',
    meta: { Course: 'Evening', Delivery: 'In-room', Covers: '2' },
    history: [
      ['submitted', 24, 'Guest · Room 502', 'Submitted from the guest service interface'],
      ['accepted', 21, 'Restaurant · Deepa Rao', 'Accepted at the kitchen pass'],
      ['in_progress', 16, 'Restaurant · Deepa Rao', 'Preparation started'],
    ],
  },
  {
    ref: 'TSH-4712',
    service: 'food',
    title: 'Table order — 4 covers',
    description: 'Terrace table order, drinks and starters.',
    locationId: 'table-08',
    location: 'Table 08',
    guestRef: 'G-TBL08-3RD',
    minutesAgo: 12,
    status: 'accepted',
    assignedTo: 'Priya Nair',
    value: 4820,
    lineItems: [
      { label: 'Chargrilled Lamb Cutlets', qty: 2, price: 1750 },
      { label: 'Tandoori Corn & Bell Pepper Skewer', qty: 1, price: 850 },
      { label: 'Fresh Watermelon Cooler', qty: 2, price: 425 },
    ],
    guestNote: 'One guest has a nut allergy — please confirm before plating.',
    meta: { Course: 'Dinner', Service: 'Terrace', Covers: '4' },
    history: [
      ['submitted', 12, 'Guest · Table 08', 'Submitted from the table QR code'],
      ['accepted', 9, 'Restaurant · Priya Nair', 'Order acknowledged'],
    ],
  },
  {
    ref: 'TSH-4714',
    service: 'food',
    title: 'Dessert and coffee service',
    description: 'Two desserts with coffee to Room 208.',
    locationId: 'room-208',
    location: 'Room 208',
    guestRef: 'G-208-5WT',
    minutesAgo: 8,
    status: 'submitted',
    value: 1275,
    lineItems: [
      { label: 'New York Style Cheesecake', qty: 1, price: 625 },
      { label: 'Single Origin Flat White', qty: 1, price: 395 },
      { label: 'Kashmiri Kahwa Infusion', qty: 1, price: 425 },
    ],
    meta: { Course: 'Dessert', Delivery: 'In-room' },
    history: [['submitted', 8, 'Guest · Room 208']],
  },
  {
    ref: 'TSH-4717',
    service: 'food',
    title: 'Two mocktails — Lobby Lounge',
    description: 'Lounge seating order.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 16,
    status: 'in_progress',
    stage: 'ready',
    assignedTo: 'Sameer Qureshi',
    value: 900,
    lineItems: [{ label: 'Virgin Passionfruit Mojito', qty: 2, price: 450 }],
    meta: { Course: 'Beverages', Service: 'Lounge seating' },
    history: [
      ['submitted', 16, 'Guest · Lobby Lounge'],
      ['accepted', 14, 'Restaurant · Sameer Qureshi'],
      ['in_progress', 6, 'Restaurant · Sameer Qureshi', 'Ready for service'],
    ],
  },
  {
    ref: 'TSH-4701',
    service: 'food',
    title: 'Breakfast order — 2 items',
    description: 'In-room breakfast delivered this morning.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 66,
    status: 'completed',
    assignedTo: 'Deepa Rao',
    value: 1720,
    lineItems: [
      { label: 'Eggs Benedict on Sourdough', qty: 1, price: 795 },
      { label: 'South Indian Breakfast Thali', qty: 1, price: 850 },
      { label: 'Single Origin Flat White', qty: 1, price: 395 },
    ],
    meta: { Course: 'Breakfast', Delivery: 'In-room' },
    history: [
      ['submitted', 66, 'Guest · Room 314'],
      ['accepted', 64, 'Restaurant · Deepa Rao'],
      ['in_progress', 60, 'Restaurant · Deepa Rao', 'Preparation started'],
      ['completed', 55, 'Restaurant · Deepa Rao', 'Delivered and signed for'],
    ],
  },
  {
    ref: 'TSH-4720',
    service: 'reservations',
    topic: 'dining',
    title: 'Table reservation — 2 covers, 8:00 PM',
    description: 'Dinner reservation request for two guests.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 44,
    status: 'accepted',
    assignedTo: 'Priya Nair',
    meta: { Option: 'All Day Dining — Table Reservation', Preferred: '8:00 PM', Covers: '2' },
    guestNote: 'Window table if one becomes available.',
    history: [
      ['submitted', 44, 'Guest · Room 401'],
      ['accepted', 40, 'Restaurant · Priya Nair', 'Table held for 20 minutes past the booking time'],
    ],
  },
  {
    ref: 'TSH-4722',
    service: 'food',
    title: 'Late-night supper request',
    description: 'Order placed after the kitchen service window.',
    locationId: 'room-118',
    location: 'Room 118',
    guestRef: 'G-118-4BZ',
    minutesAgo: 41,
    status: 'rejected',
    assignedTo: 'Arjun Menon',
    resolutionNote:
      'The kitchen has confirmed this item is unavailable at this hour. Room service can prepare a sandwich and soup selection instead.',
    lineItems: [{ label: 'Awadhi Lamb Shank Raan', qty: 1, price: 1650 }],
    meta: { Course: 'Supper', Delivery: 'In-room' },
    history: [
      ['submitted', 41, 'Guest · Room 118'],
      ['rejected', 38, 'Restaurant · Arjun Menon', 'Item unavailable during this service window'],
    ],
  },

  /* ---------------------------- Housekeeping ---------------------------- */
  {
    ref: 'TSH-4710',
    service: 'housekeeping',
    title: 'Linen change — two pillows',
    description: 'Fresh pillowcases and a light linen refresh.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 38,
    status: 'in_progress',
    assignedTo: 'Anjali Deshmukh',
    priority: 'normal',
    lineItems: [
      { label: 'Pillowcases', qty: 2 },
      { label: 'Bed linen set', qty: 1 },
    ],
    guestNote: 'Guest prefers the hypoallergenic pillows if available.',
    meta: { Service: 'Linen refresh', Area: 'Bedroom' },
    history: [
      ['submitted', 38, 'Guest · Room 314'],
      ['accepted', 35, 'Housekeeping · Rekha Sawant'],
      ['in_progress', 31, 'Housekeeping · Anjali Deshmukh', 'Attendant on the way'],
    ],
  },
  {
    ref: 'TSH-4716',
    service: 'housekeeping',
    title: 'Turndown service',
    description: 'Evening turndown requested for an arriving guest.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 25,
    status: 'accepted',
    assignedTo: 'Vaishali Patil',
    meta: { Service: 'Turndown', Preferred: '7:00 PM' },
    guestNote: 'Please leave the balcony door closed.',
    history: [
      ['submitted', 25, 'Guest · Room 401'],
      ['accepted', 22, 'Housekeeping · Rekha Sawant', 'Scheduled with the floor round'],
    ],
  },
  {
    ref: 'TSH-4698',
    service: 'housekeeping',
    title: 'Toiletries replenishment',
    description: 'Bath amenities restocked.',
    locationId: 'room-208',
    location: 'Room 208',
    guestRef: 'G-208-5WT',
    minutesAgo: 72,
    status: 'completed',
    assignedTo: 'Vaishali Patil',
    lineItems: [
      { label: 'Bath amenity set', qty: 2 },
      { label: 'Dental kit', qty: 1 },
      { label: 'Bathrobe', qty: 1 },
    ],
    meta: { Service: 'Amenities', Area: 'Bathroom' },
    history: [
      ['submitted', 72, 'Guest · Room 208'],
      ['accepted', 69, 'Housekeeping · Rekha Sawant'],
      ['in_progress', 64, 'Housekeeping · Vaishali Patil'],
      ['completed', 60, 'Housekeeping · Vaishali Patil', 'Amenities left in the bathroom vanity'],
    ],
  },
  {
    ref: 'TSH-4718',
    service: 'housekeeping',
    title: 'Spill clean-up at Table 08',
    description: 'Table reset required after a spilled drink.',
    locationId: 'table-08',
    location: 'Table 08',
    guestRef: 'G-TBL08-3RD',
    minutesAgo: 5,
    status: 'submitted',
    priority: 'high',
    meta: { Service: 'Cleaning', Area: 'Terrace' },
    history: [['submitted', 5, 'Guest · Table 08', 'Raised by the guest using the table QR code']],
  },

  /* ------------------------- Maintenance tickets ------------------------- */
  {
    ref: 'TSH-4713',
    service: 'maintenance',
    title: 'Air conditioning not cooling',
    description: 'Room temperature is not reaching the set point; unit runs but blows warm air.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 22,
    status: 'submitted',
    priority: 'urgent',
    meta: { Category: 'Air conditioning', Urgency: 'Urgent', Area: 'Bedroom' },
    guestNote: 'Room has been warm for over an hour.',
    history: [['submitted', 22, 'Guest · Room 401', 'Reported through the guest interface']],
  },
  {
    ref: 'TSH-4706',
    service: 'maintenance',
    title: 'Bathroom geyser dripping',
    description: 'Slow drip from the geyser inlet connection.',
    locationId: 'room-219',
    location: 'Room 219',
    guestRef: 'G-219-6HK',
    minutesAgo: 55,
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Prakash Jadhav',
    meta: { Category: 'Plumbing', Urgency: 'High', Area: 'Bathroom' },
    history: [
      ['submitted', 55, 'Guest · Room 219'],
      ['accepted', 51, 'Maintenance · Sandeep Kulkarni'],
      ['in_progress', 44, 'Maintenance · Prakash Jadhav', 'Isolating the inlet valve'],
    ],
  },
  {
    ref: 'TSH-4694',
    service: 'maintenance',
    title: 'Reading light not working',
    description: 'Bedside reading lamp does not respond to the switch.',
    locationId: 'room-302',
    location: 'Room 302',
    guestRef: 'G-302-1QD',
    minutesAgo: 96,
    status: 'completed',
    priority: 'low',
    assignedTo: 'Prakash Jadhav',
    resolutionNote: 'Failed bulb replaced and switch plate reseated. Tested with the guest present.',
    meta: { Category: 'Lighting', Urgency: 'Low', Area: 'Bedroom' },
    history: [
      ['submitted', 96, 'Guest · Room 302'],
      ['accepted', 92, 'Maintenance · Sandeep Kulkarni'],
      ['in_progress', 86, 'Maintenance · Prakash Jadhav'],
      ['completed', 78, 'Maintenance · Prakash Jadhav', 'Bulb replaced and tested'],
    ],
  },
  {
    ref: 'TSH-4715',
    service: 'maintenance',
    title: 'Floor lamp flickering',
    description: 'Lounge floor lamp flickers intermittently near the bar.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 30,
    status: 'accepted',
    priority: 'normal',
    assignedTo: 'Sandeep Kulkarni',
    meta: { Category: 'Lighting', Urgency: 'Normal', Area: 'Lounge' },
    history: [
      ['submitted', 30, 'Staff · Lobby Lounge'],
      ['accepted', 27, 'Maintenance · Sandeep Kulkarni', 'Scheduled during the set break'],
    ],
  },

  /* ------------------------------ Entertainment -------------------------- */
  {
    ref: 'TSH-4709',
    service: 'music',
    title: 'Song request — Gerua',
    description: 'Requested from the guest music screen.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 18,
    status: 'accepted',
    stage: 'queued',
    assignedTo: 'Nisha Fernandes',
    votes: 12,
    guestVoted: true,
    meta: { Track: 'Gerua', Artist: 'Arijit Singh', Genre: 'Hindi · Slow' },
    history: [
      ['submitted', 18, 'Guest · Room 502'],
      ['accepted', 15, 'Entertainment · Nisha Fernandes', 'Added to the lounge queue'],
    ],
  },
  {
    ref: 'TSH-4711',
    service: 'music',
    title: 'Song request — Senorita',
    description: 'Requested from the table QR code.',
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
    ref: 'TSH-4696',
    service: 'music',
    title: 'Song request with dedication — Fly Me to the Moon',
    description: 'Anniversary dedication requested from Room 314.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 20,
    status: 'accepted',
    stage: 'queued',
    assignedTo: 'Nisha Fernandes',
    votes: 9,
    guestNote: 'For Maya — happy anniversary, from both of us.',
    meta: { Track: 'Fly Me to the Moon', Artist: 'Frank Sinatra', Genre: 'Jazz standard', Dedication: 'Yes' },
    history: [
      ['submitted', 20, 'Guest · Room 314'],
      ['accepted', 17, 'Entertainment · Nisha Fernandes', 'Dedication approved for the 9:15 PM set'],
    ],
  },
  {
    ref: 'TSH-4719',
    service: 'music',
    title: 'Song request — Blinding Lights',
    description: 'Submitted from Room 401.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 33,
    status: 'rejected',
    assignedTo: 'Kabir Malhotra',
    votes: 2,
    resolutionNote:
      'This track sits outside the acoustic set planned for this hour. The team has suggested the lounge remix for the 9:15 PM set instead.',
    meta: { Track: 'Blinding Lights', Artist: 'The Weeknd', Genre: 'Pop' },
    history: [
      ['submitted', 33, 'Guest · Room 401'],
      ['rejected', 30, 'Entertainment · Kabir Malhotra', 'Outside the planned set'],
    ],
  },
  {
    ref: 'TSH-4691',
    service: 'music',
    title: 'Song request — Take Five',
    description: 'Performed during the earlier set.',
    locationId: 'lobby-lounge',
    location: 'Lobby Lounge',
    guestRef: 'G-LOBBY-9PV',
    minutesAgo: 52,
    status: 'completed',
    stage: 'played',
    assignedTo: 'Kabir Malhotra',
    votes: 17,
    meta: { Track: 'Take Five', Artist: 'Dave Brubeck', Genre: 'Jazz instrumental' },
    history: [
      ['submitted', 52, 'Guest · Lobby Lounge'],
      ['accepted', 48, 'Entertainment · Nisha Fernandes'],
      ['in_progress', 26, 'Entertainment · Kabir Malhotra', 'Now playing'],
      ['completed', 21, 'Entertainment · Kabir Malhotra', 'Performed in the 7:30 PM set'],
    ],
  },

  /* -------------------- Concierge / Guest Relations ---------------------- */
  {
    ref: 'TSH-4707',
    service: 'transport',
    title: 'Airport transfer — Terminal 2',
    description: 'Departure transfer requested for an early morning flight.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 35,
    status: 'accepted',
    priority: 'high',
    assignedTo: 'Farhan Merchant',
    meta: {
      Option: 'Airport Transfer',
      Pickup: 'Hotel entrance — main portico',
      Destination: 'Chhatrapati Shivaji Maharaj International Airport (T2)',
      Preferred: '6:15 AM',
      Vehicle: 'Sedan · up to 3 guests',
    },
    guestNote: 'Two large suitcases and one cabin bag.',
    history: [
      ['submitted', 35, 'Guest · Room 502'],
      ['accepted', 30, 'Concierge · Farhan Merchant', 'Vehicle held for 6:15 AM pending confirmation'],
    ],
  },
  {
    ref: 'TSH-4723',
    service: 'feedback',
    topic: 'concern',
    title: 'Concern — room service delivery time',
    description: 'Guest felt the evening delivery took longer than expected.',
    locationId: 'room-502',
    location: 'Room 502',
    guestRef: DEMO_GUEST_REF,
    minutesAgo: 10,
    status: 'submitted',
    priority: 'high',
    meta: { Category: 'Food & Beverage', Type: 'Concern', Rating: '3 / 5' },
    guestNote: 'The food arrived warm, but the wait was longer than the time quoted on confirmation.',
    history: [['submitted', 10, 'Guest · Room 502']],
  },
  {
    ref: 'TSH-4702',
    service: 'feedback',
    topic: 'concern',
    title: 'Concern — noise from an adjacent room',
    description: 'Reported by a guest on Level 3.',
    locationId: 'room-302',
    location: 'Room 302',
    guestRef: 'G-302-1QD',
    minutesAgo: 36,
    status: 'accepted',
    priority: 'high',
    assignedTo: 'Neha Bhatt',
    meta: { Category: 'Overall Stay', Type: 'Concern', Rating: '2 / 5' },
    guestNote: 'Please keep this anonymous when following up with the neighbouring room.',
    history: [
      ['submitted', 36, 'Guest · Room 302'],
      ['accepted', 33, 'Guest Relations · Neha Bhatt', 'Reaching out to the neighbouring room'],
    ],
  },
  {
    ref: 'TSH-4699',
    service: 'concierge',
    title: 'Local recommendation — half-day city tour',
    description: 'Guest asked for sightseeing suggestions.',
    locationId: 'room-208',
    location: 'Room 208',
    guestRef: 'G-208-5WT',
    minutesAgo: 50,
    status: 'submitted',
    meta: { Topic: 'Local recommendations', Party: '2 guests' },
    guestNote: 'We are interested in architecture and would prefer to be back by 1:00 PM.',
    history: [['submitted', 50, 'Guest · Room 208']],
  },
  {
    ref: 'TSH-4697',
    service: 'occasions',
    title: 'Anniversary arrangement',
    description: 'In-room anniversary setting requested for this evening.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 56,
    status: 'submitted',
    meta: { Package: 'Anniversary Setting', Preferred: '6:30 PM' },
    guestNote: 'Rose arrangement in deep red if possible.',
    history: [['submitted', 56, 'Guest · Room 401']],
  },
  {
    ref: 'TSH-4704',
    service: 'billing',
    title: 'Bill review request',
    description: 'Guest asked for a walkthrough of the illustrative folio charges.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 30,
    status: 'submitted',
    meta: { Charges: '7 line items', Period: 'Sample stay window' },
    guestNote: 'Please explain the minibar entries before check-out.',
    history: [['submitted', 30, 'Guest · Room 314']],
  },

  /* ------------------------------ Spa & Wellness ------------------------- */
  {
    ref: 'TSH-4708',
    service: 'spa',
    title: 'Signature Aromatherapy Massage',
    description: 'Sixty-minute treatment requested for the late morning.',
    locationId: 'room-314',
    location: 'Room 314',
    guestRef: 'G-314-2LM',
    minutesAgo: 42,
    status: 'accepted',
    assignedTo: 'Kavita Menon',
    meta: { Treatment: 'Signature Aromatherapy Massage', Slot: '11:30 AM', Duration: '60 min', Therapist: 'Preferred: female' },
    history: [
      ['submitted', 42, 'Guest · Room 314'],
      ['accepted', 37, 'Spa · Meera Iyer', 'Therapist assigned and room prepared'],
    ],
  },
  {
    ref: 'TSH-4725',
    service: 'spa',
    title: 'Deep Tissue Recovery',
    description: 'Seventy-five minute treatment in progress.',
    locationId: 'room-208',
    location: 'Room 208',
    guestRef: 'G-208-5WT',
    minutesAgo: 15,
    status: 'in_progress',
    assignedTo: 'Tanvi Rao',
    meta: { Treatment: 'Deep Tissue Recovery', Slot: '4:00 PM', Duration: '75 min' },
    history: [
      ['submitted', 15, 'Guest · Room 208'],
      ['accepted', 13, 'Spa · Meera Iyer'],
      ['in_progress', 4, 'Spa · Tanvi Rao', 'Treatment started'],
    ],
  },
  {
    ref: 'TSH-4692',
    service: 'spa',
    title: 'Sun Salutation Yoga Session',
    description: 'Morning session completed on the wellness deck.',
    locationId: 'pool-deck',
    location: 'Pool Deck',
    guestRef: 'G-POOL-2CY',
    minutesAgo: 185,
    status: 'completed',
    assignedTo: 'Meera Iyer',
    meta: { Treatment: 'Sun Salutation Yoga Session', Slot: '7:00 AM', Duration: '60 min' },
    history: [
      ['submitted', 185, 'Guest · Pool Deck'],
      ['accepted', 180, 'Spa · Meera Iyer'],
      ['in_progress', 155, 'Spa · Meera Iyer'],
      ['completed', 145, 'Spa · Meera Iyer', 'Session completed and towels refreshed'],
    ],
  },
  {
    ref: 'TSH-4721',
    service: 'spa',
    title: 'Express Back, Neck & Shoulders',
    description: 'Short treatment requested between meetings.',
    locationId: 'room-401',
    location: 'Room 401',
    guestRef: 'G-401-7XA',
    minutesAgo: 11,
    status: 'submitted',
    meta: { Treatment: 'Express Back, Neck & Shoulders', Slot: '5:30 PM', Duration: '30 min' },
    history: [['submitted', 11, 'Guest · Room 401']],
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
      title: 'Housekeeping completed TSH-4698',
      body: 'Toiletries replenishment in Room 208 was completed.',
      at: now - 60 * MINUTE,
      read: true,
      audience: 'staff',
      department: 'housekeeping',
      ref: 'TSH-4698',
    },
    {
      id: 'n-seed-2',
      title: 'New urgent ticket in Room 401',
      body: 'Air conditioning not cooling — awaiting acceptance.',
      at: now - 22 * MINUTE,
      read: false,
      audience: 'staff',
      department: 'maintenance',
      ref: 'TSH-4713',
    },
    {
      id: 'n-seed-3',
      title: 'Song request accepted',
      body: 'Your request for “Gerua” is now in the lounge queue.',
      at: now - 15 * MINUTE,
      read: false,
      audience: 'guest',
      guestRef: DEMO_GUEST_REF,
      ref: 'TSH-4709',
    },
    {
      id: 'n-seed-4',
      title: 'Transport request accepted',
      body: 'Farhan is holding a sedan for your 6:15 AM airport transfer.',
      at: now - 30 * MINUTE,
      read: true,
      audience: 'guest',
      guestRef: DEMO_GUEST_REF,
      ref: 'TSH-4707',
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
