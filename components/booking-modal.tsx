"use client"

import React, { useState, useEffect } from "react"
import { useBooking } from "@/context/BookingContext"
import { Service } from "@/lib/types"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Check, ChevronLeft, ChevronRight, X, Clock, Calendar, User, Phone } from "lucide-react"

const steps = [
    { id: 1, label: "Service" },
    { id: 2, label: "Schedule" },
    { id: 3, label: "Details" },
    { id: 4, label: "Confirm" },
]

export function BookingModal() {
    const { isOpen, closeBooking, selectedService, preSelectedStylist } = useBooking()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [staffList, setStaffList] = useState<any[]>([])
    const [availableServices, setAvailableServices] = useState<Service[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [taxRate, setTaxRate] = useState(0)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
    const [formData, setFormData] = useState({
        clientName: "",
        phoneNumber: "",
        date: "",
        time: "",
        serviceId: "",
        serviceName: "",
        staff: "",
    })

    useEffect(() => {
        if (isOpen) {
            setStep(1)
            setErrors({})
            fetchStylists()
            fetchServices()
            fetchSettings()
            fetchTaxRate()
            if (selectedService) {
                setFormData(prev => ({ ...prev, serviceId: selectedService.id, serviceName: selectedService.name }))
                setSelectedServiceIds([selectedService.id])
            } else {
                setSelectedServiceIds([])
            }
            if (preSelectedStylist) {
                setFormData(prev => ({ ...prev, staff: preSelectedStylist }))
            }
        }
    }, [isOpen, selectedService, preSelectedStylist])

    const fetchTaxRate = async () => {
        try {
            const res = await fetch("http://localhost:4000/invoice-setting", { cache: "no-store" })
            const data = await res.json()
            if (data?.taxRate) setTaxRate(Number(data.taxRate))
        } catch {}
    }

    const fetchSettings = async () => {
        try {
            const res = await fetch("http://localhost:4000/appointment-setting", { cache: "no-store" })
            setSettings(await res.json())
        } catch {}
    }

    const fetchStylists = async () => {
        try {
            const res = await fetch("http://localhost:4000/employee/basic", { cache: "no-store" })
            const data = await res.json()
            setStaffList(Array.isArray(data) ? data.filter((e: any) => e.role === "Stylist") : [])
        } catch { setStaffList([]) }
    }

    const fetchServices = async () => {
        try {
            const res = await fetch("http://localhost:4000/service/active", { cache: "no-store" })
            setAvailableServices(await res.json())
        } catch {}
    }

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {}
        if (currentStep === 1) {
            if (selectedServiceIds.length === 0) newErrors.serviceId = "Please select at least one service"
        } else if (currentStep === 2) {
            if (!formData.date) newErrors.date = "Please select a date"
            if (!formData.time) {
                newErrors.time = "Please select a time"
            } else {
                const openingTime = settings?.openingTime || "09:00"
                const closingTime = settings?.closingTime || "21:00"
                const [h, m] = formData.time.split(":").map(Number)
                const [oh, om] = openingTime.split(":").map(Number)
                const [ch, cm] = closingTime.split(":").map(Number)
                const t = h * 60 + m
                if (t < oh * 60 + om || t > ch * 60 + cm)
                    newErrors.time = `Please select a time between ${openingTime} and ${closingTime}`
            }
        } else if (currentStep === 3) {
            if (!formData.clientName) newErrors.clientName = "Please enter your name"
            if (!formData.phoneNumber) newErrors.phoneNumber = "Please enter your phone number"
            else if (!/^\d{11}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Please enter a valid 11-digit phone number"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => { if (validateStep(step) && step < 4) setStep(step + 1) }
    const handleBack = () => { if (step > 1) setStep(step - 1) }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
        if (name === "serviceId") {
            const s = availableServices.find(s => s.id === value)
            if (s) setFormData(prev => ({ ...prev, serviceName: s.name }))
        }
    }

    const toggleService = (id: string) => {
        setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
        if (errors.serviceId) setErrors(prev => { const n = { ...prev }; delete n.serviceId; return n })
    }

    const currentServices = availableServices.filter(s => selectedServiceIds.includes(s.id))
    const subtotal = currentServices.reduce((a, s) => a + Number(s.price), 0)
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const payload = {
                phoneNumber: formData.phoneNumber,
                clientName: formData.clientName,
                date: formData.date,
                time: formData.time,
                services: currentServices.map(s => s.name),
                status: "Confirmed",
                staff: formData.staff === "Any Expert" ? "" : formData.staff,
                source: "Online",
            }
            const res = await fetch("http://localhost:4000/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                toast.success("Booking Confirmed!", {
                    description: "Our team will call you within 24 hours. Thank you for choosing us.",
                })
                closeBooking()
            } else {
                toast.error("Booking failed. Please try again.")
            }
        } catch {
            toast.error("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (d: string) => {
        if (!d) return ""
        return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeBooking()}>
            <DialogContent
                data-public-modal="true"
                className="sm:max-w-[580px] bg-[#0c0c0c] border border-white/10 text-white p-0 overflow-hidden gap-0 [&>button]:hidden shadow-2xl"
            >
                {/* Top accent line */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                {/* Header */}
                <div className="flex items-start justify-between px-8 pt-7 pb-0">
                    <div>
                        <p
                            className="mb-1.5 text-[9px] uppercase tracking-[0.5em] text-white"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Premium Salon
                        </p>
                        <DialogTitle
                            className="text-[1.6rem] font-semibold leading-tight text-white"
                            style={{ fontFamily: "Playfair Display, serif" }}
                        >
                            Book Your Experience
                        </DialogTitle>
                        <DialogDescription
                            className="mt-1 text-[11px] text-white tracking-wide"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Complete the steps below to secure your appointment
                        </DialogDescription>
                    </div>
                    <button
                        onClick={closeBooking}
                        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 text-white transition-all duration-200 hover:border-white/50 hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Step Tracker */}
                <div className="px-8 pt-7">
                    <div className="relative flex items-start justify-between">
                        {/* Track line bg */}
                        <div className="absolute left-4 right-4 top-[15px] h-px bg-white/8" />
                        {/* Track line fill */}
                        <div
                            className="absolute left-4 top-[15px] h-px bg-white/35 transition-all duration-500 ease-out"
                            style={{ width: `calc(${((step - 1) / 3) * 100}% - 2rem)` }}
                        />
                        {steps.map((s) => {
                            const done = step > s.id
                            const active = step === s.id
                            return (
                                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`flex h-[30px] w-[30px] items-center justify-center border transition-all duration-300 ${
                                        done
                                            ? "border-white bg-white text-black"
                                            : active
                                                ? "border-white bg-white text-black"
                                                : "border-white/15 bg-[#0c0c0c] text-white/25"
                                    }`}>
                                        {done
                                            ? <Check className="h-3 w-3" strokeWidth={3} />
                                            : <span className="text-[11px] font-medium">{s.id}</span>
                                        }
                                    </div>
                                    <span
                                        className={`text-[9px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                                            step >= s.id ? "text-white" : "text-white/45"
                                        }`}
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-8 mt-6 h-px bg-white/6" />

                {/* Step Content */}
                <div className="overflow-y-auto px-8 py-6" style={{ maxHeight: "380px" }}>
                    <div key={step} className="animate-in fade-in slide-in-from-right-3 duration-300">

                        {/* ── Step 1: Services ── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label
                                        className="text-[10px] uppercase tracking-[0.28em] text-white"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        {selectedService ? "Your Service" : "Select Services"}
                                    </Label>

                                    {selectedService ? (
                                        <div className="flex h-12 items-center border border-white/10 bg-white/4 px-4 text-[13px] text-white">
                                            {selectedService.name}
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="max-h-[180px] overflow-y-auto border border-white/10 bg-[#111]">
                                                {availableServices.map((s) => {
                                                    const selected = selectedServiceIds.includes(s.id)
                                                    return (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => toggleService(s.id)}
                                                            className={`group flex cursor-pointer items-center justify-between border-b border-white/5 px-4 py-3 last:border-0 transition-all duration-200 ${
                                                                selected ? "bg-white text-black" : "hover:bg-white/5 text-white"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-all duration-200 ${
                                                                    selected ? "border-black/30 bg-transparent" : "border-white/20"
                                                                }`}>
                                                                    {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                                                </div>
                                                                <span className="text-[12.5px] font-medium">{s.name}</span>
                                                            </div>
                                                            <span className={`font-mono text-[11px] ${selected ? "text-black/50" : "text-white"}`}>
                                                                ৳{Number(s.price).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {errors.serviceId && (
                                                <p className="mt-1.5 text-[10px] tracking-wider text-red-400">{errors.serviceId}</p>
                                            )}
                                            <p className="mt-2 text-[10px] italic text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                                                You may select multiple services for a complete experience.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        className="text-[10px] uppercase tracking-[0.28em] text-white"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        Preferred Stylist
                                    </Label>
                                    <Select
                                        disabled={!!preSelectedStylist}
                                        value={formData.staff}
                                        onValueChange={(val) => handleSelectChange("staff", val)}
                                    >
                                        <SelectTrigger className="h-12 rounded-none border-white/10 bg-transparent text-white focus:ring-white/20">
                                            <SelectValue placeholder="Any Expert (Default)" />
                                        </SelectTrigger>
                                        <SelectContent className="border-white/10 bg-[#111] text-white">
                                            <SelectItem value="Any Expert" className="focus:bg-white focus:text-black">
                                                Any Expert (Default)
                                            </SelectItem>
                                            {staffList.map((s) => (
                                                <SelectItem key={s.id} value={s.name} className="focus:bg-white focus:text-black">
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedServiceIds.length > 0 && (
                                    <div className="border border-white/8 bg-white/[0.03] p-5 space-y-3">
                                        <p className="text-[9px] uppercase tracking-[0.4em] text-white mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                                            Price Estimate
                                        </p>
                                        {currentServices.map(s => (
                                            <div key={s.id} className="flex justify-between text-[12.5px]">
                                                <span className="text-white">{s.name}</span>
                                                <span className="text-white">৳{Number(s.price).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {taxRate > 0 && (
                                            <div className="flex justify-between text-[12.5px]">
                                                <span className="text-white">Tax ({taxRate}%)</span>
                                                <span className="text-white">৳{tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-white/10 pt-3">
                                            <span className="text-[10px] uppercase tracking-[0.25em] text-white" style={{ fontFamily: "Inter, sans-serif" }}>Total</span>
                                            <span className="text-lg font-semibold text-white">৳{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 2: Date & Time ── */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label
                                        className="text-[10px] uppercase tracking-[0.28em] text-white"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        Date
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            min={new Date().toISOString().split("T")[0]}
                                            max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                            className={`h-12 rounded-none border-white/10 bg-transparent pl-11 text-white [color-scheme:dark] focus-visible:ring-white/20 ${errors.date ? "border-red-500/70" : ""}`}
                                        />
                                    </div>
                                    {errors.date && <p className="text-[10px] tracking-wider text-red-400">{errors.date}</p>}
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        className="text-[10px] uppercase tracking-[0.28em] text-white"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        Time
                                    </Label>
                                    <div className="relative">
                                        <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                                        <Input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            className={`h-12 rounded-none border-white/10 bg-transparent pl-11 text-white [color-scheme:dark] focus-visible:ring-white/20 ${errors.time ? "border-red-500/70" : ""}`}
                                        />
                                    </div>
                                    {errors.time && <p className="text-[10px] tracking-wider text-red-400">{errors.time}</p>}
                                </div>

                                {settings && (
                                    <div className="col-span-full flex items-center gap-3 border border-white/6 bg-white/[0.02] px-4 py-3">
                                        <Clock className="h-3.5 w-3.5 shrink-0 text-white" />
                                        <p className="text-[11px] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                                            We are open {settings.openingTime || "09:00"} — {settings.closingTime || "21:00"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 3: Details ── */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label
                                        className="text-[10px] uppercase tracking-[0.28em] text-white"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                                        <Input
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            placeholder="Your full name"
                                            className={`h-12 rounded-none border-white/10 bg-transparent pl-11 text-white placeholder:text-white/30 focus-visible:ring-white/20 autofill:shadow-[0_0_0_1000px_#0c0c0c_inset] autofill:text-white ${errors.clientName ? "border-red-500/70" : ""}`}
                                        />
                                    </div>
                                    {errors.clientName && <p className="text-[10px] tracking-wider text-red-400">{errors.clientName}</p>}
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        className="text-[10px] uppercase tracking-[0.28em] text-white"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        Phone Number
                                    </Label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                                        <Input
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="017XXXXXXXX"
                                            className={`h-12 rounded-none border-white/10 bg-transparent pl-11 text-white placeholder:text-white/30 focus-visible:ring-white/20 autofill:shadow-[0_0_0_1000px_#0c0c0c_inset] autofill:text-white ${errors.phoneNumber ? "border-red-500/70" : ""}`}
                                        />
                                    </div>
                                    {errors.phoneNumber && <p className="text-[10px] tracking-wider text-red-400">{errors.phoneNumber}</p>}
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Confirmation ── */}
                        {step === 4 && (
                            <div className="space-y-5">
                                {/* Visual checkmark */}
                                <div className="flex flex-col items-center py-4 animate-in zoom-in-75 duration-500">
                                    <div className="flex h-14 w-14 items-center justify-center border border-white/20 bg-white/5">
                                        <Check className="h-6 w-6 text-white" strokeWidth={1.5} />
                                    </div>
                                    <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                                        Almost There
                                    </p>
                                </div>

                                {/* Receipt */}
                                <div className="border border-white/10 bg-white/[0.025]">
                                    <div className="border-b border-white/6 px-5 py-3">
                                        <p className="text-[9px] uppercase tracking-[0.4em] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                                            Booking Summary
                                        </p>
                                    </div>

                                    <div className="space-y-0 divide-y divide-white/5">
                                        <div className="flex items-start justify-between px-5 py-3.5">
                                            <span className="text-[11px] uppercase tracking-wider text-white" style={{ fontFamily: "Inter, sans-serif" }}>Services</span>
                                            <div className="flex flex-col items-end gap-1">
                                                {currentServices.map(s => (
                                                    <span key={s.id} className="text-[13px] text-white">{s.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-[11px] uppercase tracking-wider text-white" style={{ fontFamily: "Inter, sans-serif" }}>Stylist</span>
                                            <span className="text-[13px] text-white">{formData.staff || "Any Expert"}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-[11px] uppercase tracking-wider text-white" style={{ fontFamily: "Inter, sans-serif" }}>Date</span>
                                            <span className="text-[13px] text-white">{formatDate(formData.date)}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-[11px] uppercase tracking-wider text-white" style={{ fontFamily: "Inter, sans-serif" }}>Time</span>
                                            <span className="text-[13px] text-white">{formData.time}</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/[0.03] px-5 py-4">
                                            <span className="text-[11px] uppercase tracking-wider text-white" style={{ fontFamily: "Inter, sans-serif" }}>Total Amount</span>
                                            <span className="text-lg font-semibold text-white">৳ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-[10px] tracking-wider text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                                    Payment is collected at the salon after your service.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="border-t border-white/8 px-8 py-5">
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex h-12 flex-1 items-center justify-center gap-2 border border-white/15 bg-transparent text-[10px] uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-white/50 hover:text-white"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                                Back
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && selectedServiceIds.length === 0}
                                className="flex h-12 flex-1 items-center justify-center gap-2 bg-white text-[10px] uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                Continue
                                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex h-12 flex-1 items-center justify-center gap-2.5 bg-white text-[10px] uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white/90 disabled:opacity-50"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {loading ? (
                                    <>
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        Confirm Booking
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
