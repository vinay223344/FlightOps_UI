import { useCallback, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import { AsyncSection, PageHeader, StatusBadge } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { useEquipment } from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { equipmentApi } from '../../api/gseApi';
import { getErrorMessage, humanizeEnum } from '../../utils';
import {
  EQUIPMENT_STATUSES,
  EQUIPMENT_TYPES,
  type EquipmentStatus,
  type EquipmentType,
  type GroundEquipmentRequest,
} from '../../types';

export default function EquipmentListPage() {
  usePageTitle('Equipment');
  const toast = useToast();
  const { equipment, loading, error, reload } = useEquipment();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<EquipmentType>(EQUIPMENT_TYPES[0]);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [validated, setValidated] = useState(false);

  const resetForm = useCallback(() => {
    setType(EQUIPMENT_TYPES[0]);
    setRegistrationNumber('');
    setCurrentLocation('');
    setValidated(false);
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setShowModal(false);
  }, [submitting]);

  const handleStatusChange = useCallback(
    async (id: string, status: EquipmentStatus) => {
      try {
        await equipmentApi.updateStatus(id, status);
        toast.success('Status updated');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [toast, reload],
  );

  const handleSubmit = useCallback(async () => {
    setValidated(true);
    if (!registrationNumber.trim()) return;
    const payload: GroundEquipmentRequest = {
      type,
      registrationNumber: registrationNumber.trim(),
      currentLocation: currentLocation.trim() || undefined,
    };
    setSubmitting(true);
    try {
      await equipmentApi.create(payload);
      toast.success('Equipment registered');
      setShowModal(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [type, registrationNumber, currentLocation, toast, reload]);

  return (
    <>
      <PageHeader
        title="Equipment"
        subtitle="Register and manage ground support equipment"
        actions={
          <Button
            variant="primary"
            onClick={openModal}
            className="d-flex align-items-center gap-1"
          >
            <IconPlus size={18} /> Register Equipment
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={equipment.length > 0}
        isEmpty={equipment.length === 0}
        onRetry={reload}
        emptyTitle="No equipment"
        emptyMessage="Register your first piece of equipment to get started."
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Registration</th>
              <th>Location</th>
              <th style={{ width: 200 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.equipmentId}>
                <td>{humanizeEnum(e.type)}</td>
                <td className="fw-semibold">{e.registrationNumber}</td>
                <td>{e.currentLocation || '—'}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <StatusBadge status={e.status} />
                    <Form.Select
                      size="sm"
                      value={e.status}
                      onChange={(ev) =>
                        handleStatusChange(
                          e.equipmentId,
                          ev.target.value as EquipmentStatus,
                        )
                      }
                    >
                      {EQUIPMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {humanizeEnum(s)}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">Register Equipment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="equipmentType">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value as EquipmentType)}
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {humanizeEnum(t)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registrationNumber">
            <Form.Label>Registration number</Form.Label>
            <Form.Control
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              isInvalid={validated && !registrationNumber.trim()}
              placeholder="e.g. GSE-1042"
            />
            <Form.Control.Feedback type="invalid">
              Registration number is required.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-1" controlId="currentLocation">
            <Form.Label>Current location (optional)</Form.Label>
            <Form.Control
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. Bay 3"
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
            {submitting ? 'Saving…' : 'Register'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
