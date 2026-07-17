import { useCallback, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { useConfirm, useEquipment, useMaintenance } from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { maintenanceApi } from '../../api/gseApi';
import {
  formatDateTime,
  fromDateTimeLocalInput,
  getErrorMessage,
} from '../../utils';
import type { EquipmentMaintenanceRequest } from '../../types';

export default function MaintenancePage() {
  usePageTitle('Maintenance');
  const toast = useToast();
  const { records, loading, error, reload } = useMaintenance();
  const { equipment } = useEquipment();
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [validated, setValidated] = useState(false);

  const [equipmentId, setEquipmentId] = useState('');
  const [issue, setIssue] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  const openModal = useCallback(() => {
    setEquipmentId('');
    setIssue('');
    setExpectedReturnDate('');
    setValidated(false);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setShowModal(false);
  }, [submitting]);

  const handleResolve = useCallback(
    async (id: string) => {
      const ok = await confirm({
        body: 'Mark this equipment as returned to service?',
        variant: 'primary',
        confirmLabel: 'Resolve',
      });
      if (!ok) return;
      setBusy(true);
      try {
        await maintenanceApi.resolve(id);
        toast.success('Maintenance resolved');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [confirm, toast, reload],
  );

  const handleSubmit = useCallback(async () => {
    setValidated(true);
    if (!equipmentId || !issue.trim()) return;
    const payload: EquipmentMaintenanceRequest = {
      equipmentId,
      issue: issue.trim(),
      expectedReturnDate: expectedReturnDate
        ? fromDateTimeLocalInput(expectedReturnDate)
        : undefined,
    };
    setSubmitting(true);
    try {
      await maintenanceApi.create(payload);
      toast.success('Fault reported');
      setShowModal(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [equipmentId, issue, expectedReturnDate, toast, reload]);

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Track equipment faults and repairs"
        actions={
          <Button
            variant="primary"
            onClick={openModal}
            className="d-flex align-items-center gap-1"
          >
            <IconPlus size={18} /> Report Fault
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={records.length > 0}
        isEmpty={records.length === 0}
        onRetry={reload}
        emptyTitle="No maintenance records"
        emptyMessage="No equipment faults have been reported."
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Issue</th>
              <th>Reported By</th>
              <th>Reported</th>
              <th>Expected Return</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.maintenanceId}>
                <td className="fw-semibold">{r.registrationNumber}</td>
                <td>{r.issue}</td>
                <td>{r.reportedByName}</td>
                <td>{formatDateTime(r.reportedDate)}</td>
                <td>
                  {r.expectedReturnDate
                    ? formatDateTime(r.expectedReturnDate)
                    : '—'}
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td className="text-end">
                  {r.status !== 'ReturnedToService' && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleResolve(r.maintenanceId)}
                      disabled={busy}
                    >
                      Resolve
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
          <Modal.Title className="h6 mb-0">Report Fault</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="maintEquipment">
            <Form.Label>Equipment</Form.Label>
            <Form.Select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              isInvalid={validated && !equipmentId}
            >
              <option value="">Select equipment…</option>
              {equipment.map((e) => (
                <option key={e.equipmentId} value={e.equipmentId}>
                  {e.registrationNumber}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select equipment.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="maintIssue">
            <Form.Label>Issue</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              isInvalid={validated && !issue.trim()}
              placeholder="Describe the fault…"
            />
            <Form.Control.Feedback type="invalid">
              Please describe the issue.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-1" controlId="maintReturn">
            <Form.Label>Expected return (optional)</Form.Label>
            <Form.Control
              type="datetime-local"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
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
            {submitting ? 'Saving…' : 'Report'}
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
