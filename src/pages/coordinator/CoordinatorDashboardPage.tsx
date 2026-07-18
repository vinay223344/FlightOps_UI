import { Row, Col, Table } from 'react-bootstrap';
import {
  IconClipboardList,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { PageHeader, StatCard, StatusBadge, AsyncSection } from '../../components/common';
import { useFlights, useHandlingRequests, usePageTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils';
import {storageService} from "../../services/storageService";

export default function CoordinatorDashboardPage() {
  usePageTitle('Coordinator Dashboard');
  const { user } = useAuth();

  const currentUser = storageService.getUser();
  const userId = currentUser?.userId ?? '';

  const {
    requests: allRequests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useHandlingRequests(userId);
  const {
    flights,
    loading: flightsLoading,
    error: flightsError,
    reload: reloadFlights,
  } = useFlights();

  // Bug 2: Filter by logged-in user's requests only
  const requests = allRequests.filter((r) => r.requestedById === user?.userId);

  const confirmedCount = requests.filter((r) => r.status === 'Confirmed').length;
  const pendingCount = requests.filter((r) => r.status === 'Received').length;
  const disputedCount = requests.filter((r) => r.status === 'Disputed').length;

  const loading = requestsLoading || flightsLoading;
  const error = requestsError ?? flightsError;
  const hasData = flights.length > 0 || requests.length > 0;

  const reload = () => {
    void reloadRequests();
    void reloadFlights();
  };

  return (
    <>
      <PageHeader title="Coordinator Dashboard" />

      <Row className="g-3 mb-4">
        <Col md={3}>
          <StatCard
            label="My Requests"
            value={requests.length}
            icon={IconClipboardList}
            accent="primary"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="Confirmed"
            value={confirmedCount}
            icon={IconCircleCheck}
            accent="success"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={IconClock}
            accent="warning"
          />
        </Col>
        {/* Bug 1: Added Disputed card */}
        <Col md={3}>
          <StatCard
            label="Disputed"
            value={disputedCount}
            icon={IconAlertTriangle}
            accent="danger"
          />
        </Col>
      </Row>

      <h5 className="fw-semibold mb-3">Today&apos;s flights</h5>
      <AsyncSection
        loading={loading}
        error={error}
        hasData={hasData}
        isEmpty={flights.length === 0}
        onRetry={reload}
        emptyTitle="No flights"
        emptyMessage="There are no flights scheduled for today."
      >
        <Table hover responsive size="sm" className="align-middle">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>STA</th>
              <th>STD</th>
              <th>Status</th>
              <th>Request</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => {
              const request = requests.find((r) => r.flightId === f.flightId);
              return (
                <tr key={f.flightId}>
                  <td className="fw-semibold">
                    {f.flightNumber}
                  </td>
                  <td>
                    {f.origin}→{f.destination}
                  </td>
                  <td>{formatTime(f.scheduledArrival)}</td>
                  <td>{formatTime(f.scheduledDeparture)}</td>
                  <td>
                    <StatusBadge status={f.status} />
                  </td>
                  <td>
                    {request ? (
                      <StatusBadge status={request.status} />
                    ) : (
                      <span className="text-muted small">No request</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </AsyncSection>
    </>
  );
}
