import { useCallback, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import {
  IconBuildingWarehouse,
  IconCircleCheck,
  IconPlus,
  IconTool,
  IconTruckDelivery,
} from '@tabler/icons-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  AsyncSection,
  PageHeader,
  Pagination,
  StatCard,
  StatusBadge,
} from '../../components/common';
import { useEquipment } from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToast } from '../../context/ToastContext';
import { equipmentApi } from '../../api/gseApi';
import { EQUIPMENT_TYPES } from '../../types';
import { humanizeEnum, getErrorMessage } from '../../utils';
import type { EquipmentStatus, EquipmentType, GroundEquipmentRequest } from '../../types';

// Matches the app-wide status color tokens in src/styles/_tokens.scss
// ($fo-success / $fo-primary / $fo-warning / $fo-danger) instead of ad hoc
// Bootstrap hex values, so the chart stays visually consistent with badges.
const STATUS_COLORS: Record<EquipmentStatus, string> = {
  Available: '#16a34a',
  Allocated: '#2563eb',
  Maintenance: '#b45309',
  OutOfService: '#dc2626',
};

const emptyRegisterForm = (): GroundEquipmentRequest => ({
  type: 'StairsTruck',
  registrationNumber: '',
  currentLocation: '',
});

export default function GseDashboardPage() {
  usePageTitle('GSE Dashboard');
  const toast = useToast();

  // Fleet-wide fetch (large limit) for the KPI cards + status pie chart, which
  // must reflect the whole fleet regardless of which page is on screen below.
  const { equipment: fleet, reload: reloadFleet } = useEquipment(1, 1000);

  // Paginated fetch (10/page) for the equipment card grid itself.
  const [page, setPage] = useState(1);
  const {
    equipment,
    totalPages,
    currentPage,
    loading,
    error,
    reload: reloadPage,
  } = useEquipment(page, 10);

  const reload = useCallback(async () => {
    await Promise.all([reloadFleet(), reloadPage()]);
  }, [reloadFleet, reloadPage]);

  // Bug 2: Register equipment modal on dashboard
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState<GroundEquipmentRequest>(emptyRegisterForm);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);

  const counts = useMemo(() => {
    const base: Record<EquipmentStatus, number> = {
      Available: 0,
      Allocated: 0,
      Maintenance: 0,
      OutOfService: 0,
    };
    for (const e of fleet) {
      if (e.status in base) base[e.status] += 1;
    }
    return base;
  }, [fleet]);

  const pieData = useMemo(
    () =>
      (Object.keys(counts) as EquipmentStatus[])
        .map((status) => ({
          name: humanizeEnum(status),
          status,
          value: counts[status],
        }))
        .filter((d) => d.value > 0),
    [counts],
  );

  const openRegister = useCallback(() => {
    setRegisterForm(emptyRegisterForm());
    setValidated(false);
    setShowRegister(true);
  }, []);

  const closeRegister = useCallback(() => {
    if (registerSubmitting) return;
    setShowRegister(false);
  }, [registerSubmitting]);

  const handleRegister = useCallback(async () => {
    setValidated(true);
    if (!registerForm.registrationNumber.trim()) return;
    setRegisterSubmitting(true);
    try {
      await equipmentApi.create({
        type: registerForm.type,
        registrationNumber: registerForm.registrationNumber.trim(),
        currentLocation: registerForm.currentLocation?.trim() || undefined,
      });
      toast.success('Equipment registered');
      setShowRegister(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRegisterSubmitting(false);
    }
  }, [registerForm, toast, reload]);

  return (
    <>
      {/* Bug 2: Register button in page header */}
      <PageHeader
        title="GSE Dashboard"
        subtitle="Ground support equipment fleet overview"
        actions={
          <Button
            variant="primary"
            onClick={openRegister}
            className="d-inline-flex align-items-center gap-1"
          >
            <IconPlus size={18} />
            Register Equipment
          </Button>
        }
      />

      <Row className="g-3 mb-4">
        <Col md={6} xl>
          <StatCard
            label="Available"
            value={counts.Available}
            icon={IconCircleCheck}
            accent="success"
          />
        </Col>
        <Col md={6} xl>
          <StatCard
            label="Allocated"
            value={counts.Allocated}
            icon={IconTruckDelivery}
            accent="primary"
          />
        </Col>
        <Col md={6} xl>
          <StatCard
            label="Maintenance"
            value={counts.Maintenance}
            icon={IconTool}
            accent="warning"
          />
        </Col>
        <Col md={6} xl>
          <StatCard
            label="Out of Service"
            value={counts.OutOfService}
            icon={IconTool}
            accent="danger"
          />
        </Col>
        <Col md={6} xl>
          <StatCard
            label="Total"
            value={fleet.length}
            icon={IconBuildingWarehouse}
            accent="secondary"
            hint="Registered equipment"
          />
        </Col>
      </Row>

      <AsyncSection
        loading={loading}
        error={error}
        hasData={equipment.length > 0}
        isEmpty={equipment.length === 0}
        onRetry={reload}
        emptyTitle="No equipment"
        emptyMessage="No ground support equipment has been registered yet."
      >
        <Row className="g-3">
          {pieData.length > 0 && (
            <Col xs={12} lg={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6 mb-3">
                    Status distribution
                  </Card.Title>
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="42%"
                          outerRadius="70%"
                          label
                        >
                          {pieData.map((d) => (
                            <Cell
                              key={d.status}
                              fill={STATUS_COLORS[d.status]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}

          <Col xs={12} lg={pieData.length > 0 ? 8 : 12}>
            <Row className="g-3">
              {equipment.map((e) => (
                <Col md={6} xl={4} key={e.equipmentId}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="h6 mb-0">
                          {humanizeEnum(e.type)}
                        </Card.Title>
                        <StatusBadge status={e.status} />
                      </div>
                      <div className="fw-semibold">{e.registrationNumber}</div>
                      <div className="text-muted small">
                        {e.currentLocation || 'Location unknown'}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </AsyncSection>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Bug 2: Register Equipment Modal */}
      <Modal show={showRegister} onHide={closeRegister} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">Register New Equipment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="regType">
            <Form.Label>Equipment Type</Form.Label>
            <Form.Select
              value={registerForm.type}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  type: e.target.value as EquipmentType,
                })
              }
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {humanizeEnum(t)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="regNumber">
            <Form.Label>Registration Number</Form.Label>
            <Form.Control
              value={registerForm.registrationNumber}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  registrationNumber: e.target.value,
                })
              }
              isInvalid={validated && !registerForm.registrationNumber.trim()}
              placeholder="e.g. GSE-001"
            />
            <Form.Control.Feedback type="invalid">
              Registration number is required.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-1" controlId="regLocation">
            <Form.Label>Current Location (optional)</Form.Label>
            <Form.Control
              value={registerForm.currentLocation ?? ''}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  currentLocation: e.target.value,
                })
              }
              placeholder="e.g. Terminal 2 Apron"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeRegister} disabled={registerSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRegister}
            disabled={registerSubmitting}
          >
            {registerSubmitting ? 'Registering…' : 'Register'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
