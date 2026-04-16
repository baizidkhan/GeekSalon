import api from '../base';

export interface EmployeeBasic {
  id: string;
  name: string;
  role: string;
}

export function getBasicEmployees(): Promise<EmployeeBasic[]> {
  return api.get<EmployeeBasic[]>('/employee/basic').then((r) => r.data);
}
