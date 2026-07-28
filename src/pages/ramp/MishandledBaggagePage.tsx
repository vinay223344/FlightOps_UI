import { useCallback, useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import { IconPlus, IconReportAnalytics } from '@tabler/icons-react';
import { AsyncSection, PageHeader } from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { mishandledApi } from '../../api/baggageApi';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useMishandled } from '../../hooks/useBaggage';
import { useFlights } from '../../hooks/useFlights';
import { formatDateTime } from '../../utils/dateUtils';
import { humanizeEnum } from '../../utils/formatUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { getStatusVariant } from '../../utils/statusColorUtils';
import { MISHANDLED_STATUSES, MISHANDLED_TYPES } from '../../types';
import type { MishandledStatus, MishandledType } from '../../types';

export default function MishandledBaggagePage() {
  usePageTitle('Mishandled Baggage');
  const toast = useToast();
  const { records, loading, error, reload } = useMishandled();
  const { flights } = useFlights(undefined, false);

  const [showCreate, setShowCreate] = useState(false);
  const [flightId, setFlightId] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [bagTagNumber, setBagTagNumber] = useState('');
  const [mishandleType, setMishandleType] = useState<MishandledType>('Lost');
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setFlightId('');
    setPassengerName('');
    setBagTagNumber('');
    setMishandleType('Lost');
    setShowCreate(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!flightId || !passengerName.trim() || !bagTagNumber.trim()) return;
    setSubmitting(true);
    try {
      await mishandledApi.create({
        flightId,
        passengerName: passengerName.trim(),
        bagTagNumber: bagTagNumber.trim(),
        mishandleType,
      });
      toast.success('Mishandled baggage reported');
      await reload();
      setShowCreate(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [flightId, passengerName, bagTagNumber, mishandleType, toast, reload]);

  const handleStatusChange = useCallback(
    async (id: string, status: MishandledStatus) => {
      setSavingId(id);
      try {
        await mishandledApi.updateStatus(id, status);
        toast.success('Status updated');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setSavingId(null);
      }
    },
    [toast, reload],
  );

  return (
    <>
      <PageHeader
        title="Mishandled Baggage"
        subtitle="Report and trace mishandled bags"
        actions={
          <Button
            variant="primary"
            onClick={openCreate}
            className="d-inline-flex align-items-center gap-1"
          >
            <IconPlus size={16} />
            Report Mishandled
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={records.length > 0}
        isEmpty={records.length === 0}
        onRetry={reload}
        emptyTitle="No mishandled baggage"
        emptyMessage="No mishandled baggage has been reported."
      >
        <Card className="shadow-sm">
          <Card.Header className="bg-white fw-semibold py-3">
            Mishandled Baggage Status
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Bag Tag</th>
                    <th>Passenger</th>
                    <th>Flight</th>
                    <th>Type</th>
                    <th>Reported</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.mishandleId}>
                      <td>{r.bagTagNumber}</td>
                      <td>{r.passengerName}</td>
                      <td>{r.flightNumber}</td>
                      <td>{humanizeEnum(r.mishandleType)}</td>
                      <td>{formatDateTime(r.reportedDate)}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          className={`fo-status-select fo-status-select-${getStatusVariant(r.status)}`}
                          value={r.status}
                          disabled={savingId === r.mishandleId}
                          onChange={(e) =>
                            handleStatusChange(
                              r.mishandleId,
                              e.target.value as MishandledStatus,
                            )
                          }
                        >
                          {MISHANDLED_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {humanizeEnum(s)}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </AsyncSection>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0 d-inline-flex align-items-center gap-1">
            <IconReportAnalytics size={18} />
            Report Mishandled Baggage
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="mishandledFlight">
            <Form.Label>Flight</Form.Label>
            <FlightSelect
              flights={flights}
              value={flightId}
              onChange={setFlightId}
              isInvalid={!flightId}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="mishandledPassenger">
            <Form.Label>Passenger name</Form.Label>
            <Form.Control
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="mishandledBagTag">
            <Form.Label>Bag tag number</Form.Label>
            <Form.Control
              value={bagTagNumber}
              onChange={(e) => setBagTagNumber(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-1" controlId="mishandledType">
            <Form.Label>Mishandle type</Form.Label>
            <Form.Select
              value={mishandleType}
              onChange={(e) =>
                setMishandleType(e.target.value as MishandledType)
              }
            >
              {MISHANDLED_TYPES.map((t) => (
                <option key={t} value={t}>
                  {humanizeEnum(t)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowCreate(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={
              submitting ||
              !flightId ||
              !passengerName.trim() ||
              !bagTagNumber.trim()
            }
          >
            {submitting ? 'Saving…' : 'Report'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
