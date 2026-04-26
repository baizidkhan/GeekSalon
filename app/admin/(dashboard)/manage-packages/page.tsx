"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Sparkles,
  Calendar,
  Check,
  X,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  bookPackage,
} from "@admin/api/packages/packages"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Package {
  id: string
  category: string
  title: string
  price: number
  billingCycle: string
  description: string
  features: string[]
}

export default function ManagePackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [newPackage, setNewPackage] = useState({
    category: "SPECIAL",
    title: "",
    price: "",
    billingCycle: "package",
    description: "",
    features: [] as string[],
    newFeature: "",
  })

  const [bookingData, setBookingData] = useState({
    clientName: "",
    phoneNumber: "",
    date: new Date().toISOString().split('T')[0],
    time: "11:00",
    source: "online",
    notes: "",
  })

  const [packageToView, setPackageToView] = useState<Package | null>(null)
  const [packageToEdit, setPackageToEdit] = useState<Package | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null)
  const [packageToBook, setPackageToBook] = useState<Package | null>(null)

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const data = await getPackages()
      setPackages(data)
    } catch (error) {
      console.error("Failed to fetch packages:", error)
      toast.error("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const filteredPackages = useMemo(() => {
    return packages.filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(search.toLowerCase()) ||
        pkg.category.toLowerCase().includes(search.toLowerCase())
    )
  }, [packages, search])

  const handleAddPackage = async () => {
    if (newPackage.title && newPackage.price) {
      try {
        setSubmitting(true)
        await createPackage({
          category: newPackage.category,
          title: newPackage.title,
          price: parseFloat(newPackage.price),
          billingCycle: newPackage.billingCycle,
          description: newPackage.description,
          features: newPackage.features,
        })
        toast.success("Package created successfully")
        setNewPackage({
          category: "SPECIAL",
          title: "",
          price: "",
          billingCycle: "package",
          description: "",
          features: [],
          newFeature: "",
        })
        setIsAddDialogOpen(false)
        fetchPackages()
      } catch (error) {
        toast.error("Failed to create package")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleUpdatePackage = async () => {
    if (packageToEdit) {
      try {
        setSubmitting(true)
        const { id, createdAt, updatedAt, ...payload } = packageToEdit as any
        await updatePackage(id, payload)
        toast.success("Package updated successfully")
        setPackageToEdit(null)
        fetchPackages()
      } catch (error) {
        toast.error("Failed to update package")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleDeletePackage = async () => {
    if (packageToDelete) {
      try {
        setSubmitting(true)
        await deletePackage(packageToDelete.id)
        toast.success("Package deleted successfully")
        setPackageToDelete(null)
        fetchPackages()
      } catch (error) {
        toast.error("Failed to delete package")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleBookPackage = async () => {
    if (packageToBook && bookingData.clientName && bookingData.phoneNumber) {
      try {
        setSubmitting(true)
        await bookPackage(packageToBook.id, bookingData)
        toast.success("Package booked successfully")
        setIsBookingDialogOpen(false)
        setPackageToBook(null)
        setBookingData({
          clientName: "",
          phoneNumber: "",
          date: new Date().toISOString().split('T')[0],
          time: "11:00",
          source: "online",
          notes: "",
        })
      } catch (error) {
        toast.error("Failed to book package")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const addFeature = () => {
    if (newPackage.newFeature.trim()) {
      setNewPackage({
        ...newPackage,
        features: [...newPackage.features, newPackage.newFeature.trim()],
        newFeature: "",
      })
    }
  }

  const removeFeature = (index: number) => {
    setNewPackage({
      ...newPackage,
      features: newPackage.features.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="premium-page p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Makeover Packages
          </h1>
          <p className="text-muted-foreground">Create and manage bundled service packages</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g. Bridal Glow" 
                    value={newPackage.title}
                    onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input 
                    placeholder="e.g. SPECIAL" 
                    value={newPackage.category}
                    onChange={(e) => setNewPackage({...newPackage, category: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Price (৳)</Label>
                  <Input 
                    type="number" 
                    placeholder="799" 
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({...newPackage, price: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Billing Cycle</Label>
                  <Input 
                    placeholder="e.g. package, session" 
                    value={newPackage.billingCycle}
                    onChange={(e) => setNewPackage({...newPackage, billingCycle: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the package benefits..." 
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-4">
                  <Label>Features</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a feature..." 
                      value={newPackage.newFeature}
                      onChange={(e) => setNewPackage({...newPackage, newFeature: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button type="button" variant="secondary" onClick={addFeature}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPackage.features.map((feature, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-xs">
                        {feature}
                        <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFeature(i)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={handleAddPackage} className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Package
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Info</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : filteredPackages.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No packages found.</TableCell></TableRow>
            ) : (
              filteredPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div className="font-medium">{pkg.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{pkg.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {pkg.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">৳{pkg.price}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{pkg.billingCycle}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.slice(0, 2).map((f, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-secondary rounded text-[10px] whitespace-nowrap">{f}</span>
                      ))}
                      {pkg.features.length > 2 && (
                        <span className="px-2 py-0.5 bg-secondary rounded text-[10px]">+{pkg.features.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setPackageToBook(pkg); setIsBookingDialogOpen(true); }}>
                          <Calendar className="w-4 h-4 mr-2" />Book Package
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPackageToView(pkg)}>
                          <Eye className="w-4 h-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPackageToEdit({...pkg})}>
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setPackageToDelete(pkg)}>
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
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Book Package: {packageToBook?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Client Name</Label>
                <Input 
                  value={bookingData.clientName}
                  onChange={(e) => setBookingData({...bookingData, clientName: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Phone Number</Label>
                <Input 
                  value={bookingData.phoneNumber}
                  onChange={(e) => setBookingData({...bookingData, phoneNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input 
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Source</Label>
                <Input 
                  value={bookingData.source}
                  onChange={(e) => setBookingData({...bookingData, source: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea 
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  placeholder="e.g. Please prepare the champagne."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBookPackage} className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!packageToView} onOpenChange={() => setPackageToView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{packageToView?.title}</DialogTitle></DialogHeader>
          {packageToView && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  {packageToView.category}
                </span>
                <div className="text-right">
                  <div className="text-3xl font-bold">৳{packageToView.price}</div>
                  <div className="text-xs text-muted-foreground uppercase">{packageToView.billingCycle}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm leading-relaxed">{packageToView.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Included Features</Label>
                <ul className="mt-2 space-y-2">
                  {packageToView.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!packageToEdit} onOpenChange={() => setPackageToEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {packageToEdit && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input 
                    value={packageToEdit.title}
                    onChange={(e) => setPackageToEdit({...packageToEdit, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input 
                    value={packageToEdit.category}
                    onChange={(e) => setPackageToEdit({...packageToEdit, category: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Price (৳)</Label>
                  <Input 
                    type="number"
                    value={packageToEdit.price}
                    onChange={(e) => setPackageToEdit({...packageToEdit, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={packageToEdit.description}
                    onChange={(e) => setPackageToEdit({...packageToEdit, description: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-4">
                  <Label>Features (Comma separated)</Label>
                  <Textarea 
                    value={packageToEdit.features.join(', ')}
                    onChange={(e) => setPackageToEdit({...packageToEdit, features: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                  />
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button className="w-full" onClick={handleUpdatePackage} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!packageToDelete} onOpenChange={() => setPackageToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Package</DialogTitle></DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to delete the package <strong>{packageToDelete?.title}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackageToDelete(null)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePackage} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
