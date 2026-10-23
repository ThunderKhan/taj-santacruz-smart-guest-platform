import { useState } from 'react';
import { CalendarDays, Clock, Sparkles, Users } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { RESERVATION_OPTIONS } from '@/data/guest-services';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, Stepper, ChoiceChip } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { cx } from '@/utils/format';

const DAYS = [
  'Today',
  'Tomorrow',
  'In 2 days',
  'This weekend',
  'Choose at confirmation',
];

const KIND_TONE: Record<string, 'gold' | 'sage' | 'ink'> = {
  Dining: 'gold',
  Event: 'ink',
  Activity: 'sage',
};

/**
 * Reservations & activities: dining tables route to the restaurant queue,
 * everything else routes to concierge — demonstrated through `topic`.
 */
export function ReservationsPage() {
  const { createRequest } = useRequests();
  const [optionId, setOptionId] = useState(RESERVATION_OPTIONS[0].id);
  const [windowTime, setWindowTime] = useState<string | null>(null);
  const [day, setDay] = useState(DAYS[0]);
  const [party, setParty] = useState(2);
  const [note, setNote] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const option = RESERVATION_OPTIONS.find((entry) => entry.id === optionId) ?? RESERVATION_OPTIONS[0];
  const isDining = option.kind === 'Dining';

  const submit = () => {
    const request = createRequest({
      service: 'reservations',
      topic: isDining ? 'dining' : undefined,
      title: `${option.name} — ${day.toLowerCase()}`,
      description: option.blurb,
      guestNote: note.trim() || undefined,
      meta: {
        Option: option.name,
        Type: option.kind,
        Party: String(party),
        Day: day,
        Preferred: windowTime ?? 'Flexible',
      },
    });
    setNote('');
    setWindowTime(null);
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Plan something else"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Reservations & activities"
      title="Tables, evenings & experiences"
      description="Request a table, join an evening event, or plan a curated experience. Dining requests land with the restaurant team; activities and events are confirmed by the concierge desk."
      banner="/images/svc-reservations.jpg"
      bannerAlt="Guest experience and reservation desk"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="What would you like to book?"
            description="Sample options and windows — availability is illustrative for this prototype."
          />

          <div className="mt-5 space-y-3">
            {RESERVATION_OPTIONS.map((entry) => {
              const active = entry.id === optionId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setOptionId(entry.id);
                    setWindowTime(null);
                  }}
                  className={cx(
                    'flex w-full flex-wrap items-start gap-x-4 gap-y-3 rounded-[4px] border p-4 text-left transition sm:p-5',
                    active
                      ? 'border-gold-600 bg-gold-200/40 shadow-hairline'
                      : 'border-cream-300 bg-white shadow-hairline hover:border-warm-300',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span className="display text-[17.5px] text-ink-900">{entry.name}</span>
                      <Badge tone={KIND_TONE[entry.kind] ?? 'neutral'}>{entry.kind}</Badge>
                    </span>
                    <span className="mt-1.5 block text-[13.5px] leading-relaxed text-warm-600">
                      {entry.blurb}
                    </span>
                    <span className="mt-2.5 flex flex-wrap gap-2">
                      {entry.windows.map((time) => (
                        <span key={time} className="chip">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.7} />
                          {time}
                        </span>
                      ))}
                    </span>
                  </span>

                  <span
                    className={cx(
                      'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold',
                      active
                        ? 'border-ink-900 bg-ink-900 text-ivory-50'
                        : 'border-warm-300 text-warm-600',
                    )}
                  >
                    {active ? 'Selected' : 'Choose'}
                  </span>
                </button>
              );
            })}
          </div>

          <Panel className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow-sm text-warm-500">Step two</p>
                <h3 className="display mt-2 text-[1.35rem] text-ink-900">When, and for how many?</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="eyebrow-sm text-warm-500">Party</span>
                <Stepper value={party} onChange={setParty} min={1} max={12} label="Party size" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {DAYS.map((entry) => (
                <ChoiceChip key={entry} selected={day === entry} onClick={() => setDay(entry)}>
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.7} />
                  {entry}
                </ChoiceChip>
              ))}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="eyebrow-sm mb-2 text-warm-600">Preferred time</p>
                <div className="flex flex-wrap gap-2">
                  {option.windows.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setWindowTime(windowTime === time ? null : time)}
                      className={cx(
                        'rounded-[3px] border px-4 py-2.5 text-[13.5px] font-medium transition',
                        windowTime === time
                          ? 'border-ink-900 bg-ink-900 text-ivory-50'
                          : 'border-warm-300 bg-white text-warm-700 hover:border-warm-400 hover:text-ink-900',
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {!windowTime ? (
                  <p className="mt-2 text-[12.5px] text-warm-500">No time chosen — we will propose one.</p>
                ) : null}
              </div>

              <Field label="Requests for the team" hint="Seating, occasion, dietary notes.">
                {(props) => (
                  <TextArea
                    {...props}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Terrace seating if the weather holds — one guest avoids shellfish."
                  />
                )}
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit}>
                Send {isDining ? 'reservation' : 'request'}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-warm-600">
                <Users className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
                Party of {party} · {day}
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
            <p className="eyebrow text-gold-400">Where this goes</p>
            <h3 className="display mt-3 text-[1.4rem] text-ivory-50">
              {isDining ? 'Restaurant queue' : 'Concierge queue'}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-warm-400">
              {isDining
                ? 'Table reservations are routed to the restaurant dashboard with the party size, preferred time and your notes — the captain confirms the table there and you see it here.'
                : 'Events and activities are handled by guest relations, who confirm availability and send meeting details back through the timeline.'}
            </p>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="eyebrow-sm text-warm-500">Selected</p>
              <p className="mt-2 text-[14.5px] text-ivory-50">{option.name}</p>
              <p className="mt-1 text-[13px] text-warm-400">
                {option.kind} · {windowTime ?? 'time flexible'} · {day}
              </p>
            </div>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Sample availability">
            <p>
              Slots, windows and event timings shown here are illustrative. Nothing is held against
              real inventory.
            </p>
          </Notice>

          <div className="mt-4 flex items-center gap-2 text-[12.5px] text-warm-500">
            <Sparkles className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
            <span>Curated experiences are confirmed by the concierge team personally.</span>
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

