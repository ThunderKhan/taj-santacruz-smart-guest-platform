import { useMemo, useState } from 'react';
import { ChevronDown, ConciergeBell, MapPin, Send, Star } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { CONCIERGE_KNOWLEDGE, LOCAL_RECOMMENDATIONS } from '@/data/guest-services';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, SelectInput, ChoiceChip } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { cx } from '@/utils/format';
import type { KnowledgeEntry } from '@/data/guest-services';

const GROUP_LABEL: Record<KnowledgeEntry['group'], string> = {
  hotel: 'The hotel',
  stay: 'Your stay',
  mumbai: 'Mumbai & beyond',
};

const TOPICS = [
  'Hotel information',
  'Local recommendation',
  'Dining suggestions',
  'Itinerary & planning',
  'Accessibility assistance',
  'Something else',
];

/**
 * Concierge desk: self-serve answers first, then a direct line to the guest
 * relations queue for anything that needs a person.
 */
export function ConciergeDesk() {
  const { createRequest } = useRequests();
  const [openId, setOpenId] = useState<string | null>(CONCIERGE_KNOWLEDGE[0].id);
  const [group, setGroup] = useState<'all' | KnowledgeEntry['group']>('all');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [byWhen, setByWhen] = useState('Whenever suits — no rush');
  const [error, setError] = useState<string | undefined>(undefined);
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const entries = useMemo(
    () => (group === 'all' ? CONCIERGE_KNOWLEDGE : CONCIERGE_KNOWLEDGE.filter((entry) => entry.group === group)),
    [group],
  );

  const submit = () => {
    if (message.trim().length < 6) {
      setError('Tell us a little more so the desk can help on the first reply.');
      return;
    }
    setError(undefined);

    const request = createRequest({
      service: 'concierge',
      title: topic,
      description: message.trim(),
      guestNote: `Preferred timing: ${byWhen}`,
      meta: { Topic: topic, 'Preferred timing': byWhen },
    });

    setMessage('');
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Ask something else"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Concierge & Guest Relations"
      title="How may we help?"
      description="Popular questions are answered instantly below. Anything that needs a person goes straight to the concierge desk queue with your room context."
      actions={
        <span className="chip">
          <ConciergeBell className="h-3.5 w-3.5" strokeWidth={1.7} />
          Desk staffed 24×7
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Before you ask"
            title="Quick answers"
            description="Sample guidance — timings and policies are illustrative for this prototype."
            action={
              <div className="flex flex-wrap gap-2">
                {(['all', 'stay', 'hotel', 'mumbai'] as const).map((entry) => (
                  <ChoiceChip key={entry} selected={group === entry} onClick={() => setGroup(entry)}>
                    {entry === 'all' ? 'All' : GROUP_LABEL[entry]}
                  </ChoiceChip>
                ))}
              </div>
            }
          />

          <div className="mt-5 divide-y divide-cream-300 rounded-[4px] border border-cream-300 bg-white shadow-hairline">
            {entries.map((entry) => {
              const open = entry.id === openId;
              return (
                <div key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : entry.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-warm-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600 sm:px-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-medium text-ink-900">
                        {entry.question}
                      </span>
                      <span className="eyebrow-sm mt-1 block text-warm-500">
                        {GROUP_LABEL[entry.group]}
                      </span>
                    </span>
                    <ChevronDown
                      className={cx(
                        'h-4 w-4 shrink-0 text-warm-400 transition-transform duration-200',
                        open && 'rotate-180',
                      )}
                      strokeWidth={1.7}
                    />
                  </button>
                  {open ? (
                    <p className="border-t border-cream-300 bg-ivory-100/70 px-4 py-3.5 text-[13.5px] leading-relaxed text-warm-700 sm:px-5">
                      {entry.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <div className="mt-8">
            <SectionHeading
              eyebrow="Sample recommendations"
              title="Around Mumbai"
              description="Distances and timings are illustrative and have not been verified for this prototype."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {LOCAL_RECOMMENDATIONS.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[4px] border border-cream-300 bg-white p-4 shadow-hairline"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="display text-[17px] text-ink-900">{entry.name}</p>
                    <span className="eyebrow-sm shrink-0 text-warm-500">{entry.category}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-warm-600">{entry.blurb}</p>
                  <p className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] text-gold-700">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.7} />
                    {entry.distance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ask a person */}
          <Panel className="mt-8">
            <p className="eyebrow-sm text-warm-500">Ask a person</p>
            <h3 className="display mt-2 text-[1.5rem] text-ink-900">Send a note to the desk</h3>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-warm-600">
              The guest relations team picks this up from their queue and replies through the same
              request timeline you see in My Requests.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="What is it about?">
                {(props) => (
                  <SelectInput {...props} value={topic} onChange={(event) => setTopic(event.target.value)}>
                    {TOPICS.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>
              <Field label="When do you need it?">
                {(props) => (
                  <SelectInput
                    {...props}
                    value={byWhen}
                    onChange={(event) => setByWhen(event.target.value)}
                  >
                    <option>Whenever suits — no rush</option>
                    <option>Within the hour</option>
                    <option>Before this evening</option>
                    <option>Tomorrow morning</option>
                  </SelectInput>
                )}
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Your message" required error={error}>
                {(props) => (
                  <TextArea
                    {...props}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Four of us would like an early dinner tomorrow — somewhere quiet with a sea view."
                    maxLength={400}
                  />
                )}
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="gold" onClick={submit}>
                <Send className="h-4 w-4" strokeWidth={1.7} />
                Send to the desk
              </Button>
              <span className="text-[12.5px] text-warm-500">
                Sample response window: under 10 minutes during desk hours.
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
            <p className="eyebrow text-gold-400">Guest relations</p>
            <h3 className="display mt-3 text-[1.4rem] text-ivory-50">At your service</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-warm-400">
              The desk handles transport, occasions, reservations, feedback and bill reviews — one
              team, one queue, one timeline shared with you.
            </p>

            <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-[13px]">
              {[
                ['Concierge enquiries', 'Hotel information and assistance'],
                ['Transportation', 'Cars, airport transfers, shuttles'],
                ['Special occasions', 'Cakes, flowers, celebrations'],
                ['Feedback & support', 'Compliments and concerns'],
                ['Billing review', 'Walkthrough of illustrative charges'],
              ].map(([label, hint]) => (
                <li key={label} className="flex items-baseline gap-3">
                  <Star className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-gold-400" strokeWidth={1.6} />
                  <span className="min-w-0">
                    <span className="block text-cream-200">{label}</span>
                    <span className="block text-[12px] text-warm-500">{hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Sample content">
            <p>Answers, recommendations and response times on this page are illustrative sample copy.</p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}
