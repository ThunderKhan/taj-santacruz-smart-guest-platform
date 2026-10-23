import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Compass } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath } from '@/hooks/useHomePath';
import { StatusBadge, PriorityBadge, Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/Panel';
import { SegmentedControl } from '@/components/ui/Field';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { isTerminal } from '@/services/requestEngine';
import { departmentName } from '@/data/departments';
import { relativeTime } from '@/utils/format';
import type { ServiceRequest } from '@/types';

type Filter = 'active' | 'completed' | 'all';

/**
 * "My requests" — every submission made from this demo session, with live
 * status straight from shared state.
 */
export function MyRequests() {
  const { requests, session, tick } = useRequests();
  const [filter, setFilter] = useState<Filter>('active');

  const mine = useMemo(
    () =>
      requests
        .filter((request) => request.guestRef === session.guestRef)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    // `tick` refreshes relative timestamps without touching persisted state.
    [requests, session.guestRef, tick],
  );

  const counts = {
    active: mine.filter((request) => !isTerminal(request.status)).length,
    completed: mine.filter((request) => request.status === 'completed').length,
    all: mine.length,
  };

  const visible = mine.filter((request) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return request.status === 'completed';
    return !isTerminal(request.status);
  });

  return (
    <ServiceShell
      eyebrow="Your session"
      title="My requests"
      description="Everything you have asked for during this stay, with the live status recorded by each department. Rows open a full timeline — no refresh needed."
      actions={
        <Link
          to="/guest"
          className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-warm-300 bg-white px-4 text-[13.5px] font-medium text-ink-900 transition-colors hover:border-warm-400"
        >
          <Compass className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
          Browse services
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open now', value: counts.active, hint: 'Awaiting action or in progress' },
          { label: 'Completed', value: counts.completed, hint: 'Closed during this stay' },
          { label: 'Total raised', value: counts.all, hint: 'This demo session' },
        ].map((tile) => (
          <div
            key={tile.label}
            className="rounded-[4px] border border-cream-300 bg-white p-4 shadow-hairline sm:p-5"
          >
            <p className="eyebrow-sm text-warm-500">{tile.label}</p>
            <p className="tnum mt-3 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-none text-ink-900">
              {tile.value}
            </p>
            <p className="mt-2 text-[12.5px] text-warm-600">{tile.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionHeading
          eyebrow="Timeline"
          title="Request history"
          action={
            <SegmentedControl<Filter>
              ariaLabel="Filter requests"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'active', label: 'Open', count: counts.active },
                { value: 'completed', label: 'Completed', count: counts.completed },
                { value: 'all', label: 'All', count: counts.all },
              ]}
            />
          }
        />

        <div className="mt-5 overflow-hidden rounded-[4px] border border-cream-300 bg-white shadow-hairline">
          {visible.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" strokeWidth={1.5} />}
              title={filter === 'active' ? 'Nothing open right now' : 'No requests here yet'}
              body={
                filter === 'active'
                  ? 'Every request has been completed or closed. Anything you raise from the service directory appears here instantly.'
                  : 'Choose a service from the directory and your request will be tracked here from submission to completion.'
              }
              action={
                <Link
                  to="/guest"
                  className="inline-flex h-10 items-center gap-2 rounded-[3px] bg-ink-900 px-4 text-[13.5px] font-medium text-ivory-50 transition-colors hover:bg-ink-800"
                >
                  Open the service directory
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-cream-300">
              {visible.map((request) => (
                <li key={request.id}>
                  <RequestRow request={request} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <Notice className="mt-5" tone="gold" title="Live demonstration">
          <p>
            Statuses here change the moment a department acts. Switch to a department dashboard from
            the presenter ribbon, advance a request, then come back — everything stays in sync
            because all three experiences share one state.
          </p>
        </Notice>
      </div>
    </ServiceShell>
  );
}

function RequestRow({ request }: { request: ServiceRequest }) {
  const homePath = useHomePath();
  return (
    <Link
      to={`${homePath}/my-requests/${request.ref}`}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors hover:bg-warm-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600 sm:px-5"
    >
      <span className="tnum w-[84px] shrink-0 text-[12.5px] font-semibold tracking-[0.05em] text-warm-500">
        {request.ref}
      </span>

      <span className="min-w-0 flex-1 basis-56">
        <span className="block truncate text-[14.5px] font-medium text-ink-900">{request.title}</span>
        <span className="mt-0.5 block text-[12.5px] text-warm-500">
          {departmentName(request.department)} · {request.location} · {relativeTime(request.updatedAt)}
        </span>
      </span>

      <span className="flex shrink-0 flex-wrap items-center gap-2">
        <PriorityBadge priority={request.priority} />
        {request.seeded ? <Badge tone="neutral">Demo</Badge> : null}
        <StatusBadge status={request.status} stage={request.stage} />
        <ArrowRight
          className="h-4 w-4 shrink-0 text-warm-400 transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.7}
        />
      </span>
    </Link>
  );
}

