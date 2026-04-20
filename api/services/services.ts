import api from '../base'
import { CACHE, consumeStale, markStale } from '@/lib/cache'

const TTL = 10 * 60 * 1000 // 10 min — services rarely change

export async function getServices(filters?: { name?: string; category?: string; sortPrice?: string }) {
  const override = consumeStale(CACHE.SERVICES)
  const { data } = await api.get('/service', {
    params: filters,
    cache: { ttl: TTL, override },
  })
  return data
}

export async function getActiveServices() {
  const override = consumeStale(CACHE.SERVICES_ACTIVE)
  const { data } = await api.get('/service/active', { id: CACHE.SERVICES_ACTIVE, cache: { ttl: TTL, override } })
  return data
}

export async function getServiceById(id: string) {
  const { data } = await api.get(`/service/${id}`, { cache: { ttl: TTL } })
  return data
}

export async function createService(serviceData: any) {
  const { data } = await api.post('/service', serviceData)
  markStale(CACHE.SERVICES, CACHE.SERVICES_ACTIVE, CACHE.DASHBOARD)
  return data
}

export async function updateService(id: string, serviceData: any) {
  const { data } = await api.patch(`/service/${id}`, serviceData)
  markStale(CACHE.SERVICES, CACHE.SERVICES_ACTIVE)
  return data
}

export async function deleteService(id: string) {
  const { data } = await api.delete(`/service/${id}`)
  markStale(CACHE.SERVICES, CACHE.SERVICES_ACTIVE, CACHE.DASHBOARD)
  return data
}
