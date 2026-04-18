import api from '../base'

export async function getStaffReports(from: string, to: string) {
  const { data } = await api.get('/reports/staff', { params: { from, to } })
  return data
}
