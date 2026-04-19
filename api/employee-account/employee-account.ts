import api from '../base'

export interface UserManagement {
  id: string
  useremail: string
  role: string
  permissions: string[]
  employeeId?: string
  employee?: {
    id: string
    name: string
    role?: string
  }
  createdAt: string
  updatedAt: string
}

export async function createUser(userData: any) {
  const { data } = await api.post('/user-management', userData)
  return data
}

export async function getAllUsers(email?: string) {
  const { data } = await api.get('/user-management', { params: { email } })
  return data
}

export async function getUserById(id: string) {
  const { data } = await api.get(`/user-management/${id}`)
  return data
}

export async function updateUser(id: string, userData: any) {
  const { data } = await api.patch(`/user-management/${id}`, userData)
  return data
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/user-management/${id}`)
  return data
}
