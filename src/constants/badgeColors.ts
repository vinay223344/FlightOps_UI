/**
 * Maps every backend status/enum string to a color variant, rendered as a
 * soft-tone badge/select fill (see src/styles/components.css). Three of
 * these ('success-dark', 'orange', 'purple') aren't native Bootstrap theme
 * colors — react-bootstrap's `bg`/`text` props accept any string, and the
 * matching `.badge.bg-*` / `.fo-status-select-*` rules are hand-defined
 * alongside the standard variants so the whole app shares one status→color
 * system instead of being limited to Bootstrap's 8 defaults.
 */
export type BsVariant =
  | 'success'
  | 'success-dark'
  | 'lime'
  | 'danger'
  | 'warning'
  | 'pending'
  | 'delayed'
  | 'orange'
  | 'primary'
  | 'secondary'
  | 'purple'
  | 'info'
  | 'light'
  | 'dark';

/**
 * Central status → color table. Keys are the exact backend enum values.
 * Where the same string appears in multiple enums the intended meaning is
 * consistent, so a single table is safe. Buckets follow one app-wide
 * convention (see the design system doc): green = active/available, Lime
 * Green = completed, dark green = closed, blue = in-progress/active work,
 * light blue (info) = scheduled/future, orange = awaiting action,
 * Calamansi (warning) = Maintenance, its own gold (pending) = Pending, its
 * own amber (delayed) = Delayed, red = cancelled/rejected/failed, purple =
 * on hold, grey = neutral/not yet actioned.
 */
export const STATUS_VARIANT: Record<string, BsVariant> = {
  // green — active / available now
  Active: 'success',
  Available: 'success',
  Confirmed: 'success',
  Arrived: 'success',
  Open: 'success',
  Claimed: 'success',
  ReturnedToService: 'success',
  Assigned: 'success',

  // Lime Green — standardized "Completed" color app-wide, distinct from
  // Closed's dark green and from the regular "active" green above.
  Completed: 'lime',

  // dark green — finished/finalized (Closed), distinct from Completed's
  // Lime Green and from "currently active" green above.
  Closed: 'success-dark',

  // Maintenance — Calamansi (unchanged); Pending and Delayed each now have
  // their own standardized color, distinct from Maintenance and from each
  // other, per the final status color spec.
  Maintenance: 'warning',
  InMaintenance: 'warning',

  // Pending — #FFF3CD / #856404, its own dedicated color.
  Pending: 'pending',

  // Delayed — #FFC04D / #000000 (black text), its own dedicated color.
  Delayed: 'delayed',

  // red — cancelled / rejected / failed
  Cancelled: 'danger',
  OutOfService: 'danger',
  Disputed: 'danger',
  Discrepancy: 'danger',
  Reported: 'danger',
  Inactive: 'danger',
  Skipped: 'danger',

  // blue — active in-progress work
  InProgress: 'primary',
  Allocated: 'primary',
  Boarding: 'primary',
  OnShift: 'primary',

  // orange — awaiting action (distinct from the Delayed/Pending/Maintenance
  // light-yellow bucket above)
  Received: 'orange',
  Requested: 'orange',

  // purple — on hold
  Standby: 'purple',

  // grey — neutral, not-yet-actioned / not a meaningful outcome either way
  Departed: 'secondary',
  Released: 'secondary',
  ClosedUnresolved: 'secondary',
  Dismissed: 'secondary',
  Read: 'secondary',

  // light blue (info) — scheduled / future, and other in-flight lookups
  Scheduled: 'info',
  Diverted: 'info',
  HoldRoom: 'info',
  Traced: 'info',
  Recovered: 'info',
  Extended: 'info',
  Unread: 'info',
};

/** Variants that need dark text for contrast on their light background.
 *  'lime' (Completed) is intentionally excluded — it always uses white text. */
export const DARK_TEXT_VARIANTS: BsVariant[] = [
  'warning',
  'pending',
  'delayed',
  'orange',
  'info',
  'light',
];
