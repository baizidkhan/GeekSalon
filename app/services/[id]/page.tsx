"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "../../components/site-header"
import { Footer } from "../../components/footer"
import { TestimonialsSection } from "../../components/testimonials"
import { Service } from "@/lib/types"
import { Clock, CheckCircle2 } from "lucide-react"
import { useBooking } from "@/context/BookingContext"
import { useBusiness } from "@/context/BusinessContext"
import { formatCurrency, getMediaUrl } from "@/lib/utils"

export default function ServiceDetailPage() {
    const { businessInfo } = useBusiness()
    const { openBooking } = useBooking()
    const { id } = useParams()
    const [service, setService] = useState<Service | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchService = async () => {
            try {
                // Assuming there's an endpoint to get service by id
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/service/${id}`)
                const data = await response.json()
                setService(data)
            } catch (error) {
                console.error("Error fetching service details:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchService()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="text-[11px] uppercase tracking-[0.3em]">Refining Details...</span>
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white">
                <p>Service not found.</p>
            </div>
        )
    }

    // Mock features based on category or default
    const features = [
        "Premium Products Only",
        "Expert Consultation",
        "Personalized Approach",
        "Professional Styling",
        "Long-lasting Results",
        "Aftercare Support"
    ]

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white">
            <SiteHeader solid />

            {/* Hero Section with Image Background */}
            <section className="relative h-[60vh] w-full overflow-hidden">
                {service.imageUrl ? (
                    <img
                        src={getMediaUrl(service.imageUrl)}
                        alt={service.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-stone-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-black/40 to-transparent" />
            </section>

            {/* Content Overlay Card */}
            <main className="relative z-10 -mt-40 px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="bg-[#101010] border border-white/10 p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                        <div className="grid gap-10 md:grid-cols-3">

                            {/* Left Content */}
                            <div className="md:col-span-2">
                                <p className="mb-4 text-[10px] uppercase tracking-[0.5em] text-white/40">
                                    {service.category} Services
                                </p>
                                <h1 className="mb-6 text-4xl font-semibold leading-tight sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {service.name}
                                </h1>

                                {/* Stats/Info */}
                                <div className="mb-8 flex flex-wrap gap-6 text-[11px] uppercase tracking-widest text-white/60">

                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        <span>{service.duration} mins</span>
                                    </div>
                                </div>

                                <p className="mb-10 text-sm leading-8 text-white/60 max-w-2xl">
                                    {service.description || "Indulge in our signature treatment designed to revitalize your senses and enhance your natural beauty. Our expert artisans use only the finest techniques and products to ensure an unparalleled experience."}
                                </p>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/50">
                                            <CheckCircle2 className="h-4 w-4 text-white/30" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Booking/Price */}
                            <div className="flex flex-col justify-center border-t border-white/10 pt-10 md:border-t-0 md:border-l md:pl-10 md:pt-0">
                                <div className="text-center">
                                    <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
                                        Starting From
                                    </p>
                                    <div className="mb-8 text-4xl font-light" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        {formatCurrency(service.price)}
                                    </div>
                                    <button
                                        onClick={() => openBooking(service)}
                                        className="w-full bg-white text-black py-4 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300 hover:bg-stone-200"
                                    >
                                        Book Now
                                    </button>
                                    <p className="mt-6 text-[10px] text-white/30 tracking-widest uppercase">
                                        Free consultation • Flexible scheduling
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Testimonials */}
            <TestimonialsSection />

            <Footer />
        </div>
    )
}
