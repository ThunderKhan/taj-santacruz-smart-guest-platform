import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, ListMusic, Play, ScanLine, Search, ThumbsUp, TriangleAlert, Users } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath } from '@/hooks/useHomePath';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { ChoiceChip, SearchInput, TextArea } from '@/components/ui/Field';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { DemoQRCode } from '@/components/DemoQRCode';
import { LocationControl } from '@/components/LocationSwitcher';
import { RequestSteps } from '@/components/RequestSteps';
import { NOW_PLAYING, PERFORMER, SONG_CATALOGUE, SONG_CATEGORIES } from '@/data/music';
import { isTerminal, statusLabel } from '@/services/requestEngine';
import type { Song, SongCategory } from '@/types';
import { relativeTime } from '@/utils/format';

/**
 * Live music & song requests — the guest half of Feature A.
 *
 * Ordered for the shortest path from a table-tent QR scan to a sent request:
 * search first, then the guest's own requests, then the votable queue. Statuses
 * are read-only for guests — submitted, accepted, queued, playing, played and
 * rejected are all managed exclusively from the performer's stage dashboard.
 */
export function MusicRequests() {
  const { requests, session, location, createRequest, toggleVote, musicRules } = useRequests();
  const homePath = useHomePath();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SongCategory | 'all'>('all');
  const [selected, setSelected] = useState<Song | null>(null);
  const [dedication, setDedication] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const musicRequests = useMemo(
    () => requests.filter((request) => request.service === 'music'),
    [requests],
  );

  const myRequests = useMemo(
    () =>
      musicRequests
        .filter((request) => request.guestRef === session.guestRef)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [musicRequests, session.guestRef],
  );

  const myOpenCount = myRequests.filter((request) => !isTerminal(request.status)).length;
  const myDeclined = myRequests.filter((request) => request.status === 'rejected');

  /** The approved, votable running order. */
  const queue = useMemo(
    () =>
      musicRequests
        .filter((request) => request.status === 'in_progress' && request.stage === 'queued')
        .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    [musicRequests],
  );

  const liveNowPlaying = useMemo(
    () => musicRequests.find((request) => request.status === 'in_progress' && request.stage === 'playing') ?? null,
    [musicRequests],
  );

  const played = useMemo(
    () =>
      musicRequests
        .filter((request) => request.status === 'completed')
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5),
    [musicRequests],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SONG_CATALOGUE.filter((song) => {
      const inCategory = category === 'all' || song.category === category;
      if (!inCategory) return false;
      if (!needle) return true;
      return (
        song.title.toLowerCase().includes(needle) ||
        song.artist.toLowerCase().includes(needle) ||
        song.genre.toLowerCase().includes(needle)
      );
    }).slice(0, 8);
  }, [query, category]);

  /** Duplicate blocking: one open request per track per guest session. */
  const alreadyRequested = (song: Song) =>
    myRequests.some(
      (request) =>
        request.meta.Track === song.title && !isTerminal(request.status),
    );

  /** Demo rules, enforced on the guest screen (server rules would live in production). */
  const blockedReason = musicRules.paused
    ? 'New song requests are paused while the performer resets the set. You can still browse and vote.'
    : myOpenCount >= musicRules.requestLimit
      ? `You already have ${myOpenCount} open request${myOpenCount === 1 ? '' : 's'} — the demo limit is ${musicRules.requestLimit} per guest.`
      : null;

  const submitRequest = () => {
    if (!selected) return;
    if (blockedReason) {
      setSubmitError(blockedReason);
      return;
    }
    const request = createRequest({
      service: 'music',
      title: `Song request — ${selected.title}`,
      description: `Requested from ${location.label} at the ${PERFORMER.venue} guest music screen.`,
      guestNote: dedication.trim() || undefined,
      votes: 1,
      meta: {
        Track: selected.title,
        Artist: selected.artist,
        Genre: selected.genre,
        Dedication: dedication.trim() ? 'Yes' : 'No',
      },
    });
    setDedication('');
    setSelected(null);
    setQuery('');
    setSubmitError(null);
    setPlacedRef(request.ref);
  };

  const handleVote = (id: string) => {
    if (!musicRules.votingEnabled) return;
    toggleVote(id);
  };

  const nowPlaying = liveNowPlaying
    ? {
        title: liveNowPlaying.meta.Track ?? liveNowPlaying.title,
        artist: liveNowPlaying.meta.Artist ?? PERFORMER.name,
        genre: liveNowPlaying.meta.Genre ?? '',
        duration: '',
      }
    : NOW_PLAYING;

  /** The table-tent QR opens this screen with the scanned table attached. */
  const qrValue = useMemo(() => {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    return `${origin}/guest/music?loc=${location.id}`;
  }, [location.id]);

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Request another song"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow={PERFORMER.name}
      title="Live music requests"
      description={`${PERFORMER.role}. ${PERFORMER.setNote}. Request a track, add a dedication, or vote for the approved queue — no audio is streamed in this prototype, song metadata only.`}
      actions={<LocationControl />}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {/* ---------------------------------------------------------- Rules */}
          {musicRules.paused ? (
            <Notice tone="clay" title="Requests are paused" className="mb-5">
              <p>
                The performer has paused incoming requests while resetting the set. Voting and
                browsing stay open — try again shortly.
              </p>
            </Notice>
          ) : null}

          {blockedReason && !musicRules.paused ? (
            <Notice tone="clay" title="Request limit reached" className="mb-5">
              <p>{blockedReason}</p>
            </Notice>
          ) : null}

          {myDeclined.length > 0 ? (
            <Notice tone="gold" title="Some requests were declined" className="mb-5">
              <p>
                {myDeclined.length === 1
                  ? 'One of your requests was politely declined'
                  : `${myDeclined.length} of your requests were politely declined`}
                {' — '}usually because the track sits outside the planned set. You are welcome to
                request something else, and the performer’s note is in each request’s detail.
              </p>
            </Notice>
          ) : null}

          {/* ----------------------------------------------------- Now playing */}
          <div className="relative isolate overflow-hidden rounded-[4px] border border-ink-800 bg-ink-950">
            <div className="relative flex flex-wrap items-center gap-5 p-5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/15 text-gold-300">
                <Play className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="eyebrow flex flex-wrap items-center gap-2.5 text-gold-400">
                  Now playing · {PERFORMER.venue}
                  <StatusBadge status="in_progress" stage="playing" dark />
                </p>
                <p className="display mt-2 truncate text-[1.6rem] text-ivory-50">{nowPlaying.title}</p>
                <p className="mt-1 text-[13.5px] text-warm-400">
                  {nowPlaying.artist}
                  {nowPlaying.genre ? ` · ${nowPlaying.genre}` : ''}
                  {nowPlaying.duration ? ` · ${nowPlaying.duration}` : ''}
                </p>
              </div>
              <div className="ml-auto hidden text-right sm:block">
                <p className="eyebrow-sm text-warm-500">Next set</p>
                <p className="tnum mt-2 text-[1.4rem] font-semibold text-ivory-50">{PERFORMER.nextSet}</p>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------- Search */}
          <div className="mt-7">
            <SectionHeading
              eyebrow="Request a track"
              title="Find your song"
              description="Search by title, artist or genre, choose a track, add an optional dedication and send it straight to the stage desk."
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <ChoiceChip selected={category === 'all'} onClick={() => setCategory('all')}>
                All
              </ChoiceChip>
              {SONG_CATEGORIES.map((entry) => (
                <ChoiceChip
                  key={entry.id}
                  selected={category === entry.id}
                  onClick={() => setCategory(entry.id)}
                >
                  {entry.label}
                </ChoiceChip>
              ))}
            </div>

            <div className="mt-4 max-w-xl">
              <SearchInput
                value={query}
                onValueChange={setQuery}
                placeholder="Search by title, artist or genre"
              />
            </div>

            <ul className="mt-4 divide-y divide-cream-300 rounded-[4px] border border-cream-300 bg-white shadow-hairline">
              {results.length === 0 ? (
                <li>
                  <EmptyState
                    compact
                    icon={<Search className="h-5 w-5" strokeWidth={1.5} />}
                    title="No matches"
                    body="Try another artist, or switch categories — the catalogue is curated, so some favourites may not be listed."
                  />
                </li>
              ) : (
                results.map((song) => {
                  const taken = alreadyRequested(song);
                  const isSelected = selected?.id === song.id;
                  return (
                    <li
                      key={song.id}
                      className={
                        isSelected
                          ? 'flex flex-wrap items-center gap-x-4 gap-y-2 bg-gold-200/30 px-4 py-3 sm:px-5'
                          : 'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5'
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium text-ink-900">{song.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-warm-500">
                          {song.artist} · {song.genre} · {song.duration}
                        </p>
                      </div>

                      {taken ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-500/45 bg-sage-500/15 px-3 py-1.5 text-[12px] font-semibold text-forest-700">
                          <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          Already requested
                        </span>
                      ) : isSelected ? (
                        <Badge tone="gold">Selected</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(song)}
                          disabled={Boolean(blockedReason)}
                        >
                          Choose
                        </Button>
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {selected ? (
              <Panel className="mt-5">
                <p className="eyebrow-sm text-warm-500">Your request</p>
                <p className="display mt-2 text-[1.4rem] text-ink-900">{selected.title}</p>
                <p className="mt-1 text-[13px] text-warm-600">
                  {selected.artist} · {selected.duration}
                </p>

                <div className="mt-4">
                  <TextArea
                    value={dedication}
                    onChange={(event) => setDedication(event.target.value)}
                    placeholder="Optional dedication — “For Meera, with love from the whole table.”"
                    aria-label="Dedication message"
                    maxLength={180}
                  />
                  <p className="mt-1.5 text-[12px] text-warm-500">
                    {dedication.length}/180 characters · read aloud only if the team approves it.
                  </p>
                </div>

                {submitError ? (
                  <Notice tone="clay" title="Request not sent" className="mt-4">
                    <p>{submitError}</p>
                  </Notice>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="gold"
                    onClick={submitRequest}
                    disabled={Boolean(blockedReason)}
                    aria-describedby={blockedReason ? 'music-blocked-reason' : undefined}
                  >
                    <Heart className="h-4 w-4" strokeWidth={1.7} />
                    Send request
                  </Button>
                  <Button variant="ghost" onClick={() => setSelected(null)}>
                    Cancel
                  </Button>
                  {blockedReason ? (
                    <p id="music-blocked-reason" className="text-[13px] text-clay-600">
                      <TriangleAlert className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.8} />
                      {blockedReason}
                    </p>
                  ) : null}
                </div>
              </Panel>
            ) : null}
          </div>

          {/* --------------------------------------------------- Your requests */}
          {myRequests.length > 0 ? (
            <div className="mt-7">
              <SectionHeading
                eyebrow="Your requests"
                title="How your tracks are doing"
                description="Statuses update live from the stage desk — this screen never changes them."
              />
              <ul className="mt-4 divide-y divide-cream-300 rounded-[4px] border border-cream-300 bg-white shadow-hairline">
                {myRequests.slice(0, 6).map((request) => (
                  <li key={request.id}>
                    <Link
                      to={`${homePath}/my-requests/${request.ref}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-warm-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600 sm:px-5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium text-ink-900">
                          {request.meta.Track ?? request.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-warm-500">
                          {request.ref} · {relativeTime(request.updatedAt)}
                          {request.guestNote ? ' · dedication' : ''}
                        </p>
                        <RequestSteps
                          compact
                          status={request.status}
                          stage={request.stage}
                          className="mt-2"
                        />
                      </div>
                      <StatusBadge status={request.status} stage={request.stage} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* ----------------------------------------------------------- Queue */}
          <div className="mt-7">
            <SectionHeading
              eyebrow="Audience queue"
              title="What the room is asking for"
              description={
                musicRules.votingEnabled
                  ? 'Only approved tracks appear here. Votes are shared across every guest screen and the stage dashboard.'
                  : 'Only approved tracks appear here. Voting is paused for this set — the performer is curating the running order.'
              }
              action={
                <span className="chip">
                  <Users className="h-3.5 w-3.5" strokeWidth={1.7} />
                  {queue.length} in queue
                </span>
              }
            />

            {queue.length === 0 ? (
              <Panel className="mt-5">
                <EmptyState
                  icon={<ListMusic className="h-5 w-5" strokeWidth={1.5} />}
                  title="The queue is open"
                  body="No approved requests right now — be the first to request a track above."
                />
              </Panel>
            ) : (
              <ul className="mt-5 divide-y divide-cream-300 rounded-[4px] border border-cream-300 bg-white shadow-hairline">
                {queue.map((request, index) => {
                  const voted = Boolean(request.guestVoted);
                  return (
                    <li
                      key={request.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5"
                    >
                      <span className="tnum w-6 shrink-0 text-[13px] font-semibold text-warm-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium text-ink-900">
                          {request.meta.Track ?? request.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-warm-500">
                          {request.meta.Artist} · {request.location}
                          {request.guestNote
                            ? request.dedicationHidden
                              ? ' · dedication held for review'
                              : ' · dedication'
                            : ''}
                        </p>
                      </div>

                      <StatusBadge status={request.status} stage={request.stage} />

                      <button
                        type="button"
                        onClick={() => handleVote(request.id)}
                        aria-pressed={voted}
                        disabled={!musicRules.votingEnabled}
                        title={
                          musicRules.votingEnabled
                            ? voted
                              ? 'Remove your vote'
                              : 'Vote for this track'
                            : 'Voting is paused for this set'
                        }
                        className={
                          voted
                            ? 'inline-flex h-9 items-center gap-1.5 rounded-full border border-gold-600 bg-gold-200/60 px-3.5 text-[13px] font-semibold text-gold-700 transition-colors disabled:cursor-not-allowed disabled:opacity-45'
                            : 'inline-flex h-9 items-center gap-1.5 rounded-full border border-warm-300 bg-white px-3.5 text-[13px] font-medium text-warm-700 transition-colors hover:border-warm-400 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-45'
                        }
                      >
                        <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.8} />
                        <span className="tnum">{request.votes ?? 0}</span>
                        <span className="sr-only">{voted ? 'Remove your vote' : 'Vote for this track'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------- Sidebar */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
            <p className="eyebrow text-gold-400">
              <ScanLine className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.7} />
              QR entry · {PERFORMER.venue}
            </p>
            <h3 className="display mt-3 text-[1.35rem] text-ivory-50">
              You’re at {location.label}
            </h3>
            <div className="mt-4 flex items-start gap-4">
              <span className="shrink-0 rounded-[3px] border border-white/15 bg-white p-2">
                <DemoQRCode value={qrValue} size={96} />
              </span>
              <p className="text-[12.5px] leading-relaxed text-warm-400">
                Table tents carry this code, so the music screen opens already sitting at your
                table — change it any time with the control above. Illustrative QR only — it opens
                this local prototype, nothing else.
              </p>
            </div>
            <p className="mt-3 break-all rounded-[3px] bg-white/[0.06] px-2 py-1.5 text-[11.5px] text-warm-500">
              {qrValue}
            </p>
          </Panel>

          <Panel dark className="mt-4">
            <p className="eyebrow text-gold-400">Recently played</p>
            <h3 className="display mt-3 text-[1.4rem] text-ivory-50">This evening so far</h3>

            {played.length === 0 ? (
              <p className="mt-4 text-[13.5px] text-warm-400">
                Completed requests appear here once the ensemble performs them.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
                {played.map((request) => (
                  <li key={request.id} className="flex items-baseline gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] text-cream-200">
                        {request.meta.Track ?? request.title}
                      </span>
                      <span className="block text-[12px] text-warm-500">
                        {relativeTime(request.updatedAt)} · {statusLabel({ status: request.status, stage: request.stage })}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-warm-400">
              {PERFORMER.venue} · sets at 7:30 PM and 9:15 PM. Requests outside the planned set may
              be politely declined with a suggested alternative.
            </div>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Demo behaviour">
            <p>
              Voting, queue order and approvals all run on shared prototype state — switch to the
              Live Music Desk to accept, defer, play and mark requests as played.
            </p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}
