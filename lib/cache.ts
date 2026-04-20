// Cache key constants — must match the id passed to each api.get() call
export const CACHE = {
  DASHBOARD: 'dashboard',
  APPOINTMENTS: 'appointments',
  CLIENTS: 'clients',
  EMPLOYEES: 'employees',
  EMPLOYEES_BASIC: 'employees-basic',
  EMPLOYEES_STYLISTS: 'employees-stylists',
  SERVICES: 'services',
  SERVICES_ACTIVE: 'services-active',
  INVENTORY: 'inventory',
  BILLING: 'billing',
  REPORTS: 'reports',
  STAFF_REPORTS: 'staff-reports',
  USER_MANAGEMENT: 'user-management',
} as const

// Keys queued for bypass on the very next fetch
const stale = new Set<string>()

/** Mark one or more resources as stale so the next GET bypasses cache */
export function markStale(...keys: string[]) {
  keys.forEach(k => stale.add(k))
}

/**
 * Consume the stale flag for a key.
 * Returns true exactly once after markStale — subsequent calls return false.
 */
export function consumeStale(key: string): boolean {
  if (stale.has(key)) {
    stale.delete(key)
    return true
  }
  return false
}
