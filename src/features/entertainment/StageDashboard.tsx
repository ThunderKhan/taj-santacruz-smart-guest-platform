import { useMemo, useState } from 'react';
import { AudioLines, Check, Heart, ListMusic, Pause, Play, Settings, ThumbsUp, TriangleAlert, X } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { findDepartment } from '@/data/departments';
import { DEPARTMENT_ACCENT, DEPARTMENT_HERO, DEPARTMENT_ICONS } from '@/features/departments/departmentMeta';
import { DEFAULT_MUSIC_RULES, PERFORMER } from '@/data/music';
import { Button } from '@/components/ui/Button';
import { CountChip, StatusBadge } from '@/components/ui/Badge';
import { Panel, SectionHeading, StatTile } from '@/components/ui/Panel';
import { SelectInput } from '@/components/ui/Field';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { relativeTime } from '@/utils/format';
import { cx } from '@/utils/format';
import type { ServiceRequest } from '@/types';

/**
 * Live Music Desk — the performer / DJ console (Feature A, staff side).
 *
 * A staff-only view of the same shared state the guest music screen reads.
 * Incoming requests can be accepted, deferred or rejected; the approved queue
 * can be reordered by promoting tracks to the stage; dedications can be held
 * back from the public view; and demo rules (pause, request limits, voting)
 * are adjustable live. Guests never see this screen or any status controls.
 */
export function StageDashboard() {
  const {
    requests,
    transition,
    setStage,
    setDedicationHidden,
    musicRules,
    updateMusicRules,
  } = useRequests();

  const [rulesOpen, setRulesOpen] = useState(false);

  const music = useMemo(
    () => requests.filter((request) => request.service === 'music'),
    [requests],
  );

  const incoming = useMemo(
    () =>
      music
        .filter((request) => request.status === 'submitted')
        .sort((a, b) => b.submittedAt - a.submittedAt),
    [music],
  );

  const deferred = useMemo(
    () =>
      music.filter(
        (request) => request.status === 'accepted' && request.stage === 'deferred',
      ),
    [music],
  );

  const approved = useMemo(
    () =>
      music.filter(
        (request) => request.status === 'accepted' && request.stage !== 'deferred',
      ),
    [music],
  );

  const playing = useMemo(
    () =>
      music.find(
        (request) => request.status === 'in_progress' && request.stage === 'playing',
      ) ?? null,
    [music],
  );

  const queue = useMemo(
    () =>
      music
        .filter((request) => request.status === 'in_progress' && request.stage === 'queued')
        .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    [music],
  );

  const played = useMemo(
    () =>
      music
        .filter((request) => request.status === 'completed')
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 8),
    [music],
  );

  const rejected = music.filter((request) => request.status === 'rejected').length;
  const hiddenDedications = music.filter((request) => request.guestNote && request.dedicationHidden).length;

  const meta = findDepartment('entertainment');
  const Icon = DEPARTMENT_ICONS.entertainment;

  const ACTOR = 'Entertainment · stage desk';

  return (
    <div>
      {/* Header ------------------------------------------------------------ */}
      <header className="relative isolate overflow-hidden border-b border-white/10">
        <ImageWithFallback
          src={DEPARTMENT_HERO.entertainment}
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink-950/85" />

        <div className="relative px-4 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className={cx('eyebrow flex items-center gap-2', DEPARTMENT_ACCENT.entertainment)}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                Performer console · staff only
              </p>
              <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ivory-50">
                {meta.name}
              </h1>
              <p className="mt-2 text-[13.5px] text-warm-400">
                {PERFORMER.name} · {meta.location} · {meta.subtitle}
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
              tone={musicRules.paused ? 'clay' : 'gold'}
              label="Awaiting approval"
              value={incoming.length}
              hint={musicRules.paused ? 'Requests paused — none can arrive' : 'Guests waiting on a reply'}
            />
            <StatTile
              dark
              label="In the queue"
              value={queue.length}
              hint={queue.length ? `${queue.reduce((sum, r) => sum + (r.votes ?? 0), 0)} votes total` : 'Queue is empty'}
            />
            <StatTile
              dark
              tone={playing ? 'sage' : 'default'}
              label="On stage now"
              value={playing ? (playing.meta.Track ?? 'Live') : '—'}
              hint={playing ? `${playing.meta.Artist ?? ''} · ${playing.location}` : 'Nothing playing right now'}
            />
            <StatTile
              dark
              label="Played tonight"
              value={played.length}
              hint={`${rejected} politely declined`}
            />
          </div>
        </div>
      </header>

      {/* Demo rules ---------------------------------------------------------- */}
      <section className="px-4 pt-6 sm:px-6">
        <Panel dark>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow flex items-center gap-2 text-gold-400">
                <Settings className="h-3.5 w-3.5" strokeWidth={1.8} />
                Demo rules
              </p>
              <h2 className="display mt-2 text-[1.3rem] text-ivory-50">Request handling</h2>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-warm-400">
                Adjust what the guest music screen allows. Changes take effect immediately on every
                connected screen — sample controls only, not a live production system.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant={musicRules.paused ? 'gold' : 'outlineDark'}
                onClick={() => updateMusicRules({ paused: !musicRules.paused })}
              >
                {musicRules.paused ? (
                  <>
                    <Play className="h-4 w-4" strokeWidth={1.8} />
                    Resume requests
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" strokeWidth={1.8} />
                    Pause requests
                  </>
                )}
              </Button>
              <Button variant="outlineDark" onClick={() => setRulesOpen((open) => !open)}>
                {rulesOpen ? 'Hide rules' : 'More rules'}
              </Button>
            </div>
          </div>

          {rulesOpen ? (
            <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="music-limit"
                  className="eyebrow-sm mb-2 block text-warm-400"
                >
                  Request limit per guest
                </label>
                <SelectInput
                  dark
                  id="music-limit"
                  value={musicRules.requestLimit}
                  onChange={(event) => updateMusicRules({ requestLimit: Number(event.target.value) })}
                >
                  {[1, 2, 3].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} open request{limit === 1 ? '' : 's'}
                    </option>
                  ))}
                </SelectInput>
              </div>

              <div>
                <p className="eyebrow-sm mb-2 text-warm-400">Audience voting</p>
                <Button
                  variant={musicRules.votingEnabled ? 'outlineDark' : 'gold'}
                  onClick={() => updateMusicRules({ votingEnabled: !musicRules.votingEnabled })}
                >
                  <ThumbsUp className="h-4 w-4" strokeWidth={1.8} />
                  {musicRules.votingEnabled ? 'Voting on — disable' : 'Voting off — enable'}
                </Button>
              </div>

              <div>
                <p className="eyebrow-sm mb-2 text-warm-400">Restore defaults</p>
                <Button
                  variant="outlineDark"
                  onClick={() => updateMusicRules({ ...DEFAULT_MUSIC_RULES })}
                >
                  Reset rules
                </Button>
              </div>
            </div>
          ) : null}

          {musicRules.paused ? (
            <Notice dark tone="clay" title="Requests are paused" className="mt-4">
              <p>
                The guest music screen shows a “requests paused” notice and blocks new submissions.
                Voting, browsing and existing statuses stay live.
              </p>
            </Notice>
          ) : null}
        </Panel>
      </section>

      {/* Main working area --------------------------------------------------- */}
      <section className="grid gap-5 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------------ Left column */}
        <div className="space-y-5">
          {/* Incoming */}
          <Panel dark>
            <SectionHeading
              dark
              eyebrow="Incoming"
              title="Requests awaiting you"
              description="Accept moves a request into the approved pool; defer holds it for a later set; reject declines it with a note for the guest."
              action={<CountChip value={incoming.length} />}
            />
            {incoming.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  dark
                  icon={<AudioLines className="h-5 w-5" strokeWidth={1.5} />}
                  title="No incoming requests"
                  body="New guest submissions land here instantly — ask a guest to request a track."
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
                {incoming.map((request) => (
                  <li key={request.id} className="py-4">
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] font-medium text-ivory-50">
                          {request.meta.Track ?? request.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-warm-400">
                          {request.meta.Artist} · {request.location} · {relativeTime(request.submittedAt)}
                          <span className="ml-2 inline-flex items-center gap-1 text-warm-500">
                            <ThumbsUp className="h-3 w-3" strokeWidth={1.8} />
                            {request.votes ?? 0}
                          </span>
                        </p>
                      </div>
                      <StatusBadge dark status={request.status} stage={request.stage} />
                    </div>

                    {request.guestNote ? (
                      <DedicationLine request={request} onToggle={setDedicationHidden} dark />
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() =>
                          transition(request.id, 'accepted', { by: ACTOR, note: 'Approved for the queue' })
                        }
                      >
                        <Check className="h-4 w-4" strokeWidth={1.8} />
                        Accept
                      </Button>
                      <Button
                        variant="outlineDark"
                        size="sm"
                        onClick={() =>
                          transition(request.id, 'accepted', {
                            by: ACTOR,
                            stage: 'deferred',
                            note: 'Deferred — held for a later set',
                          })
                        }
                      >
                        <Pause className="h-4 w-4" strokeWidth={1.8} />
                        Defer
                      </Button>
                      <Button
                        variant="outlineDark"
                        size="sm"
                        onClick={() =>
                          transition(request.id, 'rejected', {
                            by: ACTOR,
                            note: 'Politely declined — outside the planned set',
                          })
                        }
                      >
                        <X className="h-4 w-4" strokeWidth={1.8} />
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Approved, awaiting queue */}
          <Panel dark>
            <SectionHeading
              dark
              eyebrow="Approved"
              title="Ready for the running order"
              description="Accepted requests waiting to join the public vote queue."
              action={<CountChip value={approved.length} />}
            />
            {approved.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  dark
                  compact
                  icon={<Check className="h-5 w-5" strokeWidth={1.5} />}
                  title="Nothing waiting"
                  body="Accepted requests appear here until you add them to the queue."
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
                {approved.map((request) => (
                  <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-ivory-50">
                        {request.meta.Track ?? request.title}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-warm-400">
                        {request.location} · {relativeTime(request.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() =>
                        transition(request.id, 'in_progress', {
                          by: ACTOR,
                          stage: 'queued',
                          note: 'Added to the vote queue',
                        })
                      }
                    >
                      <ListMusic className="h-4 w-4" strokeWidth={1.8} />
                      Add to queue
                    </Button>
                    <Button
                      variant="outlineDark"
                      size="sm"
                      onClick={() =>
                        transition(request.id, 'rejected', {
                          by: ACTOR,
                          note: 'Politely declined — outside the planned set',
                        })
                      }
                    >
                      Reject
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Deferred */}
          {deferred.length > 0 ? (
            <Panel dark>
              <SectionHeading
                dark
                eyebrow="On hold"
                title="Deferred for later"
                description="Kept out of the queue for now — promote one back or reject it."
                action={<CountChip value={deferred.length} />}
              />
              <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
                {deferred.map((request) => (
                  <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-ivory-50">
                        {request.meta.Track ?? request.title}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-warm-400">
                        {request.location} · deferred {relativeTime(request.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="outlineDark"
                      size="sm"
                      onClick={() =>
                        transition(request.id, 'in_progress', {
                          by: ACTOR,
                          stage: 'queued',
                          note: 'Brought back from deferred — added to the queue',
                        })
                      }
                    >
                      Queue it
                    </Button>
                    <Button
                      variant="outlineDark"
                      size="sm"
                      onClick={() =>
                        transition(request.id, 'rejected', {
                          by: ACTOR,
                          note: 'Politely declined — outside the planned set',
                        })
                      }
                    >
                      Reject
                    </Button>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>

        {/* ----------------------------------------------------- Right column */}
        <div className="space-y-5">
          {/* Now playing */}
          <Panel dark className="border-gold-500/30 bg-gold-500/[0.06]">
            <p className="eyebrow text-gold-400">On stage now</p>
            {playing ? (
              <>
                <p className="display mt-2 truncate text-[1.5rem] text-ivory-50">
                  {playing.meta.Track ?? playing.title}
                </p>
                <p className="mt-1 text-[13px] text-warm-400">
                  {playing.meta.Artist} · requested from {playing.location}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() =>
                      transition(playing.id, 'completed', {
                        by: ACTOR,
                        stage: 'played',
                        note: 'Performed this evening',
                      })
                    }
                  >
                    <Check className="h-4 w-4" strokeWidth={1.8} />
                    Mark as played
                  </Button>
                  <StatusBadge dark status={playing.status} stage={playing.stage} />
                </div>
              </>
            ) : (
              <p className="mt-3 text-[13.5px] leading-relaxed text-warm-400">
                Nothing on stage. Promote the head of the queue when the next song begins.
              </p>
            )}
          </Panel>

          {/* Queue */}
          <Panel dark>
            <SectionHeading
              dark
              eyebrow="Running order"
              title="Upcoming queue"
              description="Sorted by votes — promote any track to the stage."
              action={<CountChip value={queue.length} />}
            />
            {queue.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  dark
                  icon={<ListMusic className="h-5 w-5" strokeWidth={1.5} />}
                  title="Queue is empty"
                  body="Accept an incoming request and add it to the queue."
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
                {queue.map((request, index) => (
                  <li key={request.id} className="py-3.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="tnum w-6 shrink-0 text-[12.5px] font-semibold text-warm-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ivory-50">
                          {request.meta.Track ?? request.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-warm-400">
                          {request.location} ·{' '}
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" strokeWidth={1.8} />
                            {request.votes ?? 0} votes
                          </span>
                        </p>
                      </div>
                      <Button
                        variant={playing ? 'outlineDark' : 'gold'}
                        size="sm"
                        disabled={Boolean(playing)}
                        title={
                          playing
                            ? 'Mark the current track as played first'
                            : 'Play this track now'
                        }
                        onClick={() => setStage(request.id, 'playing', { note: 'Now playing' })}
                      >
                        <Play className="h-4 w-4" strokeWidth={1.8} />
                        Play now
                      </Button>
                      <Button
                        variant="outlineDark"
                        size="sm"
                        onClick={() =>
                          transition(request.id, 'rejected', {
                            by: ACTOR,
                            note: 'Removed from the queue — politely declined',
                          })
                        }
                      >
                        <X className="h-4 w-4" strokeWidth={1.8} />
                        Remove
                      </Button>
                    </div>
                    {request.guestNote ? (
                      <DedicationLine request={request} onToggle={setDedicationHidden} dark />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {playing ? (
              <p className="mt-3 text-[12.5px] text-warm-500">
                One track plays at a time — mark the current one as played to free the stage.
              </p>
            ) : null}
          </Panel>

          {/* Dedications summary */}
          {hiddenDedications > 0 ? (
            <Notice dark tone="gold" title="Dedications held for review">
              <p>
                {hiddenDedications} dedication
                {hiddenDedications === 1 ? ' is' : 's are'} hidden from the public queue view. The
                guests keep their own text; only the queue display is affected.
              </p>
            </Notice>
          ) : null}

          {/* Played */}
          <Panel dark>
            <SectionHeading dark eyebrow="History" title="Played tonight" />
            {played.length === 0 ? (
              <p className="mt-3 text-[13px] text-warm-400">
                Completed tracks appear here once performed.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10 border-t border-white/10">
                {played.map((request) => (
                  <li key={request.id} className="flex items-center gap-3 py-2.5">
                    <Heart className="h-3.5 w-3.5 shrink-0 text-sage-400" strokeWidth={1.8} />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-cream-200">
                      {request.meta.Track ?? request.title}
                    </span>
                    <span className="shrink-0 text-[12px] text-warm-500">
                      {relativeTime(request.updatedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Notice dark tone="gold" title="Prototype boundary">
            <p>
              <TriangleAlert className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.8} />
              No audio is streamed and no real guests are involved — every action here is simulated
              on shared local state. Guests cannot reach this screen or change any status.
            </p>
          </Notice>
        </div>
      </section>
    </div>
  );
}

/** Dedication preview with a hold/approve moderation toggle. */
function DedicationLine({
  request,
  onToggle,
  dark = false,
}: {
  request: ServiceRequest;
  onToggle: (id: string, hidden: boolean, note?: string) => void;
  dark?: boolean;
}) {
  const hidden = Boolean(request.dedicationHidden);
  return (
    <div
      className={cx(
        'mt-2.5 flex flex-wrap items-start gap-x-3 gap-y-2 rounded-[3px] border px-3 py-2',
        hidden
          ? 'border-clay-500/40 bg-clay-500/10'
          : dark
            ? 'border-white/10 bg-white/[0.05]'
            : 'border-cream-300 bg-ivory-100',
      )}
    >
      <p className={cx('min-w-0 flex-1 text-[13px] leading-relaxed', hidden ? 'text-[#E7B49B]' : dark ? 'text-cream-200' : 'text-warm-700')}>
        <span className="eyebrow-sm mr-2 text-warm-500">Dedication</span>
        “{request.guestNote}”
      </p>
      <button
        type="button"
        onClick={() => onToggle(request.id, !hidden)}
        className={cx(
          'shrink-0 rounded-[3px] border px-2.5 py-1 text-[12px] font-medium transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
          dark
            ? 'border-white/20 text-cream-200 hover:border-white/40 hover:bg-white/[0.07]'
            : 'border-warm-300 text-warm-700 hover:border-warm-400',
        )}
      >
        {hidden ? 'Approve' : 'Hold'}
      </button>
    </div>
  );
}
