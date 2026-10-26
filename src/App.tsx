import { Navigate, Route, Routes } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

import { GuestLayout } from '@/layouts/GuestLayout';
import { KioskLayout } from '@/layouts/KioskLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

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
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { NotFound } from '@/pages/NotFound';

/**
 * Route map for the prototype.
 *
 * The guest journey is intentionally narrow: live music requests and the
 * celebration enquiry form, both tracked in "My requests". The other hotel
 * service modules (food, housekeeping, spa, …) remain in the codebase —
 * including their dashboards, reachable by URL — but are no longer part of
 * the guest journey or navigation.
 */
export default function App() {
  useScrollToTop();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/guest" replace />} />

      {/* 1 — Guest experience (QR / tablet) */}
      <Route element={<GuestLayout />}>
        <Route path="/guest" element={<GuestHome />} />
        <Route path="/guest/music" element={<MusicRequests />} />
        <Route path="/guest/occasions" element={<CelebrationEnquiry />} />
        <Route path="/guest/celebration" element={<Navigate to="/guest/occasions" replace />} />
        <Route path="/guest/my-requests" element={<MyRequests />} />
        <Route path="/guest/my-requests/:ref" element={<RequestDetail />} />
      </Route>

      {/* 2 — Hotel tablet / kiosk presentation mode */}
      <Route element={<KioskLayout />}>
        <Route path="/kiosk" element={<KioskHome />} />
        <Route path="/kiosk/my-requests" element={<MyRequests />} />
        <Route path="/kiosk/my-requests/:ref" element={<RequestDetail />} />
        <Route path="/kiosk/:service" element={<KioskService />} />
      </Route>

      {/* 3 — Staff operations: the two focus desks, then legacy department routes */}
      <Route element={<StaffLayout />}>
        <Route path="/staff" element={<Navigate to="/staff/entertainment" replace />} />
        <Route path="/staff/entertainment" element={<StageDashboard />} />
        <Route path="/staff/events" element={<EventsDashboard />} />
        <Route path="/staff/:department" element={<DepartmentRoute />} />
      </Route>

      {/* 4 — Hotel management */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
