import api from '../base'

export async function getInventory(filters?: {
  name?: string
  page?: number
  limit?: number
  sortStock?: 'asc' | 'desc'
}) {
  const { data } = await api.get('/inventory', { params: filters })
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
  return data
}

export async function updateInventoryItem(id: string, payload: object) {
  const { data } = await api.patch(`/inventory/${id}`, payload)
  return data
}

export async function deleteInventoryItem(id: string) {
  const { data } = await api.delete(`/inventory/${id}`)
  return data
}
