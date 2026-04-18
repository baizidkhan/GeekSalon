import api from '../base'

export async function getServices(filters?: { name?: string; category?: string; sortPrice?: string }) {
  const { data } = await api.get('/service', { params: filters })
  return data
}

export async function getActiveServices() {
  const { data } = await api.get('/service/active')
  return data
}

export async function getServiceById(id: string) {
  const { data } = await api.get(`/service/${id}`)
  return data
}

export async function createService(serviceData: any) {
  const { data } = await api.post('/service', serviceData)
  return data
}

export async function updateService(id: string, serviceData: any) {
  const { data } = await api.patch(`/service/${id}`, serviceData)
  return data
}

export async function deleteService(id: string) {
  const { data } = await api.delete(`/service/${id}`)
  return data
}

