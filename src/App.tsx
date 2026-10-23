import { Navigate, Route, Routes } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

import { GuestLayout } from '@/layouts/GuestLayout';
import { KioskLayout } from '@/layouts/KioskLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { GuestHome } from '@/features/guest/GuestHome';
import { FoodOrder } from '@/features/guest/FoodOrder';
import { MusicRequests } from '@/features/guest/MusicRequests';
import { HousekeepingRequests } from '@/features/guest/HousekeepingRequests';
import { MaintenanceRequests } from '@/features/guest/MaintenanceRequests';
import { ConciergeDesk } from '@/features/guest/ConciergeDesk';
import { SpaBooking } from '@/features/guest/SpaBooking';
import { TransportRequest } from '@/features/guest/TransportRequest';
import { ReservationsPage } from '@/features/guest/ReservationsPage';
import { OccasionRequests } from '@/features/guest/OccasionRequests';
import { FeedbackForm } from '@/features/guest/FeedbackForm';
import { BillingReview } from '@/features/guest/BillingReview';
import { MyRequests } from '@/features/guest/MyRequests';
import { RequestDetail } from '@/features/guest/RequestDetail';

import { KioskHome } from '@/features/kiosk/KioskHome';
import { KioskService } from '@/features/kiosk/KioskService';

import { DepartmentRoute } from '@/features/departments/DepartmentRoute';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { NotFound } from '@/pages/NotFound';

/**
 * Route map for the prototype.
 *
 * The three demo experiences are deliberately separated so a presenter can
 * frame each one on its own, while all of them share one request state.
 */
export default function App() {
  useScrollToTop();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/guest" replace />} />

      {/* 1 — Guest experience (QR / tablet) */}
      <Route element={<GuestLayout />}>
        <Route path="/guest" element={<GuestHome />} />
        <Route path="/guest/food" element={<FoodOrder />} />
        <Route path="/guest/room-service" element={<FoodOrder />} />
        <Route path="/guest/music" element={<MusicRequests />} />
        <Route path="/guest/housekeeping" element={<HousekeepingRequests />} />
        <Route path="/guest/maintenance" element={<MaintenanceRequests />} />
        <Route path="/guest/concierge" element={<ConciergeDesk />} />
        <Route path="/guest/spa" element={<SpaBooking />} />
        <Route path="/guest/transport" element={<TransportRequest />} />
        <Route path="/guest/reservations" element={<ReservationsPage />} />
        <Route path="/guest/occasions" element={<OccasionRequests />} />
        <Route path="/guest/feedback" element={<FeedbackForm />} />
        <Route path="/guest/billing" element={<BillingReview />} />
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

      {/* 3 — Department operations */}
      <Route element={<StaffLayout />}>
        <Route path="/staff" element={<Navigate to="/staff/restaurant" replace />} />
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
