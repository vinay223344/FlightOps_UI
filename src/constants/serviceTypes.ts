/** Ground-handling services a coordinator can request (checkbox options).
 * These MUST match the keys in SERVICE_TO_MILESTONES exactly.
 */
export const HANDLING_SERVICE_OPTIONS: string[] = [
  'Ramp',
  'Baggage',
  'Cleaning',
  'Catering',
  'Fuelling',
];

/** Common target turnaround presets (minutes) for the plan form. */
export const TURNAROUND_PRESETS: number[] = [45, 60, 75, 90, 120];
