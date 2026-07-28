import { useCallback, useMemo, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Accordion, Badge, Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { turnaroundsApi, handlingRequestsApi } from '../../api';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { TURNAROUND_PRESETS } from '../../constants';
import { getMilestoneTypesForServices } from '../../constants/milestoneServiceMap';
import { useToast } from '../../context/ToastContext';
import { useFlights, useTurnarounds } from '../../hooks';
import { useConfirm } from '../../hooks/useConfirm';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  formatDateTime,
  formatMinutes,
  getErrorMessage,
} from '../../utils';
import type { MilestoneType } from '../../types';

export default function TurnaroundManagePage() {
  usePageTitle('Turnaround Plans');
  const toast = useToast();
  const { turnarounds, loading, error, reload } = useTurnarounds();
  const { flights } = useFlights(undefined, false);

  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const [busy, setBusy] = useState(false);

  // Bug 5: Accordion open state – default to first plan
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [flightId, setFlightId] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);

  // Filter turnarounds by status
  const activePlans = useMemo(
    () => turnarounds.filter((t) => t.status !== 'Completed'),
    [turnarounds],
  );

  const completedPlans = useMemo(
    () => turnarounds.filter((t) => t.status === 'Completed'),
    [turnarounds],
  );

  const resetForm = useCallback(() => {
    setFlightId('');
    setTarget('');
    setValidated(false);
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleComplete = useCallback(
    async (id: string) => {
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
    },
    [confirm, toast, reload],
  );

  // Bug 1: Look up handling request for the selected flight, derive milestone types
  const handleCreate = useCallback(async () => {
    setValidated(true);
    if (!flightId || !target || target <= 0) return;
    setSubmitting(true);
    try {
      // Fetch handling requests for this flight to derive milestoneTypes
      let milestoneTypes: MilestoneType[] = [];
      try {
        const flightRequests = await handlingRequestsApi.listByFlight(flightId);
        const confirmedRequest = flightRequests.find(
          (r) => r.status === 'Confirmed',
        );
        if (confirmedRequest) {
          milestoneTypes = getMilestoneTypesForServices(confirmedRequest.serviceTypes);
        }
      } catch {
        // If no handling request found, milestoneTypes stays empty (backend falls back to all 10)
      }

      await turnaroundsApi.create({
        flightId,
        targetTurnaroundMinutes: target,
        ...(milestoneTypes.length > 0 ? { milestoneTypes } : {}),
      });
      toast.success('Turnaround plan created');
      await reload();
      setShowModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [flightId, target, toast, reload]);

  return (
    <>
      <PageHeader
        title="Turnaround Plans"
        actions={
          <Button variant="primary" onClick={openModal}>
            <IconPlus size={18} className="me-1" />
            New Plan
          </Button>
        }
      />

      {/* Active Section */}
      <h5 className="fw-bold mb-3">Active Turnarounds</h5>
      <AsyncSection
        loading={loading}
        error={error}
        hasData={turnarounds.length > 0}
        isEmpty={activePlans.length === 0}
        onRetry={reload}
        emptyTitle="No active turnarounds"
        emptyMessage="There are currently no active turnaround plans."
      >
        <Accordion
          flush
          activeKey={activeKey ?? undefined}
          onSelect={(k) => setActiveKey(k as string | null)}
          className="fo-accordion mb-4"
        >
          {activePlans.map((t) => {
            const completed = t.milestones.filter(
              (m) => m.status === 'Completed',
            ).length;
            const total = t.milestones.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Accordion.Item eventKey={t.planId} key={t.planId}>
                <Accordion.Header>
                  <span className="fw-semibold me-2">{t.flightNumber}</span>
                  {t.stand && (
                    <span className="text-muted me-2 small">· Stand {t.stand}</span>
                  )}
                  <StatusBadge status={t.status} />
                  <span className="ms-3 small text-muted">
                    Target {formatMinutes(t.targetTurnaroundMinutes)}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Milestone progress</span>
                      <span>{completed}/{total} completed</span>
                    </div>
                    <ProgressBar now={pct} label={`${pct}%`} className="mb-3" />
                  </div>

                  <table className="table table-sm align-middle mb-3">
                    <thead className="table-light">
                      <tr>
                        <th>Milestone</th>
                        <th>Planned</th>
                        <th>Actual</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.milestones.map((m) => (
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

                  <div className="d-flex gap-2 align-items-center">
                    <Link
                      to={`/supervisor/turnarounds/${t.planId}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Detail
                    </Link>
                    {t.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        disabled={busy}
                        onClick={() => handleComplete(t.planId)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </AsyncSection>

      {/* Completed Section */}
      <h5 className="fw-bold mb-3">Completed Turnarounds</h5>
      <AsyncSection
        loading={loading}
        error={error}
        hasData={turnarounds.length > 0}
        isEmpty={completedPlans.length === 0}
        onRetry={reload}
        emptyTitle="No completed turnarounds"
        emptyMessage="No turnaround plans have been completed yet."
      >
        <Accordion
          flush
          className="fo-accordion"
          activeKey={activeKey ?? undefined}
          onSelect={(k) => setActiveKey(k as string | null)}
        >
          {completedPlans.map((t) => {
            const completed = t.milestones.filter(
              (m) => m.status === 'Completed',
            ).length;
            const total = t.milestones.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Accordion.Item eventKey={t.planId} key={t.planId}>
                <Accordion.Header>
                  <span className="fw-semibold me-2">{t.flightNumber}</span>
                  {t.stand && (
                    <span className="text-muted me-2 small">· Stand {t.stand}</span>
                  )}
                  <StatusBadge status={t.status} />
                  <span className="ms-3 small text-muted">
                    Target {formatMinutes(t.targetTurnaroundMinutes)}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Milestone progress</span>
                      <span>{completed}/{total} completed</span>
                    </div>
                    <ProgressBar now={pct} label={`${pct}%`} className="mb-3" />
                  </div>

                  <table className="table table-sm align-middle mb-3">
                    <thead className="table-light">
                      <tr>
                        <th>Milestone</th>
                        <th>Planned</th>
                        <th>Actual</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.milestones.map((m) => (
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

                  <div className="d-flex gap-2 align-items-center">
                    <Link
                      to={`/supervisor/turnarounds/${t.planId}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Detail
                    </Link>
                    {t.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        disabled={busy}
                        onClick={() => handleComplete(t.planId)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </AsyncSection>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">New Turnaround Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Flight</Form.Label>
            <FlightSelect
              flights={flights}
              value={flightId}
              onChange={setFlightId}
              isInvalid={validated && !flightId}
            />
            {validated && !flightId && (
              <div className="text-danger small mt-1">
                Please select a flight.
              </div>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>Target turnaround (minutes)</Form.Label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {TURNAROUND_PRESETS.map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={target === p ? 'primary' : 'outline-secondary'}
                  onClick={() => setTarget(p)}
                >
                  {p} min
                </Button>
              ))}
            </div>
            {/* <Form.Control
              type="number"
              min={1}
              value={target}
              onChange={(e) =>
                setTarget(e.target.value === '' ? '' : Number(e.target.value))
              }
              isInvalid={validated && (!target || target <= 0)}
            />
            <Form.Control.Feedback type="invalid">
              Enter a positive number of minutes.
            </Form.Control.Feedback> */}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Plan'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        {...confirmState}
        onConfirm={onConfirm}
        onCancel={onCancel}
        busy={busy}
      />
    </>
  );
}