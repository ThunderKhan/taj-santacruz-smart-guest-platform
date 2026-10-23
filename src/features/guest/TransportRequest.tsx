import { useState } from 'react';
import { CarFront, Clock, Luggage, MapPin, Navigation } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { DESTINATIONS, PICKUP_POINTS, TRANSPORT_OPTIONS } from '@/data/guest-services';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, SelectInput, Stepper } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { cx } from '@/utils/format';

const PREFERRED_TIMES = [
  'As soon as possible',
  'Within 30 minutes',
  'In 1 hour',
  'Tomorrow · early morning',
  'Choose at confirmation',
];

/**
 * Transportation: pick a vehicle option, route and timing. Routed to the
 * concierge queue with high priority, matching the routing configuration.
 */
export function TransportRequest() {
  const { createRequest, location } = useRequests();
  const [optionId, setOptionId] = useState(TRANSPORT_OPTIONS[0].id);
  const [pickup, setPickup] = useState(
    PICKUP_POINTS.find((point) => point.startsWith(location.label)) ?? PICKUP_POINTS[0],
  );
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [when, setWhen] = useState(PREFERRED_TIMES[0]);
  const [passengers, setPassengers] = useState(2);
  const [note, setNote] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const option = TRANSPORT_OPTIONS.find((entry) => entry.id === optionId) ?? TRANSPORT_OPTIONS[0];

  const submit = () => {
    const request = createRequest({
      service: 'transport',
      title: `${option.name} — ${destination.split('(')[0].trim()}`,
      description: `${option.blurb} Pickup: ${pickup}.`,
      guestNote: note.trim() || undefined,
      meta: {
        Option: option.name,
        Pickup: pickup,
        Destination: destination,
        Preferred: when,
        Passengers: String(passengers),
        Vehicle: `${option.capacity} · ${option.indicative}`,
      },
    });
    setNote('');
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Plan another journey"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Transportation & concierge"
      title="Cars, transfers & shuttles"
      description="Choose a vehicle, set your pickup and destination, and the transport coordinator confirms driver details back through the same request timeline."
      banner="/images/transport-drive.jpg"
      bannerAlt="Hotel car waiting at the portico"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="What do you need?"
            description="Indicative timings are sample values — a live deployment would quote real traffic and fleet availability."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {TRANSPORT_OPTIONS.map((entry) => {
              const active = entry.id === optionId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setOptionId(entry.id)}
                  className={cx(
                    'flex flex-col gap-2 rounded-[4px] border p-4 text-left transition',
                    active
                      ? 'border-gold-600 bg-gold-200/40 shadow-hairline'
                      : 'border-cream-300 bg-white shadow-hairline hover:border-warm-300',
                  )}
                >
                  <CarFront className="h-4.5 w-4.5 text-gold-700" strokeWidth={1.6} />
                  <span className="text-[14.5px] font-medium text-ink-900">{entry.name}</span>
                  <span className="text-[12.5px] leading-snug text-warm-600">{entry.blurb}</span>
                  <span className="eyebrow-sm mt-auto pt-2 text-warm-500">{entry.capacity}</span>
                  <span className="text-[12px] text-gold-700">{entry.indicative}</span>
                </button>
              );
            })}
          </div>

          <Panel className="mt-6">
            <p className="eyebrow-sm text-warm-500">Step two</p>
            <h3 className="display mt-2 text-[1.35rem] text-ink-900">Route & timing</h3>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field label="Pickup point">
                {(props) => (
                  <SelectInput {...props} value={pickup} onChange={(event) => setPickup(event.target.value)}>
                    {PICKUP_POINTS.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>

              <Field label="Destination">
                {(props) => (
                  <SelectInput
                    {...props}
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                  >
                    {DESTINATIONS.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>

              <Field label="When?">
                {(props) => (
                  <SelectInput {...props} value={when} onChange={(event) => setWhen(event.target.value)}>
                    {PREFERRED_TIMES.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>

              <div>
                <p className="eyebrow-sm mb-2 text-warm-600">Passengers</p>
                <Stepper value={passengers} onChange={setPassengers} min={1} max={8} label="Passengers" />
              </div>
            </div>

            <div className="mt-5">
              <Field label="Luggage, stops or special instructions" hint="Optional.">
                {(props) => (
                  <TextArea
                    {...props}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Two large suitcases, one cabin bag. Please keep the air conditioning low."
                  />
                )}
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit}>
                Request {option.name}
              </Button>
              <span className="text-[12.5px] text-warm-500">
                Routed to the concierge queue with high priority.
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
            <p className="eyebrow text-gold-400">Journey summary</p>

            <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={1.7} />
                <div className="min-w-0">
                  <p className="eyebrow-sm text-warm-500">Pickup</p>
                  <p className="mt-1 text-[13.5px] text-cream-200">{pickup}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={1.7} />
                <div className="min-w-0">
                  <p className="eyebrow-sm text-warm-500">Destination</p>
                  <p className="mt-1 text-[13.5px] text-cream-200">{destination}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={1.7} />
                <div className="min-w-0">
                  <p className="eyebrow-sm text-warm-500">Preferred</p>
                  <p className="mt-1 text-[13.5px] text-cream-200">{when}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Luggage className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={1.7} />
                <div className="min-w-0">
                  <p className="eyebrow-sm text-warm-500">Party & vehicle</p>
                  <p className="mt-1 text-[13.5px] text-cream-200">
                    {passengers} passenger{passengers > 1 ? 's' : ''} · {option.name}
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Demonstration only">
            <p>
              No vehicle is dispatched and no fare is charged — the request simply travels through
              the shared prototype state so the concierge workflow can be demonstrated.
            </p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}
