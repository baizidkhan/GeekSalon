import api from '../base'
import { CACHE, consumeStale, markStale } from '@admin/lib/cache'

const TTL = 10 * 60 * 1000 // 10 min — user accounts rarely change

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

export async function getAllUsers() {
  const override = consumeStale(CACHE.USER_MANAGEMENT)
  const { data } = await api.get('/auth/users', {
    id: CACHE.USER_MANAGEMENT,
    cache: { ttl: TTL, override },
  })
  return data
}

export async function getUserById(id: string) {
  const { data } = await api.get(`/user-management/${id}`, { cache: { ttl: TTL } })
  return data
}

export async function createUser(userData: any) {
  const { data } = await api.post('/user-management', userData)
  markStale(CACHE.USER_MANAGEMENT)
  return data
}

export async function updateUser(id: string, userData: any) {
  const { data } = await api.patch(`/user-management/${id}`, userData)
  markStale(CACHE.USER_MANAGEMENT)
  return data
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/user-management/${id}`)
  markStale(CACHE.USER_MANAGEMENT)
  return data
}
