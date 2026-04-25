import api from '../base'
import { CACHE, consumeStale } from '@admin/lib/cache'

const TTL = 15 * 60 * 1000 // 15 min — historical data, never changes for a given range

export async function getReports(from: string, to: string) {
  const override = consumeStale(CACHE.REPORTS)
  const { data } = await api.get('/reports', {
    params: { from, to },
    cache: { ttl: TTL, override },
  })
  return data
}
