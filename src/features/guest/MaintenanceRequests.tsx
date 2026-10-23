import { useState } from 'react';
import { Droplets, Lamp, Snowflake, Sofa, Tv, Wrench } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, SelectInput, ChoiceChip } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import type { Priority } from '@/types';

interface IssueCategory {
  id: string;
  label: string;
  hint: string;
  icon: typeof Lamp;
  defaultSeverity: Priority;
}

const ISSUE_CATEGORIES: IssueCategory[] = [
  { id: 'Air conditioning', label: 'Air conditioning', hint: 'Not cooling, noisy unit, dripping', icon: Snowflake, defaultSeverity: 'high' },
  { id: 'Lighting', label: 'Lighting', hint: 'Lamps, switches, dimmers', icon: Lamp, defaultSeverity: 'normal' },
  { id: 'Plumbing', label: 'Plumbing', hint: 'Geyser, shower, drainage, leaks', icon: Droplets, defaultSeverity: 'high' },
  { id: 'Television & devices', label: 'Television & devices', hint: 'TV, sockets, Wi-Fi, charging', icon: Tv, defaultSeverity: 'normal' },
  { id: 'Furniture', label: 'Furniture & fittings', hint: 'Drawers, locks, upholstery', icon: Sofa, defaultSeverity: 'normal' },
  { id: 'Other', label: 'Something else', hint: 'Anything not listed above', icon: Wrench, defaultSeverity: 'normal' },
];

const SEVERITIES: Array<{ value: Priority; label: string }> = [
  { value: 'low', label: 'Low — when convenient' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High — affecting comfort' },
  { value: 'urgent', label: 'Urgent — now' },
];

const AREAS = ['Bedroom', 'Bathroom', 'Living area', 'Balcony', 'Lounge', 'Corridor'];

/**
 * Maintenance reporting — a fault gets categorised, given a severity and routed
 * straight to the engineering workshop queue.
 */
export function MaintenanceRequests() {
  const { createRequest } = useRequests();
  const [categoryId, setCategoryId] = useState(ISSUE_CATEGORIES[0].id);
  const [severity, setSeverity] = useState<Priority>('normal');
  const [area, setArea] = useState(AREAS[0]);
  const [details, setDetails] = useState('');
  const [placedRef, setPlacedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const category = ISSUE_CATEGORIES.find((entry) => entry.id === categoryId) ?? ISSUE_CATEGORIES[0];

  const submit = () => {
    if (details.trim().length < 8) {
      setError('Please describe the issue in a sentence so the technician arrives prepared.');
      return;
    }
    setError(undefined);

    const request = createRequest({
      service: 'maintenance',
      title: `${category.label} — ${area}`,
      description: details.trim(),
      priority: severity,
      meta: {
        Category: category.label,
        Area: area,
        Severity: SEVERITIES.find((entry) => entry.value === severity)?.label ?? severity,
      },
    });
    setDetails('');
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Report another issue"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Maintenance / Engineering"
      title="Report a fault in your room"
      description="Tell us what is wrong and how urgent it is. Tickets are routed to the engineering workshop with your room context, and you will see a technician accept the job."
      banner="/images/svc-maintenance.jpg"
      bannerAlt="Hotel engineer checking a room fixture"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="What needs attention?"
            description="Categories map directly to the ticket types used by the engineering team."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ISSUE_CATEGORIES.map((entry) => {
              const Icon = entry.icon;
              const active = entry.id === categoryId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(entry.id);
                    setSeverity(entry.defaultSeverity);
                  }}
                  className={
                    active
                      ? 'flex flex-col gap-2 rounded-[4px] border border-gold-600 bg-gold-200/40 p-4 text-left shadow-hairline'
                      : 'flex flex-col gap-2 rounded-[4px] border border-cream-300 bg-white p-4 text-left shadow-hairline transition-[border-color,box-shadow] hover:border-warm-300 hover:shadow-lift'
                  }
                >
                  <Icon className="h-4.5 w-4.5 text-gold-700" strokeWidth={1.6} />
                  <span className="text-[14px] font-medium text-ink-900">{entry.label}</span>
                  <span className="text-[12.5px] leading-snug text-warm-500">{entry.hint}</span>
                </button>
              );
            })}
          </div>

          <Panel className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Where is the issue?">
                {(props) => (
                  <SelectInput
                    {...props}
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                  >
                    {AREAS.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>

              <div>
                <p className="eyebrow-sm mb-2 text-warm-600">How urgent is it?</p>
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map((entry) => (
                    <ChoiceChip
                      key={entry.value}
                      selected={severity === entry.value}
                      onClick={() => setSeverity(entry.value)}
                    >
                      {entry.label}
                    </ChoiceChip>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <Field
                label="What is happening?"
                required
                error={error}
                hint="Include what you have already tried, and whether the room is occupied."
              >
                {(props) => (
                  <TextArea
                    {...props}
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="The bedroom AC runs but blows warm air — set to 22°C since 4 PM."
                    maxLength={400}
                  />
                )}
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit}>
                Raise ticket
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setDetails('');
                  setSeverity(category.defaultSeverity);
                  setError(undefined);
                }}
              >
                Clear
              </Button>
              <span className="text-[12.5px] text-warm-500">
                Photos would be attached from the device camera in a live deployment — not enabled in
                this prototype.
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel>
            <p className="eyebrow-sm text-warm-500">Response guidance</p>
            <h3 className="display mt-2 text-[1.35rem] text-ink-900">What happens next</h3>

            <ol className="mt-4 space-y-4 border-t border-cream-300 pt-4">
              {[
                ['Submitted', 'The workshop sees the ticket with your room and severity.'],
                ['Accepted', 'A duty technician is assigned and eta is shared with you.'],
                ['In progress', 'The technician is at your door — you can reschedule from My Requests.'],
                ['Completed', 'Resolution notes are recorded, and you can rate the visit.'],
              ].map(([step, copy]) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold-500/60 bg-gold-200/60 text-[10.5px] font-bold text-gold-700">
                    {step[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-ink-900">{step}</span>
                    <span className="block text-[12.5px] leading-relaxed text-warm-600">{copy}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <Notice className="mt-4" tone="clay" title="Safety first">
            <p>
              For smoke, fire, medical or security emergencies, use the in-room emergency call
              button or contact the front desk directly — do not raise them here.
            </p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}
