import api from '../base'
import { CACHE, consumeStale, markStale } from '@admin/lib/cache'

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  leaveType: 'casual' | 'annual' | 'emergency'
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

const TTL = 2 * 60 * 1000 // 5 min

export async function getLeaveRequests() {
  const override = consumeStale(CACHE.LEAVE_REQUEST)
  const { data } = await api.get('/leave-request', {
    id: CACHE.LEAVE_REQUEST,
    cache: { ttl: TTL, override }
  })
  return data
}

export async function getLeaveRequestById(id: string) {
  const { data } = await api.get(`/leave-request/${id}`)
  return data
}

export async function createLeaveRequest(payload: any) {
  const { data } = await api.post('/leave-request', payload)
  markStale(CACHE.LEAVE_REQUEST, CACHE.DASHBOARD)
  return data
}

export async function updateLeaveRequestStatus(id: string, status: 'approved' | 'rejected') {
  const { data } = await api.patch(`/leave-request/${id}`, { status })
  markStale(CACHE.LEAVE_REQUEST, CACHE.DASHBOARD)
  return data
}

export async function deleteLeaveRequest(id: string) {
  const { data } = await api.delete(`/leave-request/${id}`)
  markStale(CACHE.LEAVE_REQUEST, CACHE.DASHBOARD)
  return data
}
