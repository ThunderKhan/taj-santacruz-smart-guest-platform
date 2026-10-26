import { Check, X } from 'lucide-react';
import type { RequestStage, RequestStatus } from '@/types';
import { cx } from '@/utils/format';

/**
 * Guest-facing progress stepper for live music requests.
 *
 * The five canonical steps mirror the plan's status flow
 * (Submitted → Accepted → Queued → Playing → Played). Guests only ever read
 * this — every transition happens on the stage dashboard.
 */

const STEP_LABELS = ['Submitted', 'Accepted', 'Queued', 'Playing', 'Played'] as const;

/** Index of the furthest step reached, or -1 when the request was declined. */
function stepIndex(status: RequestStatus, stage?: RequestStage): number {
  switch (status) {
    case 'completed':
      return 4;
    case 'in_progress':
      return stage === 'playing' ? 3 : 2;
    case 'accepted':
      return 1;
    case 'submitted':
      return 0;
    default:
      return -1;
  }
}

function Dot({ state }: { state: 'done' | 'current' | 'todo' }) {
  return (
    <span
      className={cx(
        'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
        state === 'done' && 'border-gold-600 bg-gold-600 text-white',
        state === 'current' && 'border-gold-600 bg-white',
        state === 'todo' && 'border-warm-300 bg-white',
      )}
    >
      {state === 'done' ? <Check className="h-3 w-3" strokeWidth={2.6} /> : null}
      {state === 'current' ? (
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold-600" />
      ) : null}
    </span>
  );
}

export function RequestSteps({
  status,
  stage,
  compact = false,
  className,
}: {
  status: RequestStatus;
  stage?: RequestStage;
  /** Dots-only treatment for dense list rows. */
  compact?: boolean;
  className?: string;
}) {
  const active = stepIndex(status, stage);
  const declined = active === -1;

  /* ---------------------------------------------------------- Compact dots */
  if (compact) {
    return (
      <span
        className={cx('inline-flex items-center', className)}
        role="img"
        aria-label={
          declined
            ? 'Progress: submitted, then declined'
            : `Progress: step ${active + 1} of ${STEP_LABELS.length} — ${STEP_LABELS[active]}`
        }
        title={
          declined
            ? 'Submitted · Declined'
            : STEP_LABELS.slice(0, active + 1).join(' → ')
        }
      >
        {STEP_LABELS.map((label, index) => {
          const state = declined
            ? index === 0
              ? 'done'
              : 'todo'
            : index < active
              ? 'done'
              : index === active
                ? 'current'
                : 'todo';
          return (
            <span key={label} className="inline-flex items-center">
              <span
                className={cx(
                  'h-2 w-2 rounded-full border',
                  state === 'done' && 'border-gold-600 bg-gold-600',
                  state === 'current' && 'border-gold-600 bg-white ring-2 ring-gold-500/40',
                  state === 'todo' && 'border-warm-300 bg-white',
                )}
              />
              {index < STEP_LABELS.length - 1 ? (
                <span
                  className={cx(
                    'h-px w-2.5',
                    !declined && index < active ? 'bg-gold-500' : 'bg-cream-300',
                  )}
                />
              ) : null}
            </span>
          );
        })}
        {declined ? (
          <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-clay-600">
            <X className="h-3 w-3" strokeWidth={2.4} />
            Declined
          </span>
        ) : null}
      </span>
    );
  }

  /* ------------------------------------------------------ Declined outline */
  if (declined) {
    return (
      <div className={className}>
        <ol className="flex items-center gap-2" aria-label="Request progress">
          <li className="flex items-center gap-2">
            <Dot state="done" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-warm-600">
              Submitted
            </span>
          </li>
          <li aria-hidden="true" className="h-px min-w-6 flex-1 bg-cream-300" />
          <li className="inline-flex items-center gap-1.5 rounded-full border border-clay-400/50 bg-clay-500/10 px-2.5 py-1">
            <X className="h-3.5 w-3.5 text-clay-600" strokeWidth={2.4} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-clay-700">
              Declined
            </span>
          </li>
        </ol>
        <p className="mt-2 text-[12.5px] text-warm-500">
          The performer politely passed on this track — details are in the timeline below.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------- Full track */
  return (
    <ol className={className} aria-label="Request progress">
      {STEP_LABELS.map((label, index) => {
        const state = index < active ? 'done' : index === active ? 'current' : 'todo';
        const last = index === STEP_LABELS.length - 1;
        return (
          <li key={label} className="min-w-0 flex-1" aria-current={state === 'current' ? 'step' : undefined}>
            <div className="flex items-center">
              <Dot state={state} />
              {!last ? (
                <span
                  aria-hidden="true"
                  className={cx('h-px flex-1', index < active ? 'bg-gold-500' : 'bg-cream-300')}
                />
              ) : null}
            </div>
            <p
              className={cx(
                'mt-2 text-[10px] uppercase tracking-[0.06em] sm:text-[11px]',
                state === 'done' && 'text-warm-600',
                state === 'current' && 'font-semibold text-gold-700',
                state === 'todo' && 'text-warm-400',
              )}
            >
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
