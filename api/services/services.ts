import api from '../base'

export async function getActiveServices() {
  const { data } = await api.get('/service/active')
  return data
}
