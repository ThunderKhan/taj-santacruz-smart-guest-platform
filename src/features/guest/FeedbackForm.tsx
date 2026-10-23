import { useState } from 'react';
import { Heart, MessageSquareWarning, Send, Star } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { FEEDBACK_CATEGORIES, FEEDBACK_TOPICS, RATING_LABELS } from '@/data/guest-services';
import { Button } from '@/components/ui/Button';
import { Panel, SectionHeading } from '@/components/ui/Panel';
import { Field, TextArea, SelectInput } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { ServiceShell } from './ServiceShell';
import { RequestSuccess } from './RequestSuccess';
import { cx } from '@/utils/format';

type FeedbackKind = 'compliment' | 'concern';

/**
 * Feedback & support. A concern is routed with elevated priority through the
 * `concern` topic rule; compliments travel the same route at normal priority.
 */
export function FeedbackForm() {
  const { createRequest } = useRequests();
  const [kind, setKind] = useState<FeedbackKind>('concern');
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [rating, setRating] = useState(3);
  const [topic, setTopic] = useState(FEEDBACK_TOPICS.concern[0]);
  const [message, setMessage] = useState('');
  const [followUp, setFollowUp] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const topics = FEEDBACK_TOPICS[kind] ?? FEEDBACK_TOPICS.concern;

  const changeKind = (next: FeedbackKind) => {
    setKind(next);
    const nextTopics = FEEDBACK_TOPICS[next];
    setTopic(nextTopics[0]);
  };

  const submit = () => {
    if (message.trim().length < 10) {
      setError('A sentence or two helps the team act on this properly.');
      return;
    }
    setError(undefined);

    const request = createRequest({
      service: 'feedback',
      topic: kind === 'concern' ? 'concern' : undefined,
      title: `${kind === 'concern' ? 'Concern' : 'Compliment'} — ${category}`,
      description: message.trim(),
      priority: kind === 'concern' ? 'high' : 'normal',
      guestNote: followUp ? 'Guest would like a follow-up.' : 'No follow-up requested.',
      meta: {
        Type: kind === 'concern' ? 'Concern' : 'Compliment',
        Category: category,
        Topic: topic,
        Rating: `${rating} / 5`,
        'Follow-up': followUp ? 'Requested' : 'Not required',
      },
    });

    setMessage('');
    setPlacedRef(request.ref);
  };

  if (placedRef) {
    return (
      <RequestSuccess
        requestRef={placedRef}
        anotherLabel="Share more feedback"
        onMakeAnother={() => setPlacedRef(null)}
      />
    );
  }

  return (
    <ServiceShell
      eyebrow="Feedback & support"
      title="Tell us how we did"
      description="Compliments reach the team that earned them; concerns are routed to guest relations with elevated priority so someone follows up while the detail is fresh."
      banner="/images/svc-feedback.jpg"
      bannerAlt="Guest relations desk"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="Step one"
            title="Compliment or concern?"
            description="This choice changes the priority and the team that picks it up first."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => changeKind('compliment')}
              className={cx(
                'flex gap-3 rounded-[4px] border p-4 text-left transition',
                kind === 'compliment'
                  ? 'border-sage-500 bg-sage-500/12 shadow-hairline'
                  : 'border-cream-300 bg-white shadow-hairline hover:border-warm-300',
              )}
            >
              <Heart className="mt-0.5 h-4.5 w-4.5 shrink-0 text-sage-600" strokeWidth={1.7} />
              <span>
                <span className="block text-[15px] font-medium text-ink-900">Share a compliment</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-warm-600">
                  Recognise a team member or simply say thank you.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => changeKind('concern')}
              className={cx(
                'flex gap-3 rounded-[4px] border p-4 text-left transition',
                kind === 'concern'
                  ? 'border-clay-500 bg-clay-500/10 shadow-hairline'
                  : 'border-cream-300 bg-white shadow-hairline hover:border-warm-300',
              )}
            >
              <MessageSquareWarning className="mt-0.5 h-4.5 w-4.5 shrink-0 text-clay-600" strokeWidth={1.7} />
              <span>
                <span className="block text-[15px] font-medium text-ink-900">Raise a concern</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-warm-600">
                  Something that needs attention during your stay.
                </span>
              </span>
            </button>
          </div>

          <Panel className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Area of the stay">
                {(props) => (
                  <SelectInput
                    {...props}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {FEEDBACK_CATEGORIES.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>

              <Field label="Specific topic">
                {(props) => (
                  <SelectInput {...props} value={topic} onChange={(event) => setTopic(event.target.value)}>
                    {topics.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>
            </div>

            <div className="mt-5">
              <p className="eyebrow-sm mb-2.5 text-warm-600">How would you rate it?</p>
              <div className="flex flex-wrap items-center gap-2">
                {RATING_LABELS.map((label, index) => {
                  const value = index + 1;
                  const active = value <= rating;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} — ${label}`}
                      aria-pressed={value === rating}
                      className={cx(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition',
                        active
                          ? 'border-gold-600 bg-gold-200/60 text-gold-700'
                          : 'border-warm-300 bg-white text-warm-500 hover:border-warm-400',
                      )}
                    >
                      <Star
                        className={cx('h-3.5 w-3.5', active ? 'fill-gold-500 text-gold-600' : 'text-warm-400')}
                        strokeWidth={1.6}
                      />
                      <span className="tnum">{value}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <Field
                label="Your feedback"
                required
                error={error}
                hint="What happened, when, and what would have made it right."
              >
                {(props) => (
                  <TextArea
                    {...props}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      kind === 'concern'
                        ? 'The evening room service took longer than the time quoted on confirmation.'
                        : 'Anjali arranged the extra pillows before we even asked — thank you.'
                    }
                    maxLength={500}
                  />
                )}
              </Field>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-[13.5px] text-warm-700">
              <input
                type="checkbox"
                checked={followUp}
                onChange={(event) => setFollowUp(event.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              I would like someone from the team to follow up with me.
            </label>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-5">
              <Button variant="gold" onClick={submit}>
                <Send className="h-4 w-4" strokeWidth={1.7} />
                Send feedback
              </Button>
              <span className="text-[12.5px] text-warm-500">
                {kind === 'concern'
                  ? 'Routed to guest relations with high priority.'
                  : 'Routed to guest relations for recognition.'}
              </span>
            </div>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Panel dark>
            <p className="eyebrow text-gold-400">What happens to it</p>
            <h3 className="display mt-3 text-[1.4rem] text-ivory-50">Read by a person, not a bot</h3>
            <ol className="mt-4 space-y-3 border-t border-white/10 pt-4 text-[13px]">
              {[
                'Guest relations receives the feedback with its rating and area.',
                'A concern is acknowledged first, then investigated with the department involved.',
                'You receive the response on the same request timeline, with a resolution note.',
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-warm-400">
                  <span className="tnum shrink-0 text-gold-400">{index + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Panel>

          <Notice className="mt-4" tone="gold" title="Prototype disclosure">
            <p>
              Feedback submitted here stays in the local demo state. It is not sent to any hotel,
              team or analytics service.
            </p>
          </Notice>
        </div>
      </div>
    </ServiceShell>
  );
}

