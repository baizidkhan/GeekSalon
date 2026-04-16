import api from '../base'

export async function getAppointments(filters?: {
  date?: string
  source?: string
  status?: string
  phone?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get('/appointments', { params: filters })
  return data
}

export async function createAppointment(payload: {
  clientName: string
  phoneNumber: string
  date: string
  time: string
  staff?: string
  assistant?: string
  source?: string
  services?: string[]
  notes?: string
  status?: string
}) {
  const { data } = await api.post('/appointments', payload)
  return data
}

export async function updateAppointment(phone: string, payload: object) {
  const { data } = await api.patch(`/appointments/${encodeURIComponent(phone)}`, payload)
  return data
}

export async function deleteAppointment(id: string) {
  const { data } = await api.delete(`/appointments/${id}`)
  return data
}
