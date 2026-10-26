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
 * Locations a presenter can switch between.
 *
 * The guest journey is table-first: guests scan a QR code printed on their
 * restaurant table, lounge seat or venue table tent, so every guest-facing
 * entry below is a table or a venue — never a hotel room. In production the
 * table would be derived from the scanned QR code (`?loc=` is read on load)
 * and never treated as proof of guest identity.
 *
 * Legacy room records are retained in code marked `hidden` so the archived
 * (URL-only) service dashboards can still label their sample data; they are
 * filtered out of every guest switcher and QR code.
 */
export const LOCATIONS: HotelLocation[] = [
  {
    id: 'table-08',
    label: 'Table 08',
    kind: 'table',
    detail: 'All Day Dining · Ground Level',
    qrTarget: '/guest?loc=table-08',
  },
  {
    id: 'table-01',
    label: 'Table 01',
    kind: 'table',
    detail: 'All Day Dining · Ground Level',
    qrTarget: '/guest?loc=table-01',
  },
  {
    id: 'table-12',
    label: 'Table 12',
    kind: 'table',
    detail: 'All Day Dining · Window side',
    qrTarget: '/guest?loc=table-12',
  },
  {
    id: 'lounge-table-04',
    label: 'Lounge Table 04',
    kind: 'table',
    detail: 'Lobby Lounge · Live music',
    qrTarget: '/guest?loc=lounge-table-04',
  },
  {
    id: 'lobby-lounge',
    label: 'Lobby Lounge',
    kind: 'lounge',
    detail: 'Ground Level · Live music',
    qrTarget: '/guest?loc=lobby-lounge',
  },
  {
    id: 'pool-table-03',
    label: 'Poolside Table 03',
    kind: 'public',
    detail: 'Level 6 · Open air',
    qrTarget: '/guest?loc=pool-table-03',
  },
  /* ---------------------------- Legacy rooms (internal only) ---------------- */
  {
    id: 'room-502',
    label: 'Room 502',
    kind: 'room',
    detail: 'Level 5 · Deluxe Sea View',
    qrTarget: '/guest?loc=room-502',
    hidden: true,
  },
  {
    id: 'room-401',
    label: 'Room 401',
    kind: 'room',
    detail: 'Level 4 · Junior Suite',
    qrTarget: '/guest?loc=room-401',
    hidden: true,
  },
  {
    id: 'room-314',
    label: 'Room 314',
    kind: 'room',
    detail: 'Level 3 · Deluxe Room',
    qrTarget: '/guest?loc=room-314',
    hidden: true,
  },
];

/** Guest-visible entries — tables and venues only. */
export const GUEST_LOCATIONS: HotelLocation[] = LOCATIONS.filter((location) => !location.hidden);

/** The demo session starts at a restaurant table, as if a table-tent QR was scanned. */
export const DEFAULT_LOCATION_ID = 'table-08';

/**
 * Resolve a `?loc=` value from a scanned QR code. Unknown or hidden values
 * fall back to the default table so a stale code can never break the demo.
 */
export function locationFromSearch(search: string): string {
  const raw = new URLSearchParams(search).get('loc');
  if (!raw) return DEFAULT_LOCATION_ID;
  const match = GUEST_LOCATIONS.find((location) => location.id === raw);
  return match ? match.id : DEFAULT_LOCATION_ID;
}

export function findLocation(id: string): HotelLocation {
  return LOCATIONS.find((location) => location.id === id) ?? LOCATIONS[0];
}

export function locationLabel(id: string): string {
  return findLocation(id).label;
}
