"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "../components/site-header"
import { Footer } from "../components/footer"
import { CtaSection } from "../components/cta-section"
import { Service, ServiceCategory } from "@/lib/types"
import Link from "next/link"
import { useBooking } from "@/context/BookingContext"
import { formatCurrency, getMediaUrl } from "@/lib/utils"

const categories = ["All", ...Object.values(ServiceCategory)]

export default function ServicesPage() {
    const { openBooking } = useBooking()
    const [active, setActive] = useState("All")
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true)
            try {
                // Use the endpoint http://localhost:4000/service/active?category=hair
                // If active is "All", we omit the category parameter
                const url = active === "All"
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/service/active`
                    : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/service/active?category=${active.toLowerCase()}`

                const response = await fetch(url)
                const data = await response.json()
                setServices(data)
            } catch (error) {
                console.error("Error fetching services:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [active])

    return (
        <div className="min-h-screen bg-[#070707]">
            {/* Hero Section Container */}
            <div className="relative min-h-[50vh] flex flex-col bg-black/60">
                {/* Background image & overlays */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2070&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-transparent to-[#070707]" />
                
                {/* Header (with transparent background) */}
                <div className="relative z-20">
                    <SiteHeader />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center flex-grow flex flex-col items-center justify-center py-20">
                    <h1 className="mb-6 text-5xl font-semibold leading-tight text-white sm:text-7xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Bespoke Beauty
                        <br />
                        <em className="italic font-light text-[#CDB37F]">Experiences</em>
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Each service is meticulously crafted to deliver exceptional results, combining artistry with the finest products and techniques.
                    </p>
                </div>
            </div>

            <main className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">

                    {/* Heading */}
                    <div className="mb-12 text-center">
                        <p className="mb-3 text-[12px] font-medium uppercase tracking-widest text-[#CDB37F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            OUR EXPERTISE
                        </p>
                        <h2 className="mb-5 text-4xl font-semibold text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Signature <em className="italic font-light text-white">Experiences</em>
                        </h2>
                        <p className="mx-auto max-w-2xl text-xs leading-6 text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Discover a new standard of beauty. Our signature treatments are tailored to your individual needs, ensuring every visit leaves you feeling refreshed, refined, and confident.
                        </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="mb-14 flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActive(cat)}
                                className={`px-7 py-2.5 text-[10px] uppercase tracking-[0.25em] transition-all duration-300 border-t-[3px] border-l-[3px] border-b border-r ${active === cat
                                        ? "border-[#CDB37F] text-[#CDB37F]"
                                        : "border-white bg-transparent text-white hover:border-white/80 hover:text-white/80"
                                    }`}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Cards grid */}
                    {loading ? (
                        <div className="flex h-64 items-center justify-center text-white/50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                <span className="text-[11px] uppercase tracking-widest">Loading services...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
                            {services.length > 0 ? (
                                services.map((item) => (
                                    <article
                                        key={item.id}
                                        className="group w-full max-w-[380px] flex flex-col border border-white/5 bg-[#111] text-white transition-all duration-500 hover:-translate-y-1 hover:border-[#CDB37F]/40"
                                    >
                                        {/* Image */}
                                        <div className={`relative aspect-[4/3] overflow-hidden bg-neutral-900 shrink-0`}>
                                            {item.imageUrl ? (
                                                <img
                                                    src={getMediaUrl(item.imageUrl)}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111] to-black text-white/20">
                                                    <span className="text-[10px] uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover:bg-black/10" />
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div>
                                                <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-[#CDB37F] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    {item.category}
                                                </p>
                                                <h3 className="text-[1.35rem] font-medium text-white truncate mb-3" title={item.name} style={{ fontFamily: 'Playfair Display, serif' }}>
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs leading-relaxed text-white/60 line-clamp-2" title={item.description} style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-6">
                                                <div className="mb-5 border-t border-white/5" />

                                                <p className="mb-5 text-[11px] font-medium uppercase tracking-wider text-[#CDB37F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    STARTING FROM {formatCurrency(item.price).replace('Tk', '৳')}
                                                </p>

                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openBooking(item)}
                                                        className="flex-1 flex items-center justify-center bg-white px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-black transition-all duration-300 hover:bg-white/90"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    >
                                                        Book Now
                                                    </button>
                                                    <Link
                                                        href={`/services/${item.id}`}
                                                        className="flex-1 flex items-center justify-center border-t-[3px] border-l-[3px] border-b border-r border-white bg-transparent px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white/5 text-center"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="col-span-full flex h-64 flex-col items-center justify-center border border-dashed border-white/10 text-white/30">
                                    <p className="text-[11px] uppercase tracking-widest">No services found for this category</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            <CtaSection />
            <Footer />
        </div>
    )
}
