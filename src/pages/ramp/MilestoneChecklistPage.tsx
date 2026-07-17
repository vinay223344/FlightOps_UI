import { useCallback, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AsyncSection, PageHeader } from '../../components/common';
import MilestoneTimeline from '../../components/turnaround/MilestoneTimeline';
import { milestonesApi } from '../../api/turnaroundsApi';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useMilestones } from '../../hooks/useTurnarounds';
import { fromDateTimeLocalInput, nowForInput } from '../../utils/dateUtils';
import { humanizeEnum } from '../../utils/formatUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import type { TurnaroundMilestoneResponse } from '../../types';

export default function MilestoneChecklistPage() {
  usePageTitle('Milestone Checklist');
  const toast = useToast();
  const { planId } = useParams<{ planId: string }>();
  const { milestones, loading, error, reload } = useMilestones(planId);

  const [active, setActive] = useState<TurnaroundMilestoneResponse | null>(null);
  const [actualTime, setActualTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openLog = useCallback((m: TurnaroundMilestoneResponse) => {
    setActive(m);
    setActualTime(nowForInput());
    setNotes('');
  }, []);

  const closeModal = useCallback(() => {
    setActive(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!active || !actualTime) return;
    setSubmitting(true);
    try {
      await milestonesApi.complete(active.milestoneId, {
        actualTime: fromDateTimeLocalInput(actualTime),
        notes: notes.trim() || undefined,
      });
      toast.success('Milestone completion logged');
      await reload();
      setActive(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [active, actualTime, notes, toast, reload]);

  return (
    <>
      <PageHeader
        title="Milestone Checklist"
        crumbs={[
          { label: 'Dashboard', to: '/ramp' },
          { label: 'Checklist' },
        ]}
      />
      <AsyncSection
        loading={loading}
        error={error}
        hasData={milestones.length > 0}
        isEmpty={milestones.length === 0}
        onRetry={reload}
        emptyTitle="No milestones"
        emptyMessage="This turnaround has no milestones."
      >
        <MilestoneTimeline
          milestones={milestones}
          renderAction={(m) =>
            m.status === 'Pending' ? (
              <Button size="sm" onClick={() => openLog(m)}>
                Log completion
              </Button>
            ) : null
          }
        />
      </AsyncSection>

      <Modal show={active !== null} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">
            Log completion
            {active && <> · {humanizeEnum(active.milestoneType)}</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="milestoneActualTime">
            <Form.Label>Actual time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              isInvalid={!actualTime}
            />
            <Form.Control.Feedback type="invalid">
              Actual time is required.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-1" controlId="milestoneNotes">
            <Form.Label>Notes (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting || !actualTime}
          >
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
