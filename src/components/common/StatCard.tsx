import type { Icon } from '@tabler/icons-react';
import { Card } from 'react-bootstrap';
import type { BsVariant } from '../../constants/badgeColors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: Icon;
  accent?: BsVariant;
  hint?: string;
}

/** Dashboard KPI card with a coloured left border accent. */
export default function StatCard({
  label,
  value,
  icon: IconCmp,
  accent = 'primary',
  hint,
}: StatCardProps) {
  return (
    <Card className={`fo-stat-card fo-stat-${accent} h-100 shadow-sm`}>
      <Card.Body className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted text-uppercase small fw-semibold">
            {label}
          </div>
          <div className="fs-3 fw-bold lh-1 mt-1">{value}</div>
          {hint && <div className="text-muted small mt-1">{hint}</div>}
        </div>
        {IconCmp && (
          <div className={`text-${accent} opacity-75`}>
            <IconCmp size={40} stroke={1.5} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
