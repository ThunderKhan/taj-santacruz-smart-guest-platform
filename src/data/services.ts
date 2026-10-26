import type { ServiceDefinition, ServiceId } from '@/types';

/**
 * Guest service catalogue. Ordered deliberately: the guest experience reads as
 * a curated digital concierge directory rather than a grid of equal cards.
 */
export const SERVICES: ServiceDefinition[] = [
  {
    id: 'food',
    title: 'Food & Beverages',
    blurb: 'Room service and à la carte dining, delivered to your location.',
    route: '/guest/food',
    icon: 'utensils',
    image: '/images/svc-food.jpg',
    order: 1,
  },
  {
    id: 'music',
    title: 'Live Music Requests',
    blurb: 'Request a song from the live set, add a dedication, and vote for the queue.',
    route: '/guest/music',
    icon: 'music',
    image: '/images/svc-music.jpg',
    order: 2,
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping',
    blurb: 'Towels, toiletries, linen, turndown and room service calls.',
    route: '/guest/housekeeping',
    icon: 'bed',
    image: '/images/svc-housekeeping.jpg',
    order: 3,
  },
  {
    id: 'maintenance',
    title: 'Room Maintenance',
    blurb: 'Report air conditioning, lighting or plumbing issues.',
    route: '/guest/maintenance',
    icon: 'wrench',
    image: '/images/svc-maintenance.jpg',
    order: 4,
  },
  {
    id: 'concierge',
    title: 'Concierge',
    blurb: 'Hotel information, local recommendations and assistance.',
    route: '/guest/concierge',
    icon: 'bell',
    image: '/images/svc-concierge.jpg',
    order: 5,
  },
  {
    id: 'spa',
    title: 'Spa & Wellness',
    blurb: 'Browse treatments and request an available time slot.',
    route: '/guest/spa',
    icon: 'lotus',
    image: '/images/svc-spa.jpg',
    order: 6,
  },
  {
    id: 'transport',
    title: 'Transportation',
    blurb: 'Request a hotel car, airport transfer or shuttle.',
    route: '/guest/transport',
    icon: 'car',
    image: '/images/svc-transport.jpg',
    order: 7,
  },
  {
    id: 'reservations',
    title: 'Reservations & Activities',
    blurb: 'Tables, curated experiences and evening events.',
    route: '/guest/reservations',
    icon: 'calendar',
    image: '/images/svc-reservations.jpg',
    order: 8,
  },
  {
    id: 'occasions',
    title: 'Plan Music for a Celebration',
    blurb: 'Birthday, anniversary, party or corporate event — send the events team an enquiry.',
    route: '/guest/occasions',
    icon: 'gift',
    image: '/images/svc-occasions.jpg',
    order: 9,
  },
  {
    id: 'feedback',
    title: 'Feedback & Support',
    blurb: 'Share a compliment, raise a concern, or rate a service.',
    route: '/guest/feedback',
    icon: 'message',
    image: '/images/svc-feedback.jpg',
    order: 10,
  },
  {
    id: 'billing',
    title: 'Billing Review',
    blurb: 'Review illustrative room charges and request a bill check.',
    route: '/guest/billing',
    icon: 'receipt',
    image: '/images/svc-billing.jpg',
    order: 11,
  },
];

export const SERVICE_ORDER = SERVICES.map((service) => service.id);

/**
 * The two experiences this prototype now focuses on, in guest-facing order.
 * Every other catalogue entry is retained in `SERVICES` (titles, labels and
 * routing still resolve) but is hidden from the guest journey.
 */
export const FOCUS_SERVICE_IDS: ServiceId[] = ['music', 'occasions'];

export const FOCUS_SERVICES: ServiceDefinition[] = FOCUS_SERVICE_IDS.map(
  (id) => SERVICES.find((service) => service.id === id) as ServiceDefinition,
);

export function findService(id: ServiceId): ServiceDefinition {
  return SERVICES.find((service) => service.id === id) ?? SERVICES[0];
}

export function serviceTitle(id: ServiceId): string {
  return findService(id).title;
}
