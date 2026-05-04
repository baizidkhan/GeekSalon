"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "../components/site-header"
import { Footer } from "../components/footer"
import { Service, ServiceCategory } from "@/lib/types"
import Link from "next/link"
import { useBooking } from "@/context/BookingContext"
import { getMediaUrl } from "@/lib/utils"

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
        <div className="min-h-screen bg-[#0b0b0b]">
            <SiteHeader solid />

            <main className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">

                    {/* Heading */}
                    <div className="mb-12">
                        <p className="mb-4 text-[11px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Our Services
                        </p>
                        <h1 className="mb-5 text-5xl font-semibold leading-tight text-white sm:text-6xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Bespoke Beauty
                            <br />
                            <span className="text-stone-400">Experiences</span>
                        </h1>
                        <p className="max-w-xl text-sm leading-7 text-white/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Each service is meticulously crafted to deliver exceptional results, combining artistry with the finest products and techniques.
                        </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="mb-14 flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActive(cat)}
                                className={`px-5 py-2 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 ${
                                    active === cat
                                        ? "bg-white text-black"
                                        : "border border-white/25 bg-transparent text-white/65 hover:border-white/50 hover:text-white"
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
                                        className="group w-full max-w-[380px] flex flex-col border border-white/10 bg-[#101010] text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1"
                                    >
                                        {/* Image */}
                                        <div className={`relative aspect-[4/3] overflow-hidden bg-neutral-900 shrink-0`}>
                                            {item.imageUrl ? (
                                                <img 
                                                    src={getMediaUrl(item.imageUrl)} 
                                                    alt={item.name} 
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-white/20">
                                                    <span className="text-[10px] uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20" />
                                            {/* Arrow icon */}
                                            <Link 
                                                href={`/services/${item.id}`}
                                                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center border border-white/30 bg-black/30 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black group-hover:border-white"
                                            >
                                                <svg className="h-4 w-4 text-white transition-colors duration-300 hover:text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                                </svg>
                                            </Link>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 sm:p-7 flex flex-col flex-grow">
                                            <div>
                                                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-white/45 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    {item.category}
                                                </p>
                                                <h3 className="text-xl font-semibold text-white truncate" title={item.name} style={{ fontFamily: 'Playfair Display, serif' }}>
                                                    {item.name}
                                                </h3>
                                                <p className="mt-3 text-sm leading-7 text-white/55 truncate" title={item.description} style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="my-5 border-t border-white/10" />

                                                <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    Starting from ৳{item.price}
                                                </p>

                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/services/${item.id}`}
                                                        className="flex-1 flex items-center justify-center border border-white/15 bg-transparent px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black text-center"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => openBooking(item)}
                                                        className="flex-1 flex items-center justify-center gap-2 border border-white bg-white px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    >
                                                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                                        </svg>
                                                        Book Now
                                                    </button>
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

            <Footer />
        </div>
    )
}
