import { Card, Col, Row, Table } from 'react-bootstrap';
import {
  IconAlertTriangle,
  IconClockCheck,
  IconPlane,
  IconTruck,
} from '@tabler/icons-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AsyncSection,
  PageHeader,
  StatCard,
  StatusBadge,
} from '../../components/common';
import { useDashboardMetrics } from '../../hooks/useAnalytics';
import { useFlights } from '../../hooks/useFlights';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  formatMinutes,
  formatNumber,
  formatPercent,
  formatTime,
} from '../../utils';

export default function AdminDashboardPage() {
  usePageTitle('Admin Dashboard');

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
    reload: reloadMetrics,
  } = useDashboardMetrics();
  const {
    flights,
    loading: flightsLoading,
    error: flightsError,
    reload: reloadFlights,
  } = useFlights();

  const chartData = metrics
    ? [
        {
          name: 'Turnarounds',
          'On time': metrics.onTimeTurnarounds,
          Delayed: metrics.delayedTurnarounds,
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Today's operational overview"
      />

      <Row className="g-3">
        <Col md={3}>
          <StatCard
            label="Flights Today"
            value={metrics ? formatNumber(metrics.totalFlightsHandled) : '—'}
            icon={IconPlane}
            accent="primary"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="On-time Rate"
            value={metrics ? formatPercent(metrics.onTimeRatePercent) : '—'}
            icon={IconClockCheck}
            accent="success"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="SLA Breaches"
            value={metrics ? formatNumber(metrics.slaBreachCount) : '—'}
            icon={IconAlertTriangle}
            accent="danger"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="GSE Utilisation"
            value={metrics ? formatPercent(metrics.gseUtilisationPercent) : '—'}
            icon={IconTruck}
            accent="info"
          />
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold">Turnarounds today</Card.Header>
            <Card.Body>
              <AsyncSection
                loading={metricsLoading}
                error={metricsError}
                hasData={!!metrics}
                isEmpty={!metrics}
                onRetry={reloadMetrics}
                emptyTitle="No metrics"
                emptyMessage="Dashboard metrics are not available yet."
              >
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="On time" fill="#198754" />
                    <Bar dataKey="Delayed" fill="#dc3545" />
                  </BarChart>
                </ResponsiveContainer>
              </AsyncSection>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold">Key metrics</Card.Header>
            <Card.Body>
              <AsyncSection
                loading={metricsLoading}
                error={metricsError}
                hasData={!!metrics}
                isEmpty={!metrics}
                onRetry={reloadMetrics}
                emptyTitle="No metrics"
                emptyMessage="Dashboard metrics are not available yet."
              >
                {metrics && (
                  <Table className="table-sm mb-0" borderless>
                    <tbody>
                      <tr>
                        <td className="text-muted">Avg turnaround</td>
                        <td className="text-end fw-semibold">
                          {formatMinutes(metrics.avgTurnaroundMinutes)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Baggage discrepancy rate</td>
                        <td className="text-end fw-semibold">
                          {formatPercent(metrics.baggageDiscrepancyRatePercent)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Mishandled bags reported</td>
                        <td className="text-end fw-semibold">
                          {formatNumber(metrics.mishandledBagsReported)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Open assistance requests</td>
                        <td className="text-end fw-semibold">
                          {formatNumber(metrics.openAssistanceRequests)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                )}
              </AsyncSection>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mt-3">
        <Card.Header className="fw-semibold">Today's flights</Card.Header>
        <Card.Body>
          <AsyncSection
            loading={flightsLoading}
            error={flightsError}
            hasData={flights.length > 0}
            isEmpty={flights.length === 0}
            onRetry={reloadFlights}
            emptyTitle="No flights"
            emptyMessage="No flights are scheduled for today."
          >
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
                    <td className="fw-semibold">
                      {f.flightNumber}
                    </td>
                    <td>
                      {f.origin} → {f.destination}
                    </td>
                    <td>{f.aircraftType}</td>
                    <td>{formatTime(f.scheduledArrival)}</td>
                    <td>{formatTime(f.scheduledDeparture)}</td>
                    <td>{f.stand ?? '—'}</td>
                    <td>
                      <StatusBadge status={f.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </AsyncSection>
        </Card.Body>
      </Card>
    </>
  );
}
