import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CircleCheck,
  Play,
  RotateCcw,
  Timer,
  TriangleAlert,
  UserRound,
  X,
} from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useActiveDepartment } from '@/hooks/useActiveDepartment';
import { useDepartmentQueue, filterQueue, type QueueFilter } from '@/hooks/useDepartmentQueue';
import { findDepartment, staffFor } from '@/data/departments';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Badge, CountChip, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { StatTile } from '@/components/ui/Panel';
import { SegmentedControl, SelectInput, TextInput } from '@/components/ui/Field';
import { Drawer } from '@/components/ui/Overlay';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { RequestTimeline } from '@/components/ui/Timeline';
import { DEPARTMENT_ACCENT, DEPARTMENT_HERO, DEPARTMENT_ICONS } from './departmentMeta';
import { DepartmentPanels } from './DepartmentPanels';
import { isTerminal, nextActionable, statusLabel, type TransitionOptions } from '@/services/requestEngine';
import { cx, inr, minutesSince, relativeTime } from '@/utils/format';
import type { RequestStatus, ServiceRequest } from '@/types';

const FILTERS: Array<{ value: QueueFilter; label: string }> = [
  { value: 'open', label: 'Needs action' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

/**
 * Department dashboard shell.
 *
 * Every one of the six dashboards shares this operational frame — header, live
 * KPIs, filterable queue, detail drawer with status actions — and then adds its
 * own department-specific panel (kitchen pass, floor board, SLA triage, set
 * list, transport board, therapist schedule).
 */
export function DepartmentRoute() {
  const department = useActiveDepartment();
  const { transition, assign } = useRequests();
  const queue = useDepartmentQueue(department);
  const [filter, setFilter] = useState<QueueFilter>('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => filterQueue(queue, filter, Date.now()), [queue, filter]);
  const selected = queue.find((request) => request.id === selectedId) ?? null;

  const counts = {
    open: queue.filter((request) => request.status === 'submitted').length,
    accepted: queue.filter((request) => request.status === 'accepted').length,
    in_progress: queue.filter((request) => request.status === 'in_progress').length,
    completed: queue.filter((request) => request.status === 'completed').length,
    all: queue.length,
  };

  const activeRequests = queue.filter((request) => !isTerminal(request.status));
  const oldestOpen = activeRequests.reduce(
    (max, request) => Math.max(max, minutesSince(request.submittedAt)),
    0,
  );

  const meta = findDepartment(department);
  const Icon = DEPARTMENT_ICONS[department];

  return (
    <div>
      {/* Header ------------------------------------------------------------- */}
      <header className="relative isolate overflow-hidden border-b border-white/10">
        <ImageWithFallback
          src={DEPARTMENT_HERO[department]}
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink-950/80" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/45" />

        <div className="relative px-4 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className={cx('eyebrow flex items-center gap-2', DEPARTMENT_ACCENT[department])}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                Department operations
              </p>
              <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ivory-50">
                {meta.name}
              </h1>
              <p className="mt-2 text-[13.5px] text-warm-400">
                {meta.subtitle} · {meta.location}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {meta.staff.slice(0, 4).map((person) => (
                <span
                  key={person.id}
                  title={`${person.name} · ${person.role}`}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/[0.07] text-[11.5px] font-semibold text-cream-200"
                >
                  {person.initials}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              dark
              tone="clay"
              label="Awaiting acceptance"
              value={counts.open}
              hint={counts.open > 0 ? 'Guests waiting on a reply' : 'Queue is clear'}
            />
            <StatTile
              dark
              tone="gold"
              label="In progress"
              value={counts.in_progress}
              hint={`${counts.accepted} accepted and ready to start`}
            />
            <StatTile
              dark
              label="Completed"
              value={counts.completed}
              hint="Closed from this queue"
            />
            <StatTile
              dark
              tone={oldestOpen > 30 ? 'clay' : 'sage'}
              label="Oldest open request"
              value={`${oldestOpen}m`}
              hint="Since submission"
            />
          </div>
        </div>
      </header>

      {/* Queue --------------------------------------------------------------- */}
      <section className="px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="eyebrow-sm text-warm-500">Live queue</p>
            <h2 className="display mt-2 text-[1.35rem] text-ivory-50">
              {FILTERS.find((entry) => entry.value === filter)?.label}
            </h2>
          </div>
          <SegmentedControl<QueueFilter>
            dark
            ariaLabel="Filter the queue by status"
            value={filter}
            onChange={setFilter}
            options={[
              { ...FILTERS[0], count: counts.open },
              FILTERS[1],
              { ...FILTERS[2], count: counts.accepted },
              { ...FILTERS[3], count: counts.in_progress },
              { ...FILTERS[4], count: counts.completed },
              { ...FILTERS[5], count: counts.all },
            ]}
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-[4px] border border-white/10 bg-white/[0.03]">
          {visible.length === 0 ? (
            <EmptyState
              dark
              title="Nothing in this view"
              body="Requests appear here the moment a guest submits one — switch filters or raise a request from the guest experience."
            />
          ) : (
            <ul className="divide-y divide-white/8">
              {visible.map((request) => (
                <li key={request.id}>
                  <QueueRow request={request} onOpen={() => setSelectedId(request.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Department-specific operations ---------------------------------- */}
        <div className="mt-6">
          <DepartmentPanels department={department} queue={queue} />
        </div>

        <Notice dark className="mt-6" tone="gold" title="Prototype environment">
          <p>
            Simulated staff access for demonstration only. A production deployment would require
            authenticated accounts, role-based permissions and server-side authorisation on every
            status change.
          </p>
        </Notice>
      </section>

      {/* Detail drawer -------------------------------------------------------- */}
      <Drawer
        dark
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        eyebrow={selected ? `${selected.ref} · ${selected.type}` : undefined}
        title={selected ? selected.title : ''}
        footer={
          selected ? (
            <StatusActions
              request={selected}
              onTransition={(status, options) => transition(selected.id, status, options)}
              onAssign={(staff) =>
                assign(selected.id, {
                  staff,
                  by: `${meta.name} · dashboard`,
                })
              }
            />
          ) : undefined
        }      >
        {selected ? <RequestDetailContent request={selected} department={department} /> : null}
      </Drawer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Queue row                                                                  */
/* -------------------------------------------------------------------------- */

function QueueRow({ request, onOpen }: { request: ServiceRequest; onOpen: () => void }) {
  const age = minutesSince(request.submittedAt);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500 sm:px-5"
    >
      <span className="tnum w-[78px] shrink-0 text-[12.5px] font-semibold tracking-[0.05em] text-warm-500">
        {request.ref}
      </span>

      <span className="min-w-0 flex-1 basis-52">
        <span className="block truncate text-[14px] font-medium text-ivory-50">{request.title}</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-warm-500">
          {request.location} · {request.guestLabel} · {relativeTime(request.updatedAt)}
        </span>
      </span>

      <span className="hidden shrink-0 items-center gap-2 sm:flex">
        <PriorityBadge priority={request.priority} dark />
        {request.value ? (
          <span className="tnum text-[12.5px] text-warm-400">{inr(request.value)}</span>
        ) : null}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <span
          className={cx(
            'hidden items-center gap-1 text-[12.5px] md:inline-flex',
            age > 30 && !isTerminal(request.status) ? 'text-clay-400' : 'text-warm-500',
          )}
        >
          <Timer className="h-3.5 w-3.5" strokeWidth={1.7} />
          {age}m
        </span>
        <StatusBadge dark status={request.status} stage={request.stage} />
        <ArrowRight className="h-4 w-4 shrink-0 text-warm-500" strokeWidth={1.6} />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer content                                                             */
/* -------------------------------------------------------------------------- */

function RequestDetailContent({
  request,
  department,
}: {
  request: ServiceRequest;
  department: string;
}) {
  void department;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge dark status={request.status} stage={request.stage} />
        <PriorityBadge priority={request.priority} dark />
        <Badge tone="neutral" dark>
          {request.location}
        </Badge>
        <CountChip value={request.votes ?? 0} dark />
      </div>

      <p className="text-[14px] leading-relaxed text-cream-200">{request.description}</p>

      <dl className="divide-y divide-white/8 border-y border-white/8">
        {Object.entries(request.meta).map(([key, value]) => (
          <div key={key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
            <dt className="eyebrow-sm w-32 shrink-0 text-warm-500">{key}</dt>
            <dd className="min-w-0 flex-1 text-[14px] break-words text-cream-200">{value}</dd>
          </div>
        ))}
        {request.assignedTo ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
            <dt className="eyebrow-sm w-32 shrink-0 text-warm-500">Assigned</dt>
            <dd className="min-w-0 flex-1 text-[14px] text-cream-200">{request.assignedTo}</dd>
          </div>
        ) : null}
        {request.value ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
            <dt className="eyebrow-sm w-32 shrink-0 text-warm-500">Value</dt>
            <dd className="tnum min-w-0 flex-1 text-[14px] text-cream-200">{inr(request.value)}</dd>
          </div>
        ) : null}
      </dl>

      {request.lineItems.length > 0 ? (
        <div>
          <p className="eyebrow-sm text-warm-500">Line items</p>
          <ul className="mt-2 divide-y divide-white/8 border-t border-white/8">
            {request.lineItems.map((line) => (
              <li key={`${line.label}-${line.qty}`} className="flex items-baseline gap-3 py-2 text-[14px]">
                <span className="tnum w-6 shrink-0 text-gold-400">{line.qty ? `${line.qty}×` : '·'}</span>
                <span className="min-w-0 flex-1 text-cream-200">{line.label}</span>
                {line.price ? (
                  <span className="tnum text-cream-200">{inr(line.price * (line.qty ?? 1))}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {request.guestNote ? (
        <div className="rounded-[3px] border border-gold-500/35 bg-gold-500/10 px-4 py-3">
          <p className="eyebrow-sm text-gold-300">Guest note</p>
          <p className="mt-2 text-[14px] leading-relaxed text-cream-200">{request.guestNote}</p>
        </div>
      ) : null}

      {request.resolutionNote ? (
        <div className="rounded-[3px] border border-sage-400/40 bg-sage-400/12 px-4 py-3">
          <p className="eyebrow-sm text-sage-300">Resolution note</p>
          <p className="mt-2 text-[14px] leading-relaxed text-cream-200">{request.resolutionNote}</p>
        </div>
      ) : null}

      <div>
        <p className="eyebrow-sm text-warm-500">History</p>
        <div className="mt-3">
          <RequestTimeline dark history={request.history} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status actions                                                             */
/* -------------------------------------------------------------------------- */

function StatusActions({
  request,
  onTransition,
  onAssign,
}: {
  request: ServiceRequest;
  onTransition: (status: RequestStatus, options?: Partial<TransitionOptions>) => void;
  onAssign: (staff: string) => void;
}) {
  const next = nextActionable(request.status);
  const terminal = isTerminal(request.status);
  const staff = staffFor(request.department);
  const [note, setNote] = useState('');

  const stageFor = (status: RequestStatus) => {
    if (request.department === 'restaurant' && status === 'in_progress') return 'preparing' as const;
    if (request.department === 'entertainment' && status === 'in_progress') return 'queued' as const;
    return undefined;
  };

  const advance = () => {
    if (!next) return;
    onTransition(next, {
      note: note.trim() || undefined,
      stage: stageFor(next),
    });
    setNote('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {!terminal && request.status === 'submitted' ? (
          <Button variant="gold" size="sm" onClick={advance}>
            <Check className="h-4 w-4" strokeWidth={2} />
            Accept request
          </Button>
        ) : null}

        {!terminal && request.status === 'accepted' ? (
          <Button variant="gold" size="sm" onClick={advance}>
            <Play className="h-4 w-4" strokeWidth={1.8} />
            Start work
          </Button>
        ) : null}

        {!terminal && request.status === 'in_progress' ? (
          <Button variant="gold" size="sm" onClick={advance}>
            <CircleCheck className="h-4 w-4" strokeWidth={1.8} />
            Mark complete
          </Button>
        ) : null}

        {!terminal ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              onTransition('rejected', {
                note: note.trim() || 'Declined with an alternative offered',
              })
            }
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
            Decline
          </Button>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-[3px] border border-white/15 bg-white/[0.06] px-3 py-2 text-[13px] text-warm-400">
            <CircleCheck className="h-4 w-4 text-sage-400" strokeWidth={1.7} />
            Closed · {statusLabel({ status: request.status, stage: request.stage })}
          </span>
        )}

        {request.status === 'completed' ? (
          <span
            className={cx(
              'inline-flex h-9 items-center gap-2 rounded-[3px] border border-white/15 px-3.5 text-[13px] text-warm-500',
              'cursor-not-allowed opacity-70',
            )}
            title="Completed requests cannot be reopened in this prototype"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.7} />
            Reopen
          </span>
        ) : null}
      </div>

      {!terminal ? (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="min-w-[210px] flex-1">
              <SelectInput
                dark
                aria-label="Assign to team member"
                value=""
                onChange={(event) => {
                  if (event.target.value) onAssign(event.target.value);
                }}
              >
                <option value="">Assign to…</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.name}>
                    {person.name} · {person.role}
                  </option>
                ))}
              </SelectInput>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-warm-500">
              <UserRound className="h-3.5 w-3.5" strokeWidth={1.7} />
              {request.assignedTo ?? 'Unassigned'}
            </span>
          </div>

          <div>
            <TextInput
              dark
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note added to the guest timeline…"
              aria-label="Note added to the timeline"
            />
          </div>
        </>
      ) : null}

      {!terminal && (request.status === 'submitted' || request.status === 'accepted') ? (
        <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-warm-500">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-500" strokeWidth={1.7} />
          Status changes are written to the shared state immediately — the guest timeline updates
          without a refresh.
        </p>
      ) : null}
    </div>
  );
}
