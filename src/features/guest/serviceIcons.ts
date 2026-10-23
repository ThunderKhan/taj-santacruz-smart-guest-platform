import type { LucideIcon } from 'lucide-react';
import {
  AudioLines,
  Bed,
  Calendar,
  Car,
  ConciergeBell,
  Flower2,
  Gift,
  MessageSquare,
  Receipt,
  Utensils,
  Wrench,
} from 'lucide-react';
import type { ServiceId } from '@/types';

/** Catalogue icon keys resolved to real Lucide components. */
export const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  food: Utensils,
  music: AudioLines,
  housekeeping: Bed,
  maintenance: Wrench,
  concierge: ConciergeBell,
  spa: Flower2,
  transport: Car,
  feedback: MessageSquare,
  occasions: Gift,
  reservations: Calendar,
  billing: Receipt,
};
