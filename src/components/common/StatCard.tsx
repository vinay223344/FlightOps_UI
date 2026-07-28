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
          <div className="fo-stat-label text-muted text-uppercase fw-semibold">
            {label}
          </div>
          <div className="fo-stat-value fw-bold lh-1 mt-1">{value}</div>
          {hint && <div className="fo-stat-hint text-muted mt-1">{hint}</div>}
        </div>
        {IconCmp && (
          <div className={`text-${accent} opacity-75`}>
            <IconCmp size={44} stroke={1.5} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
