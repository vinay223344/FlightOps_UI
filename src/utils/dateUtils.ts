/** Date/time formatting helpers built on date-fns. Never render raw ISO. */
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

/** "15 Jul 2026, 09:30" */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'dd MMM yyyy, HH:mm') : '—';
}

/** "09:30" */
export function formatTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'HH:mm') : '—';
}

/** "15 Jul 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'dd MMM yyyy') : '—';
}

/** "3 minutes ago" */
export function formatRelative(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—';
}

/** ISO string suitable for a datetime-local input value (no seconds/zone). */
export function toDateTimeLocalInput(
  value: string | Date | null | undefined,
): string {
  const d = toDate(value);
  return d ? format(d, "yyyy-MM-dd'T'HH:mm") : '';
}

/** Convert a datetime-local input value into a LocalDateTime string. */
export function fromDateTimeLocalInput(value: string): string {
  // datetime-local already yields "yyyy-MM-ddTHH:mm"; append seconds for LDT.
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

/** Current time as a datetime-local input value. */
export function nowForInput(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

/** Current date as "yyyy-MM-dd" (for LocalDate fields / date inputs). */
export function todayForInput(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
