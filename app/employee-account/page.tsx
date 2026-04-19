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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Shield, Mail, Key } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    UserManagement
} from "@/api/employee-account/employee-account"
import { getBasicEmployees } from "@/api/employees/employees"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const AVAILABLE_PERMISSIONS = [
    { id: "clients", label: "Clients" },
    { id: "appointments", label: "Appointments" },
    { id: "service", label: "Services" },
    { id: "inventory", label: "Inventory" },
    { id: "invoice", label: "Invoices / POS" },
    { id: "employee", label: "Employees" },
    { id: "attendance", label: "Attendance" },
    { id: "leave-request", label: "Leave Requests" },
    { id: "announcement", label: "Announcements" },
    { id: "user-management", label: "User Management" },
    { id: "reports", label: "Reports & Analytics" },
    { id: "hr-payroll", label: "HR & Payroll" },
    { id: "settings", label: "System Settings" },
]


export default function EmployeeAccountPage() {
    const [users, setUsers] = useState<UserManagement[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const [employees, setEmployees] = useState<any[]>([])
    const [newUser, setNewUser] = useState({
        useremail: "",
        password: "",
        role: "staff",
        permissions: [] as string[],
        employeeId: "none"
    })

    const [userToEdit, setUserToEdit] = useState<UserManagement | null>(null)
    const [userToDelete, setUserToDelete] = useState<UserManagement | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const [data, empData] = await Promise.all([
                 getAllUsers(),
                 getBasicEmployees()
            ]);
            setUsers(Array.isArray(data) ? data : (data?.data || []))
            setEmployees(Array.isArray(empData) ? empData : (empData?.data || []))
        } catch (error) {
            console.error("Failed to fetch data:", error)
            toast.error("Failed to load user accounts")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.useremail.toLowerCase().includes(search.toLowerCase())
        )
    }, [users, search])

    const handleAddUser = async () => {
        if (newUser.useremail && newUser.password && newUser.role) {
            try {
                const payload = {
                    ...newUser,
                    ...(newUser.employeeId && newUser.employeeId !== "none" && { employeeId: newUser.employeeId })
                };
                await createUser(payload)
                toast.success("User account created successfully")
                setNewUser({ useremail: "", password: "", role: "staff", permissions: [], employeeId: "none" })
                setIsAddDialogOpen(false)
                fetchUsers()
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to create user")
            }
        }
    }

    const handleUpdateSave = async () => {
        if (userToEdit) {
            try {
                const payload = {
                    role: userToEdit.role,
                    permissions: userToEdit.permissions
                }
                await updateUser(userToEdit.id, payload)
                toast.success("User account updated successfully")
                setUserToEdit(null)
                fetchUsers()
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to update user")
            }
        }
    }

    const handleDelete = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete.id)
                toast.success("User account deleted successfully")
                setUserToDelete(null)
                fetchUsers()
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to delete user")
            }
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-red-100 text-red-700 border-red-200">Admin</Badge>
            case "storeManager":
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Manager</Badge>
            case "staff":
                return <Badge className="bg-green-100 text-green-700 border-green-200">Staff</Badge>
            case "custom":
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Custom</Badge>
            default:
                return <Badge variant="outline">{role}</Badge>
        }
    }

    const togglePermission = (permId: string, isNew: boolean) => {
        if (isNew) {
            setNewUser(prev => ({
                ...prev,
                permissions: prev.permissions.includes(permId)
                    ? prev.permissions.filter(p => p !== permId)
                    : [...prev.permissions, permId]
            }))
        } else if (userToEdit) {
            setUserToEdit(prev => {
                if (!prev) return null
                const perms = prev.permissions || []
                return {
                    ...prev,
                    permissions: perms.includes(permId)
                        ? perms.filter(p => p !== permId)
                        : [...perms, permId]
                }
            })
        }
    }

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Employee Accounts</h1>
                        <p className="text-muted-foreground">Manage system access and permissions</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create System User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Link an Employee Record (Optional)</Label>
                                    <Select
                                        value={newUser.employeeId}
                                        onValueChange={(v) => setNewUser({ ...newUser, employeeId: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Employee..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Employee (System User)</SelectItem>
                                            {employees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            placeholder="staff@example.com"
                                            value={newUser.useremail}
                                            onChange={(e) => setNewUser({ ...newUser, useremail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Initial Password</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            className="pl-9"
                                            placeholder="••••••••"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>System Role</Label>
                                    <Select
                                        value={newUser.role}
                                        onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                            <SelectItem value="storeManager">Store Manager</SelectItem>
                                            <SelectItem value="staff">Staff (Default)</SelectItem>
                                            <SelectItem value="custom">Custom (Select Permissions)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newUser.role === "custom" && (
                                    <div className="space-y-3 pt-2">
                                        <Label>Granted Permissions</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                                <div key={perm.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`new-${perm.id}`}
                                                        checked={newUser.permissions.includes(perm.id)}
                                                        onCheckedChange={() => togglePermission(perm.id, true)}
                                                    />
                                                    <label htmlFor={`new-${perm.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        {perm.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddUser} className="w-full">Create Account</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-card rounded-xl border border-border">
                    <div className="p-4 border-b border-border">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10">Loading accounts...</TableCell></TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No accounts found.</TableCell></TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <p className="font-medium text-foreground">
                                                {user.employee?.name || user.useremail}
                                            </p>
                                            {user.employee?.name && (
                                                <p className="text-xs text-muted-foreground">{user.useremail}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.role === 'admin' ? (
                                                    <span className="text-xs text-muted-foreground italic">Admin</span>
                                                ) : user.role === 'storeManager' ? (
                                                    <span className="text-xs text-muted-foreground italic">Store Manager</span>
                                                ) : user.role === 'staff' ? (
                                                    <span className="text-xs text-muted-foreground italic">Staff</span>
                                                ) : user.permissions?.length > 0 ? (
                                                    <>
                                                        {user.permissions.slice(0, 3).map(p => (
                                                            <Badge key={p} variant="secondary" className="text-[10px] py-0">{p}</Badge>
                                                        ))}
                                                        {user.permissions.length > 3 && (
                                                            <span className="text-[10px] text-muted-foreground">+{user.permissions.length - 3} more</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">View Only</span>
                                                )}

                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setUserToEdit({ ...user })}>
                                                        <Pencil className="w-4 h-4 mr-2" />Edit Permissions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setUserToDelete(user)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />Delete Account
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!userToEdit} onOpenChange={() => setUserToEdit(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Edit Access Permissions</DialogTitle></DialogHeader>
                    {userToEdit && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                                <Mail className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">{userToEdit.useremail}</span>
                            </div>

                            <div className="space-y-2">
                                <Label>Update Role</Label>
                                <Select
                                    value={userToEdit.role}
                                    onValueChange={(v) => setUserToEdit({ ...userToEdit, role: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="storeManager">Store Manager</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {userToEdit.role === "custom" && (
                                <div className="space-y-3 pt-2">
                                    <Label>Module Access Control</Label>
                                    <ScrollArea className="h-[200px] border rounded-md p-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                                <div key={perm.id} className="flex items-center justify-between">
                                                    <label htmlFor={`edit-${perm.id}`} className="text-sm font-medium">
                                                        {perm.label}
                                                    </label>
                                                    <Checkbox
                                                        id={`edit-${perm.id}`}
                                                        checked={userToEdit.permissions?.includes(perm.id)}
                                                        onCheckedChange={() => togglePermission(perm.id, false)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button className="w-full" onClick={handleUpdateSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete System Account</DialogTitle></DialogHeader>
                    <div className="py-4 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-2">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <p className="text-muted-foreground">
                            Are you sure you want to delete the account for <strong>{userToDelete?.useremail}</strong>?
                            This action will immediately revoke all system access.
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setUserToDelete(null)} className="flex-1">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="flex-1">Confirm Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
