import type { Musician } from '@/types';

/**
 * Performer accounts for the singer console.
 *
 * Everything here is fictional demo data. Sign-in usernames are listed on the
 * login screen and the demo password is fixed in the browser — this prototype
 * has no real authentication, identities or personal data.
 */

/** Demo sign-in credentials (shown on the login screen, frontend-only check). */
export const STAFF_USERNAME = 'staff';
export const DEMO_PASSWORD = 'demo1234';

/** Stage roles offered when staff creates a musician account. */
export const MUSICIAN_ROLES = [
  'Lead singer',
  'Vocalist',
  'Guitarist',
  'DJ',
  'Band lead',
  'Instrumentalist',
] as const;

/** Seeded performers — each already has demo activity in the two workflows. */
export const MUSICIAN_SEED: Musician[] = [
  { id: 'mnc_aarav', name: 'Aarav Menon', role: 'Lead singer', username: 'aarav', active: true },
  { id: 'mnc_nisha', name: 'Nisha Fernandes', role: 'Vocalist', username: 'nisha', active: true },
  { id: 'mnc_kabir', name: 'Kabir Malhotra', role: 'DJ', username: 'kabir', active: true },
  { id: 'mnc_rohan', name: 'Rohan Bhatt', role: 'Guitarist', username: 'rohan', active: true },
];

export function findMusician(id: string | null | undefined, musicians: Musician[]): Musician | undefined {
  if (!id) return undefined;
  return musicians.find((musician) => musician.id === id);
}

/** Lower-case, URL-safe username derived from a performer name. */
export function usernameFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 16);
  return slug || 'performer';
}

/** Appends 2, 3, … when the derived username is already taken. */
export function uniqueUsername(base: string, musicians: Musician[]): string {
  const taken = new Set(musicians.map((musician) => musician.username));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}${suffix}`)) suffix += 1;
  return `${base}${suffix}`;
}
