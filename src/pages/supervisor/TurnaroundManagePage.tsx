import { useCallback, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { turnaroundsApi } from '../../api';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { TURNAROUND_PRESETS } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFlights, useTurnarounds } from '../../hooks';
import { useConfirm } from '../../hooks/useConfirm';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatMinutes, getErrorMessage } from '../../utils';

export default function TurnaroundManagePage() {
  usePageTitle('Turnaround Plans');
  const toast = useToast();
  const { turnarounds, loading, error, reload } = useTurnarounds();
  const { flights } = useFlights(undefined, false);

  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const [busy, setBusy] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [flightId, setFlightId] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);

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

  const handleCreate = useCallback(async () => {
    setValidated(true);
    if (!flightId || !target || target <= 0) return;
    setSubmitting(true);
    try {
      await turnaroundsApi.create({
        flightId,
        targetTurnaroundMinutes: target,
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

      <AsyncSection
        loading={loading}
        error={error}
        hasData={turnarounds.length > 0}
        isEmpty={turnarounds.length === 0}
        onRetry={reload}
        emptyTitle="No turnaround plans"
        emptyMessage="Create a plan to start tracking a turnaround."
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Stand</th>
              <th>Target</th>
              <th>Actual</th>
              <th>Supervisor</th>
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
                  {t.actualTurnaroundMinutes != null
                    ? formatMinutes(t.actualTurnaroundMinutes)
                    : '—'}
                </td>
                <td>{t.supervisorName ?? '—'}</td>
                <td>
                  <StatusBadge status={t.status} />
                </td>
                <td className="text-end">
                  <div className="d-flex gap-2 justify-content-end align-items-center">
                    <Link to={`/supervisor/turnarounds/${t.planId}`}>View</Link>
                    {t.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        disabled={busy}
                        onClick={() => handleComplete(t.planId)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
            <Form.Control
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
            </Form.Control.Feedback>
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
