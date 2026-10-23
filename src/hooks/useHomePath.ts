import { useLocation } from 'react-router-dom';
import type { ServiceId } from '@/types';

/**
 * Guest modules are shared between the QR experience and the tablet kiosk, so
 * "back to the service home" resolves to whichever chrome is active.
 */
export function useHomePath(): string {
  const { pathname } = useLocation();
  return pathname.startsWith('/kiosk') ? '/kiosk' : '/guest';
}

/**
 * Service routes are keyed by service id in both experiences
 * (`/guest/food` and `/kiosk/food`), so cross-links inside a shared module
 * resolve against whichever chrome is active instead of dropping the guest
 * out of tablet mode.
 */
export function useServicePath(): (id: ServiceId) => string {
  const home = useHomePath();
  return (id: ServiceId) => `${home}/${id}`;
}

export function useIsKiosk(): boolean {
  const { pathname } = useLocation();
  return pathname.startsWith('/kiosk');
}
