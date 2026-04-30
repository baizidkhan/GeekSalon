"use client"

import { useState, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { Fingerprint, Link2, Loader2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { useBiometricSocket, type UnlinkedFingerprintScannedPayload } from "@/hooks/use-biometric-socket"
import { linkDeviceUser } from "@admin/api/biometric/biometric"
import { getBasicEmployees, createEmployee } from "@admin/api/employees/employees"
import { reprocessAttendanceForDevice, suppressUnlinkedScan } from "@admin/api/attendance/attendance"

interface BasicEmployee {
  id: string
  name: string
  role?: string
}

export function UnlinkedFingerprintModal() {
  const [pending, setPending] = useState<UnlinkedFingerprintScannedPayload | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const [showLink, setShowLink] = useState(false)
  const [employees, setEmployees] = useState<BasicEmployee[]>([])
  const [loadingEmps, setLoadingEmps] = useState(false)

  const [linkMode, setLinkMode] = useState<"existing" | "create">("existing")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [newEmpName, setNewEmpName] = useState("")
  const [newEmpPhone, setNewEmpPhone] = useState("")
  const [newEmpRole, setNewEmpRole] = useState("")
  const [isLinking, startLinkTransition] = useTransition()

  const handleUnlinkedScan = useCallback(
    (payload: UnlinkedFingerprintScannedPayload) => {
      // Ignore if already dismissed or a prompt is already visible for this UID
      if (dismissed.has(payload.deviceUserId)) return
      if (pending?.deviceUserId === payload.deviceUserId) return
      setPending(payload)
    },
    [dismissed, pending],
  )

  useBiometricSocket({ onUnlinkedFingerprintScanned: handleUnlinkedScan })

  function dismiss() {
    if (!pending) return
    const { deviceUserId, attendanceDate } = pending
    // Suppress the triggering scan so it is never counted in attendance,
    // even if this device user is linked later via the Unlinked Users page.
    suppressUnlinkedScan(deviceUserId, attendanceDate).catch(() => {
      // Best-effort; the scan stays unsuppressed in the worst case but
      // the employee won't be linked so processGroup will keep skipping it.
    })
    setDismissed((prev) => new Set(prev).add(deviceUserId))
    setPending(null)
    setShowLink(false)
  }

  async function openLinkDialog() {
    setShowLink(true)
    setLinkMode("existing")
    setSelectedEmployeeId("")
    setNewEmpName("")
    setNewEmpPhone("")
    setNewEmpRole("")

    if (employees.length === 0) {
      setLoadingEmps(true)
      try {
        const list = await getBasicEmployees()
        setEmployees(list)
      } catch {
        toast.error("Failed to load employees")
      } finally {
        setLoadingEmps(false)
      }
    }
  }

  function handleLink() {
    if (!pending) return
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

        await linkDeviceUser(pending.deviceUserId, employeeId)

        // Reprocess any attendance logs already stored for this UID
        try {
          await reprocessAttendanceForDevice(pending.deviceUserId)
        } catch {
          // Non-fatal: attendance will be picked up on the next 30-second sync cycle
        }

        toast.success(`Fingerprint linked to ${employeeName ?? "employee"} and attendance updated`)
        setPending(null)
        setShowLink(false)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Linking failed")
      }
    })
  }

  if (!pending) return null

  // ── Prompt modal (connect or ignore) ────────────────────────────────────────
  if (!showLink) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Unlinked Fingerprint Detected</DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  Device UID:{" "}
                  <Badge variant="outline" className="font-mono text-xs">
                    {pending.deviceUserId}
                  </Badge>
                  {pending.name && (
                    <span className="ml-2 text-muted-foreground">· {pending.name}</span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mt-1">
            An unlinked user has scanned a fingerprint. Do you want to connect this user to an
            employee so their attendance is recorded?
          </p>

          <DialogFooter className="mt-4 flex-col gap-2 sm:flex-col">
            <Button className="w-full" onClick={openLinkDialog}>
              <Link2 className="mr-2 h-4 w-4" />
              Connect to Employee
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={dismiss}>
              <X className="mr-2 h-4 w-4" />
              Ignore for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Link modal ───────────────────────────────────────────────────────────────
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isLinking) {
          setShowLink(false)
          dismiss()
        }
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
                  {pending.deviceUserId}
                </Badge>
                {pending.name && (
                  <span className="ml-2 text-muted-foreground">· {pending.name}</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={linkMode}
          onValueChange={(v) => setLinkMode(v as "existing" | "create")}
          className="mt-3 pb-2"
        >
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
            <Label htmlFor="uf-emp-select">Select employee</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger id="uf-emp-select">
                <SelectValue placeholder={loadingEmps ? "Loading…" : "Choose employee…"} />
              </SelectTrigger>
              <SelectContent>
                {loadingEmps ? (
                  <SelectItem value="__loading" disabled>
                    Loading…
                  </SelectItem>
                ) : employees.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    No employees found
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
              <Label htmlFor="uf-emp-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uf-emp-name"
                placeholder="e.g. Riya Akter"
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uf-emp-phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uf-emp-phone"
                placeholder="e.g. 01712345678"
                value={newEmpPhone}
                onChange={(e) => setNewEmpPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uf-emp-role">
                Role <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Select value={newEmpRole} onValueChange={setNewEmpRole}>
                <SelectTrigger id="uf-emp-role">
                  <SelectValue placeholder="Select role…" />
                </SelectTrigger>
                <SelectContent>
                  {["Stylist", "Manager", "Receptionist", "Assistant", "Other"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setShowLink(false)
              dismiss()
            }}
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
  )
}
