import { useCallback, useState } from 'react';
import { IconCircleCheck } from '@tabler/icons-react';
import { Badge, Button, Table } from 'react-bootstrap';
import { handlingRequestsApi } from '../../api';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { useHandlingRequests } from '../../hooks';
import { useConfirm } from '../../hooks/useConfirm';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getErrorMessage, splitServiceTypes } from '../../utils';

export default function HandlingQueuePage() {
  usePageTitle('Handling Queue');
  const toast = useToast();
  const { requests, loading, error, reload } = useHandlingRequests();
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const [busy, setBusy] = useState(false);

  const pending = requests.filter((r) => r.status === 'Received');

  const handleConfirmRequest = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await handlingRequestsApi.updateStatus(id, 'Confirmed');
        toast.success('Request confirmed');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [toast, reload],
  );

  const handleDispute = useCallback(
    async (id: string) => {
      const ok = await confirm({
        body: 'Dispute this handling request?',
        variant: 'danger',
        confirmLabel: 'Dispute',
      });
      if (!ok) return;
      setBusy(true);
      try {
        await handlingRequestsApi.updateStatus(id, 'Disputed');
        toast.success('Request disputed');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [confirm, toast, reload],
  );

  return (
    <>
      <PageHeader title="Handling Queue" />

      <h5 className="fw-bold mb-3">Pending Requests</h5>
      <AsyncSection
        loading={loading}
        error={error}
        hasData={requests.length > 0}
        isEmpty={pending.length === 0}
        onRetry={reload}
        emptyTitle="No pending requests"
        emptyMessage="There are no requests awaiting review."
      >
        <Table hover responsive className="align-middle table-sm mb-4">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Services</th>
              <th>Requested By</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.requestId}>
                <td className="fw-semibold">{r.flightNumber}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {splitServiceTypes(r.serviceTypes).map((s) => (
                      <Badge key={s} bg="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td>{r.requestedByName}</td>
                <td className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={busy}
                      onClick={() => handleConfirmRequest(r.requestId)}
                    >
                      <IconCircleCheck size={16} className="me-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => handleDispute(r.requestId)}
                    >
                      Dispute
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <h5 className="fw-bold mb-3">All Requests</h5>
      <AsyncSection
        loading={loading}
        error={error}
        hasData={requests.length > 0}
        isEmpty={requests.length === 0}
        onRetry={reload}
        emptyTitle="No handling requests"
        emptyMessage="No handling requests have been submitted."
      >
        <Table hover responsive className="align-middle table-sm">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Services</th>
              <th>Requested By</th>
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
                      <Badge key={s} bg="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td>{r.requestedByName}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <ConfirmDialog
        {...confirmState}
        onConfirm={onConfirm}
        onCancel={onCancel}
        busy={busy}
      />
    </>
  );
}
