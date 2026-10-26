import { useState, type FormEvent } from 'react';
import { CalendarDays, Trash2, UserPlus } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { MUSICIAN_ROLES } from '@/data/musicians';
import { Button } from '@/components/ui/Button';
import { CountChip } from '@/components/ui/Badge';
import { Field, SelectInput, TextInput } from '@/components/ui/Field';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { Panel, SectionHeading, StatTile } from '@/components/ui/Panel';
import { isEnquiryTerminal } from '@/services/enquiryEngine';
import { cx } from '@/utils/format';

/**
 * Musicians desk — staff manage who can sign in to the singer console.
 *
 * Create a performer account (name, stage role, an auto-derived sign-in
 * username) or delete one. Assigning performers to celebrations happens in the
 * enquiry drawer on the Events desk. Deleting an account never erases history:
 * events already assigned keep the performer's name for the record.
 */
export function MusiciansDashboard() {
  const { musicians, enquiries, createMusician, deleteMusician } = useRequests();
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>(MUSICIAN_ROLES[0]);
  const [error, setError] = useState<string | undefined>();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const eventsFor = (musicianId: string) =>
    enquiries.filter(
      (enquiry) => enquiry.assignedMusicianId === musicianId && !isEnquiryTerminal(enquiry.status),
    ).length;

  const activeCount = musicians.filter((musician) => musician.active).length;
  const assignedCount = enquiries.filter(
    (enquiry) => enquiry.assignedMusicianId && !isEnquiryTerminal(enquiry.status),
  ).length;

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter the performer’s name.');
      return;
    }
    createMusician({ name: trimmed, role });
    setName('');
    setError(undefined);
  }

  return (
    <div>
      {/* Header ------------------------------------------------------------ */}
      <header className="border-b border-white/10 px-4 py-6 sm:px-6 sm:py-7">
        <p className="eyebrow text-gold-500">Staff only · account management</p>
        <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ivory-50">Musicians</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-warm-400">
          Every performer who can sign in to the singer console to work live music requests. Add an
          account for a new singer, DJ or instrumentalist, or delete one that is no longer needed.
        </p>
      </header>

      {/* Stats ------------------------------------------------------------- */}
      <div className="grid gap-3 border-b border-white/10 px-4 py-5 sm:grid-cols-3 sm:px-6">
        <StatTile dark label="Musician accounts" value={musicians.length} />
        <StatTile dark label="Active sign-ins" value={activeCount} />
        <StatTile dark label="Events with a performer" value={assignedCount} />
      </div>

      <div className="grid gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Roster ---------------------------------------------------------- */}
        <div>
          {musicians.length > 0 ? (
            <ul className="space-y-3">
              {musicians.map((musician) => {
                const events = eventsFor(musician.id);
                return (
                  <li
                    key={musician.id}
                    className="rounded-card border border-white/10 bg-white/[0.04] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-500/90 font-display text-[16px] font-semibold text-ink-950">
                            {musician.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-medium text-ivory-50">
                              {musician.name}
                            </p>
                            <p className="truncate text-[12.5px] text-warm-400">
                              {musician.role} · sign-in{' '}
                              <code className="rounded-[3px] bg-white/10 px-1.5 py-0.5 text-[11.5px] text-cream-200">
                                {musician.username}
                              </code>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-warm-400">
                          <span
                            className={cx(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
                              musician.active
                                ? 'border-sage-400/40 bg-sage-400/12 text-sage-300'
                                : 'border-white/15 bg-white/[0.05] text-warm-400',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cx(
                                'h-1.5 w-1.5 rounded-full',
                                musician.active ? 'bg-sage-400' : 'bg-warm-500',
                              )}
                            />
                            {musician.active ? 'Can sign in' : 'Disabled'}
                          </span>
                          {events > 0 ? (
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
                              {events} upcoming event{events === 1 ? '' : 's'}
                              <CountChip value={events} dark />
                            </span>
                          ) : (
                            <span className="text-warm-500">No events assigned</span>
                          )}
                        </div>
                      </div>

                      {confirmId === musician.id ? (
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[12.5px] text-warm-400">Delete account?</span>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              deleteMusician(musician.id);
                              setConfirmId(null);
                            }}
                          >
                            Yes, delete
                          </Button>
                          <Button size="sm" variant="outlineDark" onClick={() => setConfirmId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outlineDark"
                          onClick={() => setConfirmId(musician.id)}
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              dark
              icon={<UserPlus className="h-5 w-5" strokeWidth={1.6} />}
              title="No musician accounts yet"
              body="Add the first performer so they can sign in to the singer console and work live music requests."
            />
          )}
        </div>

        {/* Add form -------------------------------------------------------- */}
        <div>
          <Panel dark className="lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="New account"
              title="Add a musician"
              description="They can sign in straight away with the username shown after saving."
            />
            <form className="mt-4 space-y-4" onSubmit={submit}>
              <Field label="Name" error={error} required>
                {(props) => (
                  <TextInput
                    {...props}
                    className="border-white/15 bg-ink-850 text-ivory-100 placeholder:text-warm-400 hover:border-white/25 focus:border-gold-500"
                    placeholder="e.g. Tara Menon"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError(undefined);
                    }}
                  />
                )}
              </Field>
              <Field label="Stage role" required>
                {(props) => (
                  <SelectInput {...props} dark value={role} onChange={(event) => setRole(event.target.value)}>
                    {MUSICIAN_ROLES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </SelectInput>
                )}
              </Field>
              <Button type="submit" variant="gold" fullWidth>
                <UserPlus aria-hidden="true" className="h-4 w-4" />
                Add musician
              </Button>
            </form>

            <Notice tone="neutral" dark className="mt-4">
              <p>
                Demo sign-in only: usernames are derived from the name and every account uses the
                shared demo password shown on the login screen. No real accounts, emails or personal
                data are involved.
              </p>
            </Notice>
          </Panel>
        </div>
      </div>
    </div>
  );
}
