import { useCallback, useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
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

export default function HandlingRequestsPage() {
  usePageTitle('Handling Requests');
  const toast = useToast();

  const currentUser = storageService.getUser();
  const userId = currentUser?.userId ?? '';

  const { requests, loading, error, reload } = useHandlingRequests(userId);
  const { flights } = useFlights(undefined, false);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flightId, setFlightId] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [touched, setTouched] = useState(false);

  const flightInvalid = touched && !flightId;
  const servicesInvalid = touched && selectedServices.length === 0;

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
        title="Handling Requests"
        subtitle="Request ground-handling services for your flights"
        actions={
          <Button variant="primary" onClick={openModal}>
            <IconPlus size={18} className="me-1" />
            New Request
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={requests.length > 0}
        isEmpty={requests.length === 0}
        onRetry={reload}
        emptyTitle="No handling requests"
        emptyMessage="Create a new request to get started."
      >
        <Table hover responsive size="sm" className="align-middle">
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
                  <div className="d-flex flex-wrap gap-1">
                    {splitServiceTypes(r.serviceTypes).map((s) => (
                      <Badge key={s} bg="secondary" className="fw-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td>{r.specialRequirements || <span className="text-muted">—</span>}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
