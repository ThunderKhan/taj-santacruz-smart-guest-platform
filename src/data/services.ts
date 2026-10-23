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
    title: 'Live Music',
    blurb: 'Request a song, vote for the queue, or send a dedication.',
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
    title: 'Special Occasions',
    blurb: 'Flowers, cakes and celebration arrangements.',
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

export function findService(id: ServiceId): ServiceDefinition {
  return SERVICES.find((service) => service.id === id) ?? SERVICES[0];
}

export function serviceTitle(id: ServiceId): string {
  return findService(id).title;
}
