/** Presentation helpers for labels, numbers and enum text. */
import type { TurnaroundMilestoneResponse } from '../types';

/** Insert spaces before capitals: "BaggageOffload" → "Baggage Offload". */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

/** Percentage with one decimal, e.g. 92.5 → "92.5%". */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(1)}%`;
}

/** Round-ish number with graceful null handling. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value} min`;
}

/** Split a comma-separated service list into trimmed tokens. */
export function splitServiceTypes(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Join selected services back into the comma-separated backend format. */
export function joinServiceTypes(values: string[]): string {
  return values.map((s) => s.trim()).filter(Boolean).join(',');
}

/** Backend serialises the boolean as `delayed`; keep `isDelayed` as fallback. */
export function isMilestoneDelayed(
  milestone: Pick<TurnaroundMilestoneResponse, 'status'>,
): boolean {
  return (
    milestone.status === 'Delayed'
  );
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

/** Compute a clamped percentage for progress bars. */
export function toPercent(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}
