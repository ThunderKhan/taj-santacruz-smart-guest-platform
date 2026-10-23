import { useRequests } from '@/store/RequestsProvider';

/**
 * Sticky headers must clear the presenter ribbon. Reading its collapsed state
 * keeps every layout correct without fixed magic numbers drifting apart.
 */
export function useRibbonOffset(): number {
  const { ribbonCollapsed } = useRequests();
  return ribbonCollapsed ? 0 : 36;
}
