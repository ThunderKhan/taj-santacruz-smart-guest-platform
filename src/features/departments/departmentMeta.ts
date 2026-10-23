import type { LucideIcon } from 'lucide-react';
import { AudioLines, Bed, ChefHat, ConciergeBell, Flower2, Wrench } from 'lucide-react';
import type { DepartmentId } from '@/types';

/** One icon per department — keeps navigation visually scannable. */
export const DEPARTMENT_ICONS: Record<DepartmentId, LucideIcon> = {
  restaurant: ChefHat,
  housekeeping: Bed,
  maintenance: Wrench,
  entertainment: AudioLines,
  concierge: ConciergeBell,
  spa: Flower2,
};

export const DEPARTMENT_ACCENT: Record<DepartmentId, string> = {
  restaurant: 'text-gold-400',
  housekeeping: 'text-sage-400',
  maintenance: 'text-brass-500',
  entertainment: 'text-gold-300',
  concierge: 'text-cream-200',
  spa: 'text-sage-300',
};

/** Short label used in compact navigation. */
export const DEPARTMENT_SHORT: Record<DepartmentId, string> = {
  restaurant: 'Restaurant',
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance',
  entertainment: 'Entertainment',
  concierge: 'Concierge',
  spa: 'Spa',
};

/** Small imagery used in dashboard headers so each dashboard feels distinct. */
export const DEPARTMENT_HERO: Record<DepartmentId, string> = {
  restaurant: '/images/dept-restaurant.jpg',
  housekeeping: '/images/svc-housekeeping.jpg',
  maintenance: '/images/svc-maintenance.jpg',
  entertainment: '/images/music-stage.jpg',
  concierge: '/images/lobby-grand.jpg',
  spa: '/images/spa-treatment.jpg',
};
