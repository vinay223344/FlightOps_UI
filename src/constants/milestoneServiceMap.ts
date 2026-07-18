/**
 * Maps each ground-handling service type to the milestone types it covers.
 * Used when creating a TurnaroundPlan so only relevant milestones are generated.
 */
import type { MilestoneType } from '../types/enums';

export const SERVICE_TO_MILESTONES: Record<string, MilestoneType[]> = {
  Ramp: [
    'ChocksOn',
    'DoorOpen',
    'StairsDocked',
    'BoardingComplete',
    'DoorClose',
    'PushbackClearance',
  ],
  Baggage: ['BaggageOffload'],
  Cleaning: ['Cleaning'],
  Catering: ['Catering'],
  Fuelling: ['Fuelling'],
};

/**
 * Given a comma-separated serviceTypes string (e.g. "Ramp,Baggage"),
 * returns the unique list of MilestoneTypes that should be created.
 * Falls back to an empty array (which the backend treats as "all 10").
 */
export function getMilestoneTypesForServices(serviceTypes: string): MilestoneType[] {
  const services = serviceTypes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const milestoneSet = new Set<MilestoneType>();
  for (const svc of services) {
    const milestones = SERVICE_TO_MILESTONES[svc] ?? [];
    for (const m of milestones) {
      milestoneSet.add(m);
    }
  }
  return Array.from(milestoneSet);
}
