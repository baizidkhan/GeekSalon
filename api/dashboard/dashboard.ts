import api from '../base'

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard')
  return data
}
