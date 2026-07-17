import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { IconProgressCheck } from '@tabler/icons-react';
import { AsyncSection, PageHeader, StatusBadge } from '../../components/common';
import TurnaroundProgress from '../../components/turnaround/TurnaroundProgress';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTurnarounds } from '../../hooks/useTurnarounds';

export default function RampDashboardPage() {
  usePageTitle('Ramp Dashboard');
  const { turnarounds, loading, error, reload } = useTurnarounds(true);

  return (
    <>
      <PageHeader
        title="Ramp Dashboard"
        subtitle="Active turnarounds in progress"
      />
      <AsyncSection
        loading={loading}
        error={error}
        hasData={turnarounds.length > 0}
        isEmpty={turnarounds.length === 0}
        onRetry={reload}
        emptyTitle="No active turnarounds"
        emptyMessage="There are no active turnarounds right now."
      >
        <Row className="g-3">
          {turnarounds.map((t) => {
            const completed = t.milestones.filter(
              (m) => m.status === 'Completed',
            ).length;
            return (
              <Col md={6} key={t.planId}>
                <Card className="h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{t.flightNumber}</span>
                    <StatusBadge status={t.status} />
                  </Card.Header>
                  <Card.Body>
                    <TurnaroundProgress milestones={t.milestones} />
                    <div className="small text-muted mt-2">
                      {completed}/{t.milestones.length} milestones
                    </div>
                    <Link
                      to={`/ramp/milestones/${t.planId}`}
                      className="btn btn-outline-primary btn-sm mt-3 d-inline-flex align-items-center gap-1"
                    >
                      <IconProgressCheck size={16} />
                      Open checklist
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </AsyncSection>
    </>
  );
}
