"use client"

import { useState } from "react"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Clock, MoreHorizontal } from "lucide-react"
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

const initialServices: Service[] = [
  {
    id: "1",
    name: "Haircut - Men",
    category: "Hair",
    duration: 30,
    price: 300,
    active: true,
  },
  {
    id: "2",
    name: "Haircut - Women",
    category: "Hair",
    duration: 45,
    price: 500,
    active: true,
  },
  {
    id: "3",
    name: "Hair Spa",
    category: "Hair",
    duration: 60,
    price: 1500,
    active: true,
  },
  {
    id: "4",
    name: "Facial - Basic",
    category: "Skin",
    duration: 45,
    price: 800,
    active: true,
  },
  {
    id: "5",
    name: "Threading - Eyebrow",
    category: "Grooming",
    duration: 15,
    price: 100,
    active: true,
  },
  {
    id: "6",
    name: "Manicure",
    category: "Nails",
    duration: 30,
    price: 400,
    active: true,
  },
  {
    id: "7",
    name: "Pedicure",
    category: "Nails",
    duration: 45,
    price: 500,
    active: true,
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    category: "",
    duration: "",
    price: "",
  })

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.category.toLowerCase().includes(search.toLowerCase())
  )

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
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newService.category}
                    onValueChange={(value) =>
                      setNewService({ ...newService, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hair">Hair</SelectItem>
                      <SelectItem value="Skin">Skin</SelectItem>
                      <SelectItem value="Nails">Nails</SelectItem>
                      <SelectItem value="Grooming">Grooming</SelectItem>
                      <SelectItem value="Makeup">Makeup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newService.duration}
                      onChange={(e) =>
                        setNewService({ ...newService, duration: e.target.value })
                      }
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label>Price (৳)</Label>
                    <Input
                      type="number"
                      value={newService.price}
                      onChange={(e) =>
                        setNewService({ ...newService, price: e.target.value })
                      }
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
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
