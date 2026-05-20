"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Check, Clock } from "lucide-react"
import { Playfair_Display } from "next/font/google"
import Link from "next/link"
import { SiteHeader } from "@/app/components/site-header"
import { TestimonialsSection } from "@/app/components/testimonials"
import { Footer } from "@/app/components/footer"
import PackageBookingModal from "../PackageBookingModal"
import { formatCurrency, getMediaUrl } from "@/lib/utils"

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
    style: ["normal", "italic"],
})

interface Package {
    id: string
    category: string
    title: string
    price: number | string
    billingCycle: string
    description: string
    features: string[]
    imageUrl?: string
    image?: string
    coverImage?: string
    popular?: boolean
}

export default function PackageDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [pkg, setPkg] = useState<Package | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)
    const [bookingOpen, setBookingOpen] = useState(false)

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/makeover-packages/${id}`
                )
                if (!res.ok) { setNotFoundState(true); return }
                const data = await res.json()
                setPkg(data)
            } catch {
                setNotFoundState(true)
            } finally {
                setLoading(false)
            }
        }
        fetchPackage()
    }, [id])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#eccd80] border-t-transparent" />
            </div>
        )
    }

    if (notFoundState || !pkg) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] text-white">
                <p className="text-[14px] text-white/50">Package not found.</p>
                <Link href="/packages" className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#eccd80] hover:underline">
                    Back to Packages
                </Link>
            </div>
        )
    }

    const coverImage = getMediaUrl(pkg.imageUrl) || '/package-details.avif'

    return (
        <div className="min-h-screen bg-[#0a0a0a]">

            {/* ── Hero ── */}
            <div className="relative h-[280px] sm:h-[400px] lg:h-[560px] w-full overflow-hidden">
                <img
                    src={coverImage}
                    alt={pkg.title}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative z-20">
                    <SiteHeader />
                </div>
            </div>

            {/* ── Info card — overlaps hero bottom ── */}
            <div className="relative z-10 mx-auto mt-0 sm:-mt-[120px] lg:-mt-[220px] max-w-[1170px] px-4 sm:px-6 lg:px-8">
                <div className="border border-[#eccd80]/60 bg-[#0d0d0d]" style={{ boxShadow: '0 0 0 1px rgba(236,205,128,0.15)' }}>
                    <div className="flex flex-col lg:flex-row">

                        {/* Left: category / title / duration / description / features */}
                        <div className="flex-1 p-8 sm:p-10">
                            {pkg.category && (
                                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#eccd80]">
                                    {pkg.category}
                                </p>
                            )}
                            <h1 className={`${playfair.className} text-[2rem] font-semibold leading-tight text-white sm:text-[2.5rem]`}>
                                {pkg.title}
                            </h1>
                            {pkg.billingCycle && (
                                <div className="mt-3 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-[#eccd80]" strokeWidth={1.8} />
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">
                                        {pkg.billingCycle}
                                    </span>
                                </div>
                            )}
                            <p className="mt-4 max-w-[520px] text-[13px] leading-relaxed text-white/55">
                                {pkg.description}
                            </p>
                            {pkg.features && pkg.features.length > 0 && (
                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                                    {pkg.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#eccd80]/40">
                                                <Check className="h-[9px] w-[9px] text-[#eccd80]" strokeWidth={3} />
                                            </div>
                                            <span className="text-[11px] text-white/55">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dividers */}
                        <div className="hidden lg:block w-px self-stretch bg-white/8" />
                        <div className="mx-8 h-px bg-white/8 lg:hidden" />

                        {/* Right: price + CTA */}
                        <div className="flex flex-col justify-center p-8 sm:p-10 lg:min-w-[280px] lg:max-w-[320px]">
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.5em] text-white/35">
                                Starting From
                            </p>
                            <p className="mb-7 text-[2.75rem] font-semibold leading-none text-[#eccd80]">
                                {formatCurrency(pkg.price)}
                            </p>
                            <button
                                onClick={() => setBookingOpen(true)}
                                className="w-full bg-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-black transition-colors hover:bg-[#eccd80]"
                            >
                                Book Now
                            </button>
                            <p className="mt-3 text-center text-[9px] font-medium uppercase tracking-[0.25em] text-white/30">
                                Free Consultation · Flexible Scheduling
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Testimonials ── */}
            <div className="mt-24 border-t border-white/5">
                <TestimonialsSection />
            </div>

            {/* ── Footer ── */}
            <Footer />

            {/* ── Booking Modal ── */}
            <PackageBookingModal
                pkg={bookingOpen ? { id: pkg.id, title: pkg.title, price: pkg.price, billingCycle: pkg.billingCycle } : null}
                onClose={() => setBookingOpen(false)}
            />
        </div>
    )
}
