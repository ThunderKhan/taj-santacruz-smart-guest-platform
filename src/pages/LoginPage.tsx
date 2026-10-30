import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, LogIn, QrCode } from 'lucide-react';
import { useAuth, type Role } from '@/store/AuthProvider';
import { useRequests } from '@/store/RequestsProvider';
import { DEMO_PASSWORD, STAFF_USERNAME } from '@/data/musicians';
import { Wordmark } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Feedback';
import { PROPERTY } from '@/data/property';

/**
 * Demo sign-in for the two back-of-house roles.
 *
 * Guests never sign in — they scan a table QR code and land straight on the
 * guest experience. Staff and performers use this screen; the password check
 * happens in the browser and grants nothing beyond this prototype.
 */
export function LoginPage() {
  const { session, signIn, authLoading, ssoEnabled, portalUrl } = useAuth();
  const { musicians } = useRequests();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [staffUsername, setStaffUsername] = useState(STAFF_USERNAME);
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState<string | undefined>();

  const [musicianUsername, setMusicianUsername] = useState('');
  const [musicianPassword, setMusicianPassword] = useState('');
  const [musicianError, setMusicianError] = useState<string | undefined>();

  if (authLoading) {
    return <main role="status" className="min-h-dvh grid place-items-center">Checking sign-in status…</main>;
  }

  // In SSO mode, never render the demo username/password controls.
  if (ssoEnabled && !session) {
    return (
      <main className="min-h-dvh bg-ivory-100 px-5 py-16 text-ink-900">
        <section className="mx-auto max-w-xl rounded-card border border-cream-300 bg-white p-7 text-center shadow-soft">
          <p className="eyebrow text-gold-600">CENTRAL ACCOUNT</p>
          <h1 className="display mt-3 text-3xl">Sign in through VSPH</h1>
          <p className="mt-4 text-sm leading-relaxed text-warm-600">
            Your Music access is managed centrally. Sign into your VSPH Control Center account,
            select Music and choose the customer organization you are authorized to access.
          </p>
          {portalUrl ? (
            <a href={portalUrl + '/login'} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-6 text-sm font-semibold text-white">
              Open VSPH Control Center
            </a>
          ) : <p className="mt-5 text-sm text-warm-600">Contact your VSPH administrator for access.</p>}
          <p className="mt-6 text-xs text-warm-500">
            Guest QR music requests do not require a staff account.
          </p>
          <Link to="/guest" className="mt-3 inline-block text-sm font-semibold text-ink-900 underline">Continue as guest</Link>
        </section>
      </main>
    );
  }

  // Already signed in → skip the screen and land on the right console.
  if (session) {
    return <Navigate to={from ?? (session.role === 'staff' ? '/staff' : '/musician')} replace />;
  }

  const activeMusicians = musicians.filter((musician) => musician.active);

  function submit(role: Role, username: string, password: string) {
    const result = signIn(username, password);
    if (!result.ok) {
      const apply = role === 'staff' ? setStaffError : setMusicianError;
      apply(result.error);
      return;
    }
    navigate(from ?? (result.session.role === 'staff' ? '/staff' : '/musician'), { replace: true });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ivory-100">
      <header className="border-b border-cream-300 bg-white/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Wordmark />
          <span className="eyebrow-sm hidden text-warm-500 sm:block">{PROPERTY.descriptor}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow text-gold-600">Staff sign-in</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,5vw,2.8rem)] text-ink-900">
            Choose your console
          </h1>
          <div className="gold-hairline mx-auto mt-4 w-20" />
          <p className="mt-4 text-[14.5px] leading-relaxed text-warm-600">
            Guests never sign in — a scan of the table QR code opens the guest experience. The two
            back-of-house roles sign in below.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {/* ---------------------------------------------------------- Staff */}
          <section className="rounded-card border border-cream-300 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-ivory-50">
                <ClipboardList aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-[22px] leading-tight text-ink-900">Staff</h2>
                <p className="eyebrow-sm text-warm-500">Events &amp; musicians desk</p>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-warm-600">
              Work the celebration enquiry pipeline, assign performers and manage musician accounts.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                submit('staff', staffUsername, staffPassword);
              }}
            >
              <Field label="Username" error={staffError} required>
                {(props) => (
                  <TextInput
                    {...props}
                    autoComplete="username"
                    value={staffUsername}
                    onChange={(event) => {
                      setStaffUsername(event.target.value);
                      setStaffError(undefined);
                    }}
                  />
                )}
              </Field>
              <Field label="Password" hint={`Demo password: ${DEMO_PASSWORD}`} required>
                {(props) => (
                  <TextInput
                    {...props}
                    type="password"
                    autoComplete="current-password"
                    value={staffPassword}
                    onChange={(event) => {
                      setStaffPassword(event.target.value);
                      setStaffError(undefined);
                    }}
                  />
                )}
              </Field>
              <Button type="submit" variant="ink" fullWidth>
                <LogIn aria-hidden="true" className="h-4 w-4" />
                Sign in as staff
              </Button>
            </form>
          </section>

          {/* ------------------------------------------------------ Musician */}
          <section className="rounded-card border border-cream-300 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-ink-950">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z" />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-[22px] leading-tight text-ink-900">Musician</h2>
                <p className="eyebrow-sm text-warm-500">Singer console</p>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-warm-600">
              Work your live music queue and view the celebration events assigned to you.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                submit('musician', musicianUsername, musicianPassword);
              }}
            >
              <Field label="Username" error={musicianError} required>
                {(props) => (
                  <TextInput
                    {...props}
                    autoComplete="username"
                    placeholder="e.g. aarav"
                    value={musicianUsername}
                    onChange={(event) => {
                      setMusicianUsername(event.target.value);
                      setMusicianError(undefined);
                    }}
                  />
                )}
              </Field>
              <Field label="Password" hint={`Demo password: ${DEMO_PASSWORD}`} required>
                {(props) => (
                  <TextInput
                    {...props}
                    type="password"
                    autoComplete="current-password"
                    value={musicianPassword}
                    onChange={(event) => {
                      setMusicianPassword(event.target.value);
                      setMusicianError(undefined);
                    }}
                  />
                )}
              </Field>
              <Button type="submit" variant="gold" fullWidth>
                <LogIn aria-hidden="true" className="h-4 w-4" />
                Sign in as musician
              </Button>
            </form>
          </section>
        </div>

        <div className="mx-auto mt-6 max-w-3xl space-y-4">
          <Notice tone="gold" title="Demo credentials">
            <p>
              Staff username <strong>{STAFF_USERNAME}</strong> · musician usernames{' '}
              <strong>{activeMusicians.map((musician) => musician.username).join(', ') || '—'}</strong>{' '}
              · password <strong>{DEMO_PASSWORD}</strong> for all accounts. Performers added from the
              Musicians desk can sign in immediately. This is a browser-only demonstration — there is
              no real authentication, identity check or personal data.
            </p>
          </Notice>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13.5px] text-warm-600">
            <span className="inline-flex items-center gap-2">
              <QrCode aria-hidden="true" className="h-4 w-4 text-gold-600" />
              A guest? No sign-in needed.
            </span>
            <Link to="/guest" className="underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-ink-900">
              Continue to the guest experience
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-cream-300 px-4 py-5 text-center text-[12px] leading-relaxed text-warm-500 sm:px-6">
        {PROPERTY.disclosure}
      </footer>
    </div>
  );
}
