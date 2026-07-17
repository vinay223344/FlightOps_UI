/**
 * Response DTO interfaces — mirror the backend `responsedto/` package exactly.
 * All id fields are UUID strings. All `*Time`/`*Date` fields are ISO strings
 * (LocalDateTime → "2026-07-15T09:30:00", LocalDate → "2026-07-15").
 */
import type {
  AllocationStatus,
  AssistanceStatus,
  AssistanceType,
  CounterStatus,
  Direction,
  EquipmentStatus,
  EquipmentType,
  FlightStatus,
  GateStatus,
  MaintenanceStatus,
  MilestoneStatus,
  MilestoneType,
  MishandledStatus,
  MishandledType,
  NotificationCategory,
  NotificationStatus,
  OperationStatus,
  RequestStatus,
  Role,
  TurnaroundStatus,
  UserStatus,
} from './enums';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  role: Role;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  airportId: string | null;
  status: UserStatus;
}

export interface FlightResponse {
  flightId: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  aircraftType: string;
  paxCapacity: number | null;
  stand: string | null;
  status: FlightStatus;
}

export interface HandlingRequestResponse {
  requestId: string;
  flightId: string;
  flightNumber: string;
  airlineId: string;
  /** Comma-separated list of services, e.g. "Ramp,Baggage,Fuel". */
  serviceTypes: string;
  specialRequirements: string | null;
  requestedById: string;
  requestedByName: string;
  status: RequestStatus;
}

export interface TurnaroundMilestoneResponse {
  milestoneId: string;
  planId: string;
  milestoneType: MilestoneType;
  plannedTime: string;
  actualTime: string | null;
  completedById: string | null;
  completedByName: string | null;
  status: MilestoneStatus;
  /** Jackson serialises the boolean getter as `delayed`; `isDelayed` kept as fallback. */
  delayed?: boolean;
  isDelayed?: boolean;
  delayMinutes: number | null;
}

export interface TurnaroundPlanResponse {
  planId: string;
  flightId: string;
  flightNumber: string;
  stand: string | null;
  targetTurnaroundMinutes: number;
  actualTurnaroundMinutes: number | null;
  supervisorId: string | null;
  supervisorName: string | null;
  status: TurnaroundStatus;
  milestones: TurnaroundMilestoneResponse[];
}

export interface GroundEquipmentResponse {
  equipmentId: string;
  type: EquipmentType;
  registrationNumber: string;
  currentLocation: string | null;
  status: EquipmentStatus;
}

export interface EquipmentAllocationResponse {
  allocationId: string;
  equipmentId: string;
  registrationNumber: string;
  equipmentType: EquipmentType;
  flightId: string;
  flightNumber: string;
  allocatedById: string | null;
  allocatedByName: string | null;
  allocationTime: string;
  releaseTime: string | null;
  status: AllocationStatus;
}

export interface EquipmentMaintenanceResponse {
  maintenanceId: string;
  equipmentId: string;
  registrationNumber: string;
  issue: string;
  reportedById: string | null;
  reportedByName: string | null;
  reportedDate: string;
  expectedReturnDate: string | null;
  status: MaintenanceStatus;
}

export interface CheckInCounterResponse {
  counterId: string;
  counterNumber: string;
  terminal: string;
  flightId: string;
  flightNumber: string;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  openTime: string;
  closeTime: string | null;
  status: CounterStatus;
}

export interface BoardingGateResponse {
  gateId: string;
  gateNumber: string;
  terminal: string;
  flightId: string;
  flightNumber: string;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  openTime: string;
  closeTime: string | null;
  status: GateStatus;
}

export interface SpecialAssistanceResponse {
  assistanceId: string;
  flightId: string;
  flightNumber: string;
  passengerName: string;
  assistanceType: AssistanceType;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  status: AssistanceStatus;
}

export interface BaggageOperationResponse {
  operationId: string;
  flightId: string;
  flightNumber: string;
  direction: Direction;
  totalBagsExpected: number;
  totalBagsProcessed: number | null;
  discrepancy: number | null;
  operatorId: string | null;
  operatorName: string | null;
  startTime: string;
  endTime: string | null;
  status: OperationStatus;
}

export interface MishandledBaggageResponse {
  mishandleId: string;
  flightId: string;
  flightNumber: string;
  passengerName: string;
  bagTagNumber: string;
  mishandleType: MishandledType;
  reportedDate: string;
  status: MishandledStatus;
}

export interface NotificationResponse {
  notificationId: string;
  userId: string;
  userName: string;
  message: string;
  category: NotificationCategory;
  status: NotificationStatus;
  createdDate: string;
}

export interface AuditLogResponse {
  auditId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  timestamp: string;
}

export interface DashboardMetricsResponse {
  date: string;
  totalFlightsHandled: number;
  onTimeTurnarounds: number;
  delayedTurnarounds: number;
  onTimeRatePercent: number;
  avgTurnaroundMinutes: number;
  totalEquipment: number;
  allocatedEquipment: number;
  gseUtilisationPercent: number;
  totalBaggageOps: number;
  discrepancyOps: number;
  baggageDiscrepancyRatePercent: number;
  slaBreachCount: number;
  mishandledBagsReported: number;
  openAssistanceRequests: number;
}

/** `metrics` is a JSON string (a serialised DashboardMetricsResponse). */
export interface GroundOpsReportResponse {
  reportId: string;
  scope: string;
  metrics: string;
  generatedDate: string;
}

/** Loosely-typed report maps returned by the /api/reports/* endpoints. */
export type ReportMetricsMap = Record<string, number>;
