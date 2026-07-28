/**
 * All backend enums as TypeScript union types plus runtime value arrays.
 * Values are the EXACT PascalCase identifiers the backend serializes
 * (e.g. `Fuelling` British spelling, `GPU`, `GSEManager`, `OutOfService`).
 */

export type Role =
  | 'Admin'
  | 'AirlineCoordinator'
  | 'GroundSupervisor'
  | 'GSEManager'
  | 'PassengerAgent'
  | 'RampOfficer';
export const ROLES: Role[] = [
  'Admin',
  'AirlineCoordinator',
  'GroundSupervisor',
  'GSEManager',
  'PassengerAgent',
  'RampOfficer',
];

export type UserStatus = 'Active' | 'Inactive' | 'OnShift';
export const USER_STATUSES: UserStatus[] = ['Active', 'Inactive', 'OnShift'];

export type FlightStatus =
  | 'Scheduled'
  | 'Arrived'
  | 'Departed'
  | 'Delayed'
  | 'Diverted'
  | 'Cancelled';
export const FLIGHT_STATUSES: FlightStatus[] = [
  'Scheduled',
  'Arrived',
  'Departed',
  'Delayed',
  'Diverted',
  'Cancelled',
];

export type RequestStatus =
  | 'Received'
  | 'Confirmed'
  | 'InProgress'
  | 'Completed'
  | 'Disputed';
export const REQUEST_STATUSES: RequestStatus[] = [
  'Received',
  'Confirmed',
  'InProgress',
  'Completed',
  'Disputed',
];

export type TurnaroundStatus = 'Active' | 'Delayed' | 'Completed';
export const TURNAROUND_STATUSES: TurnaroundStatus[] = [
  'Active',
  'Delayed',
  'Completed',
];

export type MilestoneType =
  | 'ChocksOn'
  | 'DoorOpen'
  | 'StairsDocked'
  | 'BaggageOffload'
  | 'Cleaning'
  | 'Catering'
  | 'Fuelling'
  | 'BoardingComplete'
  | 'DoorClose'
  | 'PushbackClearance';
export const MILESTONE_TYPES: MilestoneType[] = [
  'ChocksOn',
  'DoorOpen',
  'StairsDocked',
  'BaggageOffload',
  'Cleaning',
  'Catering',
  'Fuelling',
  'BoardingComplete',
  'DoorClose',
  'PushbackClearance',
];

export type MilestoneStatus = 'Pending' | 'Completed' | 'Delayed';
export const MILESTONE_STATUSES: MilestoneStatus[] = [
  'Pending',
  'Completed',
  'Delayed',
];

export type EquipmentType =
  | 'StairsTruck'
  | 'BaggageBelt'
  | 'BusTractor'
  | 'GPU'
  | 'AirStarter'
  | 'TowTractor'
  | 'Catering';
export const EQUIPMENT_TYPES: EquipmentType[] = [
  'StairsTruck',
  'BaggageBelt',
  'BusTractor',
  'GPU',
  'AirStarter',
  'TowTractor',
  'Catering',
];

export type EquipmentStatus =
  | 'Available'
  | 'Allocated'
  | 'Maintenance'
  | 'OutOfService';
export const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  'Available',
  'Allocated',
  'Maintenance',
  'OutOfService',
];

export type AllocationStatus = 'Allocated' | 'Released' | 'Extended';
export const ALLOCATION_STATUSES: AllocationStatus[] = [
  'Allocated',
  'Released',
  'Extended',
];

export type MaintenanceStatus =
  | 'Reported'
  | 'InMaintenance'
  | 'ReturnedToService';
export const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  'Reported',
  'InMaintenance',
  'ReturnedToService',
];

export type CounterStatus = 'Open' | 'Closed' | 'Standby';
export const COUNTER_STATUSES: CounterStatus[] = ['Open', 'Closed', 'Standby'];

export type GateStatus = 'Open' | 'Boarding' | 'Closed' | 'HoldRoom';
export const GATE_STATUSES: GateStatus[] = [
  'Open',
  'Boarding',
  'Closed',
  'HoldRoom',
];

export type AssistanceType =
  | 'WheelchairToGate'
  | 'UnaccompaniedMinor'
  | 'MedicalCase'
  | 'StretcherCase';
export const ASSISTANCE_TYPES: AssistanceType[] = [
  'WheelchairToGate',
  'UnaccompaniedMinor',
  'MedicalCase',
  'StretcherCase',
];

export type AssistanceStatus = 'Requested' | 'Assigned' | 'Completed';
export const ASSISTANCE_STATUSES: AssistanceStatus[] = [
  'Requested',
  'Assigned',
  'Completed',
];

export type Direction = 'Outbound';
export const DIRECTIONS: Direction[] = ['Outbound'];

export type OperationStatus = 'InProgress' | 'Completed' | 'Discrepancy';
export const OPERATION_STATUSES: OperationStatus[] = [
  'InProgress',
  'Completed',
  'Discrepancy',
];

export type MishandledType = 'Lost' | 'Delayed' | 'Damaged' | 'PilferedContent';
export const MISHANDLED_TYPES: MishandledType[] = [
  'Lost',
  'Delayed',
  'Damaged',
  'PilferedContent',
];

export type MishandledStatus =
  | 'Reported'
  | 'Traced'
  | 'Recovered'
  | 'Claimed'
  | 'ClosedUnresolved';
export const MISHANDLED_STATUSES: MishandledStatus[] = [
  'Reported',
  'Traced',
  'Recovered',
  'Claimed',
  'ClosedUnresolved',
];

export type NotificationCategory =
  | 'FlightSchedule'
  | 'Turnaround'
  | 'Equipment'
  | 'Passenger'
  | 'Baggage';
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'FlightSchedule',
  'Turnaround',
  'Equipment',
  'Passenger',
  'Baggage',
];

export type NotificationStatus = 'Unread' | 'Read' | 'Dismissed';
export const NOTIFICATION_STATUSES: NotificationStatus[] = [
  'Unread',
  'Read',
  'Dismissed',
];
