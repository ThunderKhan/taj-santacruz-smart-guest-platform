import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Search } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useAuth } from '@/store/AuthProvider';
import { StatTile } from '@/components/ui/Panel';
import { SearchInput } from '@/components/ui/Field';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { EnquiryStatusBadge } from '@/components/ui/Badge';
import { isoDateLabel, relativeTime, cx } from '@/utils/format';
import { isEnquiryTerminal } from '@/services/enquiryEngine';
import { EnquiryDrawer } from '@/features/events/EnquiryDrawer';

/**
 * Singer console — "My events".
 *
 * Every celebration enquiry the events desk has assigned to this performer,
 * read-only: the occasion, date, venue, requested music and workflow status.
 * The workflow itself stays with the staff desk; performers only see what they
 * need to prepare for.
 */
export function MusicianEvents() {
  const { enquiries } = useRequests();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mine = useMemo(
    () => enquiries.filter((enquiry) => enquiry.assignedMusicianId === session?.musicianId),
    [enquiries, session?.musicianId],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return mine;
    return mine.filter(
      (enquiry) =>
        enquiry.ref.toLowerCase().includes(needle) ||
        enquiry.occasion.toLowerCase().includes(needle) ||
        enquiry.venue.toLowerCase().includes(needle) ||
        enquiry.genre.toLowerCase().includes(needle),
    );
  }, [mine, query]);

  const selected = enquiries.find((enquiry) => enquiry.id === selectedId) ?? null;

  const counts = {
    upcoming: mine.filter((enquiry) => !isEnquiryTerminal(enquiry.status)).length,
    confirmed: mine.filter((enquiry) => enquiry.status === 'confirmed').length,
    total: mine.length,
  };

  return (
    <div>
      {/* Header ------------------------------------------------------------ */}
      <header className="border-b border-white/10 px-4 py-6 sm:px-6 sm:py-7">
        <p className="eyebrow text-gold-500">Assigned to you · read-only</p>
        <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ivory-50">My events</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-warm-400">
          Celebration music bookings the events desk has assigned to you. The enquiry workflow is
          managed by staff — here you can see what is coming up and what the guest has asked for.
        </p>
      </header>

      {/* Stats ------------------------------------------------------------- */}
      <div className="grid gap-3 border-b border-white/10 px-4 py-5 sm:grid-cols-3 sm:px-6">
        <StatTile dark label="Assigned events" value={counts.total} />
        <StatTile dark label="Still to happen" value={counts.upcoming} />
        <StatTile dark label="Confirmed" value={counts.confirmed} />
      </div>

      {/* Search ------------------------------------------------------------ */}
      <div className="border-b border-white/10 px-4 py-3.5 sm:px-6">
        <SearchInput
          dark
          value={query}
          onValueChange={setQuery}
          placeholder="Search by reference, occasion, venue or music style…"
        />
      </div>

      {/* List -------------------------------------------------------------- */}
      <div className="px-4 py-5 sm:px-6">
        {visible.length > 0 ? (
          <ul className="space-y-3">
            {visible.map((enquiry) => (
              <li key={enquiry.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(enquiry.id)}
                  className={cx(
                    'w-full rounded-card border border-white/10 bg-white/[0.04] px-4 py-4 text-left',
                    'transition-colors hover:border-gold-500/40 hover:bg-white/[0.07]',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[12.5px] font-medium tracking-wide text-gold-400">
                      {enquiry.ref}
                    </span>
                    <EnquiryStatusBadge dark status={enquiry.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2 py-[2px] text-[11.5px] font-medium text-cream-200">
                      ~{enquiry.guests} guests
                    </span>
                  </div>

                  <p className="mt-2 font-display text-[21px] leading-tight text-ivory-50">
                    {enquiry.occasion} · {enquiry.venue}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-warm-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
                      {isoDateLabel(enquiry.eventDate)} · {enquiry.startTime}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
                      {enquiry.venue}
                    </span>
                    <span>{enquiry.entertainment} · {enquiry.genre}</span>
                  </div>

                  {enquiry.specialRequests ? (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-warm-500">
                      “{enquiry.specialRequests}”
                    </p>
                  ) : null}

                  <p className="mt-2 text-[11.5px] text-warm-500">
                    Desk owner: {enquiry.assignedTo ?? 'unassigned'} · updated{' '}
                    {relativeTime(enquiry.updatedAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            dark
            icon={<Search className="h-5 w-5" strokeWidth={1.6} />}
            title={mine.length === 0 ? 'No events assigned yet' : 'Nothing matches your search'}
            body={
              mine.length === 0
                ? 'When the events desk assigns a celebration to you, it appears here with the date, venue and requested music.'
                : 'Try a different reference, occasion or venue.'
            }
          />
        )}

        {mine.length > 0 ? (
          <Notice tone="neutral" dark className="mt-5">
            <p>
              Status changes are made by the events desk. If anything needs to change, contact them —
              this console is a read-only view of your assignments.
            </p>
          </Notice>
        ) : null}
      </div>

      <EnquiryDrawer enquiry={selected} onClose={() => setSelectedId(null)} readOnly />
    </div>
  );
}
