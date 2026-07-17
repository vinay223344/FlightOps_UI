import {
  IconAlertTriangle,
  IconClock,
  IconProgressCheck,
} from '@tabler/icons-react';
import { Alert, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  AsyncSection,
  PageHeader,
  StatCard,
  StatusBadge,
} from '../../components/common';
import TurnaroundProgress from '../../components/turnaround/TurnaroundProgress';
import { useDashboardMetrics, useTurnarounds } from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatMinutes, isMilestoneDelayed } from '../../utils';

export default function SupervisorDashboardPage() {
  usePageTitle('Supervisor Dashboard');

  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const {
    turnarounds,
    loading: turnaroundsLoading,
    error: turnaroundsError,
    reload,
  } = useTurnarounds(true);

  const breachCount = turnarounds.filter(
    (t) =>
      t.status === 'Delayed' ||
      t.milestones.some((m) => isMilestoneDelayed(m)),
  ).length;

  return (
    <>
      <PageHeader title="Supervisor Dashboard" />

      {breachCount > 0 && (
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <IconAlertTriangle size={20} />
          <span>
            {breachCount} turnaround(s) breaching SLA
          </span>
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col md={3}>
          <StatCard
            label="On-time"
            value={metricsLoading ? '—' : metrics?.onTimeTurnarounds ?? 0}
            icon={IconProgressCheck}
            accent="success"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="Delayed"
            value={metricsLoading ? '—' : metrics?.delayedTurnarounds ?? 0}
            icon={IconAlertTriangle}
            accent="warning"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="SLA Breaches"
            value={metricsLoading ? '—' : metrics?.slaBreachCount ?? 0}
            icon={IconAlertTriangle}
            accent="danger"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="Avg Turnaround"
            value={
              metricsLoading
                ? '—'
                : formatMinutes(metrics?.avgTurnaroundMinutes)
            }
            icon={IconClock}
            accent="info"
          />
        </Col>
      </Row>

      <h5 className="fw-bold mb-3">Active Turnarounds</h5>
      <AsyncSection
        loading={turnaroundsLoading}
        error={turnaroundsError}
        hasData={turnarounds.length > 0}
        isEmpty={turnarounds.length === 0}
        onRetry={reload}
        emptyTitle="No active turnarounds"
        emptyMessage="There are no active turnarounds right now."
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Stand</th>
              <th>Target</th>
              <th style={{ minWidth: 180 }}>Progress</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {turnarounds.map((t) => (
              <tr key={t.planId}>
                <td className="fw-semibold">{t.flightNumber}</td>
                <td>{t.stand ?? '—'}</td>
                <td>{formatMinutes(t.targetTurnaroundMinutes)}</td>
                <td>
                  <TurnaroundProgress milestones={t.milestones} />
                </td>
                <td>
                  <StatusBadge status={t.status} />
                </td>
                <td className="text-end">
                  <Link to={`/supervisor/turnarounds/${t.planId}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>
    </>
  );
}
