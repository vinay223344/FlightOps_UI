import { useCallback, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader, AsyncSection } from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useGates, useFlights, usePageTitle } from '../../hooks';
import { gatesApi } from '../../api/passengerApi';
import { GATE_STATUSES } from '../../types';
import type { BoardingGateRequest, GateStatus } from '../../types';
import {
  formatTime,
  fromDateTimeLocalInput,
  getErrorMessage,
  humanizeEnum,
  nowForInput,
} from '../../utils';

interface CreateForm {
  gateNumber: string;
  terminal: string;
  flightId: string;
  openTime: string;
  closeTime: string;
}

const emptyForm = (): CreateForm => ({
  gateNumber: '',
  terminal: '',
  flightId: '',
  openTime: nowForInput(),
  closeTime: '',
});

export default function BoardingGatesPage() {
  usePageTitle('Boarding Gates');
  const toast = useToast();
  const { user } = useAuth();
  const { gates, loading, error, reload } = useGates();
  const { flights } = useFlights(undefined, false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const openCreate = useCallback(() => {
    setForm(emptyForm());
    setValidated(false);
    setShowCreate(true);
  }, []);

  const closeCreate = useCallback(() => {
    if (submitting) return;
    setShowCreate(false);
  }, [submitting]);

  const handleCreate = useCallback(async () => {
    if (
      !form.gateNumber.trim() ||
      !form.terminal.trim() ||
      !form.flightId ||
      !form.openTime
    ) {
      setValidated(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload: BoardingGateRequest = {
        gateNumber: form.gateNumber.trim(),
        terminal: form.terminal.trim(),
        flightId: form.flightId,
        openTime: fromDateTimeLocalInput(form.openTime),
        ...(user?.userId ? { assignedAgentId: user.userId } : {}),
        ...(form.closeTime
          ? { closeTime: fromDateTimeLocalInput(form.closeTime) }
          : {}),
      };
      await gatesApi.create(payload);
      toast.success('Gate opened');
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [form, user, toast, reload]);

  const handleStatusChange = useCallback(
    async (id: string, status: GateStatus) => {
      setStatusBusy(true);
      try {
        await gatesApi.updateStatus(id, status);
        toast.success('Gate status updated');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setStatusBusy(false);
      }
    },
    [toast, reload],
  );

  return (
    <>
      <PageHeader
        title="Boarding Gates"
        subtitle="Open and manage boarding gates"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus size={18} className="me-1" />
            Open Gate
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={gates.length > 0}
        isEmpty={gates.length === 0}
        onRetry={reload}
        emptyTitle="No gates"
        emptyMessage="No boarding gates have been opened yet."
      >
        <Table hover responsive className="table-sm align-middle">
          <thead>
            <tr>
              <th>Gate #</th>
              <th>Terminal</th>
              <th>Flight</th>
              <th>Agent</th>
              <th>Open</th>
              <th>Close</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((g) => (
              <tr key={g.gateId}>
                <td className="fw-semibold">{g.gateNumber}</td>
                <td>{g.terminal}</td>
                <td>{g.flightNumber}</td>
                <td>{g.assignedAgentName ?? '—'}</td>
                <td>{formatTime(g.openTime)}</td>
                <td>{g.closeTime ? formatTime(g.closeTime) : '—'}</td>
                <td>
                  <Form.Select
                    size="sm"
                    value={g.status}
                    disabled={statusBusy}
                    onChange={(e) =>
                      handleStatusChange(g.gateId, e.target.value as GateStatus)
                    }
                  >
                    {GATE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {humanizeEnum(s)}
                      </option>
                    ))}
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <Modal show={showCreate} onHide={closeCreate} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">Open Gate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Gate Number</Form.Label>
              <Form.Control
                value={form.gateNumber}
                onChange={(e) =>
                  setForm({ ...form, gateNumber: e.target.value })
                }
                isInvalid={validated && !form.gateNumber.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Gate number is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Terminal</Form.Label>
              <Form.Control
                value={form.terminal}
                onChange={(e) => setForm({ ...form, terminal: e.target.value })}
                isInvalid={validated && !form.terminal.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Terminal is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Flight</Form.Label>
              <FlightSelect
                flights={flights}
                value={form.flightId}
                onChange={(id) => setForm({ ...form, flightId: id })}
                isInvalid={validated && !form.flightId}
              />
              <Form.Control.Feedback type="invalid">
                Flight is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Open Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={form.openTime}
                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                isInvalid={validated && !form.openTime}
              />
              <Form.Control.Feedback type="invalid">
                Open time is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Close Time (optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={form.closeTime}
                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeCreate} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Opening…' : 'Open Gate'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
