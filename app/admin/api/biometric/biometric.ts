import api from '../base'

export interface DeviceUser {
  id: string
  deviceUid: string
  name: string | null
  linkedEmployeeId: string | null
  status: 'unlinked' | 'linked'
  createdAt: string
}

export interface DeviceStatus {
  connected: boolean
  enabled: boolean
}

export async function getUnlinkedDeviceUsers(): Promise<DeviceUser[]> {
  const { data } = await api.get('/device-users/unlinked', { cache: false })
  return data
}

export async function getAllDeviceUsers(): Promise<DeviceUser[]> {
  const { data } = await api.get('/device-users', { cache: false })
  return data
}

export async function linkDeviceUser(device_uid: string, employee_id: string): Promise<DeviceUser> {
  const { data } = await api.post('/device-users/link', { device_uid, employee_id })
  return data
}

export async function unlinkDeviceUser(deviceUid: string): Promise<DeviceUser> {
  const { data } = await api.delete(`/device-users/${deviceUid}/unlink`)
  return data
}

export async function getDeviceStatus(): Promise<DeviceStatus> {
  const { data } = await api.get('/device-users/status', { cache: false })
  return data
}

export async function simulateDeviceUser(device_uid: string, name?: string): Promise<DeviceUser> {
  const { data } = await api.post('/device-users/simulate', { device_uid, name })
  return data
}
