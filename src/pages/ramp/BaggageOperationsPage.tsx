import { useCallback, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  ProgressBar,
  Row,
} from 'react-bootstrap';
import {
  IconCircleCheck,
  IconEdit,
  IconLuggage,
  IconPlus,
} from '@tabler/icons-react';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import FlightSelect from '../../components/flight/FlightSelect';
import { baggageApi } from '../../api/baggageApi';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useBaggageOps } from '../../hooks/useBaggage';
import { useFlights } from '../../hooks/useFlights';
import { useConfirm } from '../../hooks/useConfirm';
import { fromDateTimeLocalInput, nowForInput } from '../../utils/dateUtils';
import { humanizeEnum, toPercent } from '../../utils/formatUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { DIRECTIONS } from '../../types';
import type {
  BaggageOperationResponse,
  Direction,
} from '../../types';

export default function BaggageOperationsPage() {
  usePageTitle('Baggage Operations');
  const toast = useToast();
  const { operations, loading, error, reload } = useBaggageOps();
  const { flights } = useFlights(undefined, false);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();

  const [busy, setBusy] = useState(false);

  // New operation modal state
  const [showCreate, setShowCreate] = useState(false);
  const [flightId, setFlightId] = useState('');
  const [direction, setDirection] = useState<Direction>('Inbound');
  const [expected, setExpected] = useState('');
  const [startTime, setStartTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Update count modal state
  const [countTarget, setCountTarget] =
    useState<BaggageOperationResponse | null>(null);
  const [countValue, setCountValue] = useState('');

  const openCreate = useCallback(() => {
    setFlightId('');
    setDirection('Inbound');
    setExpected('');
    setStartTime(nowForInput());
    setShowCreate(true);
  }, []);

  const handleCreate = useCallback(async () => {
    const expectedNum = Number(expected);
    if (!flightId || !expectedNum || expectedNum <= 0 || !startTime) return;
    setSubmitting(true);
    try {
      await baggageApi.create({
        flightId,
        direction,
        totalBagsExpected: expectedNum,
        startTime: fromDateTimeLocalInput(startTime),
      });
      toast.success('Baggage operation created');
      await reload();
      setShowCreate(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [flightId, direction, expected, startTime, toast, reload]);

  const openCount = useCallback((op: BaggageOperationResponse) => {
    setCountTarget(op);
    setCountValue(String(op.totalBagsProcessed ?? 0));
  }, []);

  const handleUpdateCount = useCallback(async () => {
    if (!countTarget) return;
    const value = Number(countValue);
    if (Number.isNaN(value) || value < 0) return;
    setSubmitting(true);
    try {
      await baggageApi.updateCount(countTarget.operationId, value);
      toast.success('Count updated');
      await reload();
      setCountTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [countTarget, countValue, toast, reload]);

  const handleComplete = useCallback(
    async (op: BaggageOperationResponse) => {
      const ok = await confirm({
        body: `Mark baggage operation for ${op.flightNumber} as completed?`,
        confirmLabel: 'Complete',
      });
      if (!ok) return;
      setBusy(true);
      try {
        await baggageApi.complete(op.operationId);
        toast.success('Operation completed');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [confirm, toast, reload],
  );

  return (
    <>
      <PageHeader
        title="Baggage Operations"
        subtitle="Track baggage handling per flight"
        actions={
          <Button
            variant="primary"
            onClick={openCreate}
            className="d-inline-flex align-items-center gap-1"
          >
            <IconPlus size={16} />
            New Operation
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={operations.length > 0}
        isEmpty={operations.length === 0}
        onRetry={reload}
        emptyTitle="No baggage operations"
        emptyMessage="Create a baggage operation to get started."
      >
        <Row className="g-3">
          {operations.map((op) => {
            const processed = op.totalBagsProcessed ?? 0;
            const remaining = op.totalBagsExpected - processed;
            return (
              <Col md={6} key={op.operationId}>
                <Card className="h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold d-inline-flex align-items-center gap-1">
                      <IconLuggage size={18} />
                      {op.flightNumber} · {humanizeEnum(op.direction)}
                    </span>
                    <StatusBadge status={op.status} />
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between small mb-2">
                      <span>Expected: {op.totalBagsExpected}</span>
                      <span>Processed: {processed}</span>
                      <span>Remaining: {remaining}</span>
                    </div>
                    <ProgressBar
                      now={toPercent(processed, op.totalBagsExpected)}
                      label={`${toPercent(processed, op.totalBagsExpected)}%`}
                    />
                    {op.discrepancy != null && op.discrepancy !== 0 && (
                      <div className="text-danger small mt-2">
                        Discrepancy: {op.discrepancy}
                      </div>
                    )}
                    {op.status !== 'Completed' && (
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => openCount(op)}
                          className="d-inline-flex align-items-center gap-1"
                        >
                          <IconEdit size={16} />
                          Update count
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleComplete(op)}
                          disabled={busy}
                          className="d-inline-flex align-items-center gap-1"
                        >
                          <IconCircleCheck size={16} />
                          Complete
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </AsyncSection>

      {/* New operation modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">New Baggage Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="baggageFlight">
            <Form.Label>Flight</Form.Label>
            <FlightSelect
              flights={flights}
              value={flightId}
              onChange={setFlightId}
              isInvalid={!flightId}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="baggageDirection">
            <Form.Label>Direction</Form.Label>
            <Form.Select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
            >
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {humanizeEnum(d)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="baggageExpected">
            <Form.Label>Total bags expected</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              isInvalid={expected !== '' && Number(expected) <= 0}
            />
          </Form.Group>
          <Form.Group className="mb-1" controlId="baggageStart">
            <Form.Label>Start time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              isInvalid={!startTime}
            />
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
              submitting || !flightId || Number(expected) <= 0 || !startTime
            }
          >
            {submitting ? 'Saving…' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update count modal */}
      <Modal
        show={countTarget !== null}
        onHide={() => setCountTarget(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">Update processed count</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="baggageCount">
            <Form.Label>Total bags processed</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={countValue}
              onChange={(e) => setCountValue(e.target.value)}
              isInvalid={countValue !== '' && Number(countValue) < 0}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setCountTarget(null)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateCount}
            disabled={submitting || countValue === '' || Number(countValue) < 0}
          >
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        {...confirmState}
        onConfirm={onConfirm}
        onCancel={onCancel}
        busy={busy}
      />
    </>
  );
}
