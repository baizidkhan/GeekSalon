"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { Check, Clock, ArrowLeft } from "lucide-react"
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
                if (!res.ok) {
                    setNotFoundState(true)
                    return
                }
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
                <Link
                    href="/packages"
                    className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#eccd80] hover:underline"
                >
                    Back to Packages
                </Link>
            </div>
        )
    }

    const heroImage = getMediaUrl(pkg.imageUrl || pkg.image || pkg.coverImage) || "/login-cover.avif"

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* ── Hero ── */}
            <div className="relative">
                <div className="relative h-[420px] overflow-hidden sm:h-[500px]">
                    <div
                        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat transition-none"
                        style={{ backgroundImage: `url('${heroImage}')` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/90" />
                    <div className="relative z-10">
                        <SiteHeader />
                    </div>
                </div>

                {/* ── Detail card (overlaps hero bottom) ── */}
                <div className="relative z-10 mx-auto -mt-44 max-w-[1170px] px-4 sm:px-6 lg:px-8">
                    <div className="border border-[#2a2a2a] bg-[#0d0d0d] px-6 py-10 sm:px-10 lg:flex lg:items-start lg:gap-16 lg:px-14 lg:py-14">
                        {/* Left: Package Info */}
                        <div className="flex flex-1 flex-col gap-5">
                            {pkg.category && (
                                <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#eccd80]">
                                    {pkg.category}
                                </p>
                            )}

                            <h1
                                className={`${playfair.className} text-[2rem] font-semibold leading-tight text-white sm:text-[2.75rem]`}
                            >
                                {pkg.title}
                            </h1>

                            {pkg.billingCycle && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-[15px] w-[15px] flex-shrink-0 text-[#eccd80]" strokeWidth={1.8} />
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">
                                        {pkg.billingCycle}
                                    </span>
                                </div>
                            )}

                            <p className="text-[14px] leading-relaxed text-white/60">{pkg.description}</p>

                            {pkg.features && pkg.features.length > 0 && (
                                <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                    {pkg.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-[#eccd80]/50">
                                                <Check className="h-[9px] w-[9px] text-[#eccd80]" strokeWidth={3} />
                                            </div>
                                            <span className="text-[12px] font-medium uppercase tracking-wide text-white/65">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Pricing + CTA */}
                        <div className="mt-10 flex flex-col items-start gap-5 border-t border-[#2a2a2a] pt-8 lg:mt-0 lg:w-[260px] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/40">
                                    Starting From
                                </p>
                                <p className="mt-2 text-[2rem] font-semibold leading-none text-white sm:text-[2.25rem]">
                                    {formatCurrency(pkg.price)}
                                </p>
                            </div>

                            <button
                                onClick={() => setBookingOpen(true)}
                                className="w-full bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.35em] text-black transition-colors duration-200 hover:bg-[#f0f0f0] active:bg-[#e0e0e0]"
                            >
                                Book Now
                            </button>

                            <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
                                Free Consultation&nbsp;•&nbsp;Flexible Scheduling
                            </p>

                            <Link
                                href="/packages"
                                className="mt-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/35 transition-colors hover:text-[#eccd80]"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                All Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Testimonials ── */}
            <div className="mt-24">
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
