"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Fingerprint,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react"
import { toast } from "sonner"
import {
  getUnlinkedDeviceUsers,
  linkDeviceUser,
  deleteDeviceUser,
  deleteAllDeviceUsers,
  syncDeviceUsers,
  getDeviceStatus,
  type DeviceUser,
} from "@admin/api/biometric/biometric"
import { getBasicEmployees, createEmployee } from "@admin/api/employees/employees"
import { CACHE, markStale } from "@admin/lib/cache"
import { useBiometricSocket } from "@/hooks/use-biometric-socket"
import { StatCard } from "@admin/components/stat-card"

interface BasicEmployee {
  id: string
  name: string
  role?: string
}

export default function DeviceUsersPage() {
  const [deviceUsers, setDeviceUsers] = useState<DeviceUser[]>([])
  const [employees, setEmployees] = useState<BasicEmployee[]>([])
  const [deviceConnected, setDeviceConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // link dialog
  const [linkTarget, setLinkTarget] = useState<DeviceUser | null>(null)
  const [linkMode, setLinkMode] = useState<"existing" | "create">("existing")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [newEmpName, setNewEmpName] = useState("")
  const [newEmpPhone, setNewEmpPhone] = useState("")
  const [newEmpRole, setNewEmpRole] = useState("")
  const [isLinking, startLinkTransition] = useTransition()

  // single delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<DeviceUser | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  // delete-all confirmation dialog
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [isDeletingAll, startDeleteAllTransition] = useTransition()

  async function fetchData() {
    setLoading(true)
    try {
      // Sync first so the device's current user list is reflected in the DB
      await syncDeviceUsers()
      const [users, status] = await Promise.all([
        getUnlinkedDeviceUsers(),
        getDeviceStatus(),
      ])
      setDeviceUsers(users)
      setDeviceConnected(status.connected)
    } catch {
      toast.error("Failed to sync with device")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    getBasicEmployees()
      .then(setEmployees)
      .catch(() => toast.error("Failed to load employees"))
  }, [])

  // Real-time: when a new fingerprint is pushed from the device via cloud, refresh the list
  const handleNewDeviceUser = useCallback(() => {
    getUnlinkedDeviceUsers()
      .then(setDeviceUsers)
      .catch(() => { })
    getDeviceStatus()
      .then((s) => setDeviceConnected(s.connected))
      .catch(() => { })
  }, [])

  useBiometricSocket({ onNewDeviceUser: handleNewDeviceUser })

  // ── Link ──────────────────────────────────────────────────────────────────

  function openLinkDialog(user: DeviceUser) {
    setLinkTarget(user)
    setLinkMode("existing")
    setSelectedEmployeeId("")
    setNewEmpName("")
    setNewEmpPhone("")
    setNewEmpRole("")
  }

  function handleLink() {
    if (!linkTarget) return
    if (linkMode === "existing" && !selectedEmployeeId) return
    if (linkMode === "create" && (!newEmpName.trim() || !newEmpPhone.trim())) return

    startLinkTransition(async () => {
      try {
        let employeeId = selectedEmployeeId
        let employeeName: string | undefined

        if (linkMode === "create") {
          const created = await createEmployee({
            name: newEmpName.trim(),
            phone: newEmpPhone.trim(),
            ...(newEmpRole ? { role: newEmpRole } : {}),
          })
          employeeId = created.id
          employeeName = created.name
          setEmployees((prev) => [...prev, { id: created.id, name: created.name, role: created.role }])
        } else {
          employeeName = employees.find((e) => e.id === selectedEmployeeId)?.name
        }

        await linkDeviceUser(linkTarget.deviceUid, employeeId)
        markStale(CACHE.EMPLOYEES, CACHE.EMPLOYEES_BASIC, CACHE.EMPLOYEES_STYLISTS)
        toast.success(`Linked to ${employeeName ?? "employee"} successfully`)
        setLinkTarget(null)
        setDeviceUsers((prev) => prev.filter((u) => u.deviceUid !== linkTarget.deviceUid))
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Link failed")
      }
    })
  }

  // ── Delete all ────────────────────────────────────────────────────────────

  function handleDeleteAll() {
    startDeleteAllTransition(async () => {
      try {
        const { deleted, failed } = await deleteAllDeviceUsers()
        setDeviceUsers([])
        setDeleteAllOpen(false)
        if (failed === 0) {
          toast.success(`${deleted} device user${deleted !== 1 ? "s" : ""} deleted`)
        } else {
          toast.warning(`${deleted} deleted, ${failed} failed — device may be unreachable`)
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Delete all failed")
      }
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      try {
        await deleteDeviceUser(deleteTarget.deviceUid)
        toast.success(`User ${deleteTarget.name ?? deleteTarget.deviceUid} deleted from device and database`)
        setDeleteTarget(null)
        setDeviceUsers((prev) => prev.filter((u) => u.deviceUid !== deleteTarget.deviceUid))
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Delete failed")
      }
    })
  }

  return (
    <div className="premium-page p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unlinked Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span>Dashboard</span>
            <span className="mx-1">/</span>
            <span className="text-foreground">Unlinked Users</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deviceConnected !== null && (
            <Badge
              variant="outline"
              className={
                deviceConnected
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-red-300 bg-red-50 text-red-600"
              }
            >
              {deviceConnected ? (
                <>
                  <Wifi className="mr-1 h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="mr-1 h-3 w-3" />
                  Disconnected
                </>
              )}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteAllOpen(true)}
            disabled={loading || deviceUsers.length === 0}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete All
          </Button>
        </div>
      </div>

      {/* ── Stats card ──────────────────────────────────────────────────── */}
      <div className="max-w-sm">
        <StatCard
          title="Unlinked Device Users"
          value={loading ? "—" : deviceUsers.length}
          icon={Fingerprint}
          iconWrapperClassName="bg-amber-50 text-amber-500"
          className="border-t-4 border-t-transparent hover:border-t-amber-500 transition-all"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device UID</TableHead>
              <TableHead>Name on Device</TableHead>
              <TableHead>Detected On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : deviceUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">All device users are linked</p>
                </TableCell>
              </TableRow>
            ) : (
              deviceUsers.map((user) => (
                <TableRow key={user.deviceUid}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {user.deviceUid}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.name ? (
                      <span className="text-sm">{user.name}</span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">No name set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => openLinkDialog(user)}>
                        <Link2 className="mr-1.5 h-3.5 w-3.5" />
                        Link Employee
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Link dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={!!linkTarget}
        onOpenChange={(open) => {
          if (!open && !isLinking) setLinkTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Link to Employee</DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  Device UID:{" "}
                  <Badge variant="outline" className="font-mono text-xs">
                    {linkTarget?.deviceUid}
                  </Badge>
                  {linkTarget?.name && (
                    <span className="ml-2 text-muted-foreground">· {linkTarget.name}</span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={linkMode} onValueChange={(v) => setLinkMode(v as "existing" | "create")} className="mt-3 pb-2">
            <TabsList className="w-full">
              <TabsTrigger value="existing" className="flex-1">
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                Existing Employee
              </TabsTrigger>
              <TabsTrigger value="create" className="flex-1">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Create New Employee
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="mt-3 space-y-1.5">
              <Label htmlFor="emp-select">Select employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger id="emp-select">
                  <SelectValue placeholder="Choose employee…" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem value="__loading" disabled>
                      Loading…
                    </SelectItem>
                  ) : (
                    employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                        {emp.role && (
                          <span className="ml-2 text-xs text-muted-foreground">· {emp.role}</span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="create" className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-emp-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="new-emp-name"
                  placeholder="e.g. Riya Akter"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-emp-phone">Phone <span className="text-destructive">*</span></Label>
                <Input
                  id="new-emp-phone"
                  placeholder="e.g. 01712345678"
                  value={newEmpPhone}
                  onChange={(e) => setNewEmpPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-emp-role">Role <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select value={newEmpRole} onValueChange={setNewEmpRole}>
                  <SelectTrigger id="new-emp-role">
                    <SelectValue placeholder="Select role…" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Stylist", "Manager", "Receptionist", "Assistant", "Other"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setLinkTarget(null)}
              disabled={isLinking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLink}
              disabled={
                isLinking ||
                (linkMode === "existing" && !selectedEmployeeId) ||
                (linkMode === "create" && (!newEmpName.trim() || !newEmpPhone.trim()))
              }
            >
              {isLinking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : linkMode === "create" ? (
                <UserPlus className="mr-2 h-4 w-4" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              {linkMode === "create" ? "Create & Link" : "Confirm Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete-all confirmation dialog ──────────────────────────────── */}
      <Dialog
        open={deleteAllOpen}
        onOpenChange={(open) => {
          if (!open && !isDeletingAll) setDeleteAllOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Delete All Device Users</DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  {deviceUsers.length} unlinked user{deviceUsers.length !== 1 ? "s" : ""} will be removed
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="mt-2 text-sm text-muted-foreground">
            This will permanently remove all{" "}
            <span className="font-medium text-foreground">{deviceUsers.length} unlinked</span>{" "}
            users from the ZKTeco device and the database. Their fingerprint data on the device
            will be erased. This cannot be undone.
          </p>

          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteAllOpen(false)}
              disabled={isDeletingAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ───────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Delete Device User</DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  UID:{" "}
                  <Badge variant="outline" className="font-mono text-xs">
                    {deleteTarget?.deviceUid}
                  </Badge>
                  {deleteTarget?.name && (
                    <span className="ml-2 text-muted-foreground">· {deleteTarget.name}</span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="mt-2 text-sm text-muted-foreground">
            This will permanently remove the user from the{" "}
            <span className="font-medium text-foreground">ZKTeco device</span> and from the
            database. Their fingerprint data on the device will be erased. This cannot be undone.
          </p>

          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete from Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
