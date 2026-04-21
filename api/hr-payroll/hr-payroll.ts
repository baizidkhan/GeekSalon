import api from '../base';
import { CACHE, consumeStale, markStale } from '@/lib/cache';

export type PayrollStatus = 'Paid' | 'Pending' | 'Processing';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  payDate: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollResponse {
  data: PayrollRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePayrollDto {
  employeeId: string;
  employeeName: string;
  role: string;
  baseSalary: number;
  bonus?: number;
  deductions?: number;
  netSalary: number;
  status?: PayrollStatus;
  payDate?: string;
  month: number;
  year: number;
}

function payrollCacheKey(month?: number, year?: number) {
  return `${CACHE.PAYROLL}:${year ?? 'all'}:${month ?? 'all'}`;
}

export async function getPayrollRecords(
  month?: number,
  year?: number,
  page = 1,
  limit = 10,
): Promise<PayrollResponse> {
  const key = payrollCacheKey(month, year);
  const isStale = consumeStale(key);
  const params: Record<string, any> = { page, limit };
  if (month) params.month = month;
  if (year) params.year = year;

  const { data } = await api.get('/payroll', {
    params,
    id: key,
    cache: isStale ? false : { ttl: 5 * 60 * 1000 },
  } as any);
  return data;
}

export async function createPayrollRecord(dto: CreatePayrollDto): Promise<PayrollRecord> {
  const { data } = await api.post('/payroll', dto);
  markStale(payrollCacheKey(dto.month, dto.year), payrollCacheKey());
  return data;
}

export async function updatePayrollRecord(id: string, dto: Partial<CreatePayrollDto>): Promise<PayrollRecord> {
  const { data } = await api.patch(`/payroll/${id}`, dto);
  markStale(payrollCacheKey(), CACHE.PAYROLL);
  return data;
}

export async function deletePayrollRecord(id: string): Promise<void> {
  await api.delete(`/payroll/${id}`);
  markStale(payrollCacheKey(), CACHE.PAYROLL);
}
