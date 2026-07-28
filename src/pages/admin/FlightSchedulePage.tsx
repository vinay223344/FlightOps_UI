import { useCallback, useState } from 'react';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import { AsyncSection, PageHeader } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useFlights } from '../../hooks/useFlights';
import { flightsApi } from '../../api/flightsApi';
import { FLIGHT_STATUSES } from '../../types';
import type { FlightRequest, FlightStatus } from '../../types';
import {
  formatTime,
  fromDateTimeLocalInput,
  getErrorMessage,
  getStatusVariant,
  humanizeEnum,
  nowForInput,
} from '../../utils';

interface FlightForm {
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  aircraftType: string;
  paxCapacity: string;
  stand: string;
}

function emptyForm(): FlightForm {
  return {
    airlineCode: '',
    flightNumber: '',
    origin: '',
    destination: '',
    scheduledArrival: nowForInput(),
    scheduledDeparture: nowForInput(),
    aircraftType: '',
    paxCapacity: '',
    stand: '',
  };
}

export default function FlightSchedulePage() {
  usePageTitle('Flight Schedule');
  const toast = useToast();
  const { flights, loading, error, reload } = useFlights(undefined, false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FlightForm>(emptyForm());
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
      !form.airlineCode.trim() ||
      !form.flightNumber.trim() ||
      !form.origin.trim() ||
      !form.destination.trim() ||
      !form.aircraftType.trim() ||
      !form.scheduledArrival ||
      !form.scheduledDeparture
    ) {
      setValidated(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload: FlightRequest = {
        airlineCode: form.airlineCode.trim(),
        flightNumber: form.flightNumber.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        scheduledArrival: fromDateTimeLocalInput(form.scheduledArrival),
        scheduledDeparture: fromDateTimeLocalInput(form.scheduledDeparture),
        aircraftType: form.aircraftType.trim(),
        ...(form.paxCapacity.trim()
          ? { paxCapacity: Number(form.paxCapacity) }
          : {}),
        ...(form.stand.trim() ? { stand: form.stand.trim() } : {}),
      };
      await flightsApi.create(payload);
      toast.success('Flight created');
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [form, toast, reload]);

  const handleStatusChange = useCallback(
    async (id: string, status: FlightStatus) => {
      setStatusBusy(true);
      try {
        await flightsApi.updateStatus(id, status);
        toast.success('Flight status updated');
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
        title="Flight Schedule"
        subtitle="Manage flights and update their status"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus size={18} className="me-1" />
            Add Flight
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={flights.length > 0}
        isEmpty={flights.length === 0}
        onRetry={reload}
        emptyTitle="No flights"
        emptyMessage="No flights have been scheduled yet."
      >
        <Card className="shadow-sm">
          <Card.Header className="bg-white fw-semibold py-3">
            Flight Status
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Aircraft</th>
                  <th>STA</th>
                  <th>STD</th>
                  <th>Stand</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f) => (
                  <tr key={f.flightId}>
                    <td className="fw-semibold">{f.flightNumber}</td>
                    <td>
                      {f.origin} → {f.destination}
                    </td>
                    <td>{f.aircraftType}</td>
                    <td>{formatTime(f.scheduledArrival)}</td>
                    <td>{formatTime(f.scheduledDeparture)}</td>
                    <td>{f.stand ?? '—'}</td>
                    <td style={{ minWidth: 160 }}>
                      <Form.Select
                        size="sm"
                        className={`fo-status-select fo-status-select-${getStatusVariant(f.status)}`}
                        value={f.status}
                        disabled={statusBusy}
                        onChange={(e) =>
                          handleStatusChange(
                            f.flightId,
                            e.target.value as FlightStatus,
                          )
                        }
                      >
                        {FLIGHT_STATUSES.map((s) => (
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
          <Modal.Title className="h6 mb-0">Add Flight</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <div className="row g-3">
              <Form.Group className="col-6">
                <Form.Label>Airline Code</Form.Label>
                <Form.Control
                  value={form.airlineCode}
                  onChange={(e) =>
                    setForm({ ...form, airlineCode: e.target.value })
                  }
                  isInvalid={validated && !form.airlineCode.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Flight Number</Form.Label>
                <Form.Control
                  value={form.flightNumber}
                  onChange={(e) =>
                    setForm({ ...form, flightNumber: e.target.value })
                  }
                  isInvalid={validated && !form.flightNumber.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Origin</Form.Label>
                <Form.Control
                  value={form.origin}
                  onChange={(e) =>
                    setForm({ ...form, origin: e.target.value })
                  }
                  isInvalid={validated && !form.origin.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Destination</Form.Label>
                <Form.Control
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                  isInvalid={validated && !form.destination.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Scheduled Arrival</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={form.scheduledArrival}
                  onChange={(e) =>
                    setForm({ ...form, scheduledArrival: e.target.value })
                  }
                  isInvalid={validated && !form.scheduledArrival}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Scheduled Departure</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={form.scheduledDeparture}
                  onChange={(e) =>
                    setForm({ ...form, scheduledDeparture: e.target.value })
                  }
                  isInvalid={validated && !form.scheduledDeparture}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Aircraft Type</Form.Label>
                <Form.Control
                  value={form.aircraftType}
                  onChange={(e) =>
                    setForm({ ...form, aircraftType: e.target.value })
                  }
                  isInvalid={validated && !form.aircraftType.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Pax Capacity (optional)</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={form.paxCapacity}
                  onChange={(e) =>
                    setForm({ ...form, paxCapacity: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="col-6">
                <Form.Label>Stand (optional)</Form.Label>
                <Form.Control
                  value={form.stand}
                  onChange={(e) => setForm({ ...form, stand: e.target.value })}
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeCreate} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create Flight'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
