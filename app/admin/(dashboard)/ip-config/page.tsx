"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Network,
  RefreshCw,
  Save,
  Server,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  autoSyncConfig,
  getConfigLogs,
  getDeviceConfigStatus,
  saveAndApplyConfig,
  type AutoSyncResult,
  type ConfigLog,
  type DeviceConfigStatus,
} from "@admin/api/device-config/device-config"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    manual_update: "bg-blue-100 text-blue-700",
    auto_sync: "bg-purple-100 text-purple-700",
    cron_sync: "bg-amber-100 text-amber-700",
  }
  const labels: Record<string, string> = {
    manual_update: "Manual",
    auto_sync: "Auto Sync",
    cron_sync: "Cron",
  }
  const cls = map[action] ?? "bg-muted text-muted-foreground"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {labels[action] ?? action}
    </span>
  )
}

function ResultBadge({ result }: { result: string }) {
  if (result === "success") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" />Success
    </span>
  )
  if (result === "db_only") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
      <AlertCircle className="w-3 h-3" />DB only
    </span>
  )
  if (result === "no_change") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
      <Activity className="w-3 h-3" />No change
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <AlertCircle className="w-3 h-3" />Failed
    </span>
  )
}

function ConfigDiff({ oldValues, newValues }: { oldValues: Record<string, unknown>; newValues: Record<string, unknown> }) {
  const keys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]))
  const changed = keys.filter(k => String(oldValues[k] ?? "") !== String(newValues[k] ?? ""))
  if (changed.length === 0) return <span className="text-xs text-muted-foreground">No field changes</span>
  return (
    <div className="space-y-0.5">
      {changed.map(k => (
        <div key={k} className="text-xs">
          <span className="font-medium text-foreground">{k}:</span>{" "}
          <span className="text-red-500 line-through">{String(oldValues[k] ?? "—")}</span>
          {" → "}
          <span className="text-green-600">{String(newValues[k] ?? "—")}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IpConfigPage() {
  const [status, setStatus] = useState<DeviceConfigStatus | null>(null)
  const [logs, setLogs] = useState<ConfigLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)
  const [syncResult, setSyncResult] = useState<AutoSyncResult | null>(null)

  // Form state
  const [deviceIp, setDeviceIp] = useState("")
  const [devicePort, setDevicePort] = useState("")
  const [subnetMask, setSubnetMask] = useState("")
  const [gateway, setGateway] = useState("")
  const [dnsServer, setDnsServer] = useState("")
  const [communicationKey, setCommunicationKey] = useState("")

  const loadStatus = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const s = await getDeviceConfigStatus()
      setStatus(s)
      setDeviceIp(s.config.deviceIp)
      setDevicePort(String(s.config.devicePort))
      setSubnetMask(s.config.subnetMask ?? "")
      setGateway(s.config.gateway ?? "")
      setDnsServer(s.config.dnsServer ?? "")
      setCommunicationKey(s.config.communicationKey ?? "")
    } catch {
      if (!quiet) toast.error("Failed to load device configuration")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLogs = useCallback(async () => {
    try {
      const l = await getConfigLogs(30)
      setLogs(l)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    loadStatus()
    loadLogs()
  }, [loadStatus, loadLogs])

  async function handleSaveAndApply() {
    const port = parseInt(devicePort, 10)
    if (!deviceIp || isNaN(port)) {
      toast.error("Device IP and Port are required")
      return
    }
    setSaving(true)
    setSyncResult(null)
    try {
      const result = await saveAndApplyConfig({
        deviceIp,
        devicePort: port,
        subnetMask: subnetMask || undefined,
        gateway: gateway || undefined,
        dnsServer: dnsServer || undefined,
        communicationKey: communicationKey || undefined,
      })
      if (result.deviceUpdated) {
        toast.success("Configuration saved and pushed to device")
      } else {
        toast.warning(
          `Configuration saved to database. Device push failed: ${result.deviceError ?? "unknown error"}`,
          { duration: 6000 }
        )
      }
      await loadStatus(true)
      await loadLogs()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save configuration")
    } finally {
      setSaving(false)
    }
  }

  async function handleAutoSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await autoSyncConfig()
      setSyncResult(result)
      if (!result.changed) {
        toast.info("No changes detected — configuration is up to date")
      } else if (result.deviceUpdated) {
        toast.success("Network changes detected and synced to device")
      } else {
        toast.warning(
          `Changes detected, DB updated. Device push failed: ${result.deviceError ?? ""}`,
          { duration: 6000 }
        )
      }
      await loadStatus(true)
      await loadLogs()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Auto sync failed")
    } finally {
      setSyncing(false)
    }
  }

  const connected = status?.connected ?? false
  const enabled = status?.enabled ?? true
  const liveDevice = status?.liveDevice ?? null

  return (
    <div className="premium-page p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Network className="w-6 h-6 text-primary" />
            IP Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage ZKTeco F18 network settings and sync configuration changes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { loadStatus(); loadLogs() }}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Status cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Connection status */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${connected ? "bg-green-100" : "bg-red-100"}`}>
            {connected
              ? <Wifi className="w-5 h-5 text-green-600" />
              : <WifiOff className="w-5 h-5 text-red-500" />}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Device Status</p>
            <p className={`font-semibold text-sm ${connected ? "text-green-600" : "text-red-500"}`}>
              {!enabled ? "Disabled" : connected ? "Connected" : "Disconnected"}
            </p>
          </div>
        </div>

        {/* Current target */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Connecting to</p>
            <p className="font-semibold text-sm text-foreground font-mono truncate">
              {loading ? "—" : `${status?.config.deviceIp ?? "—"}:${status?.config.devicePort ?? "—"}`}
            </p>
          </div>
        </div>

        {/* Last updated */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Config last updated</p>
            <p className="font-semibold text-sm text-foreground truncate">
              {status?.config.updatedAt ? fmtDate(status.config.updatedAt) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main grid: form + live device card ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Configuration form */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Network Configuration</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit the device settings below. Click <strong>Save &amp; Apply</strong> to persist to DB and push to the device.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5">
                <Label htmlFor="deviceIp">
                  Device IP Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deviceIp"
                  placeholder="192.168.10.201"
                  value={deviceIp}
                  onChange={e => setDeviceIp(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">LAN IP used by server to reach device</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="devicePort">
                  Port <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="devicePort"
                  placeholder="4370"
                  value={devicePort}
                  onChange={e => setDevicePort(e.target.value)}
                  className="font-mono"
                  type="number"
                  min={1}
                  max={65535}
                />
                <p className="text-xs text-muted-foreground">Default ZKTeco port is 4370</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subnetMask">Subnet Mask</Label>
                <Input
                  id="subnetMask"
                  placeholder="255.255.255.0"
                  value={subnetMask}
                  onChange={e => setSubnetMask(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  placeholder="192.168.10.1"
                  value={gateway}
                  onChange={e => setGateway(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Router / default gateway IP</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dnsServer">DNS Server</Label>
                <Input
                  id="dnsServer"
                  placeholder="8.8.8.8"
                  value={dnsServer}
                  onChange={e => setDnsServer(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commKey">Communication Key</Label>
                <Input
                  id="commKey"
                  placeholder="Leave blank if none"
                  value={communicationKey}
                  onChange={e => setCommunicationKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Device comm password (if set)</p>
              </div>

            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-3 pt-2 border-t border-border flex-wrap">
            <Button
              onClick={handleSaveAndApply}
              disabled={saving || loading}
              className="gap-2"
            >
              {saving
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Applying…</>
                : <><Save className="w-4 h-4" />Save &amp; Apply</>}
            </Button>

            <Button
              variant="outline"
              onClick={handleAutoSync}
              disabled={syncing || loading}
              className="gap-2"
            >
              {syncing
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Syncing…</>
                : <><Zap className="w-4 h-4" />Auto Sync</>}
            </Button>

            <p className="text-xs text-muted-foreground ml-auto">
              Auto Sync detects server gateway/DNS and pushes changes to device
            </p>
          </div>

          {/* Auto-sync result banner */}
          {syncResult && (
            <div className={`rounded-lg border p-3 text-sm ${
              !syncResult.changed
                ? "bg-slate-50 border-slate-200 text-slate-700"
                : syncResult.deviceUpdated
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-orange-50 border-orange-200 text-orange-800"
            }`}>
              <p className="font-medium">{syncResult.message}</p>
              {syncResult.detected && (
                <p className="text-xs mt-1 opacity-80">
                  Detected → gateway: <span className="font-mono">{syncResult.detected.gateway ?? "n/a"}</span>
                  {" · "}dns: <span className="font-mono">{syncResult.detected.dns ?? "n/a"}</span>
                </p>
              )}
              {syncResult.changes && Object.keys(syncResult.changes).length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {Object.entries(syncResult.changes).map(([k, v]) => (
                    <p key={k} className="text-xs font-mono">• {k}: {v}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live device info + tips */}
        <div className="space-y-4">

          {/* Live device config */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Live Device Config</h3>
              <Badge
                variant="outline"
                className={connected ? "text-green-600 border-green-300" : "text-red-500 border-red-300"}
              >
                {connected ? "Online" : "Offline"}
              </Badge>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : !connected ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <WifiOff className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  Cannot read live config — device is offline
                </p>
              </div>
            ) : liveDevice ? (
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "IP", value: liveDevice.ip },
                  { label: "Mask", value: liveDevice.subnetMask },
                  { label: "Gateway", value: liveDevice.gateway },
                  { label: "DNS", value: liveDevice.dns },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-xs w-14 shrink-0">{label}</span>
                    <span className="font-mono text-xs text-foreground truncate text-right">
                      {value ?? <span className="text-muted-foreground">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No live data returned
              </p>
            )}
          </div>

          {/* Safety tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />Important Notes
            </h3>
            <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Changing device IP drops the current TCP session — device reconnects automatically with the new IP</li>
              <li>Wrong gateway/subnet may make the device unreachable over the network</li>
              <li>Always verify the new IP is reachable before applying</li>
              <li>Config is saved to DB first; device push failure leaves DB intact</li>
              <li>A cron job runs every hour to auto-detect gateway/DNS drift</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Change Log ──────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          onClick={() => {
            const opening = !logsOpen
            setLogsOpen(opening)
            if (opening && logs.length === 0) loadLogs()
          }}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary/70" />
            <span className="font-semibold text-sm text-foreground">Configuration Change Log</span>
            {logs.length > 0 && (
              <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
            )}
          </div>
          {logsOpen
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {logsOpen && (
          <div className="border-t border-border">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <History className="w-8 h-8 opacity-25" />
                <p className="text-sm">No configuration changes logged yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Changes</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} />
                        </TableCell>
                        <TableCell>
                          <ResultBadge result={log.result} />
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <ConfigDiff oldValues={log.oldValues} newValues={log.newValues} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.message ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
