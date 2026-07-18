import {
  IconAdjustmentsAlt,
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconClipboardList,
  IconClipboardText,
  IconDashboard,
  IconDoorEnter,
  IconFileReport,
  IconHistory,
  IconLuggage,
  IconPlane,
  IconProgressCheck,
  IconReportAnalytics,
  IconTicket,
  IconTool,
  IconTruckDelivery,
  IconUsers,
  IconWheelchair,
  type Icon,
} from '@tabler/icons-react';
import type { Role } from '../types';

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** `true` for the section index route so NavLink `end` matching is correct. */
  end?: boolean;
}

export const ROLE_NAV: Record<Role, NavItem[]> = {
  Admin: [
    { label: 'Dashboard', to: '/admin', icon: IconDashboard, end: true },
    { label: 'Users', to: '/admin/users', icon: IconUsers },
    { label: 'Flight Schedule', to: '/admin/flights', icon: IconPlane },
    { label: 'SLA Config', to: '/admin/sla-config', icon: IconAdjustmentsAlt },
    { label: 'Audit Log', to: '/admin/audit', icon: IconHistory },
  ],
  AirlineCoordinator: [
    { label: 'Dashboard', to: '/coordinator', icon: IconDashboard, end: true },
    {
      label: 'Handling Requests',
      to: '/coordinator/handling-requests',
      icon: IconClipboardList,
    },
    {
      label: 'Turnaround View',
      to: '/coordinator/turnaround-view',
      icon: IconProgressCheck,
    },
  ],
  GroundSupervisor: [
    { label: 'Dashboard', to: '/supervisor', icon: IconDashboard, end: true },
    {
      label: 'Handling Requests',
      to: '/supervisor/handling-queue',
      icon: IconClipboardText,
    },
    {
      label: 'Turnarounds',
      to: '/supervisor/turnarounds',
      icon: IconProgressCheck,
    },
    {
      label: 'Delay Flags',
      to: '/supervisor/delay-flags',
      icon: IconAlertTriangle,
    },
    // {
    //   label: 'Special Assistance',
    //   to: '/supervisor/assistance',
    //   icon: IconWheelchair,
    // },
  ],
  GSEManager: [
    { label: 'Dashboard', to: '/gse', icon: IconDashboard, end: true },
    { label: 'Allocations', to: '/gse/allocations', icon: IconTruckDelivery },
    { label: 'Maintenance', to: '/gse/maintenance', icon: IconTool },
  ],
  PassengerAgent: [
    { label: 'Dashboard', to: '/passenger', icon: IconDashboard, end: true },
    { label: 'Check-in Counters', to: '/passenger/counters', icon: IconTicket },
    { label: 'Boarding Gates', to: '/passenger/gates', icon: IconDoorEnter },
    {
      label: 'Special Assistance',
      to: '/passenger/assistance',
      icon: IconWheelchair,
    },
  ],
  RampOfficer: [
    { label: 'Dashboard', to: '/ramp', icon: IconDashboard, end: true },
    { label: 'Baggage Ops', to: '/ramp/baggage', icon: IconLuggage },
    {
      label: 'Mishandled Bags',
      to: '/ramp/mishandled',
      icon: IconReportAnalytics,
    },
  ],
};
