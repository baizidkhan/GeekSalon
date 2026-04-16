import api from '../base';

export interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  status: string;
}

export function getActiveServices(): Promise<ServiceRecord[]> {
  return api.get<ServiceRecord[]>('/service/active').then((r) => r.data);
}
