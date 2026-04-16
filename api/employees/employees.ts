import api from '../base'

export async function getEmployees() {
  const { data } = await api.get('/employee')
  return data
}

export async function getBasicEmployees() {
  const { data } = await api.get('/employee/basic')
  return data
}
