"use client"

import { useState, useEffect, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
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
} from "@admin/api/employee-account/employee-account"
import { getBasicEmployees } from "@admin/api/employees/employees"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@admin/hooks/use-auth"
import { useRouter } from "next/navigation"
import { hasPermission } from "@admin/lib/auth-utils"

const AVAILABLE_PERMISSIONS = [
    { id: "dashboard", label: "Dashboard" },
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
    { id: "hr-payroll", label: "Manage Payrolls" },
    { id: "settings", label: "System Settings" },
]


export default function EmployeeAccountPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<UserManagement[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)
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
    const [isCreating, setIsCreating] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const fetchUsers = async () => {
        try {
            setLoading(true)

            // Fetch users (with individual error handling)
            try {
                const data = await getAllUsers();
                setUsers(Array.isArray(data) ? data : (data?.data || []));
            } catch (err) {
                console.error("Failed to fetch users:", err);
                toast.error("Could not load system accounts");
            }

            // Fetch employees (with individual error handling)
            try {
                const empData = await getBasicEmployees();
                setEmployees(Array.isArray(empData) ? empData : (empData?.data || []));
            } catch (err) {
                console.error("Failed to fetch employees:", err);
            }

        } catch (error) {
            console.error("Unexpected error in fetchUsers:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading) {
            if (!hasPermission(user, 'user-management')) {
                router.replace('/admin/appointments')
                return
            }
            fetchUsers()
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (!isAddDialogOpen) return
        getBasicEmployees()
            .then((empData) => setEmployees(Array.isArray(empData) ? empData : (empData?.data || [])))
            .catch(() => setEmployees([]))
    }, [isAddDialogOpen])

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.useremail.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
    }, [users, debouncedSearch])

    const unlinkedEmployees = useMemo(() => {
        return employees.filter(emp => !users.some(user => user.employeeId === emp.id || user.employee?.id === emp.id))
    }, [employees, users])

    if (authLoading || (!hasPermission(user, 'user-management') && !authLoading)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const handleAddUser = async () => {
        const errors: Record<string, string> = {}
        if (!newUser.useremail) errors.useremail = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(newUser.useremail)) errors.useremail = "Invalid email format"

        if (!newUser.password) errors.password = "Password is required"
        else if (newUser.password.length < 6) errors.password = "Password must be at least 6 characters"

        if (!newUser.role) errors.role = "Role is required"
        if (newUser.employeeId === "none") errors.employeeId = "Please link an employee account"

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        try {
            setIsCreating(true)
            setFormErrors({})
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
        } finally {
            setIsCreating(false)
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
        <>
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
                            <div className="space-y-4 py-4 pb-2">
                                <div className="space-y-2">
                                    <Label className={formErrors.employeeId ? "text-destructive" : ""}>Link an Employee Account <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={newUser.employeeId}
                                        onValueChange={(v) => {
                                            setNewUser({ ...newUser, employeeId: v })
                                            if (v !== "none") setFormErrors(prev => {
                                                const next = { ...prev }
                                                delete next.employeeId
                                                return next
                                            })
                                        }}
                                    >
                                        <SelectTrigger className={formErrors.employeeId ? "border-destructive" : ""}><SelectValue placeholder="Select Employee..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Select Employee...</SelectItem>
                                            {unlinkedEmployees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.employeeId && <p className="text-xs text-destructive">{formErrors.employeeId}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className={formErrors.useremail ? "text-destructive" : ""}>Email Address <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className={`pl-9 ${formErrors.useremail ? "border-destructive" : ""}`}
                                            placeholder="staff@example.com"
                                            value={newUser.useremail}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, useremail: e.target.value })
                                                if (e.target.value) setFormErrors(prev => {
                                                    const next = { ...prev }
                                                    delete next.useremail
                                                    return next
                                                })
                                            }}
                                        />
                                    </div>
                                    {formErrors.useremail && <p className="text-xs text-destructive">{formErrors.useremail}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className={formErrors.password ? "text-destructive" : ""}>Initial Password <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            className={`pl-9 ${formErrors.password ? "border-destructive" : ""}`}
                                            placeholder="••••••••"
                                            value={newUser.password}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, password: e.target.value })
                                                if (e.target.value) setFormErrors(prev => {
                                                    const next = { ...prev }
                                                    delete next.password
                                                    return next
                                                })
                                            }}
                                        />
                                    </div>
                                    {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className={formErrors.role ? "text-destructive" : ""}>System Role <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={newUser.role}
                                        onValueChange={(v) => {
                                            setNewUser({ ...newUser, role: v })
                                            if (v) setFormErrors(prev => {
                                                const next = { ...prev }
                                                delete next.role
                                                return next
                                            })
                                        }}
                                    >
                                        <SelectTrigger className={formErrors.role ? "border-destructive" : ""}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                            <SelectItem value="storeManager">Store Manager</SelectItem>
                                            <SelectItem value="staff">Staff (Default)</SelectItem>
                                            <SelectItem value="custom">Custom (Select Permissions)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.role && <p className="text-xs text-destructive">{formErrors.role}</p>}
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
                            <DialogFooter className="pb-6">
                                <Button onClick={handleAddUser} size="sm" className="w-full h-7" disabled={isCreating}>
                                    {isCreating ? "creating......." : "Create Account"}
                                </Button>
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
                        <div className="space-y-4 py-4 pb-2">
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
        </>
    )
}
