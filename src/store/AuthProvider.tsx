import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRequests } from '@/store/RequestsProvider';
import { DEMO_PASSWORD, STAFF_USERNAME } from '@/data/musicians';

export type Role = 'staff' | 'musician';
export interface AuthSession {
  role: Role;
  username: string;
  displayName: string;
  musicianId?: string;
  source?: 'demo' | 'vsph';
  organizationId?: string;
  organizationName?: string;
}
export type SignInResult = { ok: true; session: AuthSession } | { ok: false; error: string };
const AUTH_KEY = 'smart-guest-platform:auth';
interface AuthApi {
  session: AuthSession | null;
  authLoading: boolean;
  ssoEnabled: boolean;
  portalUrl: string | null;
  signIn: (username: string, password: string) => SignInResult;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthApi | null>(null);

function readDemoSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    const parsed = raw ? JSON.parse(raw) as AuthSession : null;
    if (!parsed || !['staff','musician'].includes(parsed.role) || parsed.source === 'vsph') return null;
    return { ...parsed, source: 'demo' };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { musicians } = useRequests();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const statusResponse = await fetch('/api/sso/status', { credentials:'same-origin', cache:'no-store' });
        if (!statusResponse.ok) throw new Error('Cannot determine login mode.');
        const status = await statusResponse.json() as { enabled?: boolean; portalUrl?: string };
        if (!active) return;
        if (!status.enabled) {
          setSession(readDemoSession());
          setSsoEnabled(false);
          return;
        }
        setSsoEnabled(true);
        setPortalUrl(status.portalUrl || null);
        const meResponse = await fetch('/api/sso/session', { credentials:'same-origin', cache:'no-store' });
        if (!meResponse.ok) { setSession(null); return; }
        const identity = await meResponse.json() as {
          user:{id:string;name:string};organization:{id:string;name:string};
          role:Role;musicianId?:string
        };
        if (!active) return;
        if (!['staff','musician'].includes(identity.role) || !identity.user?.id || !identity.organization?.id)
          throw new Error('Unexpected Music identity.');
        setSession({
          role:identity.role,username:identity.user.id,displayName:identity.user.name,
          musicianId:identity.musicianId,source:'vsph',
          organizationId:identity.organization.id,organizationName:identity.organization.name
        });
      } catch {
        if (active) {
          // A failed SSO status check must never silently enable demo passwords
          // in a production deployment. Vite dev alone may use local demo mode.
          setSsoEnabled(import.meta.env.PROD);
          setSession(import.meta.env.DEV ? readDemoSession() : null);
        }
      } finally { if (active) setAuthLoading(false); }
    };
    void init();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authLoading || ssoEnabled) return;
    try {
      if (session?.source === 'demo') window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(AUTH_KEY);
    } catch { /* Storage is optional for demo mode only. */ }
  }, [session,authLoading,ssoEnabled]);

  const signIn = useCallback((rawUsername: string, rawPassword: string): SignInResult => {
    if (authLoading || ssoEnabled) return {ok:false,error:'Use the VSPH portal to sign in.'};
    const username=rawUsername.trim().toLowerCase(),password=rawPassword;
    if(!username||!password)return{ok:false,error:'Enter both your username and the demo password.'};
    if(username===STAFF_USERNAME){
      if(password!==DEMO_PASSWORD)return{ok:false,error:'Incorrect demo password.'};
      const next:AuthSession={role:'staff',username,displayName:'Events & Banquets Team',source:'demo'};
      setSession(next);return{ok:true,session:next};
    }
    const musician=musicians.find(item=>item.username===username && item.active);
    if(!musician)return{ok:false,error:'No active demo musician account.'};
    if(password!==DEMO_PASSWORD)return{ok:false,error:'Incorrect demo password.'};
    const next:AuthSession={
      role:'musician',username,displayName:musician.name,musicianId:musician.id,source:'demo'
    };
    setSession(next);return{ok:true,session:next};
  },[authLoading,ssoEnabled,musicians]);

  const signOut = useCallback(async () => {
    if (session?.source==='vsph') {
      const response=await fetch('/api/sso/logout',{
        method:'POST',credentials:'same-origin',cache:'no-store'
      });
      if (!response.ok) throw new Error('Could not sign out of Music');
    }
    setSession(null);
  },[session]);

  const value=useMemo<AuthApi>(()=>({
    session,authLoading,ssoEnabled,portalUrl,signIn,signOut
  }),[session,authLoading,ssoEnabled,portalUrl,signIn,signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth():AuthApi {
  const context=useContext(AuthContext);
  if(!context)throw Error('useAuth must be used inside <AuthProvider>');
  return context;
}
export function useCurrentMusician(){
  const {musicians}=useRequests();
  const {session}=useAuth();
  if(!session||session.role!=='musician')return undefined;
  return musicians.find(m=>m.id===session.musicianId);
}
