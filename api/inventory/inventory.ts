import api from '../base'
import { CACHE, consumeStale, markStale } from '@/lib/cache'

const TTL = 3 * 60 * 1000 // 3 min — stock levels change with transactions

export async function getInventory(filters?: {
  name?: string
  page?: number
  limit?: number
  sortStock?: 'asc' | 'desc'
}) {
  const override = consumeStale(CACHE.INVENTORY)
  const { data } = await api.get('/inventory', {
    params: filters,
    cache: { ttl: TTL, override },
  })
  return data
}

export async function createInventoryItem(payload: {
  name: string
  category: string
  stockQty: number
  minStockLevel: number
  unitPrice: number
  supplier: string
  expiryDate: string
}) {
  const { data } = await api.post('/inventory', payload)
  markStale(CACHE.INVENTORY, CACHE.DASHBOARD)
  return data
}

export async function updateInventoryItem(id: string, payload: object) {
  const { data } = await api.patch(`/inventory/${id}`, payload)
  markStale(CACHE.INVENTORY, CACHE.DASHBOARD)
  return data
}

export async function deleteInventoryItem(id: string) {
  const { data } = await api.delete(`/inventory/${id}`)
  markStale(CACHE.INVENTORY, CACHE.DASHBOARD)
  return data
}
