import api from '../base'

export async function getClients(page = 1, limit = 20) {
  const { data } = await api.get('/clients', { params: { page, limit } })
  return data
}

export async function createClient(payload: {
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
}) {
  const { data } = await api.post('/clients', payload)
  return data
}

export async function updateClient(id: string, payload: object) {
  const { data } = await api.patch(`/clients/${id}`, payload)
  return data
}

export async function deleteClient(id: string) {
  const { data } = await api.delete(`/clients/${id}`)
  return data
}
