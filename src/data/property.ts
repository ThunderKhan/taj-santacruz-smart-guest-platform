import type { HotelLocation } from '@/types';

/**
 * Property + location context.
 *
 * Taj Santacruz is used purely to demonstrate the presentation concept.
 * This prototype is not affiliated with, endorsed by, or connected to
 * Indian Hotels Company Limited (Taj Hotels).
 */
export const PROPERTY = {
  name: 'Taj Santacruz',
  city: 'Mumbai, India',
  descriptor: 'Smart Hotel Guest Service Platform',
  tagline: 'One platform. Every service. A better guest experience.',
  /**
   * Short, always-visible prototype disclosure. Repeated in the guest footer
   * and the presenter ribbon so no screen implies an official Taj system.
   */
  disclosure:
    'Independent concept prototype prepared for demonstration. Not affiliated with, endorsed by, or connected to Taj Hotels.',
} as const;

/**
 * Locations a presenter can switch between. In production the location would be
 * derived from the scanned QR code — never treated as proof of guest identity.
 */
export const LOCATIONS: HotelLocation[] = [
  {
    id: 'room-502',
    label: 'Room 502',
    kind: 'room',
    detail: 'Level 5 · Deluxe Sea View',
    qrTarget: '/guest?loc=room-502',
  },
  {
    id: 'room-401',
    label: 'Room 401',
    kind: 'room',
    detail: 'Level 4 · Junior Suite',
    qrTarget: '/guest?loc=room-401',
  },
  {
    id: 'room-314',
    label: 'Room 314',
    kind: 'room',
    detail: 'Level 3 · Deluxe Room',
    qrTarget: '/guest?loc=room-314',
  },
  {
    id: 'table-08',
    label: 'Table 08',
    kind: 'table',
    detail: 'All Day Dining · Ground Level',
    qrTarget: '/guest?loc=table-08',
  },
  {
    id: 'lobby-lounge',
    label: 'Lobby Lounge',
    kind: 'lounge',
    detail: 'Ground Level · Live music',
    qrTarget: '/guest?loc=lobby-lounge',
  },
  {
    id: 'pool-deck',
    label: 'Pool Deck',
    kind: 'public',
    detail: 'Level 6 · Open air',
    qrTarget: '/guest?loc=pool-deck',
  },
];

export const DEFAULT_LOCATION_ID = 'room-502';

export function findLocation(id: string): HotelLocation {
  return LOCATIONS.find((location) => location.id === id) ?? LOCATIONS[0];
}

export function locationLabel(id: string): string {
  return findLocation(id).label;
}
