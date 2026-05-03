import api from '../base'
import { CACHE, consumeStale } from '@admin/lib/cache'

const TTL = 1 * 60 * 1000 // 1 min — staff reports should update frequently

export async function getStaffReports(from: string, to: string) {
  const override = consumeStale(CACHE.STAFF_REPORTS)
  const { data } = await api.get('/reports/staff', {
    params: { from, to },
    cache: { ttl: TTL, override },
  })
  return data
}
