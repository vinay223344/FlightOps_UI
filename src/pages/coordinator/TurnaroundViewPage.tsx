import { Card, Col, Row } from 'react-bootstrap';
import { PageHeader, AsyncSection, StatusBadge } from '../../components/common';
import TurnaroundProgress from '../../components/turnaround/TurnaroundProgress';
import MilestoneTimeline from '../../components/turnaround/MilestoneTimeline';
import { useTurnarounds, usePageTitle } from '../../hooks';
import { formatMinutes } from '../../utils';

export default function TurnaroundViewPage() {
  usePageTitle('Turnaround View');

  const { turnarounds, loading, error, reload } = useTurnarounds();

  return (
    <>
      <PageHeader
        title="Turnaround View"
        subtitle="Live milestone progress (read-only)"
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={turnarounds.length > 0}
        isEmpty={turnarounds.length === 0}
        onRetry={reload}
        emptyTitle="No active turnarounds"
        emptyMessage="There are no turnaround plans to display."
      >
        <Row className="g-3">
          {turnarounds.map((plan) => (
            <Col md={6} key={plan.planId}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <span className="fw-semibold">
                    {plan.flightNumber} <StatusBadge status={plan.status} />
                  </span>
                  <span className="small text-muted">
                    Target {formatMinutes(plan.targetTurnaroundMinutes)} · Actual{' '}
                    {formatMinutes(plan.actualTurnaroundMinutes)}
                  </span>
                </Card.Header>
                <Card.Body>
                  <TurnaroundProgress milestones={plan.milestones} />
                  <div className="mt-3">
                    <MilestoneTimeline milestones={plan.milestones} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </AsyncSection>
    </>
  );
}
