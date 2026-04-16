import api from '../base';

export interface DashboardAppointment {
  id: string;
  clientName: string;
  time: string;
  services: string[];
  status: string;
  staff: string | null;
}

export interface LowStockItem {
  id: string;
  name: string;
  category: string;
  stockQty: number;
  minStockLevel: number;
}

export interface RevenueTrendPoint {
  day: string;
  revenue: number;
}

export interface AppointmentTrendPoint {
  week: string;
  appointments: number;
}

export interface TopService {
  name: string;
  count: number;
}

export interface DashboardStats {
  todaysAppointmentsCount: number;
  todaysAppointments: DashboardAppointment[];
  weeklyRevenue: number;
  totalClientsThisMonth: number;
  activeServicesCount: number;
  onlineBookingsThisMonth: number;
  walkInsThisMonth: number;
  activeEmployeesCount: number;
  lowStockItemsCount: number;
  lowStockItems: LowStockItem[];
  revenueTrend: RevenueTrendPoint[];
  appointmentTrends: AppointmentTrendPoint[];
  topServices: TopService[];
}

export function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>('/dashboard').then((r) => r.data);
}
