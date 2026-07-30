import { useCallback, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { useToast } from '../../context/ToastContext';
import {
  useAllocations,
  useAvailableEquipment,
  useConfirm,
  useFlights,
} from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { allocationsApi } from '../../api/gseApi';
import {
  formatDateTime,
  fromDateTimeLocalInput,
  getErrorMessage,
  humanizeEnum,
  nowForInput,
} from '../../utils';
import type { EquipmentAllocationRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function AllocationsPage() {
  usePageTitle('Allocations');
  const toast = useToast();

  const {user} = useAuth();

  const {
    allocations,
    loading,
    error,
    reload: reloadAllocations,
  } = useAllocations();
  const { equipment: available, reload: reloadAvailable } =
    useAvailableEquipment();
  const { flights } = useFlights(undefined, false);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [validated, setValidated] = useState(false);

  const [equipmentId, setEquipmentId] = useState('');
  const [flightId, setFlightId] = useState('');
  const [allocationTime, setAllocationTime] = useState(nowForInput());
  const [releaseTime, setReleaseTime] = useState('');

  const openModal = useCallback(() => {
    setEquipmentId('');
    setFlightId('');
    setAllocationTime(nowForInput());
    setReleaseTime('');
    setValidated(false);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setShowModal(false);
  }, [submitting]);

  const handleRelease = useCallback(
    async (id: string) => {
      const ok = await confirm({
        body: 'Release this equipment allocation?',
        variant: 'danger',
        confirmLabel: 'Release',
      });
      if (!ok) return;
      setBusy(true);
      try {
        await allocationsApi.release(id);
        toast.success('Allocation released');
        await Promise.all([reloadAllocations(), reloadAvailable()]);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [confirm, toast, reloadAllocations, reloadAvailable],
  );

  const handleSubmit = useCallback(async () => {
    setValidated(true);
    if (!equipmentId || !flightId || !allocationTime) return;
    const payload: EquipmentAllocationRequest = {
      equipmentId,
      flightId,
      allocationTime: fromDateTimeLocalInput(allocationTime),
      releaseTime: releaseTime
        ? fromDateTimeLocalInput(releaseTime)
        : undefined,
    };
    setSubmitting(true);
    try {
      await allocationsApi.create(payload);
      toast.success('Allocation created');
      setShowModal(false);
      await Promise.all([reloadAllocations(), reloadAvailable()]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    equipmentId,
    flightId,
    allocationTime,
    releaseTime,
    toast,
    reloadAllocations,
    reloadAvailable,
  ]);

  return (
    <>
      <PageHeader
        title="Allocations"
        subtitle="Assign ground support equipment to flights"
        actions={
          <Button
            variant="primary"
            onClick={openModal}
            className="d-flex align-items-center gap-1"
          >
            <IconPlus size={18} /> New Allocation
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={allocations.length > 0}
        isEmpty={allocations.length === 0}
        onRetry={reloadAllocations}
        emptyTitle="No allocations"
        emptyMessage="There are no active equipment allocations."
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Flight</th>
              <th>Allocated By</th>
              <th>Allocated</th>
              <th>Release</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody >
            {allocations.map((a) => (
              <tr key={a.allocationId}>
                <td>
                  <div className="fw-semibold">{a.registrationNumber}</div>
                  <div className="text-muted small">
                    {humanizeEnum(a.equipmentType)}
                  </div>
                </td>
                <td>{a.flightNumber}</td>
                <td>{a.allocatedByName}</td>
                <td>{formatDateTime(a.allocationTime)}</td>
                <td>
                  {a.releaseTime ? formatDateTime(a.releaseTime) : '—'}
                </td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td className="text-end">
                  {/* Check status AND verify user ID matches allocatedById */}
                  {a.status !== 'Released' && user?.userId === a.allocatedById && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleRelease(a.allocationId)}
                      disabled={busy}
                    >
                      Release
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">New Allocation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="allocEquipment">
            <Form.Label>Equipment</Form.Label>
            <Form.Select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              isInvalid={validated && !equipmentId}
            >
              <option value="">Select equipment…</option>
              {available.map((e) => (
                <option key={e.equipmentId} value={e.equipmentId}>
                  {e.registrationNumber} · {humanizeEnum(e.type)}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select equipment.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="allocFlight">
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

          <Form.Group className="mb-3" controlId="allocTime">
            <Form.Label>Allocation time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={allocationTime}
              onChange={(e) => setAllocationTime(e.target.value)}
              isInvalid={validated && !allocationTime}
            />
            <Form.Control.Feedback type="invalid">
              Allocation time is required.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-1" controlId="releaseTime">
            <Form.Label>Release time (optional)</Form.Label>
            <Form.Control
              type="datetime-local"
              value={releaseTime}
              onChange={(e) => setReleaseTime(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Allocate'}
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
