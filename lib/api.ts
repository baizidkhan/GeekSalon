const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────
export interface LoginPayload {
  useremail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    useremail: string;
    role: string;
    permissions: string[];
  };
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
}

// ── Dashboard ──────────────────────────────────────────────────
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
  return apiFetch<DashboardStats>('/dashboard');
}

// ── Appointments ───────────────────────────────────────────────
export interface AppointmentRecord {
  id: string;
  clientName: string;
  phoneNumber: string;
  date: string;
  time: string;
  staff: string | null;
  assistant: string | null;
  source: string;
  services: string[] | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListResponse {
  data: AppointmentRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAppointmentPayload {
  clientName: string;
  phoneNumber: string;
  date: string;
  time: string;
  staff?: string;
  assistant?: string;
  source?: string;
  services?: string[];
  notes?: string;
  status?: string;
}

export function getAppointments(
  filters?: { date?: string; source?: string; status?: string; phone?: string },
  page = 1,
  limit = 200,
): Promise<AppointmentListResponse> {
  const params = new URLSearchParams();
  if (filters?.date) params.set('date', filters.date);
  if (filters?.source) params.set('source', filters.source);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.phone) params.set('phone', filters.phone);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return apiFetch<AppointmentListResponse>(`/appointments?${params}`);
}

export function createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentRecord> {
  return apiFetch<AppointmentRecord>('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAppointment(
  phone: string,
  payload: Partial<CreateAppointmentPayload>,
): Promise<AppointmentRecord[]> {
  return apiFetch<AppointmentRecord[]>(`/appointments/${encodeURIComponent(phone)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAppointment(id: string): Promise<unknown> {
  return apiFetch<unknown>(`/appointments/${id}`, { method: 'DELETE' });
}

// ── Services (public) ──────────────────────────────────────────
export interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  status: string;
}

export function getActiveServices(): Promise<ServiceRecord[]> {
  return apiFetch<ServiceRecord[]>('/service/active');
}

// ── Employees (public basic) ───────────────────────────────────
export interface EmployeeBasic {
  id: string;
  name: string;
  role: string;
}

export function getBasicEmployees(): Promise<EmployeeBasic[]> {
  return apiFetch<EmployeeBasic[]>('/employee/basic');
}
