/**
 * Maps every backend status/enum string to a Bootstrap badge variant.
 * `text-dark` variants (warning, info) are handled by the Badge component.
 */
export type BsVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'light'
  | 'dark';

/**
 * Central status → variant table. Keys are the exact backend enum values.
 * Where the same string appears in multiple enums the intended meaning is
 * consistent, so a single table is safe.
 */
export const STATUS_VARIANT: Record<string, BsVariant> = {
  // success (green)
  Active: 'success',
  Available: 'success',
  Confirmed: 'success',
  Arrived: 'success',
  Completed: 'success',
  Open: 'success',
  Claimed: 'success',
  ReturnedToService: 'success',
  Assigned: 'success',

  // warning (amber)
  Delayed: 'warning',
  Maintenance: 'warning',
  Received: 'warning',
  Standby: 'warning',
  InProgress: 'warning',
  InMaintenance: 'warning',
  Requested: 'warning',
  Pending: 'warning',

  // danger (red)
  Cancelled: 'danger',
  OutOfService: 'danger',
  Disputed: 'danger',
  Discrepancy: 'danger',
  Reported: 'danger',
  Inactive: 'danger',
  Skipped: 'danger',

  // primary (blue)
  Scheduled: 'primary',
  Allocated: 'primary',
  Boarding: 'primary',
  OnShift: 'primary',

  // secondary (grey)
  Departed: 'secondary',
  Closed: 'secondary',
  Released: 'secondary',
  ClosedUnresolved: 'secondary',
  Dismissed: 'secondary',

  // info (cyan)
  Diverted: 'info',
  HoldRoom: 'info',
  Traced: 'info',
  Recovered: 'info',
  Extended: 'info',
  Unread: 'info',
  Read: 'secondary',
};

/** Variants that need dark text for contrast on their light background. */
export const DARK_TEXT_VARIANTS: BsVariant[] = ['warning', 'info', 'light'];
