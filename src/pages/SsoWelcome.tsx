import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthProvider';

export function SsoWelcome(){
  const { session, authLoading }=useAuth();
  if(authLoading)return <main className="min-h-dvh grid place-items-center" role="status">Verifying your Music access…</main>;
  if(!session)return <Navigate to="/login" replace />;
  const dest=session.role==='musician'?'/musician/live':'/staff/events';
  return (
    <main className="min-h-dvh bg-ivory-100 px-5 py-16 text-ink-900">
      <section className="mx-auto max-w-xl rounded-card border border-cream-300 bg-white p-7 text-center shadow-soft">
        <p className="eyebrow text-gold-600">VSPH MUSIC</p>
        <h1 className="display mt-3 text-3xl">Access verified</h1>
        <p className="mt-4 text-sm leading-relaxed text-warm-600">
          Signed in as {session.displayName}, with {session.role} access to
          {' '}{session.organizationName || 'your selected organization'}.
        </p>
        <p className="mt-3 text-xs text-warm-500">
          This application still uses demonstration-only local content. Production records require
          tenant-isolated server APIs.
        </p>
        <Link to={dest} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-6 text-sm font-semibold text-white">
          Continue to your console
        </Link>
      </section>
    </main>
  );
}
