import {
  DARK_TEXT_VARIANTS,
  STATUS_VARIANT,
  type BsVariant,
} from '../constants/badgeColors';

/** Resolve a Bootstrap badge variant for any status string. */
export function getStatusVariant(status: string | null | undefined): BsVariant {
  if (!status) return 'secondary';
  return STATUS_VARIANT[status] ?? 'secondary';
}

/** Whether the given variant needs `text-dark` for readable contrast. */
export function needsDarkText(variant: BsVariant): boolean {
  return DARK_TEXT_VARIANTS.includes(variant);
}
