import type { ReactNode } from 'react';
import {
  AudioLines,
  CalendarCheck,
  CarFront,
  ClipboardCheck,
  ConciergeBell,
  Flower2,
  Gauge,
  Gift,
  Layers,
  MessageSquareWarning,
  PackageCheck,
  Settings,
  Sparkles,
  Stethoscope,
  ThumbsUp,
  Wrench,
} from 'lucide-react';
import { NOW_PLAYING, PERFORMER } from '@/data/music';
import { staffFor } from '@/data/departments';
import { Badge, CountChip } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { EmptyState } from '@/components/ui/Feedback';
import { cx, inr, minutesSince } from '@/utils/format';
import { isTerminal } from '@/services/requestEngine';
import type { DepartmentId, ServiceRequest } from '@/types';

/**
 * Department-specific operational panels.
 *
 * Each dashboard keeps the shared queue frame and adds the one view its team
 * actually works from: the kitchen pass, the floor board, the SLA triage, the
 * set list, the transport board, or the therapist schedule.
 */
export function DepartmentPanels({
  department,
  queue,
}: {
  department: DepartmentId;
  queue: ServiceRequest[];
}) {
  switch (department) {
    case 'restaurant':
      return <RestaurantPanel queue={queue} />;
    case 'housekeeping':
      return <HousekeepingPanel queue={queue} />;
    case 'maintenance':
      return <MaintenancePanel queue={queue} />;
    case 'entertainment':
      return <EntertainmentPanel queue={queue} />;
    case 'concierge':
      return <ConciergePanel queue={queue} />;
    case 'spa':
      return <SpaPanel queue={queue} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Shared frame                                                               */
/* -------------------------------------------------------------------------- */

function Frame({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel dark className="overflow-hidden" padded={false}>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-white/15 bg-white/[0.06] text-gold-400">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="eyebrow-sm text-warm-500">{eyebrow}</p>
            <h3 className="display mt-2 text-[1.3rem] text-ivory-50">{title}</h3>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-warm-400">{description}</p>
          </div>
        </div>
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </Panel>
  );
}

function StatRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function Bar({ value, max, tone = 'gold' }: { value: number; max: number; tone?: 'gold' | 'sage' | 'clay' }) {
  const width = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const color = tone === 'sage' ? 'bg-sage-400' : tone === 'clay' ? 'bg-clay-500' : 'bg-gold-500';
  return (
    <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <span className={cx('block h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${width}%` }} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Restaurant — kitchen pass board                                            */
/* -------------------------------------------------------------------------- */

const PASS_COLUMNS: Array<{ key: string; label: string; match: (request: ServiceRequest) => boolean }> = [
  { key: 'new', label: 'New tickets', match: (request) => request.status === 'submitted' },
  { key: 'ack', label: 'Acknowledged', match: (request) => request.status === 'accepted' },
  { key: 'prep', label: 'Preparing', match: (request) => request.status === 'in_progress' },
  { key: 'served', label: 'Served', match: (request) => request.status === 'completed' },
];

function RestaurantPanel({ queue }: { queue: ServiceRequest[] }) {
  const orders = queue.filter((request) => request.service === 'food');
  const reservations = queue.filter((request) => request.service === 'reservations');
  const openValue = orders
    .filter((request) => !isTerminal(request.status))
    .reduce((sum, request) => sum + (request.value ?? 0), 0);
  const covers = orders
    .filter((request) => !isTerminal(request.status))
    .reduce((sum, request) => sum + Number(request.meta.Covers ?? 2), 0);

  return (
    <div className="space-y-5">
      <StatRow>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Open order value</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-gold-400">{inr(openValue)}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Sample pricing · live from the queue</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Covers being served</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">{covers}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Across open room and table orders</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Table reservations</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">
            {reservations.filter((request) => !isTerminal(request.status)).length}
          </p>
          <p className="mt-2 text-[12.5px] text-warm-500">Routed here by the dining topic rule</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Sample kitchen estimate</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">28 min</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Quoted to guests on the menu screen</p>
        </Panel>
      </StatRow>

      <Frame
        eyebrow="Service board"
        title="Kitchen pass — right now"
        description="Tickets move left to right as the team accepts, prepares and serves them."
        icon={<ClipboardCheck className="h-4 w-4" strokeWidth={1.7} />}
      >
        <div className="grid gap-3 lg:grid-cols-4">
          {PASS_COLUMNS.map((column) => {
            const tickets = queue.filter(column.match);
            return (
              <div key={column.key} className="rounded-[3px] border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <span className="eyebrow-sm text-warm-500">{column.label}</span>
                  <CountChip value={tickets.length} dark />
                </div>
                <ul className="mt-3 space-y-2">
                  {tickets.length === 0 ? (
                    <li className="rounded-[3px] border border-dashed border-white/12 px-3 py-4 text-center text-[12.5px] text-warm-500">
                      Clear
                    </li>
                  ) : (
                    tickets.map((request) => (
                      <li key={request.id} className="rounded-[3px] border border-white/10 bg-ink-850 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="tnum text-[11.5px] font-semibold text-gold-400">{request.ref}</span>
                          <span className="tnum text-[11.5px] text-warm-500">{minutesSince(request.submittedAt)}m</span>
                        </div>
                        <p className="mt-1 truncate text-[13px] text-cream-200">{request.title}</p>
                        <p className="mt-0.5 truncate text-[11.5px] text-warm-500">
                          {request.location}
                          {request.meta.Course ? ` · ${request.meta.Course}` : ''}
                          {request.value ? ` · ${inr(request.value)}` : ''}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </Frame>

      <Frame
        eyebrow="Reservations"
        title="Upcoming tables"
        description="Dining reservations routed from the guest Reservations service."
        icon={<CalendarCheck className="h-4 w-4" strokeWidth={1.7} />}
      >
        {reservations.length === 0 ? (
          <EmptyState dark compact title="No bookings in view" body="Table requests from guests appear here as soon as they are submitted." />
        ) : (
          <ul className="divide-y divide-white/8">
            {reservations.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="tnum w-[74px] shrink-0 text-[12.5px] text-warm-500">{request.ref}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-ivory-50">{request.title}</span>
                  <span className="block text-[12.5px] text-warm-500">
                    Party {request.meta.Party ?? '—'} · {request.meta.Preferred ?? 'flexible'} · {request.location}
                  </span>
                </span>
                <Badge tone="neutral" dark>
                  {request.status === 'accepted' ? 'Table held' : 'Awaiting'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Frame>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Housekeeping — floor board                                                 */
/* -------------------------------------------------------------------------- */

const FLOOR_ROOMS = [
  { room: '502', floor: 'Level 5', attendant: 'Vaishali Patil', state: 'Occupied' },
  { room: '401', floor: 'Level 4', attendant: 'Anjali Deshmukh', state: 'Occupied' },
  { room: '314', floor: 'Level 3', attendant: 'Vaishali Patil', state: 'Occupied' },
  { room: '219', floor: 'Level 2', attendant: 'Anjali Deshmukh', state: 'Vacant clean' },
  { room: '208', floor: 'Level 2', attendant: 'Manoj Yadav', state: 'Departed — deep clean' },
  { room: '302', floor: 'Level 3', attendant: 'Manoj Yadav', state: 'Vacant clean' },
];

function HousekeepingPanel({ queue }: { queue: ServiceRequest[] }) {
  const open = queue.filter((request) => !isTerminal(request.status));
  const roomTasks = open.filter((request) => request.location.startsWith('Room'));
  const attendants = staffFor('housekeeping');

  const workload = attendants.map((person) => ({
    person,
    count: open.filter((request) => request.assignedTo === person.name).length,
  }));
  const maxLoad = Math.max(1, ...workload.map((entry) => entry.count));

  return (
    <div className="space-y-5">
      <StatRow>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Open room requests</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-sage-300">{roomTasks.length}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Towels, linen, amenities and turndown</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Attendants on shift</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">{attendants.length}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Sample roster · linen room, Level 2</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Public-area tasks</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">
            {open.filter((request) => !request.location.startsWith('Room')).length}
          </p>
          <p className="mt-2 text-[12.5px] text-warm-500">Lounge, terrace and pool deck</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Sample response target</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">22 min</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Illustrative target, not measured</p>
        </Panel>
      </StatRow>

      <Frame
        eyebrow="Floor board"
        title="Today's rooms"
        description="Illustrative room status for the floor round — demo content, not a housekeeping system of record."
        icon={<Layers className="h-4 w-4" strokeWidth={1.7} />}
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FLOOR_ROOMS.map((room) => {
            const task = roomTasks.find((request) => request.location.includes(room.room));
            return (
              <li key={room.room} className="rounded-[3px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="display text-[1.15rem] text-ivory-50">Room {room.room}</span>
                  <Badge tone={task ? 'brass' : room.state.startsWith('Vacant') ? 'sage' : 'neutral'} dark>
                    {task ? 'Guest request open' : room.state.split(' ')[0]}
                  </Badge>
                </div>
                <p className="mt-1.5 text-[12.5px] text-warm-500">
                  {room.floor} · {room.attendant}
                </p>
                <p className="mt-0.5 text-[12.5px] text-warm-400">{room.state}</p>
                {task ? (
                  <p className="mt-2 truncate border-t border-white/10 pt-2 text-[12.5px] text-gold-300">
                    {task.ref} · {task.title}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Frame>

      <Frame
        eyebrow="Workload"
        title="Who is carrying what"
        description="Live assignment counts from the shared queue."
        icon={<PackageCheck className="h-4 w-4" strokeWidth={1.7} />}
      >
        <ul className="space-y-4">
          {workload.map((entry) => (
            <li key={entry.person.id}>
              <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                <span className="text-cream-200">
                  {entry.person.name}
                  <span className="ml-2 text-[12.5px] text-warm-500">{entry.person.role}</span>
                </span>
                <span className="tnum text-warm-400">{entry.count} assigned</span>
              </div>
              <Bar value={entry.count} max={maxLoad} tone="sage" />
            </li>
          ))}
        </ul>
      </Frame>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Maintenance — SLA triage                                                   */
/* -------------------------------------------------------------------------- */

const ASSETS = [
  { id: 'FCU-502', name: 'Fan coil unit · Room 502', state: 'Monitored' },
  { id: 'GEY-219', name: 'Geyser inlet · Room 219', state: 'Technician on site' },
  { id: 'LGT-302', name: 'Lighting circuit · Room 302', state: 'Resolved' },
  { id: 'LIFT-2', name: 'Lobby lift 2', state: 'Scheduled service' },
];

const PRIORITY_ORDER = ['urgent', 'high', 'normal', 'low'] as const;

function MaintenancePanel({ queue }: { queue: ServiceRequest[] }) {
  const open = queue.filter((request) => !isTerminal(request.status));
  const byPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    count: open.filter((request) => request.priority === priority).length,
  }));
  const maxCount = Math.max(1, ...byPriority.map((entry) => entry.count));
  const oldest = open.reduce<ServiceRequest | null>(
    (current, request) => (!current || request.submittedAt < current.submittedAt ? request : current),
    null,
  );

  return (
    <div className="space-y-5">
      <StatRow>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Open tickets</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-gold-400">{open.length}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Awaiting or under repair</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Urgent + high</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-clay-500">
            {open.filter((request) => request.priority === 'urgent' || request.priority === 'high').length}
          </p>
          <p className="mt-2 text-[12.5px] text-warm-500">Comfort-affecting issues first</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Oldest open</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">
            {oldest ? `${minutesSince(oldest.submittedAt)}m` : '—'}
          </p>
          <p className="mt-2 text-[12.5px] text-warm-500">{oldest ? oldest.ref : 'Queue is clear'}</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Sample SLA target</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">45 min</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Illustrative target for repairs</p>
        </Panel>
      </StatRow>

      <Frame
        eyebrow="Triage"
        title="Priority distribution"
        description="How the open queue is weighted right now — re-severity a ticket from the detail drawer."
        icon={<Gauge className="h-4 w-4" strokeWidth={1.7} />}
      >
        <ul className="space-y-4">
          {byPriority.map((entry) => (
            <li key={entry.priority}>
              <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                <span className="capitalize text-cream-200">{entry.priority}</span>
                <span className="tnum text-warm-400">{entry.count} open</span>
              </div>
              <Bar
                value={entry.count}
                max={maxCount}
                tone={entry.priority === 'urgent' || entry.priority === 'high' ? 'clay' : 'gold'}
              />
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="eyebrow-sm text-warm-500">Fault categories in the queue</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from(new Set(open.map((request) => request.meta.Category ?? 'General'))).map((category) => (
              <span key={category} className="chip chip-dark">
                <Wrench className="h-3.5 w-3.5" strokeWidth={1.7} />
                {category}
              </span>
            ))}
            {open.length === 0 ? <span className="text-[13px] text-warm-500">No open tickets.</span> : null}
          </div>
        </div>
      </Frame>

      <Frame
        eyebrow="Asset watchlist"
        title="Equipment under attention"
        description="Sample asset register for the workshop board."
        icon={<Settings className="h-4 w-4" strokeWidth={1.7} />}
      >
        <ul className="divide-y divide-white/8">
          {ASSETS.map((asset) => (
            <li key={asset.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="tnum w-[84px] shrink-0 text-[12.5px] text-warm-500">{asset.id}</span>
              <span className="min-w-0 flex-1 text-[14px] text-cream-200">{asset.name}</span>
              <Badge tone={asset.state === 'Resolved' ? 'sage' : asset.state === 'Technician on site' ? 'brass' : 'neutral'} dark>
                {asset.state}
              </Badge>
            </li>
          ))}
        </ul>
      </Frame>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Entertainment — set list & votes                                           */
/* -------------------------------------------------------------------------- */

function EntertainmentPanel({ queue }: { queue: ServiceRequest[] }) {
  const music = queue.filter((request) => request.service === 'music');
  const awaiting = music.filter((request) => request.status === 'submitted');
  const ranked = [...music]
    .filter((request) => !isTerminal(request.status) || request.status === 'completed')
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    .slice(0, 6);
  const maxVotes = Math.max(1, ...ranked.map((request) => request.votes ?? 0));

  return (
    <div className="space-y-5">
      <Frame
        eyebrow="Stage"
        title="Now playing & next set"
        description="What the ensemble is performing and when the next break falls."
        icon={<AudioLines className="h-4 w-4" strokeWidth={1.7} />}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-[3px] border border-gold-500/30 bg-gold-500/10 px-4 py-3.5">
            <p className="eyebrow-sm text-gold-300">On stage now</p>
            <p className="display mt-2 text-[1.35rem] text-ivory-50">{NOW_PLAYING.title}</p>
            <p className="mt-1 text-[13px] text-warm-400">
              {NOW_PLAYING.artist} · {NOW_PLAYING.genre} · {NOW_PLAYING.duration}
            </p>
          </div>
          <div className="rounded-[3px] border border-white/10 bg-white/[0.03] px-4 py-3.5">
            <p className="eyebrow-sm text-warm-500">Running order</p>
            <p className="mt-2 text-[13.5px] text-cream-200">{PERFORMER.name}</p>
            <p className="mt-1 text-[13px] text-warm-400">{PERFORMER.setNote}</p>
            <p className="mt-2 text-[13px] text-gold-300">Next set · {PERFORMER.nextSet}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip chip-dark">
            <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.7} />
            {music.reduce((sum, request) => sum + (request.votes ?? 0), 0)} total votes
          </span>
          <span className="chip chip-dark">
            <ClipboardCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
            {awaiting.length} awaiting approval
          </span>
          <span className="chip chip-dark">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.7} />
            {music.filter((request) => request.guestNote).length} with dedications
          </span>
        </div>
      </Frame>

      <Frame
        eyebrow="Request queue"
        title="Vote leaderboard"
        description="Guest votes decide the running order — highest vote count plays first."
        icon={<ThumbsUp className="h-4 w-4" strokeWidth={1.7} />}
      >
        {ranked.length === 0 ? (
          <EmptyState dark compact title="No song requests yet" body="Guest requests land here the moment they are submitted from the music screen." />
        ) : (
          <ul className="space-y-4">
            {ranked.map((request, index) => (
              <li key={request.id}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13.5px]">
                  <span className="tnum w-5 shrink-0 text-warm-500">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-cream-200">
                    {request.meta.Track ?? request.title}
                    <span className="ml-2 text-[12.5px] text-warm-500">{request.location}</span>
                  </span>
                  <Badge tone={request.status === 'completed' ? 'sage' : request.status === 'in_progress' ? 'gold' : 'brass'} dark>
                    {request.status === 'completed' ? 'Played' : request.status === 'in_progress' ? 'In queue' : 'Awaiting'}
                  </Badge>
                  <span className="tnum w-8 shrink-0 text-right text-gold-300">{request.votes ?? 0}</span>
                </div>
                <Bar value={request.votes ?? 0} max={maxVotes} />
              </li>
            ))}
          </ul>
        )}
      </Frame>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Concierge — transport & guest relations boards                             */
/* -------------------------------------------------------------------------- */

function ConciergePanel({ queue }: { queue: ServiceRequest[] }) {
  const transports = queue.filter((request) => request.service === 'transport');
  const concerns = queue.filter((request) => request.service === 'feedback');
  const celebrations = queue.filter((request) => request.service === 'occasions');
  const enquiries = queue.filter((request) => request.service === 'concierge');
  const billing = queue.filter((request) => request.service === 'billing');

  const workstreams = [
    { label: 'Guest enquiries', count: enquiries.filter((request) => !isTerminal(request.status)).length, icon: ConciergeBell },
    { label: 'Concerns to resolve', count: concerns.filter((request) => !isTerminal(request.status)).length, icon: MessageSquareWarning },
    { label: 'Celebrations to prepare', count: celebrations.filter((request) => !isTerminal(request.status)).length, icon: Gift },
    { label: 'Bill reviews pending', count: billing.filter((request) => !isTerminal(request.status)).length, icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-5">
      <StatRow>
        {workstreams.map((entry) => {
          const Icon = entry.icon;
          return (
            <Panel key={entry.label} dark>
              <p className="eyebrow-sm flex items-center gap-2 text-warm-500">
                <Icon className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.7} />
                {entry.label}
              </p>
              <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">{entry.count}</p>
              <p className="mt-2 text-[12.5px] text-warm-500">Open on this desk</p>
            </Panel>
          );
        })}
      </StatRow>

      <Frame
        eyebrow="Transport board"
        title="Upcoming journeys"
        description="Vehicles, pickups and destinations confirmed or awaiting a driver."
        icon={<CarFront className="h-4 w-4" strokeWidth={1.7} />}
      >
        {transports.length === 0 ? (
          <EmptyState dark compact title="No journeys booked" body="Transport requests raised from the guest interface appear here with pickup, destination and timing." />
        ) : (
          <ul className="divide-y divide-white/8">
            {transports.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="tnum w-[74px] shrink-0 text-[12.5px] text-warm-500">{request.ref}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-ivory-50">{request.meta.Option ?? request.title}</span>
                  <span className="block truncate text-[12.5px] text-warm-500">
                    {request.meta.Pickup} → {request.meta.Destination}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[13px] text-gold-300">{request.meta.Preferred ?? '—'}</span>
                  <span className="block text-[12px] text-warm-500">
                    {request.meta.Passengers ?? '—'} pax · {request.status === 'accepted' ? 'held' : 'pending'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Frame>

      <Frame
        eyebrow="Guest relations"
        title="Follow-ups owed to guests"
        description="Concerns and celebrations that need a personal reply before check-out."
        icon={<MessageSquareWarning className="h-4 w-4" strokeWidth={1.7} />}
      >
        {[...concerns, ...celebrations].length === 0 ? (
          <EmptyState dark compact title="Nothing outstanding" body="Compliments, concerns and occasion requests from guests appear here." />
        ) : (
          <ul className="divide-y divide-white/8">
            {[...concerns, ...celebrations].map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="tnum w-[74px] shrink-0 text-[12.5px] text-warm-500">{request.ref}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-ivory-50">{request.title}</span>
                  <span className="block text-[12.5px] text-warm-500">
                    {request.location} · {request.meta.Category ?? request.meta.Package ?? request.type}
                  </span>
                </span>
                <Badge tone={request.priority === 'high' ? 'brass' : 'neutral'} dark>
                  {request.priority} priority
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Frame>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Spa — therapist schedule                                                   */
/* -------------------------------------------------------------------------- */

function SpaPanel({ queue }: { queue: ServiceRequest[] }) {
  const spaRequests = queue.filter((request) => request.service === 'spa');
  const therapists = staffFor('spa');

  const schedule = [...spaRequests].sort((a, b) =>
    (a.meta.Slot ?? '').localeCompare(b.meta.Slot ?? ''),
  );

  const workload = therapists.map((person) => ({
    person,
    count: spaRequests.filter((request) => request.assignedTo === person.name && !isTerminal(request.status)).length,
  }));
  const maxLoad = Math.max(1, ...workload.map((entry) => entry.count));

  const mix = Array.from(
    new Set(spaRequests.map((request) => request.meta.Treatment ?? request.title)),
  ).map((treatment) => ({
    treatment,
    count: spaRequests.filter((request) => (request.meta.Treatment ?? request.title) === treatment).length,
  }));

  return (
    <div className="space-y-5">
      <StatRow>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Treatments booked today</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-sage-300">{spaRequests.length}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Sample day · wellness suite</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">In treatment now</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">
            {spaRequests.filter((request) => request.status === 'in_progress').length}
          </p>
          <p className="mt-2 text-[12.5px] text-warm-500">Do not disturb applies</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Awaiting confirmation</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-gold-400">
            {spaRequests.filter((request) => request.status === 'submitted').length}
          </p>
          <p className="mt-2 text-[12.5px] text-warm-500">Reply to the guest with a therapist</p>
        </Panel>
        <Panel dark>
          <p className="eyebrow-sm text-warm-500">Therapists on duty</p>
          <p className="tnum mt-3 text-[1.7rem] font-semibold leading-none text-ivory-50">{therapists.length}</p>
          <p className="mt-2 text-[12.5px] text-warm-500">Level 6 wellness suite</p>
        </Panel>
      </StatRow>

      <Frame
        eyebrow="Schedule"
        title="Today's appointments"
        description="Bookings ordered by slot, with therapist and treatment length."
        icon={<Flower2 className="h-4 w-4" strokeWidth={1.7} />}
      >
        {schedule.length === 0 ? (
          <EmptyState dark compact title="No treatments booked" body="Spa requests from guests appear here with their preferred slot and therapist preference." />
        ) : (
          <ul className="divide-y divide-white/8">
            {schedule.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="tnum w-[74px] shrink-0 text-[13px] font-semibold text-gold-300">
                  {request.meta.Slot ?? '—'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-ivory-50">
                    {request.meta.Treatment ?? request.title}
                  </span>
                  <span className="block text-[12.5px] text-warm-500">
                    {request.location} · {request.meta.Duration ?? '—'} ·{' '}
                    {request.meta.Therapist ?? 'preference not set'}
                  </span>
                </span>
                <Badge
                  tone={
                    request.status === 'completed'
                      ? 'sage'
                      : request.status === 'in_progress'
                        ? 'gold'
                        : request.status === 'accepted'
                          ? 'ink'
                          : 'brass'
                  }
                  dark
                >
                  {request.assignedTo ?? 'Unassigned'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Frame>

      <div className="grid gap-5 lg:grid-cols-2">
        <Frame
          eyebrow="Team"
          title="Therapist workload"
          description="Open treatments currently assigned."
          icon={<Stethoscope className="h-4 w-4" strokeWidth={1.7} />}
        >
          <ul className="space-y-4">
            {workload.map((entry) => (
              <li key={entry.person.id}>
                <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                  <span className="text-cream-200">
                    {entry.person.name}
                    <span className="ml-2 text-[12.5px] text-warm-500">{entry.person.role}</span>
                  </span>
                  <span className="tnum text-warm-400">{entry.count}</span>
                </div>
                <Bar value={entry.count} max={maxLoad} tone="sage" />
              </li>
            ))}
          </ul>
        </Frame>

        <Frame
          eyebrow="Menu mix"
          title="What guests are booking"
          description="Treatment demand from this queue."
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.7} />}
        >
          <ul className="space-y-3">
            {mix.map((entry) => (
              <li key={entry.treatment} className="flex items-center justify-between gap-3 text-[13.5px]">
                <span className="min-w-0 truncate text-cream-200">{entry.treatment}</span>
                <span className="tnum shrink-0 rounded-full border border-white/15 px-2.5 py-[2px] text-[12px] text-warm-400">
                  {entry.count}
                </span>
              </li>
            ))}
          </ul>
        </Frame>
      </div>
    </div>
  );
}
