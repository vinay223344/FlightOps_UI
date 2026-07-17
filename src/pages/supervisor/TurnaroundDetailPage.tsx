import { useCallback, useState } from 'react';
import { IconCircleCheck } from '@tabler/icons-react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { turnaroundsApi } from '../../api';
import {
  AsyncSection,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import MilestoneTimeline from '../../components/turnaround/MilestoneTimeline';
import { useToast } from '../../context/ToastContext';
import { useTurnaround } from '../../hooks';
import { useConfirm } from '../../hooks/useConfirm';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatMinutes, getErrorMessage } from '../../utils';

export default function TurnaroundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { turnaround, loading, error, reload } = useTurnaround(id);

  usePageTitle(
    turnaround ? `Turnaround · ${turnaround.flightNumber}` : 'Turnaround',
  );

  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const [busy, setBusy] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!id) return;
    const ok = await confirm({
      body: 'Mark this turnaround as complete?',
      confirmLabel: 'Complete',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await turnaroundsApi.complete(id);
      toast.success('Turnaround completed');
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [id, confirm, toast, reload]);

  return (
    <>
      <PageHeader
        title={
          turnaround
            ? `Turnaround · ${turnaround.flightNumber}`
            : 'Turnaround'
        }
        crumbs={[
          { label: 'Turnarounds', to: '/supervisor/turnarounds' },
          { label: turnaround?.flightNumber ?? '…' },
        ]}
        actions={
          turnaround && turnaround.status !== 'Completed' ? (
            <Button
              variant="success"
              disabled={busy}
              onClick={handleComplete}
            >
              <IconCircleCheck size={18} className="me-1" />
              Mark Complete
            </Button>
          ) : undefined
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={!!turnaround}
        onRetry={reload}
      >
        {turnaround ? (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <div className="text-muted small text-uppercase fw-semibold">
                      Stand
                    </div>
                    <div className="fw-semibold">{turnaround.stand ?? '—'}</div>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted small text-uppercase fw-semibold">
                      Target
                    </div>
                    <div className="fw-semibold">
                      {formatMinutes(turnaround.targetTurnaroundMinutes)}
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted small text-uppercase fw-semibold">
                      Actual
                    </div>
                    <div className="fw-semibold">
                      {turnaround.actualTurnaroundMinutes != null
                        ? formatMinutes(turnaround.actualTurnaroundMinutes)
                        : '—'}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-muted small text-uppercase fw-semibold">
                      Supervisor
                    </div>
                    <div className="fw-semibold">
                      {turnaround.supervisorName ?? '—'}
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted small text-uppercase fw-semibold">
                      Status
                    </div>
                    <div>
                      <StatusBadge status={turnaround.status} />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <h5 className="fw-bold mb-3">Milestones</h5>
            <Card className="shadow-sm">
              <Card.Body>
                <MilestoneTimeline milestones={turnaround.milestones} />
              </Card.Body>
            </Card>
          </>
        ) : (
          <ErrorState
            message="Turnaround not found."
            onRetry={reload}
          />
        )}
      </AsyncSection>

      <ConfirmDialog
        {...confirmState}
        onConfirm={onConfirm}
        onCancel={onCancel}
        busy={busy}
      />
    </>
  );
}
