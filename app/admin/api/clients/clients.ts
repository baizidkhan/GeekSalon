import api from '../base'
import { CACHE, consumeStale, markStale } from '@admin/lib/cache'

const TTL = 5 * 60 * 1000 // 5 min

export async function getClients(page = 1, limit = 20) {
  const override = consumeStale(CACHE.CLIENTS)
  const { data } = await api.get('/clients', {
    params: { page, limit },
    cache: { ttl: TTL, override },
  })
  return data
}

export async function getClientByPhone(phone: string) {
  const { data } = await api.get(`/clients/${phone}`)
  return data
}

export async function createClient(payload: {
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
}) {
  const { data } = await api.post('/clients', payload)
  markStale(CACHE.CLIENTS, CACHE.DASHBOARD)
  return data
}

export async function updateClient(id: string, payload: object) {
  const { data } = await api.patch(`/clients/${id}`, payload)
  markStale(CACHE.CLIENTS, CACHE.APPOINTMENTS, CACHE.BILLING, CACHE.DASHBOARD)
  return data
}

export async function deleteClient(id: string) {
  const { data } = await api.delete(`/clients/${id}`)
  markStale(CACHE.CLIENTS, CACHE.DASHBOARD)
  return data
}

export async function getClientHistory(id: string) {
  try {
    const { data } = await api.get(`/clients/history/${encodeURIComponent(id)}`)
    return data
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      throw error
    }

    const res = await getClients(1, 1000)
    const clients = res.data ?? res
    const client = Array.isArray(clients)
      ? clients.find((item: any) => item.id === id)
      : undefined

    if (!client) {
      throw error
    }

    // Fallback should still include invoice mapping for each appointment.
    let invoices: any[] = []
    try {
      const invoiceRes = await api.get('/invoice', {
        params: { phone: client.phone, page: 1, limit: 1000 },
      })
      invoices = invoiceRes.data?.data ?? invoiceRes.data ?? []
    } catch {
      invoices = []
    }

    const appointments = (client.appointments ?? []).map((apt: any) => ({
      ...apt,
      invoices: invoices.filter(
        (inv: any) =>
          inv?.appointment?.id === apt.id ||
          (apt.invoiceId && inv?.id === apt.invoiceId),
      ),
    }))

    return {
      ...client,
      appointments,
      invoices,
    }
  }
}
