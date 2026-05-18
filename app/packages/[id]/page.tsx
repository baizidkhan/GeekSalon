"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Check, Clock, ArrowLeft, Shield, Award, Sparkles, ChevronRight } from "lucide-react"
import { Playfair_Display } from "next/font/google"
import Link from "next/link"
import { SiteHeader } from "@/app/components/site-header"
import { TestimonialsSection } from "@/app/components/testimonials"
import { Footer } from "@/app/components/footer"
import PackageBookingModal from "../PackageBookingModal"
import ContactSpecialistsModal from "../ContactSpecialistsModal"
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

const HOW_IT_WORKS = [
    { step: "01", title: "Book Online", desc: "Choose your date, time, and preferred expert through our seamless booking flow." },
    { step: "02", title: "Arrive & Consult", desc: "Our specialists welcome you and tailor every detail to your personal preferences." },
    { step: "03", title: "Transform & Glow", desc: "Relax into a curated luxury session crafted specifically for you." },
]

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

            {/* ── Nav ── */}
            <div className="border-b border-white/5 bg-[#0a0a0a]">
                <SiteHeader />
            </div>

            {/* ── Breadcrumb ── */}
            <div className="border-b border-white/5">
                <div className="mx-auto max-w-[1170px] px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 py-4 text-[10px] font-medium uppercase tracking-[0.3em] text-white/25">
                        <Link href="/" className="transition-colors hover:text-white/50">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/packages" className="transition-colors hover:text-white/50">Packages</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-[#eccd80]/60 truncate max-w-[200px]">{pkg.title}</span>
                    </div>
                </div>
            </div>

            {/* ── Main product layout ── */}
            <div className="mx-auto max-w-[1170px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-16 xl:gap-20">

                    {/* ── Left: Image ── */}
                    <div>
                        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                            <img
                                src={coverImage}
                                alt={pkg.title}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            {pkg.popular && (
                                <div className="absolute left-0 top-5 flex items-center gap-1.5 bg-[#eccd80] pl-4 pr-5 py-2">
                                    <Sparkles className="h-[10px] w-[10px] text-black" strokeWidth={2.5} />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-black">Most Popular</span>
                                </div>
                            )}
                            {/* subtle inner vignette */}
                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]" />
                        </div>

                        {/* ── What's Included ── */}
                        {pkg.features && pkg.features.length > 0 && (
                            <div className="mt-12">
                                <div className="mb-6 flex items-center gap-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[#eccd80]">What's Included</p>
                                    <div className="h-px flex-1 bg-[#eccd80]/15" />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {pkg.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3.5 border border-white/6 bg-white/[0.02] px-5 py-3.5">
                                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#eccd80]/40 bg-[#eccd80]/5">
                                                <Check className="h-[9px] w-[9px] text-[#eccd80]" strokeWidth={3} />
                                            </div>
                                            <span className="text-[12px] font-medium text-white/65">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── How It Works ── */}
                        <div className="mt-16">
                            <div className="mb-8 flex items-center gap-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[#eccd80]">The Process</p>
                                <div className="h-px flex-1 bg-[#eccd80]/15" />
                            </div>
                            <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
                                {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                                    <div key={step} className={`flex flex-col gap-4 p-6 border border-white/6 bg-white/[0.015] ${i > 0 ? 'border-l-0' : ''}`}>
                                        <span className="text-[11px] font-bold tracking-[0.3em] text-[#eccd80]/60">{step}</span>
                                        <div>
                                            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white mb-2">{title}</p>
                                            <p className="text-[12px] leading-relaxed text-white/40">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Sticky pricing panel ── */}
                    <div className="mt-10 lg:mt-0">
                        <div className="lg:sticky lg:top-8">
                            <div
                                className="bg-[#0d0d0d] p-8"
                                style={{
                                    boxShadow: '0 0 0 1px rgba(236,205,128,0.3), 0 0 40px rgba(236,205,128,0.05), inset 0 1px 0 rgba(236,205,128,0.15)',
                                }}
                            >
                                {/* Category */}
                                {pkg.category && (
                                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#eccd80]">
                                        {pkg.category}
                                    </p>
                                )}

                                {/* Title */}
                                <h1 className={`${playfair.className} text-[2rem] font-semibold leading-tight text-white`}>
                                    {pkg.title}
                                </h1>

                                {/* Billing cycle */}
                                {pkg.billingCycle && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-[#eccd80]" strokeWidth={1.8} />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">
                                            {pkg.billingCycle}
                                        </span>
                                    </div>
                                )}

                                {/* Description */}
                                <p className="mt-5 pb-6 text-[13px] leading-relaxed text-white/50 border-b border-white/6">
                                    {pkg.description}
                                </p>

                                {/* Price */}
                                <div className="mt-6 mb-6">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/30 mb-2">
                                        Starting From
                                    </p>
                                    <p className="text-[2.75rem] font-semibold leading-none text-white">
                                        {formatCurrency(pkg.price)}
                                    </p>
                                </div>

                                {/* Book Now */}
                                <button
                                    onClick={() => setBookingOpen(true)}
                                    className="w-full bg-[#eccd80] py-4 text-[11px] font-bold uppercase tracking-[0.4em] text-black transition-colors hover:bg-[#d4b86a]"
                                >
                                    Book This Package
                                </button>

                                {/* Contact specialist */}
                                <ContactSpecialistsModal
                                    triggerLabel="Have questions? Talk to a specialist"
                                    triggerClassName="mt-3 w-full flex items-center justify-center gap-2 border border-white/8 py-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/35 transition-all hover:border-[#eccd80]/25 hover:text-[#eccd80]"
                                />

                                {/* Trust signals */}
                                <div className="mt-7 space-y-3 border-t border-white/6 pt-7">
                                    {[
                                        { icon: Shield, text: "Satisfaction Guaranteed" },
                                        { icon: Award, text: "Certified Expert Stylists" },
                                        { icon: Sparkles, text: "Premium Luxury Products" },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-3">
                                            <Icon className="h-4 w-4 text-[#eccd80]/50" strokeWidth={1.5} />
                                            <span className="text-[11px] text-white/35 uppercase tracking-[0.2em]">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Back link */}
                            <Link
                                href="/packages"
                                className="mt-5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/25 transition-colors hover:text-[#eccd80]"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Back to All Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Testimonials ── */}
            <div className="border-t border-white/5">
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
