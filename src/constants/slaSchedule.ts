import type { MilestoneType } from '../types';

export interface SlaMilestone {
  type: MilestoneType;
  /** Minutes after scheduled arrival. */
  offsetMinutes: number;
  description: string;
}

/** Mirrors the hardcoded SLA_OFFSETS in the backend TurnaroundService. */
export const SLA_SCHEDULE: SlaMilestone[] = [
  { type: 'ChocksOn', offsetMinutes: 2, description: 'Aircraft chocked at stand' },
  { type: 'DoorOpen', offsetMinutes: 7, description: 'Aircraft doors opened' },
  { type: 'StairsDocked', offsetMinutes: 5, description: 'Passenger stairs docked' },
  { type: 'BaggageOffload', offsetMinutes: 25, description: 'Inbound baggage offloaded' },
  { type: 'Cleaning', offsetMinutes: 35, description: 'Cabin cleaning complete' },
  { type: 'Catering', offsetMinutes: 40, description: 'Catering uplift complete' },
  { type: 'Fuelling', offsetMinutes: 40, description: 'Refuelling complete' },
  { type: 'BoardingComplete', offsetMinutes: 55, description: 'All passengers boarded' },
  { type: 'DoorClose', offsetMinutes: 58, description: 'Aircraft doors closed' },
  { type: 'PushbackClearance', offsetMinutes: 60, description: 'Cleared for pushback' },
];

/** Ordering index used to sort milestones consistently in the UI. */
export const MILESTONE_ORDER: Record<MilestoneType, number> = SLA_SCHEDULE.reduce(
  (acc, m, i) => {
    acc[m.type] = i;
    return acc;
  },
  {} as Record<MilestoneType, number>,
);
