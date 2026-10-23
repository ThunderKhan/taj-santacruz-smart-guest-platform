import { useMemo, useState } from 'react';
import { Check, Heart, ListMusic, Play, Search, ThumbsUp, Users } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { NOW_PLAYING, PERFORMER, SONG_CATALOGUE } from '@/data/music';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { SearchInput, TextArea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { Notice, EmptyState } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { relativeTime } from '@/utils/format';
import { isTerminal, statusLabel } from '@/services/requestEngine';
import type { Song } from '@/types';

/**
 * Live music requests: search the set catalogue, add a dedication, vote for
 * tracks already in the queue, and see requests move through the entertainment
 * dashboard without refreshing.
 */
export function MusicRequests() {
  const { requests, session, createRequest, toggleVote } = useRequests();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Song | null>(null);
  const [dedication, setDedication] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const myOpenSongRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.service === 'music' &&
          request.guestRef === session.guestRef &&
          !isTerminal(request.status),
      ),
    [requests, session.guestRef],
  );

  const queue = useMemo(
    () =>
      requests
        .filter((request) => request.service === 'music' && !isTerminal(request.status))
        .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    [requests],
  );

  const played = useMemo(
    () =>
      requests
        .filter((request) => request.service === 'music' && request.status === 'completed')
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 4),
    [requests],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SONG_CATALOGUE.slice(0, 6);
    return SONG_CATALOGUE.filter(
      (song) =>
        song.title.toLowerCase().includes(needle) ||
        song.artist.toLowerCase().includes(needle) ||
        song.genre.toLowerCase().includes(needle),
    ).slice(0, 8);
  }, [query]);

  /** Duplicate blocking: one live request per track per guest session. */
  const alreadyRequested = (song: Song) =>
    myOpenSongRequests.some((request) => request.meta.Track === song.title);

  const submitRequest = () => {
    if (!selected) return;
    const request = createRequest({
      service: 'music',
      title: `Song request — ${selected.title}`,
      description: 'Requested from the guest music screen.',
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
    setPlacedRef(request.ref);
  };

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
      title="Live music & song requests"
      description={`${PERFORMER.role}. ${PERFORMER.setNote}. Request a track, add a dedication, or vote for what the ensemble plays next — no audio is streamed in this prototype, song metadata only.`}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {/* Now playing */}
          <div className="relative isolate overflow-hidden rounded-[4px] border border-ink-800 bg-ink-950">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-gold-500/12 to-transparent"
            />
            <div className="relative flex flex-wrap items-center gap-5 p-5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/15 text-gold-300">
                <Play className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="eyebrow text-gold-400">Now playing · {PERFORMER.venue}</p>
                <p className="display mt-2 truncate text-[1.6rem] text-ivory-50">{NOW_PLAYING.title}</p>
                <p className="mt-1 text-[13.5px] text-warm-400">
                  {NOW_PLAYING.artist} · {NOW_PLAYING.genre} · {NOW_PLAYING.duration}
                </p>
              </div>
              <div className="ml-auto hidden text-right sm:block">
                <p className="eyebrow-sm text-warm-500">Next set</p>
                <p className="tnum mt-2 text-[1.4rem] font-semibold text-ivory-50">{PERFORMER.nextSet}</p>
              </div>
            </div>
          </div>

          {/* Queue */}
          <div className="mt-7">
            <SectionHeading
              eyebrow="Audience queue"
              title="What the room is asking for"
              description="Votes are shared across every guest screen and the entertainment dashboard."
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
                  body="No live requests right now — be the first to request a track below."
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
                          {request.guestNote ? ' · dedication' : ''}
                        </p>
                      </div>

                      <Badge
                        tone={
                          request.status === 'in_progress'
                            ? 'gold'
                            : request.status === 'submitted'
                              ? 'brass'
                              : 'ink'
                        }
                      >
                        {statusLabel({ status: request.status, stage: request.stage })}
                      </Badge>

                      <button
                        type="button"
                        onClick={() => toggleVote(request.id)}
                        aria-pressed={voted}
                        className={
                          voted
                            ? 'inline-flex h-9 items-center gap-1.5 rounded-full border border-gold-600 bg-gold-200/60 px-3.5 text-[13px] font-semibold text-gold-700 transition-colors'
                            : 'inline-flex h-9 items-center gap-1.5 rounded-full border border-warm-300 bg-white px-3.5 text-[13px] font-medium text-warm-700 transition-colors hover:border-warm-400 hover:text-ink-900'
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

          {/* Search */}
          <div className="mt-7">
            <SectionHeading
              eyebrow="Request a track"
              title="Search the catalogue"
              description="Dedicated tracks are read by the ensemble before the set."
            />

            <div className="mt-4 max-w-md">
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
                    body="Try an artist name, or a genre such as jazz, upbeat or slow."
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

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="gold" onClick={submitRequest}>
                    <Heart className="h-4 w-4" strokeWidth={1.7} />
                    Send request
                  </Button>
                  <Button variant="ghost" onClick={() => setSelected(null)}>
                    Cancel
                  </Button>
                </div>
              </Panel>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
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
                        {relativeTime(request.updatedAt)}
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
              Entertainment dashboard to see a request accepted and marked “Now playing”.
            </p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}
