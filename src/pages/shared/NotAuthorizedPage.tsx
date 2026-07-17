import { IconShieldLock } from '@tabler/icons-react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { homePathForRole } from '../../utils/roleUtils';

export default function NotAuthorizedPage() {
  usePageTitle('Not authorised');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container className="text-center py-5">
      <IconShieldLock size={64} className="text-warning mb-3" />
      <h3 className="fw-bold">Access denied</h3>
      <p className="text-muted">
        Your role doesn't have permission to view this page.
      </p>
      <Button
        variant="primary"
        onClick={() =>
          navigate(user ? homePathForRole(user.role) : '/login', {
            replace: true,
          })
        }
      >
        Back to my portal
      </Button>
    </Container>
  );
}
