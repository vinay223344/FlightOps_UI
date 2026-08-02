import { useCallback, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { IconPlus } from '@tabler/icons-react';
import {
  AsyncSection,
  ConfirmDialog,
  PageHeader,
  Pagination,
  StatusBadge,
} from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useUsers } from '../../hooks/useUsers';
import { useConfirm } from '../../hooks/useConfirm';
import { usersApi } from '../../api/usersApi';
import { ROLES } from '../../types';
import type { CreateUserRequest, Role, UserResponse } from '../../types';
import { getErrorMessage, humanizeEnum } from '../../utils';

interface CreateForm {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  airportId: string;
}

const EMPTY_FORM: CreateForm = {
  name: '',
  email: '',
  password: '',
  role: 'RampOfficer',
  phone: '',
  airportId: '',
};

export default function UserManagementPage() {
  usePageTitle('User Management');
  const toast = useToast();
  const [page, setPage] = useState(1);
  const { users, totalPages, currentPage, loading, error, reload } =
    useUsers(page, 10);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM);
    setValidated(false);
    setShowCreate(true);
  }, []);

  const closeCreate = useCallback(() => {
    if (submitting) return;
    setShowCreate(false);
  }, [submitting]);

  const handleCreate = useCallback(async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.airportId.trim()
    ) {
      setValidated(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateUserRequest = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        airportId: form.airportId.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      };
      await usersApi.create(payload);
      toast.success('User created');
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [form, toast, reload]);

  const handleToggleStatus = useCallback(
    async (user: UserResponse) => {
      const deactivate = user.status !== 'Inactive';
      if (deactivate) {
        const ok = await confirm({
          body: `Deactivate ${user.name}?`,
          variant: 'danger',
          confirmLabel: 'Deactivate',
        });
        if (!ok) return;
      }
      setStatusBusy(true);
      try {
        await usersApi.updateStatus(
          user.userId,
          deactivate ? 'Inactive' : 'Active',
        );
        toast.success(deactivate ? 'User deactivated' : 'User activated');
        await reload();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setStatusBusy(false);
      }
    },
    [confirm, toast, reload],
  );

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Create and manage FlightOps user accounts"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus size={18} className="me-1" />
            New User
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        hasData={users.length > 0}
        isEmpty={users.length === 0}
        onRetry={reload}
        emptyTitle="No users"
        emptyMessage="No user accounts have been created yet."
      >
        <Table hover responsive className="table-sm align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Airport</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td className="fw-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td>{humanizeEnum(u.role)}</td>
                <td>{u.phone ?? '—'}</td>
                <td>{u.airportId ?? '—'}</td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant={
                      u.status !== 'Inactive'
                        ? 'outline-danger'
                        : 'outline-success'
                    }
                    disabled={statusBusy}
                    onClick={() => handleToggleStatus(u)}
                  >
                    {u.status !== 'Inactive' ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AsyncSection>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal show={showCreate} onHide={closeCreate} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                isInvalid={validated && !form.name.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Name is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                isInvalid={validated && !form.email.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Email is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                isInvalid={validated && !form.password.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Password is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {humanizeEnum(r)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone (optional)</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Airport ID</Form.Label>
              <Form.Control
                value={form.airportId}
                onChange={(e) =>
                  setForm({ ...form, airportId: e.target.value })
                }
                isInvalid={validated && !form.airportId.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Airport ID is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeCreate} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        {...confirmState}
        onConfirm={onConfirm}
        onCancel={onCancel}
        busy={statusBusy}
      />
    </>
  );
}
