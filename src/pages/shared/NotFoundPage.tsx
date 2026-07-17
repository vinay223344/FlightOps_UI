import { IconError404 } from '@tabler/icons-react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { homePathForRole } from '../../utils/roleUtils';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <Container className="text-center py-5">
      <IconError404 size={72} className="text-secondary mb-3" />
      <h3 className="fw-bold">Page not found</h3>
      <p className="text-muted">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Button
        variant="primary"
        onClick={() =>
          navigate(
            isAuthenticated && user ? homePathForRole(user.role) : '/login',
            { replace: true },
          )
        }
      >
        Go home
      </Button>
    </Container>
  );
}
