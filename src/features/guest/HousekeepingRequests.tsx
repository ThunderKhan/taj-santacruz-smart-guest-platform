import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Timer } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useServicePath } from '@/hooks/useHomePath';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, ChoiceChip, Stepper } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import type { RequestLineItem, ServiceId } from '@/types';

interface HousekeepingOption {
  id: string;
  label: string;
  description: string;
  defaultQty: number;
  lead: string;
}

/** Sample housekeeping menu — item names and response times are illustrative. */
const HOUSEKEEPING_OPTIONS: HousekeepingOption[] = [
  {
    id: 'towels',
    label: 'Bath towels',
    description: 'Fresh bath towels, hand towels and face cloths.',
    defaultQty: 2,
    lead: 'Usually delivered within 15 minutes',
  },
  {
    id: 'linen',
    label: 'Linen & pillowcases',
    description: 'Bed linen refresh or fresh pillowcases for the evening.',
    defaultQty: 2,
    lead: 'Scheduled with the next floor round',
  },
  {
    id: 'amenities',
    label: 'Bath amenities',
    description: 'Shampoo, conditioner, body wash, dental or shaving kits.',
    defaultQty: 1,
    lead: 'Usually delivered within 15 minutes',
  },
  {
    id: 'laundry',
    label: 'Laundry & pressing',
    description: 'Collection and return of garments during your stay.',
    defaultQty: 3,
    lead: 'Same-day return before 6:00 PM',
  },
  {
    id: 'turndown',
    label: 'Turndown service',
    description: 'Evening room refresh with water and chocolates.',
    defaultQty: 1,
    lead: 'Offered between 6:00 PM and 9:00 PM',
  },
  {
    id: 'cleaning',
    label: 'Room tidy-up',
    description: 'Full service of the room while you are out.',
    defaultQty: 1,
    lead: 'Around 30 minutes, keyed to your schedule',
  },
];

const CROSS_LINKS: Array<{ key: ServiceId; label: string; hint: string }> = [
  { key: 'maintenance', label: 'Maintenance', hint: 'Something not working' },
  { key: 'concierge', label: 'Concierge', hint: 'Plans and arrangements' },
  { key: 'transport', label: 'Transportation', hint: 'Airport and cars' },
  { key: 'music', label: 'Live music', hint: 'Song requests' },
  { key: 'spa', label: 'Spa', hint: 'Treatments' },
  { key: 'food', label: 'In-room dining', hint: 'Full sample menu' },
];

/**
 * Housekeeping requests — the canonical demo path:
 * Room 502 asks for two towels and follows the request to completion.
 */
export function HousekeepingRequests() {
  const { createRequest } = useRequests();
  const servicePath = useServicePath();
  const [optionId, setOptionId] = useState(HOUSEKEEPING_OPTIONS[0].id);
  const [qty, setQty] = useState(2);
  const [note, setNote] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const option = HOUSEKEEPING_OPTIONS.find((entry) => entry.id === optionId) ?? HOUSEKEEPING_OPTIONS[0];

  const selectOption = (next: HousekeepingOption) => {
    setOptionId(next.id);
    setQty(next.defaultQty);
  };

  const submit = () => {
    const lineItems: RequestLineItem[] = [{ label: option.label, qty }];
    const request = createRequest({
      service: 'housekeeping',
      title: `${qty} × ${option.label}`,
      description: option.description,
      lineItems,
      priority: urgent ? 'high' : 'normal',
      guestNote: note.trim() || undefined,
      meta: {
        Item: option.label,
        Quantity: String(qty),
        Urgency: urgent ? 'Urgent' : 'Standard',
        Response: option.lead,
      },
    });

    setNote('');
    setUrgent(false);
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Request something else"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Housekeeping"
      title="Fresh linens, tidy rooms"
      description="Choose what you need, set a quantity and add a note. Requests are routed to the floor supervisor and you can watch the attendant accept and complete them in real time."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="What do you need?"
            description="Sample request types — availability and response times are illustrative."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {HOUSEKEEPING_OPTIONS.map((entry) => {
              const active = entry.id === optionId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectOption(entry)}
                  className={
                    active
                      ? 'rounded-[4px] border border-gold-600 bg-gold-200/40 p-4 text-left shadow-hairline'
                      : 'rounded-[4px] border border-cream-300 bg-white p-4 text-left shadow-hairline transition-[border-color,box-shadow] hover:border-warm-300 hover:shadow-lift'
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="display text-[17px] text-ink-900">{entry.label}</span>
                    <span className="eyebrow-sm text-warm-500">{entry.defaultQty} pc</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-warm-600">
                    {entry.description}
                  </p>
                </button>
              );
            })}
          </div>

          <Panel className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow-sm text-warm-500">Step two</p>
                <h3 className="display mt-2 text-[1.35rem] text-ink-900">How many, and any notes?</h3>
              </div>
              <Stepper value={qty} onChange={setQty} min={1} max={12} label={`${option.label} quantity`} />
            </div>

            <div className="mt-3 flex items-center gap-2 text-[13px] text-warm-600">
              <Timer className="h-4 w-4 text-gold-600" strokeWidth={1.7} />
              {option.lead}
            </div>

            <div className="mt-5">
              <Field label="Note for the housekeeper" hint="Optional — timings, placement, preferences.">
                {(props) => (
                  <TextArea
                    {...props}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Please leave the towels by the vanity — we are at the pool until 6."
                  />
                )}
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <ChoiceChip selected={urgent} onClick={() => setUrgent((value) => !value)}>
                {urgent ? 'Urgent — attendant first' : 'Mark as urgent'}
              </ChoiceChip>
              <span className="text-[12.5px] text-warm-500">
                Urgent requests are flagged to the nearest available attendant.
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit}>
                Send request — {qty} × {option.label}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setQty(option.defaultQty);
                  setNote('');
                  setUrgent(false);
                }}
              >
                Reset
              </Button>
            </div>
          </Panel>

          <Notice className="mt-5" tone="gold" title="Try the full demo path">
            <p>
              Send this request, then open the Housekeeping dashboard from the presenter ribbon —
              accept it, move it to In Progress and complete it, and watch this screen (and My
              Requests) update without refreshing.
            </p>
          </Notice>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel>
            <p className="eyebrow-sm text-warm-500">Your session</p>
            <h3 className="display mt-2 text-[1.35rem] text-ink-900">Also available</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-warm-600">
              Every service shares the same request timeline, so you can mix and match.
            </p>

            <ul className="mt-4 divide-y divide-cream-300 border-t border-cream-300">
              {CROSS_LINKS.map((entry) => (
                <li key={entry.key}>
                  <Link
                    to={servicePath(entry.key)}
                    className="group flex items-center gap-3 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium text-ink-900">
                        {entry.label}
                      </span>
                      <span className="block text-[12px] text-warm-500">{entry.hint}</span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-warm-400 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.6}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2 rounded-[3px] border border-sage-500/40 bg-sage-500/12 px-3.5 py-2.5 text-[12.5px] text-forest-700">
              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.7} />
              Room-attendant names shown to guests are masked in production.
            </div>
          </Panel>
        </div>
      </div>
    </ServiceShell>
  );
}
