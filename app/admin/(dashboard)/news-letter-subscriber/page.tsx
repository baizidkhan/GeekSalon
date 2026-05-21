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
  Plus,
  Search,
  Trash2,
  Mail,
  Loader2,
} from "lucide-react"
import {
  getSubscribers,
  createSubscriber,
  deleteSubscriber,
  NewsLetterSubscriber
} from "@admin/api/news-letter-subscriber/news-letter-subscriber"
import { toast } from "sonner"
import { useAuth } from "@admin/hooks/use-auth"
import { useRouter } from "next/navigation"
import { hasPermission } from "@admin/lib/auth-utils"

export default function NewsLetterSubscribersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<NewsLetterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [newEmail, setNewEmail] = useState("")
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsLetterSubscriber | null>(null)

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const data = await getSubscribers()
      setSubscribers(data)
    } catch (error) {
      console.error("Failed to fetch subscribers:", error)
      toast.error("Failed to load subscribers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!hasPermission(user, 'news-letter-subscriber')) {
        router.replace('/admin/appointments')
        return
      }
      fetchSubscribers()
    }
  }, [user, authLoading, router])

  const filteredSubscribers = useMemo(() => {
    return Array.isArray(subscribers) ? subscribers.filter(
      (s) => s.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) : []
  }, [subscribers, debouncedSearch])

  const handleAddSubscriber = async () => {
    if (!newEmail) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error("Invalid email format")
      return
    }

    try {
      setSubmitting(true)
      await createSubscriber({ email: newEmail })
      toast.success("Subscriber added successfully")
      setNewEmail("")
      setIsAddDialogOpen(false)
      fetchSubscribers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add subscriber")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSubscriber = async () => {
    if (subscriberToDelete) {
      try {
        setSubmitting(true)
        await deleteSubscriber(subscriberToDelete.id)
        toast.success("Subscriber removed successfully")
        setSubscriberToDelete(null)
        fetchSubscribers()
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete subscriber")
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (authLoading || (!hasPermission(user, 'news-letter-subscriber') && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Marketing</p>
          <h1 className="text-2xl font-semibold text-foreground">Newsletter Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage public newsletter email subscriptions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subscriber</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 pb-2">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email"
                  placeholder="e.g. customer@example.com" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSubscriber} className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Email
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
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email Address</TableHead>
              <TableHead>Subscription Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : filteredSubscribers.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No subscribers found.</TableCell></TableRow>
            ) : (
              filteredSubscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setSubscriberToDelete(s)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!subscriberToDelete} onOpenChange={() => setSubscriberToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Unsubscribe Email</DialogTitle></DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to remove <strong>{subscriberToDelete?.email}</strong> from the newsletter subscribers list?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscriberToDelete(null)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSubscriber} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
