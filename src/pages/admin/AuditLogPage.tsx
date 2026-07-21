import { useCallback, useState } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { AsyncSection, PageHeader } from '../../components/common';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAudit } from '../../hooks/useAudit';
import type { AuditLogFilters } from '../../types';
import { formatDateTime, fromDateTimeLocalInput } from '../../utils';
import { Label } from 'recharts';

interface FilterForm {
  userEmail: string;
  entityType: string;
  from: string;
  to: string;
}

const ENTITY_TYPES = [
  { label:'All', value:'' },
  { label:'User', value:'User' }, { label:'Flight', value:'Flight' },
  { label:'TurnaroundPlan', value:'TurnaroundPlan' }, { label:'TurnaroundMilestone', value:'TurnaroundMilestone' },
  { label:'HandlingRequest', value:'HandlingRequest' }, { label:'EquipmentAllocation', value:'EquipmentAllocation' },
  { label: 'EquipmentMaintenance', value: 'EquipmentMaintenance' },
  { label:'BaggageOperation', value:'BaggageOperation' }, { label : 'MishandledBaggage', value: 'MishandledBaggage' },
  { label: 'CheckInCounter', value: 'CheckInCounter' }, { label: 'BoardingGate', value: 'BoardingGate' },
]

const EMPTY: FilterForm = { userEmail: '', entityType: '', from: '', to: '' };

export default function AuditLogPage() {
  usePageTitle('Audit Log');

  const [formState, setFormState] = useState<FilterForm>(EMPTY);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  const { logs, loading, error, reload } = useAudit(filters);

  const applyFilters = useCallback(() => {
    const next: AuditLogFilters = {};
    if (formState.userEmail.trim()) next.userEmail = formState.userEmail.trim();
    if (formState.entityType.trim())
      next.entityType = formState.entityType.trim();
    if (formState.from) next.from = fromDateTimeLocalInput(formState.from);
    if (formState.to) next.to = fromDateTimeLocalInput(formState.to);
    setFilters(next);
  }, [formState]);

  const clearFilters = useCallback(() => {
    setFormState(EMPTY);
    setFilters({});
  }, []);

  return (
    <>
      <PageHeader
        title="Audit Log"
        subtitle="Review system activity and administrative actions"
      />

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>User Email</Form.Label>
              <Form.Control
                value={formState.userEmail}
                onChange={(e) =>
                  setFormState({ ...formState, userEmail: e.target.value })
                }
              />
            </Col>
            {/* Swapped standard Form.Control with Form.Select dropdown */}
            <Col md={3}>
              <Form.Label>Audit Type</Form.Label>
              <Form.Select
                value={formState.entityType}
                onChange={(e) =>
                  setFormState({ ...formState, entityType: e.target.value })
                }
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>From</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formState.from}
                onChange={(e) =>
                  setFormState({ ...formState, from: e.target.value })
                }
              />
            </Col>
            <Col md={2}>
              <Form.Label>To</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formState.to}
                onChange={(e) =>
                  setFormState({ ...formState, to: e.target.value })
                }
              />
            </Col>
            <Col md={2} className="d-flex gap-2">
              <Button variant="primary" onClick={applyFilters}>
                Apply
              </Button>
              <Button variant="light" onClick={clearFilters}>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <AsyncSection
        loading={loading}
        error={error}
        hasData={logs.length > 0}
        isEmpty={logs.length === 0}
        onRetry={reload}
        emptyTitle="No audit entries"
        emptyMessage="No audit log entries match the current filters."
      >
        <Table hover responsive className="table-sm align-middle">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity Type</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.auditId}>
                <td>{formatDateTime(log.timestamp)}</td>
                <td className="fw-semibold">{log.userName}</td>
                <td>{log.userRole}</td>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>
    </>
  );
}
