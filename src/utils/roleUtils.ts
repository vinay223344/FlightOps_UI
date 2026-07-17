import type { Role } from '../types';

/** Landing route for each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  Admin: '/admin',
  AirlineCoordinator: '/coordinator',
  GroundSupervisor: '/supervisor',
  GSEManager: '/gse',
  PassengerAgent: '/passenger',
  RampOfficer: '/ramp',
};

/** Human-friendly role names. */
export const ROLE_LABEL: Record<Role, string> = {
  Admin: 'Administrator',
  AirlineCoordinator: 'Airline Coordinator',
  GroundSupervisor: 'Ground Supervisor',
  GSEManager: 'GSE Manager',
  PassengerAgent: 'Passenger Agent',
  RampOfficer: 'Ramp Officer',
};

export function homePathForRole(role: Role): string {
  return ROLE_HOME[role] ?? '/login';
}

export function roleLabel(role: Role | null | undefined): string {
  return role ? ROLE_LABEL[role] : '';
}

export function hasAnyRole(role: Role | null | undefined, allowed: Role[]): boolean {
  return !!role && allowed.includes(role);
}
