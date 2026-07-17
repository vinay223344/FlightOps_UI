import { ProgressBar } from 'react-bootstrap';
import type { TurnaroundMilestoneResponse } from '../../types';
import { isMilestoneDelayed } from '../../utils/formatUtils';

interface TurnaroundProgressProps {
  milestones: TurnaroundMilestoneResponse[];
  showLabel?: boolean;
}

/** Progress bar summarising completed / delayed milestones for a plan. */
export default function TurnaroundProgress({
  milestones,
  showLabel = true,
}: TurnaroundProgressProps) {
  const total = milestones.length || 1;
  const completed = milestones.filter(
    (m) => m.status === 'Completed',
  ).length;
  const delayed = milestones.filter((m) => isMilestoneDelayed(m)).length;

  const completedPct = Math.round((completed / total) * 100);
  const delayedPct = Math.round((delayed / total) * 100);

  return (
    <div>
      <ProgressBar style={{ height: '0.9rem' }}>
        <ProgressBar variant="success" now={completedPct} key="done" />
        <ProgressBar variant="warning" now={delayedPct} key="late" />
      </ProgressBar>
      {showLabel && (
        <div className="d-flex justify-content-between small text-muted mt-1">
          <span>
            {completed}/{milestones.length} complete
          </span>
          {delayed > 0 && (
            <span className="text-warning fw-semibold">{delayed} delayed</span>
          )}
        </div>
      )}
    </div>
  );
}
