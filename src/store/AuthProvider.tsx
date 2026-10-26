import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRequests } from '@/store/RequestsProvider';
import { DEMO_PASSWORD, STAFF_USERNAME } from '@/data/musicians';

/**
 * Demo-only role session for the two back-of-house log-ins (staff / musician).
 *
 * This is explicitly NOT authentication: there is no server, no hashing and no
 * real identity. The demo password is checked in the browser purely so the
 * prototype can demonstrate two separate role experiences. Guests never sign
 * in — they scan a table QR code.
 */

export type Role = 'staff' | 'musician';

export interface AuthSession {
  role: Role;
  /** Lower-case sign-in username. */
  username: string;
  /** Display name shown in the console header. */
  displayName: string;
  /** For musicians: the performer account id they signed in as. */
  musicianId?: string;
}

export type SignInResult = { ok: true; session: AuthSession } | { ok: false; error: string };

const AUTH_KEY = 'smart-guest-platform:auth';

interface AuthApi {
  session: AuthSession | null;
  signIn: (username: string, password: string) => SignInResult;
  signOut: () => void;
}

const AuthContext = createContext<AuthApi | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession | null;
    if (!parsed || (parsed.role !== 'staff' && parsed.role !== 'musician')) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { musicians } = useRequests();
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

  useEffect(() => {
    try {
      if (session) window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(AUTH_KEY);
    } catch {
      // Storage may be unavailable — the in-memory session still works.
    }
  }, [session]);

  const signIn = useCallback(
    (rawUsername: string, rawPassword: string): SignInResult => {
      const username = rawUsername.trim().toLowerCase();
      const password = rawPassword;

      if (!username || !password) {
        return { ok: false, error: 'Enter both your username and the demo password.' };
      }

      if (username === STAFF_USERNAME) {
        if (password !== DEMO_PASSWORD) {
          return { ok: false, error: 'Incorrect demo password. It is shown on this screen.' };
        }
        const next: AuthSession = { role: 'staff', username, displayName: 'Events & Banquets Team' };
        setSession(next);
        return { ok: true, session: next };
      }

      const musician = musicians.find((entry) => entry.username === username);
      if (!musician || !musician.active) {
        return {
          ok: false,
          error: `No active musician account for “${username}”. Ask the events desk to add you.`,
        };
      }
      if (password !== DEMO_PASSWORD) {
        return { ok: false, error: 'Incorrect demo password. It is shown on this screen.' };
      }
      const next: AuthSession = {
        role: 'musician',
        username,
        displayName: musician.name,
        musicianId: musician.id,
      };
      setSession(next);
      return { ok: true, session: next };
    },
    [musicians],
  );

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo<AuthApi>(() => ({ session, signIn, signOut }), [session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** The signed-in musician's account, when the session is a musician one. */
export function useCurrentMusician() {
  const { musicians } = useRequests();
  const { session } = useAuth();
  if (!session || session.role !== 'musician') return undefined;
  return musicians.find((musician) => musician.id === session.musicianId);
}
