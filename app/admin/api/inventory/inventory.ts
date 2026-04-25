import api from '../base'
import { CACHE, consumeStale, markStale } from '@admin/lib/cache'

const TTL = 3 * 60 * 1000 // 3 min — stock levels change with transactions

export interface InventoryItem {
  id: string
  name: string
  category: string
  stockQty: number
  minStockLevel: number
  unitPrice: number
  supplier: string
  expiryDate: string
}

export type CreateInventoryPayload = Omit<InventoryItem, 'id'>
export type UpdateInventoryPayload = Partial<CreateInventoryPayload>

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

export async function createInventoryItem(payload: CreateInventoryPayload) {
  const { data } = await api.post('/inventory', payload)
  markStale(CACHE.INVENTORY, CACHE.DASHBOARD)
  return data
}

export async function updateInventoryItem(id: string, payload: UpdateInventoryPayload) {
  const { data } = await api.patch(`/inventory/${id}`, payload)
  markStale(CACHE.INVENTORY, CACHE.DASHBOARD)
  return data
}

export async function deleteInventoryItem(id: string) {
  const { data } = await api.delete(`/inventory/${id}`)
  markStale(CACHE.INVENTORY, CACHE.DASHBOARD)
  return data
}
