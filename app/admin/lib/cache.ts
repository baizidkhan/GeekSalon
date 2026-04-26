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
  BUSINESS_INFO: 'business-info',
  INVOICE_SETTING: 'invoice-setting',
  APPOINTMENT_SETTING: 'appointment-setting',
  PAYROLL: 'payroll',
  PACKAGES: 'packages',
} as const

/** Mark one or more resources as stale so the next GET bypasses cache */
export function markStale(...keys: string[]) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('aci-stale-keys')
    const stale = new Set<string>(raw ? JSON.parse(raw) : [])
    keys.forEach(k => stale.add(k))
    localStorage.setItem('aci-stale-keys', JSON.stringify(Array.from(stale)))
  } catch { }
}

/**
 * Immediately remove the axios-cache-interceptor localStorage entry for one or
 * more keys.  Call this when you need the cache gone NOW rather than waiting
 * for the next fetch to consume a stale flag.
 */
export function removeFromCache(...keys: string[]) {
  if (typeof window === 'undefined') return
  keys.forEach((k) => {
    try {
      localStorage.removeItem(`aci:${k}`)
    } catch {}
  })
}

/**
 * Consume the stale flag for a key.
 * Returns true exactly once after markStale — subsequent calls return false.
 */
export function consumeStale(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem('aci-stale-keys')
    if (!raw) return false
    const staleList = JSON.parse(raw) as string[]
    const stale = new Set<string>(staleList)
    
    if (stale.has(key)) {
      stale.delete(key)
      localStorage.setItem('aci-stale-keys', JSON.stringify(Array.from(stale)))
      return true
    }
  } catch { }
  return false
}
