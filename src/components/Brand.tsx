import { cx } from '@/utils/format';
import { PROPERTY } from '@/data/property';

/**
 * Original prototype mark. Deliberately not derived from any hotel brand's
 * logo — this is an independent concept demonstration.
 */
export function Mark({ className, tone = 'gold' }: { className?: string; tone?: 'gold' | 'ivory' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cx('shrink-0', tone === 'gold' ? 'text-gold-500' : 'text-ivory-100', className)}
    >
      <path d="M32 6 L52 32 L32 58 L12 32 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <path d="M32 17 L43 32 L32 47 L21 32 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 25 L37.5 32 L32 39 L26.5 32 Z" fill="currentColor" />
    </svg>
  );
}

/** Header wordmark used across guest, kiosk and staff chrome. */
export function Wordmark({
  dark = false,
  compact = false,
  className,
}: {
  dark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <Mark className={compact ? 'h-6 w-6' : 'h-8 w-8'} tone={dark ? 'ivory' : 'gold'} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cx(
            'display truncate',
            compact ? 'text-[1.05rem]' : 'text-[1.25rem]',
            dark ? 'text-ivory-50' : 'text-ink-900',
          )}
        >
          {PROPERTY.name}
        </span>
        <span
          className={cx(
            'eyebrow-sm mt-1 truncate',
            dark ? 'text-warm-400' : 'text-warm-500',
          )}
        >
          Smart Guest Platform
        </span>
      </span>
    </span>
  );
}
