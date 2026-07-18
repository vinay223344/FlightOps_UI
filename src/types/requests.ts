/**
 * Request payload interfaces — mirror the backend `requestdto/` package.
 * Fields marked optional map to nullable / non-required backend fields.
 */
import type {
  AssistanceType,
  CounterStatus,
  Direction,
  EquipmentStatus,
  EquipmentType,
  FlightStatus,
  GateStatus,
  MilestoneStatus,
  MilestoneType,
  MishandledStatus,
  MishandledType,
  NotificationCategory,
  RequestStatus,
  Role,
  UserStatus,
} from './enums';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  airportId: string;
  phone: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  airportId: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: Role;
  phone?: string;
  airportId: string;
}

export interface UserStatusRequest {
  status: UserStatus;
}

export interface FlightRequest {
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  aircraftType: string;
  paxCapacity?: number;
  stand?: string;
}

export interface FlightStatusRequest {
  status: FlightStatus;
}

export interface HandlingRequestDto {
  flightId: string;
  airlineId: string;
  /** Comma-separated services, e.g. "Ramp,Baggage,Fuel". */
  serviceTypes: string;
  specialRequirements?: string;
}

export interface HandlingStatusRequest {
  status: RequestStatus;
}

export interface TurnaroundPlanRequest {
  flightId: string;
  targetTurnaroundMinutes: number;
  /** Optional: specific milestone types to include. If empty/absent, backend uses all 10. */
  milestoneTypes?: MilestoneType[];
}

export interface MilestoneCompleteRequest {
  flightId: string,
  actualTime: string;
  notes?: string;
}

/** Not sent to the backend directly but used by the milestone status UI. */
export interface MilestoneStatusRequest {
  status: MilestoneStatus;
}

export interface GroundEquipmentRequest {
  type: EquipmentType;
  registrationNumber: string;
  currentLocation?: string;
}

export interface EquipmentStatusRequest {
  status: EquipmentStatus;
}

export interface EquipmentAllocationRequest {
  equipmentId: string;
  flightId: string;
  allocationTime: string;
  releaseTime?: string;
}

export interface EquipmentMaintenanceRequest {
  equipmentId: string;
  issue: string;
  expectedReturnDate?: string;
}

export interface CheckInCounterRequest {
  counterNumber: string;
  terminal: string;
  flightId: string;
  assignedAgentId?: string;
  openTime: string;
  closeTime?: string;
}

export interface CounterStatusRequest {
  status: CounterStatus;
}

export interface BoardingGateRequest {
  gateNumber: string;
  terminal: string;
  flightId: string;
  assignedAgentId?: string;
  openTime: string;
  closeTime?: string;
}

export interface GateStatusRequest {
  status: GateStatus;
}

export interface SpecialAssistanceRequest {
  flightId: string;
  passengerName: string;
  assistanceType: AssistanceType;
}

export interface AssistanceAssignRequest {
  agentId: string;
}

export interface BaggageOperationRequest {
  flightId: string;
  direction: Direction;
  totalBagsExpected: number;
  startTime: string;
}

export interface BaggageCountRequest {
  totalBagsProcessed: number;
}

export interface MishandledBaggageRequest {
  flightId: string;
  passengerName: string;
  bagTagNumber: string;
  mishandleType: MishandledType;
}

export interface MishandledStatusRequest {
  status: MishandledStatus;
}

export interface NotificationRequest {
  userId: string;
  message: string;
  category: NotificationCategory;
}

export interface AuditLogRequest {
  userEmail: string;
  action: string;
  entityType: string;
}

export interface AuditLogFilters {
  userEmail?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

export interface ReportGenerateRequest {
  scope: string;
  /** LocalDate — "yyyy-MM-dd". */
  fromDate: string;
  /** LocalDate — "yyyy-MM-dd". */
  toDate: string;
}
