import api from '../base'
import { CACHE, consumeStale, markStale, removeFromCache } from '@/lib/cache'

const TTL = 60 * 1000 // 1 min — appointments change very frequently

export async function getAppointments(filters?: {
  date?: string
  source?: string
  status?: string
  phone?: string
  page?: number
  limit?: number
}) {
  const override = consumeStale(CACHE.APPOINTMENTS)
  const { data } = await api.get('/appointments', {
    id: CACHE.APPOINTMENTS,
    params: filters,
    cache: { ttl: TTL, override },
  })
  return data
}

export async function createAppointment(payload: {
  clientName: string
  phoneNumber: string
  date: string
  time: string
  staff?: string
  assistant?: string
  source?: string
  services?: string[]
  notes?: string
  status?: string
}) {
  const { data } = await api.post('/appointments', payload)
  // Backend auto-creates the client inside the same transaction — invalidate clients cache so the page refreshes
  markStale(CACHE.APPOINTMENTS, CACHE.DASHBOARD, CACHE.CLIENTS, CACHE.BILLING)
  return data
}

export async function updateAppointment(id: string, payload: object) {
  const { data } = await api.patch(`/appointments/id/${encodeURIComponent(id)}`, payload)
  markStale(CACHE.APPOINTMENTS, CACHE.DASHBOARD, CACHE.BILLING, CACHE.CLIENTS)
  return data
}

export async function deleteAppointment(id: string) {
  const { data } = await api.delete(`/appointments/${id}`)
  markStale(CACHE.APPOINTMENTS, CACHE.DASHBOARD, CACHE.BILLING, CACHE.CLIENTS)
  return data
}
