import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Cake } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { useHomePath } from '@/hooks/useHomePath';
import { ServiceShell } from './ServiceShell';
import { Button } from '@/components/ui/Button';
import { EnquiryStatusBadge } from '@/components/ui/Badge';
import { KeyValue, Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, ChoiceChip, SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyState, Notice, SuccessPanel } from '@/components/ui/Feedback';
import { EnquiryTimeline } from '@/components/ui/Timeline';
import {
  DURATION_OPTIONS,
  ENTERTAINMENT_TYPES,
  EVENT_GENRES,
  EVENT_VENUES,
  OCCASION_TYPES,
} from '@/data/celebrations';
import { enquiryNextHint } from '@/services/enquiryEngine';
import { isoDateLabel, relativeTime } from '@/utils/format';

/**
 * Plan Music for a Celebration — the guest half of Feature B.
 *
 * A structured enquiry form (occasion, date, timing, guests, venue, entertainment
 * preference, style, special requests and notes) that lands directly in the
 * events & banquet dashboard with its own reference and workflow. Submitting an
 * enquiry never books anything: the confirmation says so explicitly.
 */

interface FormState {
  occasion: string;
  eventDate: string;
  startTime: string;
  durationHours: string;
  guests: string;
  venue: string;
  entertainment: string;
  genre: string;
  specialRequests: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  occasion: '',
  eventDate: '',
  startTime: '',
  durationHours: '2',
  guests: '',
  venue: '',
  entertainment: '',
  genre: '',
  specialRequests: '',
  notes: '',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.occasion) errors.occasion = 'Choose the occasion.';
  if (!form.eventDate) {
    errors.eventDate = 'Choose the event date.';
  } else if (form.eventDate < todayIso()) {
    errors.eventDate = 'Choose an upcoming date.';
  }
  if (!form.startTime) errors.startTime = 'Choose a start time.';
  const guests = Number(form.guests);
  if (!form.guests || !Number.isFinite(guests) || guests < 1) {
    errors.guests = 'Enter the expected number of guests.';
  } else if (guests > 1000) {
    errors.guests = 'For more than 1,000 guests, the banquet team will call you.';
  }
  if (!form.venue) errors.venue = 'Choose a venue.';
  if (!form.entertainment) errors.entertainment = 'Choose an entertainment preference.';
  if (!form.genre) errors.genre = 'Choose a music style.';
  if (form.specialRequests.length > 400) errors.specialRequests = 'Keep this under 400 characters.';
  return errors;
}

export function CelebrationEnquiry() {
  const { createEnquiry, getEnquiryByRef } = useRequests();
  const homePath = useHomePath();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const minDate = useMemo(() => todayIso(), []);
  const errorCount = Object.keys(errors).length;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const submit = () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const enquiry = createEnquiry({
      occasion: form.occasion,
      eventDate: form.eventDate,
      startTime: form.startTime,
      durationHours: Number(form.durationHours),
      guests: Number(form.guests),
      venue: form.venue,
      entertainment: form.entertainment,
      genre: form.genre,
      specialRequests: form.specialRequests || undefined,
      notes: form.notes || undefined,
    });
    setPlacedRef(enquiry.ref);
  };

  /* ------------------------------------------------------------ Confirmation */
  const placed = placedRef ? getEnquiryByRef(placedRef) : undefined;

  if (placedRef && placed) {
    return (
      <div className="mx-auto max-w-2xl">
        <SuccessPanel
          eyebrow="Enquiry received"
          reference={placed.ref}
          title={`${placed.occasion} · ${placed.venue}`}
          body={`Thank you — your celebration enquiry has reached the Events & Banquets team. ${enquiryNextHint(placed)}`}
        >
          <Notice tone="gold" title="An enquiry is not a booking">
            <p>
              Nothing is confirmed yet. Availability, pricing and final arrangements require hotel
              staff confirmation — this prototype does not contact a real events team and no
              payment is ever taken.
            </p>
          </Notice>
        </SuccessPanel>

        <Panel className="mt-6">
          <SectionHeading
            eyebrow="Live status"
            title="Where your enquiry stands"
            description="Updates as the events team works — no refresh needed."
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <EnquiryStatusBadge status={placed.status} />
            <span className="text-[13px] text-warm-600">
              Updated {relativeTime(placed.updatedAt)}
            </span>
            {placed.assignedTo ? (
              <span className="text-[13px] text-warm-600">· {placed.assignedTo}</span>
            ) : null}
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-warm-700">
            {enquiryNextHint(placed)}
          </p>

          <dl className="mt-5 grid gap-x-6 sm:grid-cols-2">
            <KeyValue label="Occasion">{placed.occasion}</KeyValue>
            <KeyValue label="Event">{`${isoDateLabel(placed.eventDate)} · ${placed.startTime}`}</KeyValue>
            <KeyValue label="Guests">{`~${placed.guests} guests`}</KeyValue>
            <KeyValue label="Entertainment">{`${placed.entertainment} · ${placed.genre}`}</KeyValue>
          </dl>

          {placed.proposedPackage ? (
            <Notice tone="sage" title="Sample package proposed" className="mt-4">
              <p>{placed.proposedPackage} — indicative only, not a quotation or a booking.</p>
            </Notice>
          ) : null}

          <div className="mt-6 border-t border-cream-300 pt-5">
            <p className="eyebrow-sm text-warm-500">Enquiry history</p>
            <div className="mt-4">
              <EnquiryTimeline history={placed.history} dense />
            </div>
          </div>
        </Panel>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={`${homePath}/my-requests`}
            className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink-900 px-5 text-[14px] font-medium text-ivory-50 transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            See it in My requests
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setForm(EMPTY_FORM);
              setErrors({});
              setPlacedRef(null);
            }}
          >
            Plan another celebration
          </Button>
        </div>
      </div>
    );
  }

  if (placedRef && !placed) return <EnquiryMissing />;

  /* ------------------------------------------------------------------- Form */
  return (
    <ServiceShell
      eyebrow="Events & Banquets"
      title="Plan music for a celebration"
      description="Birthdays, anniversaries, engagements, parties and corporate events — tell the events team what you have in mind and they will follow up with options."
      banner="/images/event-banquet.jpg"
      bannerAlt="A banquet hall set for an evening celebration"
    >
      <div className="mx-auto max-w-3xl">
        <Notice tone="gold" title="An enquiry is not a booking">
          <p>
            Sending this form starts a conversation with the events team — it does not confirm
            availability, pricing or entertainment. Every package shown in this prototype is sample
            data only.
          </p>
        </Notice>

        {errorCount > 0 ? (
          <Notice tone="clay" title="Please review your answers" className="mt-4">
            <p>
              {errorCount} field{errorCount === 1 ? '' : 's'} need
              {errorCount === 1 ? 's' : ''} attention before the enquiry can be sent.
            </p>
          </Notice>
        ) : null}

        <div className="mt-6 space-y-5">
          {/* ------------------------------------------------- The celebration */}
          <Panel>
            <SectionHeading
              eyebrow="The celebration"
              title="What are we celebrating?"
              description="Dates and timings are indicative — the events team confirms everything that follows."
            />

            <div className="mt-5">
              <p className="eyebrow-sm mb-2 text-warm-600">
                Occasion type<span className="ml-1 text-clay-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {OCCASION_TYPES.map((occasion) => (
                  <ChoiceChip
                    key={occasion}
                    selected={form.occasion === occasion}
                    onClick={() => update('occasion', occasion)}
                  >
                    <Cake className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.7} />
                    {occasion}
                  </ChoiceChip>
                ))}
              </div>
              {errors.occasion ? (
                <p className="mt-2 text-[12.5px] text-clay-600">{errors.occasion}</p>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Event date" required error={errors.eventDate}>
                {(fieldProps) => (
                  <TextInput
                    {...fieldProps}
                    type="date"
                    min={minDate}
                    value={form.eventDate}
                    onChange={(event) => update('eventDate', event.target.value)}
                  />
                )}
              </Field>
              <Field label="Start time" required error={errors.startTime}>
                {(fieldProps) => (
                  <TextInput
                    {...fieldProps}
                    type="time"
                    value={form.startTime}
                    onChange={(event) => update('startTime', event.target.value)}
                  />
                )}
              </Field>
              <Field label="Approximate duration" required>
                {(fieldProps) => (
                  <SelectInput
                    {...fieldProps}
                    value={form.durationHours}
                    onChange={(event) => update('durationHours', event.target.value)}
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                )}
              </Field>
              <Field
                label="Expected number of guests"
                required
                error={errors.guests}
                hint="An estimate is fine."
              >
                {(fieldProps) => (
                  <TextInput
                    {...fieldProps}
                    type="number"
                    min={1}
                    max={1000}
                    inputMode="numeric"
                    placeholder="e.g. 40"
                    value={form.guests}
                    onChange={(event) => update('guests', event.target.value)}
                  />
                )}
              </Field>
            </div>

            <div className="mt-5">
              <p className="eyebrow-sm mb-2 text-warm-600">
                Venue<span className="ml-1 text-clay-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {EVENT_VENUES.map((venue) => (
                  <ChoiceChip
                    key={venue}
                    selected={form.venue === venue}
                    onClick={() => update('venue', venue)}
                  >
                    {venue}
                  </ChoiceChip>
                ))}
              </div>
              {errors.venue ? (
                <p className="mt-2 text-[12.5px] text-clay-600">{errors.venue}</p>
              ) : null}
            </div>
          </Panel>

          {/* ---------------------------------------------------- Entertainment */}
          <Panel>
            <SectionHeading
              eyebrow="Entertainment"
              title="Sound and style"
              description="Pick a preference — the events team proposes specific artists and packages in reply."
            />

            <div className="mt-5">
              <p className="eyebrow-sm mb-2 text-warm-600">
                Entertainment preference<span className="ml-1 text-clay-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {ENTERTAINMENT_TYPES.map((option) => (
                  <ChoiceChip
                    key={option}
                    selected={form.entertainment === option}
                    onClick={() => update('entertainment', option)}
                  >
                    {option}
                  </ChoiceChip>
                ))}
              </div>
              {errors.entertainment ? (
                <p className="mt-2 text-[12.5px] text-clay-600">{errors.entertainment}</p>
              ) : null}
            </div>

            <div className="mt-5 max-w-md">
              <Field label="Preferred music genre or style" required error={errors.genre}>
                {(fieldProps) => (
                  <SelectInput
                    {...fieldProps}
                    value={form.genre}
                    onChange={(event) => update('genre', event.target.value)}
                  >
                    <option value="">Select a style</option>
                    {EVENT_GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </SelectInput>
                )}
              </Field>
            </div>
          </Panel>

          {/* ------------------------------------------------- Finer details */}
          <Panel>
            <SectionHeading
              eyebrow="Finer details"
              title="Anything we should know?"
              description="Special songs, dedications, announcements — or simply a mood you are after."
            />

            <div className="mt-5">
              <Field
                label="Special requests, favourite songs, dedications or announcements"
                error={errors.specialRequests}
                hint="Optional — read by the events team only."
              >
                {(fieldProps) => (
                  <TextArea
                    {...fieldProps}
                    value={form.specialRequests}
                    onChange={(event) => update('specialRequests', event.target.value)}
                    maxLength={400}
                    placeholder="e.g. A first-dance song, a short anniversary announcement before dessert…"
                  />
                )}
              </Field>
              <p className="mt-1.5 text-[12px] text-warm-500">
                {form.specialRequests.length}/400 characters
              </p>
            </div>

            <div className="mt-5">
              <Field
                label="Additional notes"
                hint="Optional — dietary notes, access details, timings around the event."
              >
                {(fieldProps) => (
                  <TextArea
                    {...fieldProps}
                    value={form.notes}
                    onChange={(event) => update('notes', event.target.value)}
                    maxLength={600}
                    placeholder="Anything else the events team should keep in mind."
                  />
                )}
              </Field>
              <p className="mt-1.5 text-[12px] text-warm-500">{form.notes.length}/600 characters</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-cream-300 pt-5">
              <Button variant="gold" size="lg" onClick={submit}>
                <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
                Send the enquiry
              </Button>
              <p className="text-[12.5px] text-warm-500">
                You will receive a reference number straight away.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </ServiceShell>
  );
}

/** Fallback used only if the reference disappears (e.g. demo reset mid-view). */
export function EnquiryMissing() {
  return (
    <div className="mx-auto max-w-xl">
      <Panel>
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" strokeWidth={1.5} />}
          title="Enquiry not found"
          body="The demo may have been reset. Start a new celebration enquiry from the home page."
        />
      </Panel>
    </div>
  );
}
