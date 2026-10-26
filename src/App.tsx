import { type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

import { GuestLayout } from '@/layouts/GuestLayout';
import { KioskLayout } from '@/layouts/KioskLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { MusicianLayout } from '@/layouts/MusicianLayout';

import { GuestHome } from '@/features/guest/GuestHome';
import { MusicRequests } from '@/features/guest/MusicRequests';
import { CelebrationEnquiry } from '@/features/guest/CelebrationEnquiry';
import { MyRequests } from '@/features/guest/MyRequests';
import { RequestDetail } from '@/features/guest/RequestDetail';

import { KioskHome } from '@/features/kiosk/KioskHome';
import { KioskService } from '@/features/kiosk/KioskService';

import { DepartmentRoute } from '@/features/departments/DepartmentRoute';
import { StageDashboard } from '@/features/entertainment/StageDashboard';
import { EventsDashboard } from '@/features/events/EventsDashboard';
import { MusiciansDashboard } from '@/features/staff/MusiciansDashboard';
import { MusicianEvents } from '@/features/musician/MusicianEvents';
import { LoginPage } from '@/pages/LoginPage';
import { NotFound } from '@/pages/NotFound';
import { useAuth, type Role } from '@/store/AuthProvider';

/**
 * Route guard for the two back-of-house roles.
 *
 * Guests never sign in — they scan a table QR code. Staff and performers are
 * bounced to the demo sign-in screen when there is no session for their role.
 * This is presentation-layer routing only, not authorisation.
 */
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) {
    return <Navigate to={session.role === 'staff' ? '/staff' : '/musician'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  useScrollToTop();

  return (
    <Routes>
      {/* 1 — Guest experience (table QR entry, no sign-in) ---------------- */}
      <Route element={<GuestLayout />}>
        <Route path="/guest" element={<GuestHome />} />
        <Route path="/guest/music" element={<MusicRequests />} />
        <Route path="/guest/occasions" element={<CelebrationEnquiry />} />
        <Route path="/guest/my-requests" element={<MyRequests />} />
        <Route path="/guest/requests/:ref" element={<RequestDetail />} />
      </Route>

      {/* 2 — Tablet / kiosk in-room mode (still guest-facing) -------------- */}
      <Route element={<KioskLayout />}>
        <Route path="/kiosk" element={<KioskHome />} />
        <Route path="/kiosk/:slug" element={<KioskService />} />
      </Route>

      {/* 3 — Demo sign-in for the two back-of-house roles ------------------ */}
      <Route path="/login" element={<LoginPage />} />

      {/* 4 — Staff console: celebration enquiries + musician accounts ------ */}
      <Route
        path="/staff"
        element={
          <RequireRole role="staff">
            <StaffLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/staff/events" replace />} />
        <Route path="events" element={<EventsDashboard />} />
        <Route path="musicians" element={<MusiciansDashboard />} />
        {/* Live music is owned by performers — staff land back on the desk. */}
        <Route path="entertainment" element={<Navigate to="/staff/events" replace />} />
        {/* Legacy department dashboards still resolve by URL (not advertised). */}
        <Route path=":department" element={<DepartmentRoute />} />
      </Route>

      {/* 5 — Singer console: live music queue + assigned events ------------ */}
      <Route
        path="/musician"
        element={
          <RequireRole role="musician">
            <MusicianLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/musician/live" replace />} />
        <Route path="live" element={<StageDashboard />} />
        <Route path="events" element={<MusicianEvents />} />
      </Route>

      <Route path="/" element={<Navigate to="/guest" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
