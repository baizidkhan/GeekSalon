import api from '../base'

export async function getReports(from: string, to: string) {
  const { data } = await api.get('/reports', { params: { from, to } })
  return data
}
