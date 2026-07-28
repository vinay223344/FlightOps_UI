import { useCallback, useState } from 'react';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader, AsyncSection } from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useCounters, useFlights, usePageTitle } from '../../hooks';
import { countersApi } from '../../api/passengerApi';
import { COUNTER_STATUSES } from '../../types';
import type { CheckInCounterRequest, CounterStatus } from '../../types';
import {
  formatTime,
  fromDateTimeLocalInput,
  getErrorMessage,
  getStatusVariant,
  humanizeEnum,
  nowForInput,
} from '../../utils';

interface CreateForm {
  counterNumber: string;
  terminal: string;
  flightId: string;
  openTime: string;
  closeTime: string;
}

const emptyForm = (): CreateForm => ({
  counterNumber: '',
  terminal: '',
  flightId: '',
  openTime: nowForInput(),
  closeTime: '',
});

export default function CheckInCountersPage() {
  usePageTitle('Check-in Counters');
  const toast = useToast();
  const { user } = useAuth();
  const { counters, loading, error, reload } = useCounters(user?.userId);
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
      !form.counterNumber.trim() ||
      !form.terminal.trim() ||
      !form.flightId ||
      !form.openTime
    ) {
      setValidated(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload: CheckInCounterRequest = {
        counterNumber: form.counterNumber.trim(),
        terminal: form.terminal.trim(),
        flightId: form.flightId,
        openTime: fromDateTimeLocalInput(form.openTime),
        ...(user?.userId ? { assignedAgentId: user.userId } : {}),
        ...(form.closeTime
          ? { closeTime: fromDateTimeLocalInput(form.closeTime) }
          : {}),
      };
      await countersApi.create(payload);
      toast.success('Counter opened');
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [form, user, toast, reload]);

  const handleStatusChange = useCallback(
    async (id: string, status: CounterStatus) => {
      setStatusBusy(true);
      try {
        await countersApi.updateStatus(id, status);
        toast.success('Counter status updated');
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
        title="Check-in Counters"
        subtitle="Open and manage passenger check-in counters"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus size={18} className="me-1" />
            Open Counter
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={counters.length > 0}
        isEmpty={counters.length === 0}
        onRetry={reload}
        emptyTitle="No counters"
        emptyMessage="No check-in counters have been opened yet."
      >
        <Card className="shadow-sm">
          <Card.Header className="bg-white fw-semibold py-3">
            Check-in Counter Status
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Counter #</th>
                  <th>Terminal</th>
                  <th>Flight</th>
                  <th>Agent</th>
                  <th>Open</th>
                  <th>Close</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {counters.map((c) => (
                  <tr key={c.counterId}>
                    <td className="fw-semibold">{c.counterNumber}</td>
                    <td>{c.terminal}</td>
                    <td>{c.flightNumber}</td>
                    <td>{c.assignedAgentName ?? '—'}</td>
                    <td>{formatTime(c.openTime)}</td>
                    <td>{c.closeTime ? formatTime(c.closeTime) : '—'}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        className={`fo-status-select fo-status-select-${getStatusVariant(c.status)}`}
                        value={c.status}
                        disabled={statusBusy}
                        onChange={(e) =>
                          handleStatusChange(
                            c.counterId,
                            e.target.value as CounterStatus,
                          )
                        }
                      >
                        {COUNTER_STATUSES.map((s) => (
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
          </Card.Body>
        </Card>
      </AsyncSection>

      <Modal show={showCreate} onHide={closeCreate} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">Open Counter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Counter Number</Form.Label>
              <Form.Control
                value={form.counterNumber}
                onChange={(e) =>
                  setForm({ ...form, counterNumber: e.target.value })
                }
                isInvalid={validated && !form.counterNumber.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Counter number is required.
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
            {submitting ? 'Opening…' : 'Open Counter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
