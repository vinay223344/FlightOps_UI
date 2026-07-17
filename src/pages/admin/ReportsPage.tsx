import { useCallback, useState } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import {
  IconAlertTriangle,
  IconClockCheck,
  IconPackage,
  IconTruck,
} from '@tabler/icons-react';
import { AsyncSection, PageHeader, StatCard } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDashboardMetrics, useReports } from '../../hooks/useAnalytics';
import { analyticsApi } from '../../api/analyticsApi';
import type { DashboardMetricsResponse } from '../../types';
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  getErrorMessage,
  todayForInput,
} from '../../utils';

function parseMetrics(raw: string): DashboardMetricsResponse | null {
  try {
    return JSON.parse(raw) as DashboardMetricsResponse;
  } catch {
    return null;
  }
}

export default function ReportsPage() {
  usePageTitle('Reports');
  const toast = useToast();
  const { metrics } = useDashboardMetrics();
  const { reports, loading, error, reload } = useReports();

  const [scope, setScope] = useState('');
  const [fromDate, setFromDate] = useState(todayForInput());
  const [toDate, setToDate] = useState(todayForInput());
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!scope.trim() || !fromDate || !toDate) {
      setValidated(true);
      return;
    }
    setSubmitting(true);
    try {
      await analyticsApi.generateReport({
        scope: scope.trim(),
        fromDate,
        toDate,
      });
      toast.success('Report generated');
      setScope('');
      setValidated(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [scope, fromDate, toDate, toast, reload]);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Key performance indicators and saved operational reports"
      />

      <Row className="g-3">
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
            label="GSE Utilisation"
            value={metrics ? formatPercent(metrics.gseUtilisationPercent) : '—'}
            icon={IconTruck}
            accent="info"
          />
        </Col>
        <Col md={3}>
          <StatCard
            label="Baggage Discrepancy"
            value={
              metrics
                ? formatPercent(metrics.baggageDiscrepancyRatePercent)
                : '—'
            }
            icon={IconPackage}
            accent="warning"
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
      </Row>

      <Card className="shadow-sm mt-3">
        <Card.Header className="fw-semibold">Generate report</Card.Header>
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Label>Scope</Form.Label>
              <Form.Control
                placeholder="Airline:AI or Shift:Morning"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                isInvalid={validated && !scope.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Scope is required.
              </Form.Control.Feedback>
            </Col>
            <Col md={3}>
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                isInvalid={validated && !fromDate}
              />
            </Col>
            <Col md={3}>
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                isInvalid={validated && !toDate}
              />
            </Col>
            <Col md={1}>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={submitting}
              >
                {submitting ? '…' : 'Generate'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-3">
        <Card.Header className="fw-semibold">Saved reports</Card.Header>
        <Card.Body>
          <AsyncSection
            loading={loading}
            error={error}
            hasData={reports.length > 0}
            isEmpty={reports.length === 0}
            onRetry={reload}
            emptyTitle="No reports"
            emptyMessage="No reports have been generated yet."
          >
            <Table hover responsive className="table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Generated</th>
                  <th>On-time %</th>
                  <th>Flights</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const parsed = parseMetrics(r.metrics);
                  return (
                    <tr key={r.reportId}>
                      <td className="fw-semibold">{r.scope}</td>
                      <td>{formatDateTime(r.generatedDate)}</td>
                      <td>
                        {parsed
                          ? formatPercent(parsed.onTimeRatePercent)
                          : '—'}
                      </td>
                      <td>
                        {parsed
                          ? formatNumber(parsed.totalFlightsHandled)
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </AsyncSection>
        </Card.Body>
      </Card>
    </>
  );
}
