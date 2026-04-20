import api from '../base'
import { CACHE, consumeStale } from '@/lib/cache'

const TTL = 2 * 60 * 1000 // 2 min — dashboard data changes frequently

export async function getDashboardStats() {
  const override = consumeStale(CACHE.DASHBOARD)
  const { data } = await api.get('/dashboard', { id: CACHE.DASHBOARD, cache: { ttl: TTL, override } })
  return data
}
