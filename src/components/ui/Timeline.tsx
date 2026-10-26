import type { EnquiryStatus, RequestStatus, StatusEvent } from '@/types';
import { cx, clockTime, fullTimestamp } from '@/utils/format';
import { statusLabel } from '@/services/requestEngine';
import { enquiryStatusLabel } from '@/services/enquiryEngine';

const DOT_TONE: Record<RequestStatus, string> = {
  submitted: 'bg-brass-500',
  accepted: 'bg-ink-700',
  in_progress: 'bg-gold-500',
  completed: 'bg-sage-600',
  rejected: 'bg-clay-500',
  cancelled: 'bg-warm-400',
};

/**
 * Guest-visible request timeline. Mirrors the "Track your request" concept in
 * the reference infographic: every status change is an immutable entry.
 */
export function RequestTimeline({
  history,
  dark = false,
  dense = false,
}: {
  history: StatusEvent[];
  dark?: boolean;
  dense?: boolean;
}) {
  const ordered = [...history];

  return (
    <ol className="relative">
      {ordered.map((event, index) => {
        const last = index === ordered.length - 1;
        return (
          <li key={`${event.status}-${event.at}-${index}`} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cx(
                  'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4',
                  DOT_TONE[event.status],
                  dark ? 'ring-ink-850' : 'ring-white',
                  last && 'animate-scale-in',
                )}
              />
              {!last ? (
                <span
                  aria-hidden="true"
                  className={cx(
                    'my-1 w-px flex-1',
                    dark ? 'bg-white/15' : 'bg-cream-300',
                  )}
                />
              ) : null}
            </div>

            <div className={cx('min-w-0 flex-1', dense ? 'pb-4' : 'pb-6', last && 'pb-0')}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p
                  className={cx(
                    'text-[13.5px] font-semibold tracking-[0.01em]',
                    dark ? 'text-ivory-50' : 'text-ink-900',
                  )}
                >
                  {statusLabel({ status: event.status, stage: event.stage })}
                </p>
                <time
                  dateTime={new Date(event.at).toISOString()}
                  className={cx('text-[12.5px] tabular-nums', dark ? 'text-warm-400' : 'text-warm-600')}
                  title={fullTimestamp(event.at)}
                >
                  {clockTime(event.at)}
                </time>
              </div>
              <p className={cx('mt-0.5 text-[12.5px]', dark ? 'text-warm-400' : 'text-warm-600')}>
                {event.by}
              </p>
              {event.note ? (
                <p
                  className={cx(
                    'mt-1.5 border-l-2 pl-3 text-[13px] leading-relaxed',
                    dark ? 'border-white/15 text-cream-200/85' : 'border-gold-500/50 text-warm-700',
                  )}
                >
                  {event.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const ENQUIRY_DOT: Record<EnquiryStatus, string> = {
  new: 'bg-brass-500',
  under_review: 'bg-ink-700',
  needs_info: 'bg-clay-500',
  proposal_sent: 'bg-gold-500',
  confirmed: 'bg-sage-600',
  closed: 'bg-warm-400',
};

/** Enquiry workflow timeline — same visual language as the request timeline. */
export function EnquiryTimeline({
  history,
  dark = false,
  dense = false,
}: {
  history: Array<{ status: EnquiryStatus; at: number; by: string; note?: string }>;
  dark?: boolean;
  dense?: boolean;
}) {
  return (
    <ol className="relative">
      {history.map((event, index) => {
        const last = index === history.length - 1;
        return (
          <li key={`${event.status}-${event.at}-${index}`} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cx(
                  'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4',
                  ENQUIRY_DOT[event.status],
                  dark ? 'ring-ink-850' : 'ring-white',
                  last && 'animate-scale-in',
                )}
              />
              {!last ? (
                <span
                  aria-hidden="true"
                  className={cx('my-1 w-px flex-1', dark ? 'bg-white/15' : 'bg-cream-300')}
                />
              ) : null}
            </div>

            <div className={cx('min-w-0 flex-1', dense ? 'pb-4' : 'pb-6', last && 'pb-0')}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p
                  className={cx(
                    'text-[13.5px] font-semibold tracking-[0.01em]',
                    dark ? 'text-ivory-50' : 'text-ink-900',
                  )}
                >
                  {enquiryStatusLabel(event.status)}
                </p>
                <time
                  dateTime={new Date(event.at).toISOString()}
                  className={cx('text-[12.5px] tabular-nums', dark ? 'text-warm-400' : 'text-warm-600')}
                  title={fullTimestamp(event.at)}
                >
                  {clockTime(event.at)}
                </time>
              </div>
              <p className={cx('mt-0.5 text-[12.5px]', dark ? 'text-warm-400' : 'text-warm-600')}>
                {event.by}
              </p>
              {event.note ? (
                <p
                  className={cx(
                    'mt-1.5 border-l-2 pl-3 text-[13px] leading-relaxed',
                    dark ? 'border-white/15 text-cream-200/85' : 'border-gold-500/50 text-warm-700',
                  )}
                >
                  {event.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
