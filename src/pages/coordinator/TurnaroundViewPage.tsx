import { useState } from 'react';
import { Accordion, Badge, ProgressBar } from 'react-bootstrap';
import { PageHeader, AsyncSection, StatusBadge } from '../../components/common';
import { useTurnarounds, usePageTitle } from '../../hooks';
import { formatDateTime, formatMinutes } from '../../utils';

export default function TurnaroundViewPage() {
  usePageTitle('Turnaround View');

  const { turnarounds, loading, error, reload } = useTurnarounds();
  // Bug 5: No item open by default
  const [activeKey, setActiveKey] = useState<string | null>(null);

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
        {/* Bug 5: Accordion instead of flat card grid */}
        <Accordion
          flush
          activeKey={activeKey ?? undefined}
          onSelect={(k) => setActiveKey(k as string | null)}
        >
          {turnarounds.map((plan) => {
            const completed = plan.milestones.filter(
              (m) => m.status === 'Completed',
            ).length;
            const total = plan.milestones.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Accordion.Item eventKey={plan.planId} key={plan.planId}>
                <Accordion.Header>
                  <span className="fw-semibold me-2">{plan.flightNumber}</span>
                  {plan.stand && (
                    <span className="text-muted me-2 small">· Stand {plan.stand}</span>
                  )}
                  <StatusBadge status={plan.status} />
                  <span className="ms-auto me-2 small text-muted">
                    Target {formatMinutes(plan.targetTurnaroundMinutes)}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Milestone progress</span>
                      <span>{completed}/{total} completed</span>
                    </div>
                    <ProgressBar now={pct} label={`${pct}%`} />
                  </div>

                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Milestone</th>
                        <th>Planned</th>
                        <th>Actual</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.milestones.map((m) => (
                        <tr key={m.milestoneId}>
                          <td className="fw-semibold">{m.milestoneType}</td>
                          <td className="small text-muted">
                            {formatDateTime(m.plannedTime)}
                          </td>
                          <td className="small">
                            {m.actualTime ? (
                              <span className={m.delayed || m.isDelayed ? 'text-danger' : ''}>
                                {formatDateTime(m.actualTime)}
                                {(m.delayed || m.isDelayed) && m.delayMinutes != null && (
                                  <Badge bg="danger" className="ms-1 fw-normal">
                                    +{m.delayMinutes}m
                                  </Badge>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={m.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </AsyncSection>
    </>
  );
}
