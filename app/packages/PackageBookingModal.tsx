"use client"

import { useState, useEffect } from "react"
import { X, Phone, User, Calendar, Clock, FileText, Loader2, CheckCircle2 } from "lucide-react"
import { bookPackage } from "@admin/api/packages/packages"
import api from "@admin/api/base"
import { getInvoiceSettings } from "@admin/api/settings/settings"

interface Package {
  id: string
  title: string
  price: number | string
  billingCycle?: string
}

interface PackageBookingModalProps {
  pkg: Package | null
  onClose: () => void
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("8801") && digits.length === 13) return digits
  if (digits.startsWith("01") && digits.length === 11) return digits
  if (digits.startsWith("1") && digits.length === 10) return `0${digits}`
  return digits
}

const MIN_DATE = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
})()

const MAX_DATE = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
})()

function calcTotal(price: number | string, taxRate: number): string {
  const base = parseFloat(String(price)) || 0
  const tax = (base * taxRate) / 100
  return (base + tax).toFixed(2)
}

export default function PackageBookingModal({ pkg, onClose }: PackageBookingModalProps) {
  const [phone, setPhone] = useState("")
  const [clientName, setClientName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [staff, setStaff] = useState("")
  const [staffList, setStaffList] = useState<any[]>([])
  const [taxRate, setTaxRate] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch tax rate and staff list on mount
  useEffect(() => {
    getInvoiceSettings()
      .then((s) => { if (s?.taxRate) setTaxRate(Number(s.taxRate)) })
      .catch(() => {})
      
    api.get("/employee/basic")
      .then((res) => {
        const stylists = Array.isArray(res.data) ? res.data.filter((emp: any) => emp.role === "Stylist") : []
        setStaffList(stylists)
      })
      .catch(() => {})
  }, [])

  // Reset form when pkg changes
  useEffect(() => {
    setPhone("")
    setClientName("")
    setDate("")
    setTime("")
    setNotes("")
    setStaff("")
    setErrors({})
    setSuccess(false)
  }, [pkg?.id])

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    setErrors((e) => ({ ...e, phone: "" }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!phone.trim()) e.phone = "Phone number is required."
    if (!clientName.trim()) e.clientName = "Client name is required."
    if (!date) e.date = "Date is required."
    else if (date < MIN_DATE) e.date = "Please select a valid upcoming date."
    if (!time) e.time = "Time is required."
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (!pkg) return
    try {
      setIsSubmitting(true)
      await bookPackage(pkg.id, {
        clientName: clientName.trim(),
        phoneNumber: normalizePhone(phone),
        date,
        time,
        source: "online",
        staff: staff === "Any Expert" ? "" : staff,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      setSuccess(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      const parsed = Array.isArray(msg) ? msg.join(", ") : msg || "Booking failed. Please try again."
      setErrors({ submit: parsed })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!pkg) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/10 shadow-2xl rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c4a484] mb-1">
                Package Booking
              </p>
              <h2 className="text-xl font-serif text-white">{pkg.title}</h2>
              <p className="text-white/60 text-sm mt-0.5 font-medium">
                ৳{Number(pkg.price).toLocaleString()} / {pkg.billingCycle || "session"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success State */}
        {success ? (
          <div className="px-6 py-12 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-14 h-14 text-[#c4a484]" />
            </div>
            <h3 className="text-xl font-serif text-white">Booking Confirmed!</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Your package booking has been received. We'll be in touch shortly to confirm the details.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-8 py-3 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#c4a484] hover:text-white transition-all duration-300 rounded-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/70">
                <Phone className="w-3 h-3" />
                Phone Number <span className="text-[#c4a484]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className={`w-full bg-white/5 border ${errors.phone ? "border-red-500/60" : "border-white/10"} rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c4a484]/50 focus:bg-white/8 transition-all autofill:shadow-[0_0_0_1000px_#111_inset] autofill:text-white`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
            </div>

            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/70">
                <User className="w-3 h-3" />
                Full Name <span className="text-[#c4a484]">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value)
                  setErrors((er) => ({ ...er, clientName: "" }))
                }}
                placeholder="Enter your full name"
                className={`w-full bg-white/5 border ${errors.clientName ? "border-red-500/60" : "border-white/10"} rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c4a484]/50 focus:bg-white/8 transition-all autofill:shadow-[0_0_0_1000px_#111_inset] autofill:text-white`}
              />
              {errors.clientName && <p className="text-xs text-red-400">{errors.clientName}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/50">
                  <Calendar className="w-3 h-3" />
                  Date <span className="text-[#c4a484]">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={MIN_DATE}
                  max={MAX_DATE}
                  onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, date: "" })) }}
                  className={`w-full bg-white/5 border ${errors.date ? "border-red-500/60" : "border-white/10"} rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#c4a484]/50 transition-all [color-scheme:dark] autofill:shadow-[0_0_0_1000px_#111_inset] autofill:text-white`}
                />
                {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/50">
                  <Clock className="w-3 h-3" />
                  Time <span className="text-[#c4a484]">*</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => { setTime(e.target.value); setErrors((er) => ({ ...er, time: "" })) }}
                  className={`w-full bg-white/5 border ${errors.time ? "border-red-500/60" : "border-white/10"} rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#c4a484]/50 transition-all [color-scheme:dark] autofill:shadow-[0_0_0_1000px_#111_inset] autofill:text-white`}
                />
                {errors.time && <p className="text-xs text-red-400">{errors.time}</p>}
              </div>
            </div>

            {/* Preferred Expert */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/70">
                <User className="w-3 h-3" />
                Preferred Expert
              </label>
              <select
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#c4a484]/50 transition-all appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\' stroke-width=\'1.5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19.5 8.25l-7.5 7.5-7.5-7.5\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              >
                <option value="Any Expert" className="bg-[#111]">Any Expert (Default)</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name} className="bg-[#111]">{s.name}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/70">
                <FileText className="w-3 h-3" />
                Notes <span className="text-white/40 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c4a484]/50 focus:bg-white/8 transition-all resize-none autofill:shadow-[0_0_0_1000px_#111_inset] autofill:text-white"
              />
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 p-4 bg-white/5 border border-white/5 space-y-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-white/70 tracking-wider text-[10px] uppercase font-bold">Subtotal</span>
                <span className="text-white font-medium">৳{parseFloat(String(pkg.price)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70 tracking-wider text-[10px] uppercase font-bold">Tax ({taxRate}%)</span>
                <span className="text-white font-medium">৳{(parseFloat(String(pkg.price)) * taxRate / 100).toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="uppercase tracking-[0.2em] text-[10px] text-white font-bold">Total Price</span>
                <span className="text-2xl font-serif text-[#c4a484]">৳{calcTotal(pkg.price, taxRate)}</span>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {errors.submit}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-white text-black text-xs font-bold tracking-[0.25em] uppercase hover:bg-[#c4a484] hover:text-white transition-all duration-300 rounded-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
