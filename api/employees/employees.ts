import api from '../base'

export async function getEmployees() {
  const { data } = await api.get('/employee')
  return data
}

export async function getBasicEmployees() {
  const { data } = await api.get('/employee/basic')
  return data
}

export async function createEmployee(employeeData: any) {
  const { data } = await api.post('/employee', employeeData)
  return data
}

export async function getEmployeesFiltered(name?: string) {
  const { data } = await api.get('/employee', { params: { name } })
  return data
}

export async function getStylists() {
  const { data } = await api.get('/employee/stylists')
  return data
}

export async function getEmployeeById(id: string) {
  const { data } = await api.get(`/employee/${id}`)
  return data
}

export async function updateEmployee(id: string, employeeData: any) {
  const { data } = await api.patch(`/employee/${id}`, employeeData)
  return data
}

export async function deleteEmployee(id: string) {
  const { data } = await api.delete(`/employee/${id}`)
  return data
}

