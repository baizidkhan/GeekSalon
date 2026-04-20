import api from '../base'
import { CACHE, consumeStale } from '@/lib/cache'

const TTL = 15 * 60 * 1000 // 15 min — historical, immutable for a given date range

export async function getStaffReports(from: string, to: string) {
  const override = consumeStale(CACHE.STAFF_REPORTS)
  const { data } = await api.get('/reports/staff', {
    params: { from, to },
    cache: { ttl: TTL, override },
  })
  return data
}
