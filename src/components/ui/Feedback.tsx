import type { ReactNode } from 'react';
import { cx } from '@/utils/format';

/** Consistent quiet loading state — no long simulated waits. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx('block animate-soft-pulse rounded-[3px] bg-cream-200', className)}
    />
  );
}

export function SkeletonRow({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cx(
        'flex items-center gap-4 border-b px-5 py-4 last:border-b-0',
        dark ? 'border-white/8' : 'border-cream-300',
      )}
    >
      <Skeleton className="h-3 w-20 shrink-0" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-3 w-24 shrink-0" />
      <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  );
}

/** Illustrative "talking to the service" delay for submissions. */
export function InlineWorking({ label = 'Working' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-warm-600">
      <Spinner className="text-gold-600" />
      {label}…
    </span>
  );
}

/** Empty state that explains what would appear here. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  dark = false,
  compact = false,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-10' : 'py-16',
      )}
    >
      <div
        aria-hidden="true"
        className={cx(
          'mb-5 flex h-12 w-12 items-center justify-center rounded-full border',
          dark ? 'border-white/15 bg-white/[0.05] text-gold-400' : 'border-cream-300 bg-ivory-100 text-gold-600',
        )}
      >
        {icon ?? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="1.3" stroke="currentColor">
            <path d="M4 7h16M4 12h10M4 17h7" />
          </svg>
        )}
      </div>
      <p className={cx('display text-[1.25rem]', dark ? 'text-ivory-50' : 'text-ink-900')}>{title}</p>
      <p className={cx('mt-2 max-w-sm text-[13.5px] leading-relaxed', dark ? 'text-warm-400' : 'text-warm-600')}>
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Inline informational strip — used for prototype disclosures and hints. */
export function Notice({
  tone = 'neutral',
  title,
  children,
  dark = false,
  className,
}: {
  tone?: 'neutral' | 'gold' | 'sage' | 'clay';
  title?: string;
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const tones = {
    neutral: dark
      ? 'border-white/12 bg-white/[0.05] text-warm-300'
      : 'border-cream-300 bg-ivory-100 text-warm-600',
    gold: dark
      ? 'border-gold-500/40 bg-gold-500/12 text-gold-300'
      : 'border-gold-500/40 bg-gold-200/40 text-gold-800',
    sage: dark
      ? 'border-sage-400/40 bg-sage-400/12 text-sage-300'
      : 'border-sage-500/40 bg-sage-500/12 text-forest-700',
    clay: dark
      ? 'border-clay-500/45 bg-clay-500/15 text-[#E7B49B]'
      : 'border-clay-500/40 bg-clay-500/10 text-clay-600',
  } as const;

  return (
    <div className={cx('rounded-[3px] border px-4 py-3 text-[13px] leading-relaxed', tones[tone], className)}>
      {title ? <p className="eyebrow-sm mb-1.5 text-current opacity-90">{title}</p> : null}
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}

/** Success confirmation shown after a guest submits a request. */
export function SuccessPanel({
  reference,
  title,
  body,
  children,
}: {
  reference: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="animate-fade-up rounded-[4px] border border-sage-500/40 bg-white p-6 text-center shadow-lift sm:p-8">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500/15 text-sage-600">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" strokeWidth="1.6" stroke="currentColor">
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="eyebrow text-sage-600">Request submitted</p>
      <h3 className="display mt-3 text-[1.7rem] text-ink-900">{title}</h3>
      <p className="mx-auto mt-2.5 max-w-md text-[14px] leading-relaxed text-warm-600">{body}</p>

      <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-[3px] border border-cream-300 bg-ivory-100 px-4 py-2.5">
        <span className="eyebrow-sm text-warm-500">Reference</span>
        <span className="text-[15px] font-semibold tabular-nums tracking-[0.06em] text-ink-900">
          {reference}
        </span>
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
