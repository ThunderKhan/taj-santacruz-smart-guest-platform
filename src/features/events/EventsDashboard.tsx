import { useMemo, useState } from 'react';
import { CalendarDays, Search, TriangleAlert, Users } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { findDepartment } from '@/data/departments';
import {
  DEPARTMENT_ACCENT,
  DEPARTMENT_HERO,
  DEPARTMENT_ICONS,
} from '@/features/departments/departmentMeta';
import { ENTERTAINMENT_TYPES, OCCASION_TYPES } from '@/data/celebrations';
import { Badge, CountChip, EnquiryStatusBadge } from '@/components/ui/Badge';
import { Panel, SectionHeading, StatTile } from '@/components/ui/Panel';
import { SearchInput, SelectInput } from '@/components/ui/Field';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import {
  enquiryStatusLabel,
  isEnquiryTerminal,
} from '@/services/enquiryEngine';
import { isoDateLabel, relativeTime } from '@/utils/format';
import { cx } from '@/utils/format';
import type { EnquiryStatus } from '@/types';
import { EnquiryDrawer } from './EnquiryDrawer';

/**
 * Events & Banquets dashboard — Feature B's staff side.
 *
 * The desk sees every celebration enquiry raised from the guest form (and the
 * kiosk), filters by occasion, date window, entertainment preference or
 * workflow status, and works each one through the drawer: assignment, sample
 * package, internal notes and the New → Under Review → Need More Information →
 * Proposal Sent → Confirmed / Closed workflow. No availability is ever
 * claimed: packages are sample data and confirmations are simulation only.
 */
export function EventsDashboard() {
  const { enquiries } = useRequests();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [occasion, setOccasion] = useState('all');
  const [entertainment, setEntertainment] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateWindow, setDateWindow] = useState('all');

  const now = Date.now();
  const DAY = 86_400_000;

  const counts = {
    open: enquiries.filter((enquiry) => !isEnquiryTerminal(enquiry.status)).length,
    fresh: enquiries.filter((enquiry) => enquiry.status === 'new').length,
    review: enquiries.filter(
      (enquiry) => enquiry.status === 'under_review' || enquiry.status === 'needs_info',
    ).length,
    proposals: enquiries.filter((enquiry) => enquiry.status === 'proposal_sent').length,
    confirmed: enquiries.filter((enquiry) => enquiry.status === 'confirmed').length,
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return enquiries.filter((enquiry) => {
      if (occasion !== 'all' && enquiry.occasion !== occasion) return false;
      if (entertainment !== 'all' && enquiry.entertainment !== entertainment) return false;
      if (status !== 'all') {
        if (status === 'open' && isEnquiryTerminal(enquiry.status)) return false;
        if (status !== 'open' && enquiry.status !== status) return false;
      }
      if (dateWindow !== 'all') {
        const eventTs = Date.parse(`${enquiry.eventDate}T12:00:00`);
        if (dateWindow === '30' && eventTs > now + 30 * DAY) return false;
        if (dateWindow === '90' && eventTs > now + 90 * DAY) return false;
        if (dateWindow === 'later' && eventTs <= now + 90 * DAY) return false;
      }
      if (!needle) return true;
      return (
        enquiry.ref.toLowerCase().includes(needle) ||
        enquiry.occasion.toLowerCase().includes(needle) ||
        enquiry.venue.toLowerCase().includes(needle) ||
        enquiry.genre.toLowerCase().includes(needle) ||
        (enquiry.assignedTo ?? '').toLowerCase().includes(needle)
      );
    });
  }, [enquiries, query, occasion, entertainment, status, dateWindow, now]);

  const selected = enquiries.find((enquiry) => enquiry.id === selectedId) ?? null;
  const meta = findDepartment('events');
  const Icon = DEPARTMENT_ICONS.events;

  return (
    <div>
      {/* Header ------------------------------------------------------------ */}
      <header className="relative isolate overflow-hidden border-b border-white/10">
        <ImageWithFallback
          src={DEPARTMENT_HERO.events}
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink-950/85" />

        <div className="relative px-4 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className={cx('eyebrow flex items-center gap-2', DEPARTMENT_ACCENT.events)}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                Banquet desk · staff only
              </p>
              <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ivory-50">
                {meta.name}
              </h1>
              <p className="mt-2 text-[13.5px] text-warm-400">
                {meta.location} · {meta.subtitle}
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
              tone="gold"
              label="New enquiries"
              value={counts.fresh}
              hint={`${counts.open} open in total`}
            />
            <StatTile
              dark
              label="Being reviewed"
              value={counts.review}
              hint="Under review or awaiting guest info"
            />
            <StatTile
              dark
              tone={counts.proposals > 0 ? 'sage' : 'default'}
              label="Proposals out"
              value={counts.proposals}
              hint="Sample packages shared"
            />
            <StatTile
              dark
              label="Confirmed"
              value={counts.confirmed}
              hint="Simulation only — no real bookings"
            />
          </div>
        </div>
      </header>

      {/* Filters ------------------------------------------------------------ */}
      <section className="px-4 pt-6 sm:px-6">
        <Panel dark>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <label htmlFor="enquiry-search" className="eyebrow-sm mb-2 block text-warm-400">
                Search
              </label>
              <SearchInput
                dark
                value={query}
                onValueChange={setQuery}
                placeholder="Reference, occasion, venue, style or owner"
              />
            </div>

            <div className="min-w-[170px]">
              <label htmlFor="enquiry-occasion" className="eyebrow-sm mb-2 block text-warm-400">
                Occasion
              </label>
              <SelectInput
                dark
                id="enquiry-occasion"
                value={occasion}
                onChange={(event) => setOccasion(event.target.value)}
              >
                <option value="all">All occasions</option>
                {OCCASION_TYPES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="min-w-[170px]">
              <label htmlFor="enquiry-entertainment" className="eyebrow-sm mb-2 block text-warm-400">
                Entertainment
              </label>
              <SelectInput
                dark
                id="enquiry-entertainment"
                value={entertainment}
                onChange={(event) => setEntertainment(event.target.value)}
              >
                <option value="all">All preferences</option>
                {ENTERTAINMENT_TYPES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="min-w-[170px]">
              <label htmlFor="enquiry-status" className="eyebrow-sm mb-2 block text-warm-400">
                Workflow status
              </label>
              <SelectInput
                dark
                id="enquiry-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="open">Open (not confirmed/closed)</option>
                {(
                  [
                    'new',
                    'under_review',
                    'needs_info',
                    'proposal_sent',
                    'confirmed',
                    'closed',
                  ] as EnquiryStatus[]
                ).map((entry) => (
                  <option key={entry} value={entry}>
                    {enquiryStatusLabel(entry)}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="min-w-[150px]">
              <label htmlFor="enquiry-window" className="eyebrow-sm mb-2 block text-warm-400">
                Event date
              </label>
              <SelectInput
                dark
                id="enquiry-window"
                value={dateWindow}
                onChange={(event) => setDateWindow(event.target.value)}
              >
                <option value="all">Any date</option>
                <option value="30">Next 30 days</option>
                <option value="90">Next 90 days</option>
                <option value="later">Beyond 90 days</option>
              </SelectInput>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <span className="text-[12.5px] text-warm-400">
              Showing {visible.length} of {enquiries.length} enquiries
            </span>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOccasion('all');
                setEntertainment('all');
                setStatus('all');
                setDateWindow('all');
              }}
              className="rounded-[3px] border border-white/20 px-2.5 py-1 text-[12px] font-medium text-cream-200 transition-colors hover:border-white/40 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              Clear filters
            </button>
          </div>
        </Panel>
      </section>

      {/* Enquiry list ------------------------------------------------------- */}
      <section className="px-4 py-6 sm:px-6">
        <Panel dark>
          <SectionHeading
            dark
            eyebrow="Pipeline"
            title="Celebration enquiries"
            description="Open an enquiry to assign it, attach a sample package, add internal notes and move the workflow."
            action={<CountChip dark value={visible.length} />}
          />

          {visible.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                dark
                icon={<Search className="h-5 w-5" strokeWidth={1.5} />}
                title="No enquiries match"
                body="Adjust the filters above, or reset them to see the whole pipeline again."
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
              {visible.map((enquiry) => (
                <li key={enquiry.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(enquiry.id)}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-1 py-3.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600"
                  >
                    <span className="tnum w-[76px] shrink-0 text-[12.5px] font-semibold tracking-[0.05em] text-warm-400">
                      {enquiry.ref}
                    </span>

                    <span className="min-w-0 flex-1 basis-52">
                      <span className="block truncate text-[14.5px] font-medium text-ivory-50">
                        {enquiry.occasion} · {enquiry.venue}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-warm-400">
                        <CalendarDays className="mr-1 inline h-3 w-3" strokeWidth={1.7} />
                        {isoDateLabel(enquiry.eventDate)} at {enquiry.startTime}
                        <span className="mx-1.5">·</span>
                        <Users className="mr-1 inline h-3 w-3" strokeWidth={1.7} />
                        ~{enquiry.guests}
                        <span className="mx-1.5">·</span>
                        {enquiry.entertainment} · {enquiry.genre}
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-wrap items-center gap-2">
                      {enquiry.proposedPackage ? (
                        <Badge tone="sage">Proposal</Badge>
                      ) : null}
                      {enquiry.assignedTo ? (
                        <span className="hidden text-[12px] text-warm-400 lg:inline">
                          {enquiry.assignedTo}
                        </span>
                      ) : null}
                      <span className="hidden text-[12px] text-warm-500 xl:inline">
                        {relativeTime(enquiry.updatedAt)}
                      </span>
                      <EnquiryStatusBadge dark status={enquiry.status} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Notice dark tone="gold" title="Prototype boundary" className="mt-4">
          <p>
            <TriangleAlert className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.8} />
            Every enquiry, package and figure on this desk is fictional sample data. No real events
            team is contacted, no dates are held, and “Confirmed” here is a workflow end state — not
            a booking.
          </p>
        </Notice>
      </section>

      <EnquiryDrawer enquiry={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
