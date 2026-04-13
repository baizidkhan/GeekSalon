"use client"

import { useState, useMemo } from "react"
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
import { Plus, Search, Clock, MoreHorizontal, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react"
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
  price: number
  active: boolean
}

const CATEGORIES = ["All", "Hair", "Beauty", "Skin", "Bridal", "Nails", "Other"]

const initialServices: Service[] = [
  { id: "1", name: "Haircut - Men", category: "Hair", duration: 30, price: 300, active: true },
  { id: "2", name: "Haircut - Women", category: "Hair", duration: 45, price: 500, active: true },
  { id: "3", name: "Hair Spa", category: "Hair", duration: 60, price: 1500, active: true },
  { id: "4", name: "Facial - Basic", category: "Skin", duration: 45, price: 800, active: true },
  { id: "5", name: "Threading - Eyebrow", category: "Beauty", duration: 15, price: 100, active: true },
  { id: "6", name: "Manicure", category: "Nails", duration: 30, price: 400, active: true },
  { id: "7", name: "Pedicure", category: "Nails", duration: 45, price: 500, active: true },
  { id: "8", name: "Bridal Makeup", category: "Bridal", duration: 120, price: 8000, active: true },
  { id: "9", name: "Party Makeup", category: "Beauty", duration: 60, price: 2500, active: true },
]

const PRICE_SORT_OPTIONS = [
  { value: "none", label: "All Prices" },
  { value: "high", label: "High to Low" },
  { value: "low", label: "Low to High" },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priceSort, setPriceSort] = useState("none")
  const [newService, setNewService] = useState({ name: "", category: "", duration: "", price: "" })
  
  const [viewService, setViewService] = useState<Service | null>(null)
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)

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

  const handleAddService = () => {
    if (newService.name && newService.category && newService.price) {
      setServices([
        ...services,
        {
          id: Date.now().toString(),
          name: newService.name,
          category: newService.category,
          duration: parseInt(newService.duration) || 30,
          price: parseFloat(newService.price),
          active: true,
        },
      ])
      setNewService({ name: "", category: "", duration: "", price: "" })
      setIsDialogOpen(false)
    }
  }

  const handleEditSave = () => {
    if (editService) {
      setServices(services.map(s => s.id === editService.id ? editService : s))
      setEditService(null)
    }
  }

  const handleDelete = () => {
    if (deleteService) {
      setServices(services.filter(s => s.id !== deleteService.id))
      setDeleteService(null)
    }
  }

  const toggleServiceActive = (id: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, active: !service.active } : service
      )
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
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
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
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
                      onCheckedChange={() => toggleServiceActive(service.id)}
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
                        <DropdownMenuItem onClick={() => setViewService(service)}>
                          <Eye className="w-4 h-4 mr-2" />View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditService({...service})}>
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteService(service)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewService} onOpenChange={() => setViewService(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Service Details</DialogTitle></DialogHeader>
          {viewService && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{viewService.name}</p></div>
                <div><Label className="text-muted-foreground">Category</Label><p className="font-medium">{viewService.category}</p></div>
                <div><Label className="text-muted-foreground">Duration</Label><p className="font-medium">{viewService.duration} min</p></div>
                <div><Label className="text-muted-foreground">Price</Label><p className="font-medium">৳{viewService.price.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{viewService.active ? "Active" : "Inactive"}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editService} onOpenChange={() => setEditService(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          {editService && (
            <div className="space-y-4 mt-4">
              <div><Label>Name</Label><Input value={editService.name} onChange={(e) => setEditService({...editService, name: e.target.value})} /></div>
              <div>
                <Label>Category</Label>
                <Select value={editService.category} onValueChange={(v) => setEditService({...editService, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.filter(c => c !== "All").map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Duration (min)</Label><Input type="number" value={editService.duration} onChange={(e) => setEditService({...editService, duration: parseInt(e.target.value) || 0})} /></div>
                <div><Label>Price (৳)</Label><Input type="number" value={editService.price} onChange={(e) => setEditService({...editService, price: parseFloat(e.target.value) || 0})} /></div>
              </div>
              <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteService} onOpenChange={() => setDeleteService(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Service</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleteService?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteService(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
