import { Table } from 'react-bootstrap';
import {
  AsyncSection,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import { useDelayedMilestones } from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatTime, humanizeEnum } from '../../utils';

export default function DelayFlagsPage() {
  usePageTitle('Delay Flags');
  const { milestones, loading, error, reload } = useDelayedMilestones();

  return (
    <>
      <PageHeader
        title="Delay Flags"
        subtitle="Delayed milestones across active turnarounds"
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={milestones.length > 0}
        isEmpty={milestones.length === 0}
        onRetry={reload}
        emptyTitle="No delays"
        emptyMessage="No delays — all on track"
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Planned</th>
              <th>Actual</th>
              <th>Delay</th>
              <th>Completed By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => (
              <tr key={m.milestoneId}>
                <td className="fw-semibold">
                  {humanizeEnum(m.milestoneType)}
                </td>
                <td>{formatTime(m.plannedTime)}</td>
                <td>{formatTime(m.actualTime)}</td>
                <td className="text-warning fw-semibold">
                  {m.delayMinutes != null ? `+${m.delayMinutes} min` : '—'}
                </td>
                <td>{m.completedByName ?? '—'}</td>
                <td>
                  <StatusBadge status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>
    </>
  );
}
