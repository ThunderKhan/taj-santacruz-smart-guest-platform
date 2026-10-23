/**
 * Guest assistance content: concierge knowledge, transport, reservations,
 * special occasions and feedback categories.
 *
 * All availability, timings and prices are illustrative sample content and are
 * labelled as such in the interface. Nothing here has been verified against a
 * real property.
 */

export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  group: 'hotel' | 'stay' | 'mumbai';
}

export const CONCIERGE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'k-01',
    question: 'What time is check-in and check-out?',
    answer:
      'Standard check-in is from 2:00 PM and check-out by 12:00 noon. Early arrival and late departure are subject to availability — raise a concierge request and the team will confirm.',
    group: 'stay',
  },
  {
    id: 'k-02',
    question: 'How do I request an airport transfer?',
    answer:
      'Open Transportation, choose your pickup point and destination, and select a preferred time. The concierge team confirms the vehicle and driver details back to you.',
    group: 'stay',
  },
  {
    id: 'k-03',
    question: 'Is Wi-Fi available in the room?',
    answer:
      'Complimentary high-speed Wi-Fi is available throughout the property. Sample network details would be displayed on the in-room tablet in a live deployment.',
    group: 'stay',
  },
  {
    id: 'k-04',
    question: 'Can you arrange a tour or local experience?',
    answer:
      'Yes. Browse Reservations & Activities for curated half-day and evening options, then submit a preferred date. The concierge team confirms availability.',
    group: 'mumbai',
  },
  {
    id: 'k-05',
    question: 'What is nearby for shopping or sightseeing?',
    answer:
      'Sample recommendations are listed below. Distances and opening hours are illustrative and have not been verified for this prototype.',
    group: 'mumbai',
  },
  {
    id: 'k-06',
    question: 'How do I arrange laundry or pressing?',
    answer:
      'Housekeeping accepts laundry and pressing requests. Add your preferred collection window in the instructions field.',
    group: 'stay',
  },
];

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  blurb: string;
  distance: string;
}

export const LOCAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r-01',
    name: 'Gateway of India',
    category: 'Landmark',
    blurb: 'Colonial-era arch overlooking the harbour — best visited early morning.',
    distance: 'Sample · 35 min drive',
  },
  {
    id: 'r-02',
    name: 'Dr. Bhau Daji Lad Museum',
    category: 'Culture',
    blurb: 'Mumbai’s oldest museum, set inside a restored Victorian building in Byculla.',
    distance: 'Sample · 30 min drive',
  },
  {
    id: 'r-03',
    name: 'Bandra Bandstand',
    category: 'Promenade',
    blurb: 'Seaside walk with sea-facing cafés and live music on weekend evenings.',
    distance: 'Sample · 25 min drive',
  },
  {
    id: 'r-04',
    name: 'Colaba Causeway',
    category: 'Shopping',
    blurb: 'Street market for textiles, antiques and handcrafted accessories.',
    distance: 'Sample · 40 min drive',
  },
];

/* -------------------------------------------------------------------------- */

export interface TransportOption {
  id: string;
  name: string;
  blurb: string;
  capacity: string;
  indicative: string;
}

export const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 't-01',
    name: 'Airport Transfer',
    blurb: 'Sedan to the international terminal with luggage assistance.',
    capacity: 'Up to 3 guests',
    indicative: 'Sample · approx. 25 min',
  },
  {
    id: 't-02',
    name: 'Hotel Car — Half Day',
    blurb: 'Dedicated car and driver for city errands and shopping.',
    capacity: 'Up to 3 guests',
    indicative: 'Sample · 4 hour block',
  },
  {
    id: 't-03',
    name: 'Group Shuttle',
    blurb: 'Spacious vehicle for families or groups with additional luggage.',
    capacity: 'Up to 6 guests',
    indicative: 'Sample · on request',
  },
];

export const PICKUP_POINTS = [
  'Hotel entrance — main portico',
  'Room 502 — lobby pick-up',
  'Restaurant — service exit',
  'Pool deck — Level 6',
];

export const DESTINATIONS = [
  'Chhatrapati Shivaji Maharaj International Airport (T2)',
  'Chhatrapati Shivaji Maharaj International Airport (T1)',
  'Bandra–Worli Sea Link',
  'Colaba Causeway',
  'Juhu Beach',
  'Custom destination',
];

/* -------------------------------------------------------------------------- */

export interface ReservationOption {
  id: string;
  name: string;
  kind: string;
  blurb: string;
  windows: string[];
}

export const RESERVATION_OPTIONS: ReservationOption[] = [
  {
    id: 'rv-01',
    name: 'All Day Dining — Table Reservation',
    kind: 'Dining',
    blurb: 'Indoor or terrace seating for breakfast, lunch or dinner.',
    windows: ['8:00 AM', '1:00 PM', '7:30 PM', '9:00 PM'],
  },
  {
    id: 'rv-02',
    name: 'Sunset Jazz Evening',
    kind: 'Event',
    blurb: 'Lobby Lounge performance with a small-plate pairing menu.',
    windows: ['7:30 PM', '9:15 PM'],
  },
  {
    id: 'rv-03',
    name: 'City Highlights — Half Day',
    kind: 'Activity',
    blurb: 'Guided drive covering landmark architecture and the harbour front.',
    windows: ['9:00 AM', '2:00 PM'],
  },
  {
    id: 'rv-04',
    name: 'Cooking Demonstration',
    kind: 'Activity',
    blurb: 'Kitchen-led session on regional coastal cuisine.',
    windows: ['11:00 AM', '4:00 PM'],
  },
];

/* -------------------------------------------------------------------------- */

export interface OccasionPackage {
  id: string;
  name: string;
  blurb: string;
  indicative: string;
}

export const OCCASION_PACKAGES: OccasionPackage[] = [
  {
    id: 'o-01',
    name: 'Birthday Surprise',
    blurb: 'Cake, fresh flowers and a handwritten note delivered to your location.',
    indicative: 'Sample · staff confirmation required',
  },
  {
    id: 'o-02',
    name: 'Anniversary Setting',
    blurb: 'Rose arrangement, chilled sparkling juice and a printed keepsake menu.',
    indicative: 'Sample · staff confirmation required',
  },
  {
    id: 'o-03',
    name: 'Fresh Flower Arrangement',
    blurb: 'Seasonal arrangement in the colour of your choice.',
    indicative: 'Sample · subject to availability',
  },
  {
    id: 'o-04',
    name: 'Welcome Amenity',
    blurb: 'In-room amenity prepared for an arriving guest or colleague.',
    indicative: 'Sample · subject to availability',
  },
];

/* -------------------------------------------------------------------------- */

export const FEEDBACK_CATEGORIES = [
  'Housekeeping',
  'Food & Beverage',
  'Maintenance',
  'Concierge & Transport',
  'Spa & Wellness',
  'Front Desk',
  'Overall Stay',
];

export const FEEDBACK_TOPICS: Record<string, string[]> = {
  compliment: ['Delighted with the service', 'Team member recognition', 'Room and facilities'],
  concern: ['Response time', 'Accuracy of request', 'Quality of service', 'Noise or comfort'],
};

export const RATING_LABELS = ['Poor', 'Below average', 'Satisfactory', 'Good', 'Excellent'];
