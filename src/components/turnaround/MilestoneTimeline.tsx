import {
  IconCircle,
  IconCircleCheck,
  IconClockExclamation,
  IconCircleMinus,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type {
  MilestoneStatus,
  TurnaroundMilestoneResponse,
} from '../../types';
import { MILESTONE_ORDER } from '../../constants/slaSchedule';
import { formatTime } from '../../utils/dateUtils';
import { humanizeEnum, isMilestoneDelayed } from '../../utils/formatUtils';
import StatusBadge from '../common/StatusBadge';

interface MilestoneTimelineProps {
  milestones: TurnaroundMilestoneResponse[];
  /** Optional per-milestone action (e.g. "Log completion" button). */
  renderAction?: (m: TurnaroundMilestoneResponse) => ReactNode;
}

function statusIcon(status: MilestoneStatus, delayed: boolean) {
  if (status === 'Completed' && !delayed)
    return <IconCircleCheck size={22} className="text-success" />;
  if (status === 'Completed' && delayed)
    return <IconClockExclamation size={22} className="text-warning" />;
  if (status === 'Delayed')
    return <IconClockExclamation size={22} className="text-warning" />;
  if (status === 'Skipped')
    return <IconCircleMinus size={22} className="text-secondary" />;
  return <IconCircle size={22} className="text-muted" />;
}

/** Vertical checklist of the 10 turnaround milestones. */
export default function MilestoneTimeline({
  milestones,
  renderAction,
}: MilestoneTimelineProps) {
  const sorted = [...milestones].sort(
    (a, b) =>
      (MILESTONE_ORDER[a.milestoneType] ?? 0) -
      (MILESTONE_ORDER[b.milestoneType] ?? 0),
  );

  return (
    <ul className="list-group list-group-flush">
      {sorted.map((m) => {
        const delayed = isMilestoneDelayed(m);
        return (
          <li
            key={m.milestoneId}
            className="list-group-item d-flex align-items-center gap-3 px-0"
          >
            <span className="flex-shrink-0">
              {statusIcon(m.status, delayed)}
            </span>
            <div className="flex-grow-1">
              <div className="fw-semibold">
                {humanizeEnum(m.milestoneType)}
              </div>
              <div className="small text-muted">
                Planned {formatTime(m.plannedTime)}
                {m.actualTime && <> · Actual {formatTime(m.actualTime)}</>}
                {delayed && m.delayMinutes != null && (
                  <span className="text-warning fw-semibold">
                    {' '}
                    · +{m.delayMinutes} min late
                  </span>
                )}
                {m.completedByName && <> · by {m.completedByName}</>}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <StatusBadge status={m.status} />
              {renderAction?.(m)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
