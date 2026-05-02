import api from '../base'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeviceNetworkConfig {
  id: string
  deviceIp: string
  devicePort: number
  subnetMask: string | null
  gateway: string | null
  dnsServer: string | null
  communicationKey: string | null
  updatedAt: string
  createdAt: string
}

export interface LiveDeviceInfo {
  ip: string | null
  subnetMask: string | null
  gateway: string | null
  dns: string | null
}

export interface DeviceConfigStatus {
  config: DeviceNetworkConfig
  connected: boolean
  enabled: boolean
  liveDevice: LiveDeviceInfo | null
}

export interface SaveAndApplyResult {
  config: DeviceNetworkConfig
  deviceUpdated: boolean
  deviceError?: string
}

export interface AutoSyncResult {
  changed: boolean
  message: string
  detected?: { gateway: string | null; dns: string | null }
  changes?: Record<string, string>
  deviceUpdated?: boolean
  deviceError?: string
}

export interface ConfigLog {
  id: string
  action: string
  oldValues: Record<string, unknown>
  newValues: Record<string, unknown>
  result: string
  message: string | null
  createdAt: string
}

export interface UpdateDeviceConfigPayload {
  deviceIp: string
  devicePort: number
  subnetMask?: string
  gateway?: string
  dnsServer?: string
  communicationKey?: string
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getDeviceConfigStatus(): Promise<DeviceConfigStatus> {
  const { data } = await api.get('/device-config', { cache: false })
  return data
}

export async function saveAndApplyConfig(payload: UpdateDeviceConfigPayload): Promise<SaveAndApplyResult> {
  const { data } = await api.put('/device-config', payload)
  return data
}

export async function autoSyncConfig(): Promise<AutoSyncResult> {
  const { data } = await api.post('/device-config/auto-sync', {})
  return data
}

export async function getConfigLogs(limit = 30): Promise<ConfigLog[]> {
  const { data } = await api.get(`/device-config/logs?limit=${limit}`, { cache: false })
  return data
}
