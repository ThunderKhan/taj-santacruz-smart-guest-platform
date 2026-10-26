import type { ReactNode } from 'react';
import type { EnquiryStatus, Priority, RequestStage, RequestStatus } from '@/types';
import { cx } from '@/utils/format';
import { statusLabel } from '@/services/requestEngine';
import { enquiryStatusLabel } from '@/services/enquiryEngine';

export type BadgeTone = 'brass' | 'ink' | 'gold' | 'sage' | 'clay' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  brass: 'border-brass-500/40 bg-brass-500/12 text-clay-600',
  ink: 'border-ink-700/30 bg-ink-700/8 text-ink-700',
  gold: 'border-gold-500 bg-gold-500 text-ink-950',
  sage: 'border-sage-500/45 bg-sage-500/15 text-forest-700',
  clay: 'border-clay-500/40 bg-clay-500/12 text-clay-600',
  neutral: 'border-warm-400/45 bg-warm-100 text-warm-700',
};

const DARK_TONES: Record<BadgeTone, string> = {
  brass: 'border-brass-500/50 bg-brass-500/18 text-gold-300',
  ink: 'border-white/25 bg-white/10 text-cream-200',
  gold: 'border-gold-500 bg-gold-500 text-ink-950',
  sage: 'border-sage-400/50 bg-sage-400/20 text-sage-300',
  clay: 'border-clay-500/55 bg-clay-500/20 text-[#E7B49B]',
  neutral: 'border-white/18 bg-white/8 text-warm-300',
};

export function Badge({
  tone = 'neutral',
  dark = false,
  className,
  children,
  dot = false,
}: {
  tone?: BadgeTone;
  dark?: boolean;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px]',
        'text-[10.5px] font-semibold uppercase tracking-[0.12em] leading-[1.5]',
        dark ? DARK_TONES[tone] : TONES[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" /> : null}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<RequestStatus, BadgeTone> = {
  submitted: 'brass',
  accepted: 'ink',
  in_progress: 'gold',
  completed: 'sage',
  rejected: 'clay',
  cancelled: 'neutral',
};

export function StatusBadge({
  status,
  stage,
  dark = false,
}: {
  status: RequestStatus;
  stage?: RequestStage;
  dark?: boolean;
}) {
  return (
    <Badge tone={STATUS_TONE[status]} dark={dark} dot>
      {statusLabel({ status, stage })}
    </Badge>
  );
}

const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  urgent: 'clay',
  high: 'brass',
  normal: 'neutral',
  low: 'neutral',
};

const PRIORITY_WORD: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export function PriorityBadge({
  priority,
  dark = false,
}: {
  priority: Priority;
  dark?: boolean;
}) {
  if (priority === 'normal') return null;
  return (
    <Badge tone={PRIORITY_TONE[priority]} dark={dark}>
      {PRIORITY_WORD[priority]}
    </Badge>
  );
}

const ENQUIRY_TONE: Record<EnquiryStatus, BadgeTone> = {
  new: 'brass',
  under_review: 'ink',
  needs_info: 'clay',
  proposal_sent: 'gold',
  confirmed: 'sage',
  closed: 'neutral',
};

/** Status pill for celebration enquiries (own workflow, own wording). */
export function EnquiryStatusBadge({
  status,
  dark = false,
}: {
  status: EnquiryStatus;
  dark?: boolean;
}) {
  return (
    <Badge tone={ENQUIRY_TONE[status]} dark={dark} dot>
      {enquiryStatusLabel(status)}
    </Badge>
  );
}

/** Quiet count chip used in dashboard tabs and the notification bell. */
export function CountChip({
  value,
  dark = false,
  strong = false,
}: {
  value: number;
  dark?: boolean;
  strong?: boolean;
}) {
  if (value <= 0) return null;
  return (
    <span
      className={cx(
        'inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-[1px]',
        'text-[11px] font-semibold tabular-nums leading-[1.45]',
        strong
          ? 'bg-clay-600 text-ivory-50'
          : dark
            ? 'bg-white/12 text-cream-200'
            : 'bg-cream-300 text-warm-700',
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}
