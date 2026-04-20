"use client"

import { useState, useMemo, useEffect } from "react"
import api from "@/api/base"
import { getServices, createService, updateService, deleteService } from "@/api/services/services"
import { toast } from "sonner"

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
import { Plus, Search, Clock, MoreHorizontal, ArrowUpDown, Eye, Pencil, Trash2, Scissors, Package, Receipt, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

interface Service {
  id: string
  name: string
  category: string
  duration: number
  description: string
  price: number
  active: boolean
}

const CATEGORIES = ["All", "Hair", "Makeup", "Skin", "Bridal", "Nails", "Other"]


const PRICE_SORT_OPTIONS = [
  { value: "none", label: "All Prices" },
  { value: "high", label: "High to Low" },
  { value: "low", label: "Low to High" },
]
const PAGE_SIZE = 10

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priceSort, setPriceSort] = useState("none")
  const [currentPage, setCurrentPage] = useState(1)
  const [newService, setNewService] = useState({ name: "", category: "", duration: "", price: "", description: "" })

  const [serviceToView, setServiceToView] = useState<Service | null>(null)
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)


  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await getServices()
      const mappedServices = data.map((s: any) => ({
        ...s,
        price: parseFloat(s.price) || 0,
        duration: parseInt(s.duration) || 0,
        description: s.description || "",
        active: s.status === 'active'
      }))
      setServices(mappedServices)

    } catch (error) {
      console.error("Failed to fetch services:", error)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])


  const filteredServices = useMemo(() => {
    let result = services.filter(
      (service) =>
        (service.name.toLowerCase().includes(search.toLowerCase()) ||
          service.category.toLowerCase().includes(search.toLowerCase())) &&
        (categoryFilter === "All" || service.category === categoryFilter)
    )

    if (priceSort === "high") {
      result = [...result].sort((a, b) => b.price - a.price)
    } else if (priceSort === "low") {
      result = [...result].sort((a, b) => a.price - b.price)
    }

    return result
  }, [services, search, categoryFilter, priceSort])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, priceSort])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE))
  const paginatedServices = filteredServices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAddService = async () => {
    if (newService.name && newService.category && newService.price) {
      try {
        const payload = {
          name: newService.name,
          category: newService.category,
          duration: parseInt(newService.duration) || 30,
          price: parseFloat(newService.price),
          status: 'active',
          description: newService.description
        }
        await createService(payload)
        toast.success("Service added successfully")
        setNewService({ name: "", category: "", duration: "", price: "", description: "" })
        setIsDialogOpen(false)
        fetchServices()
      } catch (error) {
        console.error("Failed to add service:", error)
        toast.error("Failed to add service")
      }
    }
  }

  const handleEditSave = async () => {
    if (serviceToEdit) {
      try {
        const payload = {
          name: serviceToEdit.name,
          category: serviceToEdit.category,
          duration: Number(serviceToEdit.duration),
          price: Number(serviceToEdit.price),
          status: serviceToEdit.active ? 'active' : 'hidden',
          description: serviceToEdit.description || ""
        }


        await updateService(serviceToEdit.id, payload)
        toast.success("Service updated successfully")
        setServiceToEdit(null)
        fetchServices()
      } catch (error) {
        console.error("Failed to update service:", error)
        toast.error("Failed to update service")
      }
    }
  }

  const handleDelete = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id)
        toast.success("Service deleted successfully")
        setServiceToDelete(null)
        fetchServices()
      } catch (error) {
        console.error("Failed to delete service:", error)
        toast.error("Failed to delete service")
      }
    }
  }


  const toggleServiceActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateService(id, { status: !currentStatus ? 'active' : 'hidden' })
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchServices()
    } catch (error) {
      console.error("Failed to toggle service status:", error)
      toast.error("Failed to update status")
    }
  }


  return (
    <>
      <div className="premium-page p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Services</h1>
            <p className="text-muted-foreground">Manage your salon services</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newService.category}
                    onValueChange={(value) => setNewService({ ...newService, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c !== "All").map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Describtion</Label>
                  <Input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Give a short description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label>Price (৳)</Label>
                    <Input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <Button onClick={handleAddService} className="w-full">
                  Add Service
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger className="w-36">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-auto">{filteredServices.length} results</span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Service Name</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary/60" />Category</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" />Duration</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Price</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-secondary rounded-md text-sm">
                        {service.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{service.duration} min</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ৳{service.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={service.active}
                        onCheckedChange={() => toggleServiceActive(service.id, service.active)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setServiceToView(service)}>
                            <Eye className="w-4 h-4 mr-2" />View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setServiceToEdit({ ...service })}>
                            <Pencil className="w-4 h-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setServiceToDelete(service)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>

                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}

            </TableBody>
          </Table>
          {!loading && filteredServices.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredServices.length)} of {filteredServices.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!serviceToView} onOpenChange={() => setServiceToView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Service Details</DialogTitle></DialogHeader>
          {serviceToView && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{serviceToView.name}</p></div>
                <div><Label className="text-muted-foreground">Category</Label><p className="font-medium">{serviceToView.category}</p></div>
                <div><Label className="text-muted-foreground">Duration</Label><p className="font-medium">{serviceToView.duration} min</p></div>
                <div><Label className="text-muted-foreground">Price</Label><p className="font-medium">৳{serviceToView.price.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{serviceToView.active ? "Active" : "Inactive"}</p></div>
              </div>
              <div><Label className="text-muted-foreground">Description</Label><p className="font-medium whitespace-pre-wrap">{serviceToView.description || "No description provided"}</p></div>
            </div>

          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!serviceToEdit} onOpenChange={() => setServiceToEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          {serviceToEdit && (
            <div className="space-y-4 mt-4">
              <div><Label>Name</Label><Input value={serviceToEdit.name} onChange={(e) => setServiceToEdit({ ...serviceToEdit, name: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={serviceToEdit.category} onValueChange={(v) => setServiceToEdit({ ...serviceToEdit, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.filter(c => c !== "All").map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Input type="text" value={serviceToEdit.description} onChange={(e) => setServiceToEdit({ ...serviceToEdit, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Duration (min)</Label><Input type="number" value={serviceToEdit.duration} onChange={(e) => setServiceToEdit({ ...serviceToEdit, duration: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Price (৳)</Label><Input type="number" value={serviceToEdit.price} onChange={(e) => setServiceToEdit({ ...serviceToEdit, price: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Service</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
