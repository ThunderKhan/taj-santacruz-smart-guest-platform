import { useLocation } from 'react-router-dom';
import type { DepartmentId } from '@/types';
import { DEPARTMENT_IDS } from '@/data/departments';

/**
 * Reads the active department from the URL.
 *
 * Used instead of `useParams` so the value is available in both the staff
 * layout chrome and the dashboard route component.
 */
export function useActiveDepartment(): DepartmentId {
  const { pathname } = useLocation();
  const segment = pathname.split('/')[2];
  if (segment && (DEPARTMENT_IDS as string[]).includes(segment)) {
    return segment as DepartmentId;
  }
  return 'restaurant';
}
