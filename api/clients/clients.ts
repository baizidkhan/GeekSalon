import api from '../base';

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  preferredStylist: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListResponse {
  data: ClientRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getClients(page = 1, limit = 200): Promise<ClientListResponse> {
  return api.get<ClientListResponse>(`/clients?page=${page}&limit=${limit}`).then((r) => r.data);
}

export function createClient(
  payload: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ClientRecord> {
  return api.post<ClientRecord>('/clients', payload).then((r) => r.data);
}

export function updateClient(id: string, payload: Partial<ClientRecord>): Promise<ClientRecord> {
  return api.patch<ClientRecord>(`/clients/${id}`, payload).then((r) => r.data);
}

export function deleteClient(id: string): Promise<unknown> {
  return api.delete(`/clients/${id}`).then((r) => r.data);
}
