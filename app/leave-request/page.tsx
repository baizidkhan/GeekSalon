"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, XCircle, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import {
    getLeaveRequests,
    createLeaveRequest,
    updateLeaveRequestStatus,
    deleteLeaveRequest,
    LeaveRequest
} from "@/api/leave-request/leave-request"
import { getBasicEmployees } from "@/api/employees/employees"

export default function LeaveRequestsPage() {
    const { user } = useAuth()
    const [requests, setRequests] = useState<LeaveRequest[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(null)

    // Form state
    const [newRequest, setNewRequest] = useState({
        employeeId: "",
        leaveType: "casual",
        startDate: "",
        endDate: "",
        reason: ""
    })

    const isPrivileged = user?.role === 'admin' || user?.role === 'storeManager' ||
        (user?.role === 'custom' && user?.permissions?.includes('leave-request'))

    const fetchData = async () => {
        try {
            setLoading(true)
            const responseData = await getLeaveRequests()
            // Safely handle both array and object { data: [] } response formats from the backend
            const requestsArray = Array.isArray(responseData) ? responseData : (responseData?.data || responseData?.items || [])
            setRequests(requestsArray)

            if (isPrivileged) {
                const empData = await getBasicEmployees()
                // Safely handle employee response format too
                const employeesArray = Array.isArray(empData) ? empData : (empData?.data || empData?.items || [])
                setEmployees(employeesArray)
            }
        } catch (error) {
            console.error("Failed to fetch leave requests:", error)
            toast.error("Failed to load leave requests")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const filteredRequests = useMemo(() => {
        if (!Array.isArray(requests)) return []

        return requests.filter((req) => {
            const matchesName = req.employeeName ? req.employeeName.toLowerCase().includes(search.toLowerCase()) : false
            const matchesReason = req.reason ? req.reason.toLowerCase().includes(search.toLowerCase()) : false
            const matchesType = req.leaveType ? req.leaveType.toLowerCase().includes(search.toLowerCase()) : false
            return matchesName || matchesReason || matchesType
        })
    }, [requests, search])

    const handleCreateRequest = async () => {
        if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
            toast.error("Please fill in all required fields")
            return
        }

        if (isPrivileged && !newRequest.employeeId) {
            toast.error("Please select an employee")
            return
        }

        try {
            const payload = {
                leaveType: newRequest.leaveType,
                startDate: newRequest.startDate,
                endDate: newRequest.endDate,
                reason: newRequest.reason,
                ...(isPrivileged && { employeeId: newRequest.employeeId })
            }

            await createLeaveRequest(payload)
            toast.success("Leave request submitted successfully")
            setNewRequest({ employeeId: "", leaveType: "casual", startDate: "", endDate: "", reason: "" })
            setIsAddDialogOpen(false)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit request")
        }
    }

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateLeaveRequestStatus(id, status)
            toast.success(`Request ${status} successfully`)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to update status`)
        }
    }

    const handleDelete = async () => {
        if (requestToDelete) {
            try {
                await deleteLeaveRequest(requestToDelete.id)
                toast.success("Leave request deleted successfully")
                setRequestToDelete(null)
                fetchData()
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to delete request")
            }
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
            case "rejected":
                return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
            default:
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "casual":
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Casual</Badge>
            case "annual":
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Annual</Badge>
            case "emergency":
                return <Badge variant="outline" className="border-red-200 text-red-700">Emergency</Badge>
            default:
                return <Badge variant="outline">{type}</Badge>
        }
    }

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Leave Requests</h1>
                        <p className="text-muted-foreground">Manage employee time off and absences</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {isPrivileged ? "Submit Leave Request (On Behalf)" : "Request Leave"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{isPrivileged ? "Submit Leave Request" : "Request Time Off"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {isPrivileged && (
                                    <div className="space-y-2">
                                        <Label>Employee</Label>
                                        <Select
                                            value={newRequest.employeeId}
                                            onValueChange={(v) => setNewRequest({ ...newRequest, employeeId: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                                            <SelectContent>
                                                {employees.map(emp => (
                                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Leave Type</Label>
                                    <Select
                                        value={newRequest.leaveType}
                                        onValueChange={(v) => setNewRequest({ ...newRequest, leaveType: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="casual">Casual Leave</SelectItem>
                                            <SelectItem value="annual">Annual Leave</SelectItem>
                                            <SelectItem value="emergency">Emergency Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={newRequest.startDate}
                                            onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={newRequest.endDate}
                                            onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 max-w-full">
                                    <Label>Reason for Leave</Label>
                                    <Textarea
                                        placeholder="Please briefly explain your reason..."
                                        className="resize-none w-full break-all"
                                        rows={3}
                                        value={newRequest.reason}
                                        onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateRequest} className="w-full">Submit Request</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-card rounded-xl border border-border">
                    <div className="p-4 border-b border-border">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isPrivileged && <TableHead>Employee</TableHead>}
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                {isPrivileged && <TableHead className="w-16">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={isPrivileged ? 6 : 5} className="text-center py-10">Loading requests...</TableCell></TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow><TableCell colSpan={isPrivileged ? 6 : 5} className="text-center py-10 text-muted-foreground">No leave requests found.</TableCell></TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        {isPrivileged && (
                                            <TableCell className="font-medium">
                                                {req.employeeName || "Unknown"}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {getTypeBadge(req.leaveType)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[150px] sm:max-w-xs truncate" title={req.reason}>
                                            {req.reason}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(req.status)}
                                        </TableCell>
                                        {isPrivileged && (
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleUpdateStatus(req.id, 'approved')}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setRequestToDelete(req)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={!!requestToDelete} onOpenChange={() => setRequestToDelete(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Leave Request</DialogTitle></DialogHeader>
                    <div className="py-4 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-2">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <p className="text-muted-foreground">
                            Are you sure you want to delete this leave request? This action cannot be undone.
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setRequestToDelete(null)} className="flex-1">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="flex-1">Confirm Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
