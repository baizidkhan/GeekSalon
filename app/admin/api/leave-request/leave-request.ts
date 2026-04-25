import api from '../base'

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

export async function getLeaveRequests() {
  const { data } = await api.get('/leave-request')
  return data
}

export async function getLeaveRequestById(id: string) {
  const { data } = await api.get(`/leave-request/${id}`)
  return data
}

export async function createLeaveRequest(payload: any) {
  const { data } = await api.post('/leave-request', payload)
  return data
}

export async function updateLeaveRequestStatus(id: string, status: 'approved' | 'rejected') {
  const { data } = await api.patch(`/leave-request/${id}`, { status })
  return data
}

export async function deleteLeaveRequest(id: string) {
  const { data } = await api.delete(`/leave-request/${id}`)
  return data
}
