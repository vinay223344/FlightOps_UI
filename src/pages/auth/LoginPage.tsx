import { IconLock, IconMail, IconPlaneTilt } from '@tabler/icons-react';
import { useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getErrorMessage } from '../../utils/errorUtils';
import { homePathForRole } from '../../utils/roleUtils';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@flightops.in' },
  { role: 'Supervisor', email: 'arjun.verma@blrops.in' },
  { role: 'Coordinator', email: 'priya.nair@airindia.in' },
  { role: 'GSE Manager', email: 'suresh.babu@blrops.in' },
  { role: 'Passenger Agent', email: 'sneha.das@blrops.in' },
  { role: 'Ramp Officer', email: 'vijay.kumar@blrops.in' },
];

export default function LoginPage() {
  usePageTitle('Sign in');
  const { login, isAuthenticated, user, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== 'loading' && isAuthenticated && user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? homePathForRole(user.role)} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter both email and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const authUser = await login({ email: email.trim(), password });
      toast.success('Welcome back!');
      navigate(homePathForRole(authUser.role), { replace: true });
    } catch (err) {
      const message = getErrorMessage(err, 'Invalid email or password.');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={9} lg={7} xl={5}>
            <div className="text-center text-white mb-4">
              <IconPlaneTilt size={44} />
              <h2 className="fw-bold mt-2 mb-0">FlightOps</h2>
              <p className="text-white-50 mb-0">
                Airport Ground Operations Management
              </p>
            </div>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Sign in to your portal</h5>
                {error && (
                  <Alert variant="danger" className="py-2 small">
                    {error}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <IconMail size={18} />
                      </span>
                      <Form.Control
                        type="email"
                        autoComplete="username"
                        placeholder="you@airport.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <IconLock size={18} />
                      </span>
                      <Form.Control
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Signing in…
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </Form>

                <hr className="my-3" />
                <div className="small text-muted">
                  <div className="fw-semibold mb-1">
                    Demo accounts (password: Password@123)
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {DEMO_ACCOUNTS.map((a) => (
                      <Button
                        key={a.email}
                        size="sm"
                        variant="outline-secondary"
                        className="py-0 px-2"
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => {
                          setEmail(a.email);
                          setPassword('Password@123');
                        }}
                        disabled={submitting}
                      >
                        {a.role}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
