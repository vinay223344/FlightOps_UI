import { useCallback, useMemo, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus, IconCircleCheck } from '@tabler/icons-react';
import {
  PageHeader,
  AsyncSection,
  StatusBadge,
  ConfirmDialog,
} from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  useAssistance,
  useFlights,
  usePageTitle,
  useConfirm,
  useAssistanceByUserId,
} from '../../hooks';
import { assistanceApi } from '../../api/passengerApi';
import { ASSISTANCE_TYPES } from '../../types';
import type { AssistanceType, SpecialAssistanceRequest } from '../../types';
import { getErrorMessage, humanizeEnum } from '../../utils';

interface CreateForm {
  flightId: string;
  passengerName: string;
  assistanceType: AssistanceType;
}

const emptyForm = (): CreateForm => ({
  flightId: '',
  passengerName: '',
  assistanceType: ASSISTANCE_TYPES[0],
});

export default function SpecialAssistancePage() {
  usePageTitle('Special Assistance');
  const toast = useToast();
  const { user } = useAuth();

  // 🟢 Pass user?.userId to fetch only requests for this agent from the backend
  const { requests, loading, error, reload } = useAssistanceByUserId(user?.userId);
  const { flights } = useFlights(undefined, false);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  // Sort requests: Assigned (Active) first, Completed last
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aVal = a.status === 'Assigned' ? 0 : 1;
      const bVal = b.status === 'Assigned' ? 0 : 1;
      return aVal - bVal;
    });
  }, [requests]);

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
    if (!form.flightId || !form.passengerName.trim()) {
      setValidated(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload: SpecialAssistanceRequest = {
        flightId: form.flightId,
        userId: user?.userId ?? '', 
        passengerName: form.passengerName.trim(),
        assistanceType: form.assistanceType,
      };
      await assistanceApi.create(payload);
      toast.success('Assistance request created & assigned to you');
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [form, toast, reload]);

  const handleComplete = useCallback(
    async (id: string) => {
      const ok = await confirm({
        body: 'Mark this assistance request as completed?',
        confirmLabel: 'Complete',
      });
      if (!ok) return;
      setActionBusy(true);
      try {
        await assistanceApi.complete(id);
        toast.success('Request completed');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setActionBusy(false);
      }
    },
    [confirm, toast, reload],
  );

  return (
    <>
      <PageHeader
        title="Special Assistance"
        subtitle="Manage your assigned special assistance requests"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus size={18} className="me-1" />
            New Request
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={sortedRequests.length > 0}
        isEmpty={sortedRequests.length === 0}
        onRetry={reload}
        emptyTitle="No requests"
        emptyMessage="You have no special assistance requests."
      >
        <Table hover responsive className="table-sm align-middle">
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Flight</th>
              <th>Type</th>
              <th>Agent</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((r) => (
              <tr key={r.assistanceId}>
                <td className="fw-semibold">{r.passengerName}</td>
                <td>{r.flightNumber}</td>
                <td>{humanizeEnum(r.assistanceType)}</td>
                <td>{r.assignedAgentName ?? user?.email ?? '—'}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td className="text-end">
                  {r.status === 'Assigned' && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      disabled={actionBusy}
                      onClick={() => handleComplete(r.assistanceId)}
                    >
                      <IconCircleCheck size={16} className="me-1" />
                      Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <Modal show={showCreate} onHide={closeCreate} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">New Assistance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
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
              <Form.Label>Passenger Name</Form.Label>
              <Form.Control
                value={form.passengerName}
                onChange={(e) =>
                  setForm({ ...form, passengerName: e.target.value })
                }
                isInvalid={validated && !form.passengerName.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Passenger name is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Assistance Type</Form.Label>
              <Form.Select
                value={form.assistanceType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assistanceType: e.target.value as AssistanceType,
                  })
                }
              >
                {ASSISTANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {humanizeEnum(t)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeCreate} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        {...confirmState}
        onConfirm={onConfirm}
        onCancel={onCancel}
        busy={actionBusy}
      />
    </>
  );
}