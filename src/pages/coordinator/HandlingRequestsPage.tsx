import { useCallback, useState } from 'react';
import { Badge, Button, Col, Card, Form, Modal, Row, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader, AsyncSection, StatusBadge } from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { useFlights, useHandlingRequests, usePageTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { handlingRequestsApi } from '../../api';
import { HANDLING_SERVICE_OPTIONS } from '../../constants';
import {
  getErrorMessage,
  joinServiceTypes,
  splitServiceTypes,
} from '../../utils';
import type { HandlingRequestDto } from '../../types';
import { storageService } from '../../services/storageService';

interface FilterForm {
  status: string;
  date: string;
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'Received' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Disputed', value: 'Disputed' },
];


export default function HandlingRequestsPage() {
  usePageTitle('Your Handling Requests');
  const toast = useToast();

  const currentUser = storageService.getUser();
  const userId = currentUser?.userId ?? '';

  // Filter form state
  const [formState, setFormState] = useState<FilterForm>({ status: '', date: '' });
  const [appliedFilters, setAppliedFilters] = useState<FilterForm>({ status: '', date: '' });

  // Hook now receives appliedFilters -> triggers API call on change
  const { requests, loading, error, reload } = useHandlingRequests(userId, appliedFilters);
  const { flights } = useFlights(undefined, false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flightId, setFlightId] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [touched, setTouched] = useState(false);

  const flightInvalid = touched && !flightId;
  const servicesInvalid = touched && selectedServices.length === 0;

  // Filter handlers
  const applyFilters = useCallback(() => {
    // Creating a new object reference here guarantees useEffect in useAsyncData runs
    setAppliedFilters({
      status: formState.status,
      date: formState.date,
    });
  }, [formState]);

  const clearFilters = useCallback(() => {
    const empty = { status: '', date: '' };
    setFormState(empty);
    setAppliedFilters(empty);
  }, []);

  const resetForm = useCallback(() => {
    setFlightId('');
    setSelectedServices([]);
    setSpecialRequirements('');
    setTouched(false);
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const toggleService = useCallback((service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setTouched(true);
    const selectedFlight = flights.find((f) => f.flightId === flightId);
    if (!selectedFlight || selectedServices.length === 0) return;

    const dto: HandlingRequestDto = {
      flightId,
      airlineId: selectedFlight.airlineCode,
      serviceTypes: joinServiceTypes(selectedServices),
      specialRequirements: specialRequirements.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await handlingRequestsApi.create(dto);
      toast.success('Handling request created');
      await reload();
      closeModal();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    flights,
    flightId,
    selectedServices,
    specialRequirements,
    toast,
    reload,
    closeModal,
  ]);

  return (
    <>
      <PageHeader
        title="Your Handling Requests"
        subtitle="Request ground-handling services for your flights"
        actions={
          <Button variant="primary" onClick={openModal}>
            <IconPlus size={18} className="me-1" />
            New Request
          </Button>
        }
      />

      {/* Filter Card */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formState.status}
                onChange={(e) =>
                  setFormState({ ...formState, status: e.target.value })
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formState.date}
                onChange={(e) =>
                  setFormState({ ...formState, date: e.target.value })
                }
              />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" onClick={applyFilters}>
                Apply
              </Button>
              <Button variant="light" onClick={clearFilters}>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <AsyncSection
        loading={loading}
        error={error}
        hasData={requests.length > 0}
        isEmpty={requests.length === 0}
        onRetry={reload}
        emptyTitle="No handling requests"
        emptyMessage={
          appliedFilters.status || appliedFilters.date
            ? "No handling requests match the selected filters."
            : "Create a new request to get started."
        }
      >
        <Card className="shadow-sm">
          <Card.Header className="bg-white fw-semibold py-3">
            Handling Request Services
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive size="sm" className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Services</th>
                  <th>Special Requirements</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.requestId}>
                    <td className="fw-semibold">{r.flightNumber}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {splitServiceTypes(r.serviceTypes).map((s) => (
                          <Badge
                            key={s}
                            bg="primary"
                            className="fo-service-chip fw-normal"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      {r.specialRequirements || (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </AsyncSection>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Handling Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="flightId">
            <Form.Label>Flight</Form.Label>
            <FlightSelect
              flights={flights}
              value={flightId}
              onChange={setFlightId}
              isInvalid={flightInvalid}
            />
            {flightInvalid && (
              <div className="text-danger small mt-1">Please select a flight.</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Services</Form.Label>
            <div className="d-flex flex-wrap gap-3">
              {HANDLING_SERVICE_OPTIONS.map((service) => (
                <Form.Check
                  key={service}
                  type="checkbox"
                  id={`service-${service}`}
                  label={service}
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                />
              ))}
            </div>
            {servicesInvalid && (
              <div className="text-danger small mt-1">
                Select at least one service.
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-1" controlId="specialRequirements">
            <Form.Label>Special Requirements (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}