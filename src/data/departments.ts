import type { Department, DepartmentId, StaffMember } from '@/types';

/** Fictitious staff records used only for simulated assignment. */
const staff = (entries: Array<[string, string]>): StaffMember[] =>
  entries.map(([name, role], index) => ({
    id: `${name.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 18)}-${index}`,
    name,
    role,
    initials: name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  }));

export const DEPARTMENTS: Department[] = [
  {
    id: 'restaurant',
    name: 'Restaurant / Room Service',
    subtitle: 'In-room dining, table orders & reservations',
    location: 'Kitchen pass · Ground level',
    services: ['food', 'reservations'],
    staff: staff([
      ['Arjun Menon', 'Sous Chef'],
      ['Priya Nair', 'Captain'],
      ['Sameer Qureshi', 'Steward'],
      ['Deepa Rao', 'Room Service Lead'],
    ]),
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    subtitle: 'Amenities, linen, turndown & room cleaning',
    location: 'Linen room · Level 2',
    services: ['housekeeping'],
    staff: staff([
      ['Rekha Sawant', 'Floor Supervisor'],
      ['Anjali Deshmukh', 'Room Attendant'],
      ['Vaishali Patil', 'Room Attendant'],
      ['Manoj Yadav', 'Linen Porter'],
    ]),
  },
  {
    id: 'maintenance',
    name: 'Maintenance / Engineering',
    subtitle: 'Climate, lighting, plumbing & equipment',
    location: 'Engineering workshop · Lower ground',
    services: ['maintenance'],
    staff: staff([
      ['Sandeep Kulkarni', 'Duty Technician'],
      ['Imran Shaikh', 'HVAC Technician'],
      ['Prakash Jadhav', 'Electrical Technician'],
    ]),
  },
  {
    id: 'entertainment',
    name: 'Live Music Desk',
    subtitle: 'Song requests, queue, votes & dedications',
    location: 'Lobby Lounge stage · Ground level',
    services: ['music'],
    staff: staff([
      ['Kabir Malhotra', 'Resident DJ'],
      ['Nisha Fernandes', 'Stage Manager'],
      ['Rohan Bhatt', 'Sound Engineer'],
    ]),
  },
  {
    id: 'events',
    name: 'Events & Banquets',
    subtitle: 'Celebration music & entertainment enquiries',
    location: 'Banquet desk · Level 1',
    services: ['occasions'],
    staff: staff([
      ['Sanya Kapoor', 'Events Manager'],
      ['Devika Rao', 'Banquet Coordinator'],
      ['Imran Qureshi', 'Entertainment Liaison'],
    ]),
  },
  {
    id: 'concierge',
    name: 'Concierge / Guest Relations',
    subtitle: 'Transport, guest questions & feedback',
    location: 'Concierge desk · Lobby',
    services: ['concierge', 'transport', 'feedback', 'billing'],
    staff: staff([
      ['Vikram Shetty', 'Chief Concierge'],
      ['Aditi Sharma', 'Guest Relations Officer'],
      ['Farhan Merchant', 'Transport Coordinator'],
      ['Neha Bhatt', 'Guest Relations Manager'],
    ]),
  },
  {
    id: 'spa',
    name: 'Spa & Wellness',
    subtitle: 'Treatments, sessions & therapist scheduling',
    location: 'Wellness suite · Level 6',
    services: ['spa'],
    staff: staff([
      ['Meera Iyer', 'Spa Manager'],
      ['Kavita Menon', 'Senior Therapist'],
      ['Tanvi Rao', 'Therapist'],
    ]),
  },
];

export const DEPARTMENT_IDS = DEPARTMENTS.map((department) => department.id);

/**
 * The departments surfaced in this focused music & celebration prototype.
 * The remaining queues are retained (routes still resolve by URL) but hidden
 * from staff navigation until they are needed again.
 */
export const FOCUS_DEPARTMENTS: DepartmentId[] = ['entertainment', 'events'];

export function findDepartment(id: DepartmentId): Department {
  return DEPARTMENTS.find((department) => department.id === id) ?? DEPARTMENTS[0];
}

export function departmentName(id: DepartmentId): string {
  return findDepartment(id).name;
}

/** Staff pick lists used by the assignment control in each dashboard. */
export function staffFor(department: DepartmentId): StaffMember[] {
  return findDepartment(department).staff;
}
