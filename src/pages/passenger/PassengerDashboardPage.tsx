import { Row, Col, Table } from 'react-bootstrap';
import {
  IconTicket,
  IconDoorEnter,
  IconWheelchair,
} from '@tabler/icons-react';
import {
  PageHeader,
  StatCard,
  StatusBadge,
  AsyncSection,
} from '../../components/common';
import {
  useCounters,
  useGates,
  useAssistance,
  usePageTitle,
  useAssistanceByUserId,
} from '../../hooks';

import { useAuth } from '../../context/AuthContext';

export default function PassengerDashboardPage() {
  usePageTitle('Passenger Services Dashboard');

  const {user} = useAuth();


  const {
    counters,
    loading: countersLoading,
    error: countersError,
    reload: reloadCounters,
  } = useCounters(user?.userId);
  const {
    gates,
    loading: gatesLoading,
    error: gatesError,
    reload: reloadGates,
  } = useGates(user?.userId);
  const { requests } = useAssistanceByUserId(user?.userId);

  const openCounters = counters.filter((c) => c.status === 'Open').length;
  const boardingGates = gates.filter(
    (g) => g.status === 'Boarding' || g.status === 'Open',
  ).length;
  const openAssistance = requests.filter(
    (r) => r.status !== 'Completed',
  ).length;

  return (
    <>
      <PageHeader title="Passenger Services Dashboard" />

      <Row className="g-3 mb-4">
        <Col md={4}>
          <StatCard
            label="Open Counters"
            value={openCounters}
            icon={IconTicket}
            accent="primary"
          />
        </Col>
        <Col md={4}>
          <StatCard
            label="Boarding Gates"
            value={boardingGates}
            icon={IconDoorEnter}
            accent="info"
          />
        </Col>
        <Col md={4}>
          <StatCard
            label="Open Assistance"
            value={openAssistance}
            icon={IconWheelchair}
            accent="warning"
          />
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <h5 className="fw-semibold mb-3">Check-in counters</h5>
          <AsyncSection
            loading={countersLoading}
            error={countersError}
            hasData={counters.length > 0}
            isEmpty={counters.length === 0}
            onRetry={reloadCounters}
            emptyTitle="No counters"
            emptyMessage="No check-in counters have been opened."
          >
            <Table hover responsive className="table-sm align-middle">
              <thead>
                <tr>
                  <th>Counter #</th>
                  <th>Terminal</th>
                  <th>Flight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {counters.map((c) => (
                  <tr key={c.counterId}>
                    <td className="fw-semibold">{c.counterNumber}</td>
                    <td>{c.terminal}</td>
                    <td>{c.flightNumber}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </AsyncSection>
        </Col>

        <Col md={6}>
          <h5 className="fw-semibold mb-3">Boarding gates</h5>
          <AsyncSection
            loading={gatesLoading}
            error={gatesError}
            hasData={gates.length > 0}
            isEmpty={gates.length === 0}
            onRetry={reloadGates}
            emptyTitle="No gates"
            emptyMessage="No boarding gates have been opened."
          >
            <Table hover responsive className="table-sm align-middle">
              <thead>
                <tr>
                  <th>Gate #</th>
                  <th>Terminal</th>
                  <th>Flight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gates.map((g) => (
                  <tr key={g.gateId}>
                    <td className="fw-semibold">{g.gateNumber}</td>
                    <td>{g.terminal}</td>
                    <td>{g.flightNumber}</td>
                    <td>
                      <StatusBadge status={g.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </AsyncSection>
        </Col>
      </Row>
    </>
  );
}
