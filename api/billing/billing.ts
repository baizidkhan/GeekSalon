import api from '../base'

export async function getInvoices(page = 1, limit = 20) {
  const { data } = await api.get('/invoice', { params: { page, limit } })
  return data
}

export async function createInvoice(payload: {
  clientId?: string
  services?: string[]
  staff: string
  assistant?: string
  printBy?: string
  total?: number
  paymentMethod?: 'Cash' | 'bKash' | 'Card'
  status?: 'Paid' | 'Unpaid' | 'Partial'
}) {
  const { data } = await api.post('/invoice', payload)
  return data
}

export async function updateInvoice(id: string, payload: object) {
  const { data } = await api.patch(`/invoice/${id}`, payload)
  return data
}

export async function deleteInvoice(id: string) {
  const { data } = await api.delete(`/invoice/${id}`)
  return data
}
