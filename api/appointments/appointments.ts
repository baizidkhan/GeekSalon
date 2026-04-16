import api from '../base';

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
  return api.get<AppointmentListResponse>(`/appointments?${params}`).then((r) => r.data);
}

export function createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentRecord> {
  return api.post<AppointmentRecord>('/appointments', payload).then((r) => r.data);
}

export function updateAppointment(
  phone: string,
  payload: Partial<CreateAppointmentPayload>,
): Promise<AppointmentRecord[]> {
  return api
    .patch<AppointmentRecord[]>(`/appointments/${encodeURIComponent(phone)}`, payload)
    .then((r) => r.data);
}

export function deleteAppointment(id: string): Promise<unknown> {
  return api.delete(`/appointments/${id}`).then((r) => r.data);
}
