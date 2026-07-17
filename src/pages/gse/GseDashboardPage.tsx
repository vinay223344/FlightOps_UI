import { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
  IconBuildingWarehouse,
  IconCircleCheck,
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
  StatCard,
  StatusBadge,
} from '../../components/common';
import { useEquipment } from '../../hooks';
import { usePageTitle } from '../../hooks/usePageTitle';
import { humanizeEnum } from '../../utils';
import type { EquipmentStatus } from '../../types';

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  Available: '#198754',
  Allocated: '#0d6efd',
  Maintenance: '#ffc107',
  OutOfService: '#dc3545',
};

export default function GseDashboardPage() {
  usePageTitle('GSE Dashboard');
  const { equipment, loading, error, reload } = useEquipment();

  const counts = useMemo(() => {
    const base: Record<EquipmentStatus, number> = {
      Available: 0,
      Allocated: 0,
      Maintenance: 0,
      OutOfService: 0,
    };
    for (const e of equipment) {
      if (e.status in base) base[e.status] += 1;
    }
    return base;
  }, [equipment]);

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

  return (
    <>
      <PageHeader
        title="GSE Dashboard"
        subtitle="Ground support equipment fleet overview"
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
            value={equipment.length}
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
                <Card.Body>
                  <Card.Title className="h6 mb-3">
                    Status distribution
                  </Card.Title>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((d) => (
                          <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
    </>
  );
}
