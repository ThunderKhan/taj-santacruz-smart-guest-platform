import { useState } from 'react';
import { Cake, Gift, Heart, Sparkles } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { OCCASION_PACKAGES } from '@/data/guest-services';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, SelectInput, ChoiceChip } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { cx } from '@/utils/format';

const ICONS: Array<typeof Gift> = [Cake, Heart, Gift, Sparkles];
const WHEN = ['This evening', 'Tomorrow morning', 'During dinner', 'At a time we agree'];
const FOR_WHOM = ['In-room surprise', 'Restaurant table', 'Lounge celebration', 'Pool deck'];

/**
 * Special occasions: celebrations are routed to the concierge team, who confirm
 * what is possible before anything is prepared.
 */
export function OccasionRequests() {
  const { createRequest } = useRequests();
  const [packageId, setPackageId] = useState(OCCASION_PACKAGES[0].id);
  const [when, setWhen] = useState(WHEN[0]);
  const [forWhom, setForWhom] = useState(FOR_WHOM[0]);
  const [message, setMessage] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const pack = OCCASION_PACKAGES.find((entry) => entry.id === packageId) ?? OCCASION_PACKAGES[0];

  const submit = () => {
    if (message.trim().length < 5) {
      setError('Add a short note — names, colours or timing help the team prepare.');
      return;
    }
    setError(undefined);

    const request = createRequest({
      service: 'occasions',
      title: pack.name,
      description: pack.blurb,
      guestNote: message.trim(),
      meta: {
        Package: pack.name,
        Setting: forWhom,
        When: when,
        Note: message.trim(),
      },
    });
    setMessage('');
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Plan another surprise"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Special occasions"
      title="Make it unforgettable"
      description="Flowers, cakes, decorations and little surprises — prepared by the concierge team once they confirm the details with you."
      banner="/images/svc-occasions.jpg"
      bannerAlt="Celebration arrangement prepared for a guest"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="Choose an arrangement"
            description="Sample packages — every arrangement is confirmed by the team before it is prepared."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {OCCASION_PACKAGES.map((entry, index) => {
              const Icon = ICONS[index % ICONS.length];
              const active = entry.id === packageId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setPackageId(entry.id)}
                  className={cx(
                    'rounded-[4px] border p-4 text-left transition',
                    active
                      ? 'border-gold-600 bg-gold-200/40 shadow-hairline'
                      : 'border-cream-300 bg-white shadow-hairline hover:border-warm-300',
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={cx(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-full border',
                        active
                          ? 'border-gold-600 bg-gold-500/20 text-gold-700'
                          : 'border-cream-300 bg-ivory-100 text-gold-700',
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium text-ink-900">{entry.name}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-warm-600">
                        {entry.blurb}
                      </span>
                      <span className="mt-2 block text-[12px] text-gold-700">{entry.indicative}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <Panel className="mt-6">
            <p className="eyebrow-sm text-warm-500">Step two</p>
            <h3 className="display mt-2 text-[1.35rem] text-ink-900">Where and when?</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {FOR_WHOM.map((entry) => (
                <ChoiceChip key={entry} selected={forWhom === entry} onClick={() => setForWhom(entry)}>
                  {entry}
                </ChoiceChip>
              ))}
            </div>

            <div className="mt-5 max-w-sm">
              <Field label="When should it be ready?">
                {(props) => (
                  <SelectInput {...props} value={when} onChange={(event) => setWhen(event.target.value)}>
                    {WHEN.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>
            </div>

            <div className="mt-5">
              <Field
                label="Your note"
                required
                error={error}
                hint="Names, allergies, colours, or anything we should know."
              >
                {(props) => (
                  <TextArea
                    {...props}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="It is Meera's 30th — deep red roses, no nuts in the cake, please surprise her after dessert."
                    maxLength={300}
                  />
                )}
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit}>
                Send arrangement request
              </Button>
              <span className="text-[12.5px] text-warm-500">
                The team replies with confirmation and any indicative charges.
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative isolate h-40 overflow-hidden rounded-[4px] border border-cream-300">
            <ImageWithFallback
              src="/images/dessert-cupcakes.jpg"
              alt="Celebration dessert"
              className="absolute inset-0 h-full w-full"
            />
            <div aria-hidden="true" className="absolute inset-0 photo-scrim" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="eyebrow text-gold-300">Your selection</p>
              <p className="display mt-1.5 text-[1.3rem] text-ivory-50">{pack.name}</p>
            </div>
          </div>

          <Panel className="mt-4">
            <dl className="space-y-1 text-[13.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-warm-600">Setting</dt>
                <dd className="text-right text-ink-800">{forWhom}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-warm-600">When</dt>
                <dd className="text-right text-ink-800">{when}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-warm-600">Indicative</dt>
                <dd className="text-right text-ink-800">{pack.indicative}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-[3px] border border-cream-300 bg-ivory-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-warm-600">
              Allergies and dietary requirements are passed to the kitchen with your request — always
              mention them here.
            </div>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Demo request">
            <p>
              This raises a request on the concierge queue. No order is placed with a vendor and no
              charge is incurred.
            </p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}
