import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../utils/roleUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

import AdminLayout from '../layouts/AdminLayout';
import CoordinatorLayout from '../layouts/CoordinatorLayout';
import SupervisorLayout from '../layouts/SupervisorLayout';
import GseLayout from '../layouts/GseLayout';
import PassengerLayout from '../layouts/PassengerLayout';
import RampLayout from '../layouts/RampLayout';

import LoginPage from '../pages/auth/LoginPage';
import NotAuthorizedPage from '../pages/shared/NotAuthorizedPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import FlightSchedulePage from '../pages/admin/FlightSchedulePage';
import SlaConfigPage from '../pages/admin/SlaConfigPage';
import AuditLogPage from '../pages/admin/AuditLogPage';
import ReportsPage from '../pages/admin/ReportsPage';

import CoordinatorDashboardPage from '../pages/coordinator/CoordinatorDashboardPage';
import HandlingRequestsPage from '../pages/coordinator/HandlingRequestsPage';
import TurnaroundViewPage from '../pages/coordinator/TurnaroundViewPage';

import SupervisorDashboardPage from '../pages/supervisor/SupervisorDashboardPage';
import HandlingQueuePage from '../pages/supervisor/HandlingQueuePage';
import TurnaroundManagePage from '../pages/supervisor/TurnaroundManagePage';
import TurnaroundDetailPage from '../pages/supervisor/TurnaroundDetailPage';
import DelayFlagsPage from '../pages/supervisor/DelayFlagsPage';

import GseDashboardPage from '../pages/gse/GseDashboardPage';
import EquipmentListPage from '../pages/gse/EquipmentListPage';
import AllocationsPage from '../pages/gse/AllocationsPage';
import MaintenancePage from '../pages/gse/MaintenancePage';

import PassengerDashboardPage from '../pages/passenger/PassengerDashboardPage';
import CheckInCountersPage from '../pages/passenger/CheckInCountersPage';
import BoardingGatesPage from '../pages/passenger/BoardingGatesPage';
import SpecialAssistancePage from '../pages/passenger/SpecialAssistancePage';

import RampDashboardPage from '../pages/ramp/RampDashboardPage';
import MilestoneChecklistPage from '../pages/ramp/MilestoneChecklistPage';
import BaggageOperationsPage from '../pages/ramp/BaggageOperationsPage';
import MishandledBaggagePage from '../pages/ramp/MishandledBaggagePage';

/** Sends the visitor to their role home or to login. */
function RootRedirect() {
  const { status, isAuthenticated, user } = useAuth();
  if (status === 'loading') {
    return <LoadingSpinner fullHeight label="Loading FlightOps…" />;
  }
  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/not-authorized" element={<NotAuthorizedPage />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <RoleRoute allow={['Admin']}>
              <AdminLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="flights" element={<FlightSchedulePage />} />
        <Route path="sla-config" element={<SlaConfigPage />} />
        <Route path="audit" element={<AuditLogPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* Airline Coordinator */}
      <Route
        path="/coordinator"
        element={
          <PrivateRoute>
            <RoleRoute allow={['AirlineCoordinator']}>
              <CoordinatorLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<CoordinatorDashboardPage />} />
        <Route path="handling-requests" element={<HandlingRequestsPage />} />
        <Route path="turnaround-view" element={<TurnaroundViewPage />} />
      </Route>

      {/* Ground Supervisor */}
      <Route
        path="/supervisor"
        element={
          <PrivateRoute>
            <RoleRoute allow={['GroundSupervisor']}>
              <SupervisorLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<SupervisorDashboardPage />} />
        <Route path="handling-queue" element={<HandlingQueuePage />} />
        <Route path="turnarounds" element={<TurnaroundManagePage />} />
        <Route path="turnarounds/:id" element={<TurnaroundDetailPage />} />
        <Route path="delay-flags" element={<DelayFlagsPage />} />
      </Route>

      {/* GSE Manager */}
      <Route
        path="/gse"
        element={
          <PrivateRoute>
            <RoleRoute allow={['GSEManager']}>
              <GseLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<GseDashboardPage />} />
        <Route path="equipment" element={<EquipmentListPage />} />
        <Route path="allocations" element={<AllocationsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
      </Route>

      {/* Passenger Agent */}
      <Route
        path="/passenger"
        element={
          <PrivateRoute>
            <RoleRoute allow={['PassengerAgent']}>
              <PassengerLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<PassengerDashboardPage />} />
        <Route path="counters" element={<CheckInCountersPage />} />
        <Route path="gates" element={<BoardingGatesPage />} />
        <Route path="assistance" element={<SpecialAssistancePage />} />
      </Route>

      {/* Ramp Officer */}
      <Route
        path="/ramp"
        element={
          <PrivateRoute>
            <RoleRoute allow={['RampOfficer']}>
              <RampLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<RampDashboardPage />} />
        <Route path="milestones/:planId" element={<MilestoneChecklistPage />} />
        <Route path="baggage" element={<BaggageOperationsPage />} />
        <Route path="mishandled" element={<MishandledBaggagePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
