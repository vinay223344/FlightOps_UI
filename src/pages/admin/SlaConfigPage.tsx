import { Alert, Card, Table } from 'react-bootstrap';
import { IconInfoCircle } from '@tabler/icons-react';
import { PageHeader } from '../../components/common';
import { usePageTitle } from '../../hooks/usePageTitle';
import { SLA_SCHEDULE } from '../../constants';
import { humanizeEnum } from '../../utils';

export default function SlaConfigPage() {
  usePageTitle('SLA Configuration');

  return (
    <>
      <PageHeader
        title="SLA Configuration"
        subtitle="Turnaround milestone targets, expressed as offsets from scheduled arrival"
      />

      <Card className="shadow-sm">
        <Card.Body>
          <Table hover responsive className="table-sm align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Milestone</th>
                <th>Offset</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {SLA_SCHEDULE.map((m, i) => (
                <tr key={m.type}>
                  <td>{i + 1}</td>
                  <td className="fw-semibold">{humanizeEnum(m.type)}</td>
                  <td>+{m.offsetMinutes} min</td>
                  <td className="text-muted">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
