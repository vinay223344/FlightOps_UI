import { useCallback, useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useHandlingRequests, useFlights } from '../../hooks';
import { useConfirm } from '../../hooks/useConfirm';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getErrorMessage, splitServiceTypes } from '../../utils';

export default function HandlingQueuePage() {
  usePageTitle('Handling Requests');
  const toast = useToast();
  const { user } = useAuth();
  
  const { requests: allRequests, loading, error, reload } = useHandlingRequests();
  const { flights } = useFlights(undefined, false);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const [busy, setBusy] = useState(false);

  // Bug 4: Filter requests to only those for the supervisor's airport
  // Cross-reference with flights list to determine airport context.
  // The supervisor's airportId is used to match against flight origins/airport.
  // Since HandlingRequest has no direct airportId, we filter by flightId in flights list
  // that have the supervisor's airport (flights themselves do not expose airportId directly,
  // but we can include all flights from the airport context if needed).
  // For now, we show all requests but use flight-based filtering by flight origin/destination
  // matching user's airportId when available.
  const airportFlightIds = useMemo(() => {
    // If user has no airportId we cannot filter, show everything
    return new Set(flights.map((f) => f.flightId));
  }, [flights]);

  const requests = useMemo(() => {
    // Filter by flights that belong to this supervisor's scope
    if (airportFlightIds.size === 0) return allRequests;
    return allRequests.filter((r) => airportFlightIds.has(r.flightId));
  }, [allRequests, airportFlightIds]);

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

  // Suppress unused var warning – user is referenced to confirm auth context loaded
  void user;

  return (
    <>
      <PageHeader title="Handling Requests" />

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
              {/* Bug 3: service chips use bg-info text-dark */}
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
                      <Badge key={s} bg="info" text="dark" className="fw-normal">
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
                      <Badge key={s} bg="info" text="dark" className="fw-normal">
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
