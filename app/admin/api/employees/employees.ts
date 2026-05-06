import api from '../base'
import { CACHE, clearCacheByPrefix, consumeStale, markStale } from '@admin/lib/cache'

const TTL = 10 * 60 * 1000 // 10 min — employees rarely change

export async function getEmployees() {
  const override = consumeStale(CACHE.EMPLOYEES)
  const { data } = await api.get('/employee', { id: CACHE.EMPLOYEES, cache: { ttl: TTL, override } })
  return data
}

export async function getBasicEmployees() {
  const override = consumeStale(CACHE.EMPLOYEES_BASIC)
  const { data } = await api.get('/employee/basic', { id: CACHE.EMPLOYEES_BASIC, cache: { ttl: TTL, override } })
  return data
}

export async function getEmployeesFiltered(name?: string) {
  const override = consumeStale(CACHE.EMPLOYEES)
  const { data } = await api.get('/employee', {
    params: { name },
    cache: { ttl: TTL, override },
  })
  return data
}

export async function getStylists() {
  const override = consumeStale(CACHE.EMPLOYEES_STYLISTS)
  const { data } = await api.get('/employee/basic', { id: CACHE.EMPLOYEES_STYLISTS, cache: { ttl: TTL, override } })
  return data.filter((e: any) => e.role === 'Stylist')
}

export async function getEmployeeById(id: string) {
  const { data } = await api.get(`/employee/${id}`, { cache: { ttl: TTL } })
  return data
}

export async function createEmployee(employeeData: any) {
  let payload = employeeData
  if (!(employeeData instanceof FormData)) {
    payload = new FormData()
    payload.append('data', JSON.stringify(employeeData))
  }

  const { data } = await api.post('/employee', payload)
  markStale(
    CACHE.EMPLOYEES,
    CACHE.EMPLOYEES_BASIC,
    CACHE.EMPLOYEES_STYLISTS,
    CACHE.DASHBOARD,
    CACHE.STAFF_REPORTS,
    CACHE.PAYROLL,
  )
  return data
}

export async function updateEmployee(id: string, employeeData: any) {
  let payload = employeeData
  if (!(employeeData instanceof FormData)) {
    payload = new FormData()
    payload.append('data', JSON.stringify(employeeData))
  }

  const { data } = await api.patch(`/employee/${id}`, payload)
  clearCacheByPrefix(CACHE.PAYROLL)
  markStale(CACHE.EMPLOYEES, CACHE.EMPLOYEES_BASIC, CACHE.EMPLOYEES_STYLISTS, CACHE.STAFF_REPORTS, CACHE.PAYROLL)
  return data
}

export async function deleteEmployee(id: string) {
  const { data } = await api.delete(`/employee/${id}`)
  markStale(
    CACHE.EMPLOYEES,
    CACHE.EMPLOYEES_BASIC,
    CACHE.EMPLOYEES_STYLISTS,
    CACHE.DASHBOARD,
    CACHE.STAFF_REPORTS,
    CACHE.PAYROLL,
  )
  return data
}
