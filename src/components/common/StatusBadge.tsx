import { Badge } from 'react-bootstrap';
import { getStatusVariant, needsDarkText } from '../../utils/statusColorUtils';
import { humanizeEnum } from '../../utils/formatUtils';

interface StatusBadgeProps {
  status: string | null | undefined;
  /** Optional override label (defaults to a humanised status). */
  label?: string;
  className?: string;
}

/** Bootstrap badge coloured by the backend status value. */
export default function StatusBadge({
  status,
  label,
  className,
}: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  const text = needsDarkText(variant) ? 'dark' : undefined;
  return (
    <Badge bg={variant} text={text} className={className}>
      {label ?? humanizeEnum(status)}
    </Badge>
  );
}
