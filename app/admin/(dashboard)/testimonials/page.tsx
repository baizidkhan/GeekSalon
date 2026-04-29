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
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Quote,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  Testimonial
} from "@admin/api/testimonials/testimonials"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    position: "",
    description: "",
  })

  const [testimonialToEdit, setTestimonialToEdit] = useState<Testimonial | null>(null)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const data = await getTestimonials()
      setTestimonials(data)
    } catch (error) {
      console.error("Failed to fetch testimonials:", error)
      toast.error("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const filteredTestimonials = useMemo(() => {
    return Array.isArray(testimonials) ? testimonials.filter(
      (t) =>
        t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.position.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) : []
  }, [testimonials, debouncedSearch])

  const handleAddTestimonial = async () => {
    if (newTestimonial.name && newTestimonial.description) {
      try {
        setSubmitting(true)
        await createTestimonial(newTestimonial)
        toast.success("Testimonial added successfully")
        setNewTestimonial({
          name: "",
          position: "",
          description: "",
        })
        setIsAddDialogOpen(false)
        fetchTestimonials()
      } catch (error) {
        toast.error("Failed to add testimonial")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleUpdateTestimonial = async () => {
    if (testimonialToEdit) {
      try {
        setSubmitting(true)
        const { name, position, description } = testimonialToEdit
        await updateTestimonial(testimonialToEdit.id, { name, position, description })
        toast.success("Testimonial updated successfully")
        setTestimonialToEdit(null)
        fetchTestimonials()
      } catch (error) {
        console.error("Update failed:", error)
        toast.error("Failed to update testimonial")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleDeleteTestimonial = async () => {
    if (testimonialToDelete) {
      try {
        setSubmitting(true)
        await deleteTestimonial(testimonialToDelete.id)
        toast.success("Testimonial deleted successfully")
        setTestimonialToDelete(null)
        fetchTestimonials()
      } catch (error) {
        toast.error("Failed to delete testimonial")
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="premium-page p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Quote className="w-6 h-6 text-primary" />
            Client Testimonials
          </h1>
          <p className="text-muted-foreground">Manage client feedback and success stories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 pb-2">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input 
                  placeholder="e.g. Sophia Laurent" 
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Position / Title</Label>
                <Input 
                  placeholder="e.g. Creative Director" 
                  value={newTestimonial.position}
                  onChange={(e) => setNewTestimonial({...newTestimonial, position: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="The team's artistry and dedication..." 
                  value={newTestimonial.description}
                  onChange={(e) => setNewTestimonial({...newTestimonial, description: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTestimonial} className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Testimonial
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
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : filteredTestimonials.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No testimonials found.</TableCell></TableRow>
            ) : (
              filteredTestimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.position}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTestimonialToEdit({...t})}>
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setTestimonialToDelete(t)}>
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

      {/* Edit Modal */}
      <Dialog open={!!testimonialToEdit} onOpenChange={() => setTestimonialToEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Testimonial</DialogTitle></DialogHeader>
          {testimonialToEdit && (
            <div className="space-y-4 py-4 pb-2">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input 
                  value={testimonialToEdit.name}
                  onChange={(e) => setTestimonialToEdit({...testimonialToEdit, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input 
                  value={testimonialToEdit.position}
                  onChange={(e) => setTestimonialToEdit({...testimonialToEdit, position: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={testimonialToEdit.description}
                  onChange={(e) => setTestimonialToEdit({...testimonialToEdit, description: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={handleUpdateTestimonial} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!testimonialToDelete} onOpenChange={() => setTestimonialToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Testimonial</DialogTitle></DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to delete the testimonial from <strong>{testimonialToDelete?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialToDelete(null)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTestimonial} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
