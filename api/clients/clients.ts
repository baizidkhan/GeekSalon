import api from '../base'
import { CACHE, consumeStale, markStale } from '@/lib/cache'

const TTL = 5 * 60 * 1000 // 5 min

export async function getClients(page = 1, limit = 20) {
  const override = consumeStale(CACHE.CLIENTS)
  const { data } = await api.get('/clients', {
    params: { page, limit },
    cache: { ttl: TTL, override },
  })
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
  markStale(CACHE.CLIENTS)
  return data
}

export async function deleteClient(id: string) {
  const { data } = await api.delete(`/clients/${id}`)
  markStale(CACHE.CLIENTS, CACHE.DASHBOARD)
  return data
}
