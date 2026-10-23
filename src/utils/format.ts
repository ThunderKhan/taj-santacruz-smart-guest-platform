/** Small formatting + presentation helpers shared across all three experiences. */

const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Illustrative prices are always sample data. */
export function inr(value: number): string {
  return `₹${inrFormatter.format(Math.round(value))}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function clockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function dateLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function fullTimestamp(ts: number): string {
  return `${dateLabel(ts)} · ${clockTime(ts)}`;
}

/** Natural-language relative time used in queue rows. */
export function relativeTime(ts: number, now: number = Date.now()): string {
  const seconds = Math.max(0, (now - ts) / 1000);
  if (seconds < 40) return 'just now';
  if (seconds < 90) return '1 min ago';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export function minutesSince(ts: number, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - ts) / 60000));
}

/** Compact elapsed duration for KPI tiles, e.g. "1 hr 15 min". */
export function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—';
  const minutes = Math.round(totalMinutes);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function initials(name: string): string {
  return name
    .replace(/[^\p{L}\s.·]/gu, '')
    .split(/[\s.·]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic small pseudo-random generator for illustrative series. */
export function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
