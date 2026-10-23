import { useMemo } from 'react';
import type { DepartmentId, RequestStatus, ServiceRequest } from '@/types';
import { useRequests } from '@/store/RequestsProvider';

/** Requests for one department, newest activity first. */
export function useDepartmentQueue(department: DepartmentId): ServiceRequest[] {
  const { requests, tick } = useRequests();
  return useMemo(() => {
    void tick;
    return requests
      .filter((request) => request.department === department)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [requests, department, tick]);
}

export type QueueFilter = 'open' | RequestStatus | 'all';

/** Apply a status filter to an already-sorted queue. */
export function filterQueue(
  queue: ServiceRequest[],
  filter: QueueFilter,
  now: number,
): ServiceRequest[] {
  void now;
  switch (filter) {
    case 'open':
      return queue.filter(
        (request) => request.status === 'submitted' || request.status === 'accepted',
      );
    case 'all':
      return queue;
    default:
      return queue.filter((request) => request.status === filter);
  }
}
