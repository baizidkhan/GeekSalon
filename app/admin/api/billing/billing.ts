import api from '../base'
import { CACHE, consumeStale, markStale, removeFromCache } from '@admin/lib/cache'

const TTL = 2 * 60 * 1000 // 2 min — invoices/transactions are high-frequency

export async function getInvoices(page = 1, limit = 20) {
  const override = consumeStale(CACHE.BILLING)
  const { data } = await api.get('/invoice', {
    params: { page, limit },
    cache: { ttl: TTL, override },
  })
  return data
}

export async function createInvoice(payload: {
  clientId?: string
  appointmentId?: string
  services?: string[]
  staff?: string
  assistant?: string
  printBy?: string
  paidAmount?: number
  total?: number
  paymentMethod?: 'Cash' | 'bKash' | 'Card'
  status?: 'Paid' | 'Unpaid' | 'Partial'
}) {
  const { data } = await api.post('/invoice', payload)
  markStale(CACHE.BILLING, CACHE.DASHBOARD)
  return data
}

export async function updateInvoice(id: string, payload: object) {
  const { data } = await api.patch(`/invoice/${id}`, payload)
  markStale(CACHE.BILLING, CACHE.DASHBOARD)
  return data
}

export async function deleteInvoice(id: string) {
  const { data } = await api.delete(`/invoice/${id}`)
  markStale(CACHE.BILLING, CACHE.DASHBOARD)
  removeFromCache(CACHE.APPOINTMENTS)
  return data
}
