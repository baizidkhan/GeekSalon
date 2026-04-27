"use client"

import React, { useState, useEffect } from "react"
import { useBooking } from "@/context/BookingContext"
import { Service } from "@/lib/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { Check, ChevronLeft, ChevronRight, X, Clock, Calendar, User, Phone, CreditCard } from "lucide-react"

export function BookingModal() {
    const { isOpen, closeBooking, selectedService } = useBooking()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [staffList, setStaffList] = useState<any[]>([])
    const [availableServices, setAvailableServices] = useState<Service[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [taxRate, setTaxRate] = useState(0)
    const [errors, setErrors] = useState<Record<string, string>>({})

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
                setFormData(prev => ({
                    ...prev,
                    serviceId: selectedService.id,
                    serviceName: selectedService.name
                }))
            }
        }
    }, [isOpen, selectedService])

    const fetchTaxRate = async () => {
        try {
            const response = await fetch("http://localhost:4000/invoice-setting", { cache: 'no-store' })
            const data = await response.json()
            if (data?.taxRate) setTaxRate(Number(data.taxRate))
        } catch (error) {
            console.error("Error fetching tax rate:", error)
        }
    }

    const fetchSettings = async () => {
        try {
            const response = await fetch("http://localhost:4000/appointment-setting", { cache: 'no-store' })
            const data = await response.json()
            setSettings(data)
        } catch (error) {
            console.error("Error fetching settings:", error)
        }
    }

    const fetchStylists = async () => {
        try {
            const response = await fetch("http://localhost:4000/employee/basic", { cache: 'no-store' })
            const data = await response.json()
            const stylists = Array.isArray(data) ? data.filter((emp: any) => emp.role === "Stylist") : []
            setStaffList(stylists)
        } catch (error) {
            console.error("Error fetching stylists:", error)
            setStaffList([])
        }
    }

    const fetchServices = async () => {
        try {
            const response = await fetch("http://localhost:4000/service/active", { cache: 'no-store' })
            const data = await response.json()
            setAvailableServices(data)
        } catch (error) {
            console.error("Error fetching services:", error)
        }
    }

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {}

        if (currentStep === 1) {
            if (!formData.serviceId) newErrors.serviceId = "Please select a service"
            if (!formData.staff) newErrors.staff = "Please select a stylist"
        } else if (currentStep === 2) {
            if (!formData.date) newErrors.date = "Please select a date"
            if (!formData.time) {
                newErrors.time = "Please select a time"
            } else {
                // Use settings from backend if available, otherwise fallback to defaults
                const openingTime = settings?.openingTime || '09:00'
                const closingTime = settings?.closingTime || '21:00'

                const [h, m] = formData.time.split(':').map(Number)
                const [oh, om] = openingTime.split(':').map(Number)
                const [ch, cm] = closingTime.split(':').map(Number)

                const timeInMins = h * 60 + m
                const openingInMins = oh * 60 + om
                const closingInMins = ch * 60 + cm

                if (timeInMins < openingInMins || timeInMins > closingInMins) {
                    newErrors.time = `Please select time between ${openingTime} and ${closingTime}`
                }
            }
        } else if (currentStep === 3) {
            if (!formData.clientName) newErrors.clientName = "Please enter your name"
            if (!formData.phoneNumber) {
                newErrors.phoneNumber = "Please enter your phone number"
            } else if (!/^\d{11}$/.test(formData.phoneNumber)) {
                newErrors.phoneNumber = "Please enter a valid 11-digit phone number"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            if (step < 4) setStep(step + 1)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev }
                delete next[name]
                return next
            })
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev }
                delete next[name]
                return next
            })
        }
        if (name === "serviceId") {
            const service = availableServices.find(s => s.id === value)
            if (service) {
                setFormData(prev => ({ ...prev, serviceName: service.name }))
            }
        }
    }

    const currentService = availableServices.find(s => s.id === formData.serviceId) || selectedService
    const subtotal = currentService ? Number(currentService.price) : 0
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const payload = {
                phoneNumber: formData.phoneNumber,
                clientName: formData.clientName,
                date: formData.date,
                time: formData.time,
                services: [formData.serviceName],
                status: "Confirmed",
                staff: formData.staff,
                source: "Online"
            }

            const response = await fetch("http://localhost:4000/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                toast.success("Booking Confirmed!", {
                    description: "Our team will call you within 24 hours. Thank you for choosing us.",
                })
                closeBooking()
            } else {
                toast.error("Booking failed. Please try again.")
            }
        } catch (error) {
            console.error("Error booking appointment:", error)
            toast.error("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { id: 1, label: "Service", icon: <CreditCard className="w-4 h-4" /> },
        { id: 2, label: "Date & Time", icon: <Calendar className="w-4 h-4" /> },
        { id: 3, label: "Details", icon: <User className="w-4 h-4" /> },
        { id: 4, label: "Confirmation", icon: <Check className="w-4 h-4" /> },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeBooking()}>
            <DialogContent className="sm:max-w-[600px] bg-[#101010] border-white/10 text-white p-0 overflow-hidden">
                <div className="p-8">
                    <DialogHeader className="mb-8 text-left">
                        <DialogTitle className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Book Your Experience
                        </DialogTitle>
                        <DialogDescription className="text-white/40 text-sm">
                            Complete the steps below to secure your appointment
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step Progress */}
                    <div className="flex items-center justify-between mb-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s.id ? "bg-white text-black" : "bg-[#1a1a1a] text-white/30 border border-white/10"
                                    }`}>
                                    {step > s.id ? <Check className="w-5 h-5" /> : <span>{s.id}</span>}
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest font-medium ${step >= s.id ? "text-white" : "text-white/20"
                                    }`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="transition-all duration-300">
                        {/* Step 1: Service */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Select Service</Label>
                                    <Select
                                        disabled={!!selectedService}
                                        value={formData.serviceId}
                                        onValueChange={(val) => handleSelectChange("serviceId", val)}
                                    >
                                        <SelectTrigger className={`bg-transparent border-white/10 h-14 rounded-none focus:ring-white/20 ${errors.serviceId ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Choose a service" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#101010] border-white/10 text-white">
                                            {availableServices?.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="focus:bg-white focus:text-black">
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.serviceId && <p className="text-[10px] text-red-500 tracking-wider">{errors.serviceId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Preferred Stylist</Label>
                                    <Select value={formData.staff} onValueChange={(val) => handleSelectChange("staff", val)}>
                                        <SelectTrigger className={`bg-transparent border-white/10 h-14 rounded-none focus:ring-white/20 ${errors.staff ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select an expert" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#101010] border-white/10 text-white">
                                            {Array.isArray(staffList) && staffList?.map((staff) => (
                                                <SelectItem key={staff.id} value={staff.name} className="focus:bg-white focus:text-black">
                                                    {staff.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.staff && <p className="text-[10px] text-red-500 tracking-wider">{errors.staff}</p>}
                                </div>

                                {currentService && (
                                    <div className="mt-8 p-6 bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/40">Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/40">Tax ({taxRate}%)</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-3 border-t border-white/10 flex justify-between font-semibold">
                                            <span className="uppercase tracking-widest text-[11px]">Total Price</span>
                                            <span className="text-xl">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Select Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className={`bg-transparent border-white/10 h-14 pl-12 rounded-none focus-visible:ring-white/20 [color-scheme:dark] ${errors.date ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.date && <p className="text-[10px] text-red-500 tracking-wider">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Select Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                        <Input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            className={`bg-transparent border-white/10 h-14 pl-12 rounded-none focus-visible:ring-white/20 [color-scheme:dark] ${errors.time ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.time && <p className="text-[10px] text-red-500 tracking-wider">{errors.time}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <Input
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className={`bg-transparent border-white/10 h-14 pl-12 rounded-none focus-visible:ring-white/20 placeholder:text-white/10 ${errors.clientName ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.clientName && <p className="text-[10px] text-red-500 tracking-wider">{errors.clientName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <Input
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="017XXXXXXXX"
                                            className={`bg-transparent border-white/10 h-14 pl-12 rounded-none focus-visible:ring-white/20 placeholder:text-white/10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.phoneNumber && <p className="text-[10px] text-red-500 tracking-wider">{errors.phoneNumber}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Summary/Payment */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-6 border border-white/10 bg-white/5 space-y-4">
                                    <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">Booking Summary</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40">Service</span>
                                        <span className="font-medium">{formData.serviceName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40">Expert</span>
                                        <span className="font-medium">{formData.staff}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40">Date & Time</span>
                                        <span className="font-medium">{formData.date} at {formData.time}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between font-semibold">
                                        <span className="text-white/40">Total Amount</span>
                                        <span className="text-xl">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-white/30 tracking-wider">
                                    Payment will be collected at the salon after your service.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 flex gap-4">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1 h-14 rounded-none border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-[11px]"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                        {step < 4 ? (
                            <Button
                                onClick={handleNext}
                                disabled={step === 1 && (!formData.serviceId || !formData.staff)}
                                className="flex-1 h-14 rounded-none bg-white text-black hover:bg-stone-200 transition-all duration-300 uppercase tracking-widest text-[11px]"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 h-14 rounded-none bg-white text-black hover:bg-stone-200 transition-all duration-300 uppercase tracking-widest text-[11px]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                                        Processing...
                                    </div>
                                ) : "Confirm Booking"}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
