import { useState } from 'react';
import { Clock, Flower2, Leaf, Sparkles } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { SPA_SLOTS, SPA_TREATMENTS } from '@/data/spa';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, ChoiceChip } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { cx, inr } from '@/utils/format';

const THERAPIST_PREFERENCES = ['No preference', 'Female therapist', 'Male therapist'];
const OCCASION_NOTES = ['First visit', 'Travelling today', 'Pressure preference noted', 'Quiet treatment'];

/**
 * Spa booking: choose a treatment, pick an illustrative time slot, note a
 * therapist preference and send it to the wellness suite queue.
 */
export function SpaBooking() {
  const { createRequest } = useRequests();
  const [treatmentId, setTreatmentId] = useState(SPA_TREATMENTS[0].id);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [preference, setPreference] = useState(THERAPIST_PREFERENCES[0]);
  const [note, setNote] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const treatment = SPA_TREATMENTS.find((entry) => entry.id === treatmentId) ?? SPA_TREATMENTS[0];
  const slot = SPA_SLOTS.find((entry) => entry.id === slotId);

  const submit = () => {
    const request = createRequest({
      service: 'spa',
      title: treatment.name,
      description: `${treatment.duration} minute treatment requested from the guest interface.`,
      value: treatment.price,
      guestNote: note.trim() || undefined,
      meta: {
        Treatment: treatment.name,
        Duration: `${treatment.duration} min`,
        Slot: slot?.time ?? 'Flexible',
        Therapist: preference,
        'Indicative price': inr(treatment.price),
      },
    });
    setNote('');
    setSlotId(null);
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Book another treatment"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Jiva Spa · Wellness suite"
      title="Treatments & sessions"
      description="Browse the sample treatment menu, choose an available slot and tell us your preferences. The spa manager confirms your therapist through the shared request timeline."
      banner="/images/spa-suite.jpg"
      bannerAlt="Quiet spa treatment suite"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="Choose a treatment"
            description="Prices and durations are illustrative sample data — not a verified price list."
          />

          <ul className="mt-5 divide-y divide-cream-300 rounded-[4px] border border-cream-300 bg-white shadow-hairline">
            {SPA_TREATMENTS.map((entry) => {
              const active = entry.id === treatmentId;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setTreatmentId(entry.id)}
                    className={cx(
                      'flex w-full flex-wrap items-start gap-x-4 gap-y-2 px-4 py-4 text-left transition-colors sm:px-5',
                      active ? 'bg-gold-200/35' : 'hover:bg-warm-50',
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className={cx(
                        'mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                        active ? 'border-gold-700 bg-gold-600' : 'border-warm-300 bg-white',
                      )}
                    >
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-ivory-50" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-2">
                        <span className="display text-[17.5px] text-ink-900">{entry.name}</span>
                        {entry.tag ? <Badge tone="gold">{entry.tag}</Badge> : null}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-warm-600">
                        {entry.description}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="tnum block text-[14.5px] font-semibold text-ink-900">
                        {inr(entry.price)}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-warm-500">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.7} />
                        {entry.duration} min
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Panel className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow-sm text-warm-500">Step two</p>
                <h3 className="display mt-2 text-[1.35rem] text-ink-900">Pick a time today</h3>
              </div>
              <span className="text-[12.5px] text-warm-500">
                {SPA_SLOTS.filter((entry) => entry.available).length} of {SPA_SLOTS.length} slots open
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SPA_SLOTS.map((entry) => {
                const active = entry.id === slotId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={!entry.available}
                    onClick={() => setSlotId(active ? null : entry.id)}
                    className={cx(
                      'rounded-[3px] border px-4 py-2.5 text-[13.5px] font-medium transition',
                      !entry.available
                        ? 'cursor-not-allowed border-warm-200 bg-warm-50 text-warm-400 line-through'
                        : active
                          ? 'border-ink-900 bg-ink-900 text-ivory-50'
                          : 'border-warm-300 bg-white text-warm-700 hover:border-warm-400 hover:text-ink-900',
                    )}
                  >
                    {entry.time}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[12.5px] text-warm-500">
              Struck-through slots are already held for other guests in this sample day.
            </p>
          </Panel>

          <Panel className="mt-6">
            <p className="eyebrow-sm text-warm-500">Step three</p>
            <h3 className="display mt-2 text-[1.35rem] text-ink-900">Preferences</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {THERAPIST_PREFERENCES.map((entry) => (
                <ChoiceChip key={entry} selected={preference === entry} onClick={() => setPreference(entry)}>
                  {entry}
                </ChoiceChip>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {OCCASION_NOTES.map((entry) => (
                <ChoiceChip key={entry} selected={note.includes(entry)} onClick={() =>
                  setNote((current) =>
                    current.includes(entry)
                      ? current
                          .split(' · ')
                          .filter((part) => part !== entry)
                          .join(' · ')
                      : current ? `${current} · ${entry}` : entry,
                  )
                }>
                  {entry}
                </ChoiceChip>
              ))}
            </div>

            <div className="mt-4">
              <Field label="Anything else?" hint="Health notes, pressure preference or accessibility needs.">
                {(props) => (
                  <TextArea
                    {...props}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Mild pressure preferred — recovering from a long flight."
                  />
                )}
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit} disabled={!slot}>
                {slot ? `Request ${slot.time}` : 'Select a time first'}
              </Button>
              <span className="text-[12.5px] text-warm-500">
                {slot ? `${treatment.name} · ${treatment.duration} min` : 'No slot chosen yet'}
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative isolate h-44 overflow-hidden rounded-[4px] border border-cream-300">
            <ImageWithFallback
              src="/images/spa-treatment.jpg"
              alt="Spa treatment in progress"
              className="absolute inset-0 h-full w-full"
            />
            <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="eyebrow text-gold-300">Wellness suite · Level 6</p>
              <p className="display mt-1.5 text-[1.3rem] text-ivory-50">Quiet hours, unhurried care</p>
            </div>
          </div>

          <Panel className="mt-4">
            <p className="eyebrow-sm text-warm-500">Your selection</p>
            <p className="display mt-2 text-[1.4rem] text-ink-900">{treatment.name}</p>

            <dl className="mt-3 space-y-1 border-t border-cream-300 pt-3 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-warm-600">Duration</dt>
                <dd className="tnum text-ink-800">{treatment.duration} min</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-600">Indicative price</dt>
                <dd className="tnum text-ink-800">{inr(treatment.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-600">Slot</dt>
                <dd className="text-ink-800">{slot ? slot.time : 'Not chosen'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-600">Preference</dt>
                <dd className="text-ink-800">{preference}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-start gap-2 rounded-[3px] border border-sage-500/40 bg-sage-500/12 px-3.5 py-3 text-[12.5px] leading-relaxed text-forest-700">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />
              Complimentary herbal infusion and use of the relaxation deck are included with every
              treatment in this sample menu.
            </div>
          </Panel>

          <Notice className="mt-4" tone="gold" title="No payment taken">
            <p>
              Booking requests are recorded for the demonstration only — nothing is charged and no
              real availability is held.
            </p>
          </Notice>

          <div className="mt-4 flex items-center gap-2 text-[12.5px] text-warm-500">
            <Sparkles className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
            <span>Sample menu maintained by the spa team in mock data.</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[12.5px] text-warm-500">
            <Flower2 className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
            <span>Therapist names are shared only after confirmation.</span>
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}
