"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getClientHistory } from "@admin/api/clients/clients"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Phone, Mail, Calendar, Clock, User, Receipt, Scissors, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Invoice {
  id: string
  invoiceNumber: string
  services: string[]
  staff: string
  total: number
  paymentMethod: string
  status: string
  createdAt: string
}

interface ClientAppointment {
  id: string
  date: string
  time: string
  services: string[]
  isPackage?: boolean
  packageName?: string
  staff: string
  status: string
  source: string
  invoices: Invoice[]
}

interface ClientHistory {
  id: string
  name: string
  phone: string
  email: string
  address: string
  appointments: ClientAppointment[]
  invoices: Invoice[]
}

const statusColors: Record<string, string> = {
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Pending: "bg-gray-50 text-gray-700 border-gray-200",
  "Checked In": "bg-purple-50 text-purple-700 border-purple-200",
  "In Service": "bg-amber-50 text-amber-700 border-amber-200",
}

const invoiceStatusColors: Record<string, string> = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Unpaid: "bg-red-50 text-red-700 border-red-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
}

function formatTime(t: string) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`
}

export default function ClientHistoryPage() {
  const params = useParams<{ id?: string | string[] }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const [client, setClient] = useState<ClientHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<ClientAppointment | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    getClientHistory(id)
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="premium-page p-4 sm:p-6 md:p-8 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-6" />
        <div className="h-28 bg-muted rounded-xl mb-6" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="premium-page p-8 text-center text-muted-foreground">
        Client not found.
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  const initials = client.name.split(" ").map(n => n[0]).join("").toUpperCase()
  const totalSpent = client.invoices.reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
        </Button>
        <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Client</p>
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
      </div>

      {/* Client Details Card */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{client.name}</h2>
            <p className="text-sm text-muted-foreground">{client.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {client.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />{client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />{client.phone}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary/60" />
            <span><span className="font-medium">{client.appointments?.length ?? 0}</span> appointments</span>
          </div>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary/60" />
            <span><span className="font-medium">{formatCurrency(totalSpent)}</span> total spent</span>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium text-foreground">Appointment History</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{client.appointments?.length ?? 0} total appointments</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />Date</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" />Time</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Services</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Staff</span></TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-36">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!client.appointments?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                [...client.appointments]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((apt) => (
                    <TableRow
                      key={apt.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <TableCell className="font-medium">{apt.date}</TableCell>
                      <TableCell>{formatTime(apt.time)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 max-w-[220px]">
                          <span className="text-sm truncate">
                            {Array.isArray(apt.services) ? apt.services.slice(0, 2).join(", ") : apt.services}
                          </span>
                          {Array.isArray(apt.services) && apt.services.length > 2 && (
                            <span className="shrink-0 text-[11px] font-medium text-primary whitespace-nowrap">
                              +{apt.services.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{apt.staff || "—"}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColors[apt.status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                          {apt.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{apt.source}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {apt.invoices?.length > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInvoice(apt.invoices[0])}
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1.5" />
                            View Invoice
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">No invoice</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="mt-2 space-y-4 pb-2">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Date</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary/60" />
                    <span className="font-medium">{selectedAppointment.date}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Time</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary/60" />
                    <span className="font-medium">{formatTime(selectedAppointment.time) || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {(selectedAppointment as any).isPackage ? "Package & Included Services" : "Services"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedAppointment as any).isPackage && (selectedAppointment as any).packageName && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mr-1">
                      <Zap className="w-3 h-3" />
                      {(selectedAppointment as any).packageName}
                    </span>
                  )}
                  {(Array.isArray(selectedAppointment.services) ? selectedAppointment.services : [selectedAppointment.services])
                    .filter(Boolean)
                    .map((svc, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${(selectedAppointment as any).isPackage
                            ? "bg-secondary/10 text-secondary-foreground border border-secondary/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                      >
                        <Scissors className="w-3 h-3" />
                        {svc}
                      </span>
                    ))}
                </div>
              </div>

              {/* Staff & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Staff</p>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary/60" />
                    <span className="font-medium">{selectedAppointment.staff || "—"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Source</p>
                  <span className="font-medium">{selectedAppointment.source || "—"}</span>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Status</p>
                <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[selectedAppointment.status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Invoice (if any) */}
              {selectedAppointment.invoices?.length > 0 && (() => {
                const inv = selectedAppointment.invoices[0]
                return (
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" /> Invoice
                    </p>
                    <div className="bg-muted/40 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Invoice No</span>
                        <span className="font-mono font-medium">{inv.invoiceNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-medium">{inv.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-base">{formatCurrency(inv.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${invoiceStatusColors[inv.status] ?? ""}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 mt-2 pb-32">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Invoice Number</span>
                <span className="font-mono font-medium">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Services</span>
                <span className="font-medium text-right">
                  {Array.isArray(selectedInvoice.services) ? selectedInvoice.services.join(", ") : selectedInvoice.services}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Staff</span>
                <span className="font-medium">{selectedInvoice.staff}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">{selectedInvoice.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${invoiceStatusColors[selectedInvoice.status] ?? ""}`}>
                  {selectedInvoice.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
