"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "../components/site-header"
import { Footer } from "../components/footer"
import { Service, ServiceCategory } from "@/lib/types"
import Link from "next/link"
import { useBooking } from "@/context/BookingContext"
import { formatCurrency, getMediaUrl } from "@/lib/utils"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"], style: ["normal", "italic"] })

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
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <div
                className="relative flex min-h-[550px] w-full flex-col"
                style={{
                    backgroundImage: "url('/login-cover.avif')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/72" />
                <div className="relative z-10">
                    <SiteHeader />
                </div>
                <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-20">
                    <div className="flex flex-col items-center gap-6 text-center max-w-[769px]">
                        <div className="flex flex-col items-center">
                            <h1 className={`${playfair.className} text-[56px] font-semibold leading-[1.2] text-white sm:text-[64px]`}>
                                Bespoke Beauty
                                <br />
                                <span className="italic font-normal text-[#eccd80]">Experiences</span>
                            </h1>
                        </div>
                        <p className="text-[16px] leading-relaxed text-white/80 max-w-[600px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Each service is meticulously crafted to deliver exceptional results, combining artistry with the finest products and techniques.
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <main className="bg-black px-4 py-20 sm:px-8 lg:px-16">
                <div className="mx-auto w-full max-w-[1200px]">

                    {/* Section heading */}
                    <div className="mb-10 flex flex-col items-center gap-3 text-center">
                        <p className="text-[15px] uppercase tracking-[0.12em] text-[#eccd80]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Our Expertise
                        </p>
                        <h2 className={`${playfair.className} text-[48px] font-normal leading-[1.2] text-white`}>
                            <span className="font-semibold not-italic">Signature</span>
                            {" "}
                            <span className="italic font-normal">Experiences</span>
                        </h2>
                        <p className="max-w-[600px] text-[16px] leading-relaxed text-white/75" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Discover a new standard of beauty. Our signature treatments are tailored to your individual needs, ensuring every visit leaves you feeling refreshed, refined, and confident.
                        </p>
                    </div>

                    {/* Filter tabs */}
                    <div className="mb-16 flex flex-wrap justify-center gap-3.5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActive(cat)}
                                className={`px-8 py-1 text-[14px] font-medium uppercase transition-all duration-300 ${active === cat
                                        ? "border-2 border-[#eccd80] text-[#eccd80]"
                                        : "border border-white text-white hover:border-[#eccd80] hover:text-[#eccd80]"
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
                                <span className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>Loading services...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
                            {services.length > 0 ? (
                                services.map((item, index) => (
                                    <article
                                        key={item.id}
                                        className={`group flex flex-col overflow-hidden bg-[#1a1a1a] transition-transform duration-300 hover:-translate-y-1 ${index === 1 ? "border-2 border-[#eccd80]" : ""
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="relative h-[264px] w-full shrink-0 overflow-hidden bg-neutral-800">
                                            {item.imageUrl ? (
                                                <img
                                                    src={getMediaUrl(item.imageUrl)}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-white/20">
                                                    <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col gap-8 p-6">
                                            {/* Info block */}
                                            <div className="flex flex-col gap-8">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-col gap-3">
                                                        <p className="text-[14px] uppercase text-[#eccd80]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            {item.category}
                                                        </p>
                                                        <h3 className={`${playfair.className} text-[20px] font-semibold text-white leading-snug`}>
                                                            {item.name}
                                                        </h3>
                                                    </div>
                                                    <p className="truncate text-[14px] leading-relaxed text-white" title={item.description} style={{ fontFamily: 'Inter, sans-serif' }}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                                <div className="border-t border-white/20" />
                                            </div>

                                            {/* Price + buttons */}
                                            <div className="flex flex-col gap-[22px]">
                                                <p className="text-[16px] uppercase text-[#eccd80]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    Starting from {formatCurrency(item.price)}
                                                </p>
                                                <div className="flex h-10 gap-[18px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => openBooking(item)}
                                                        className="flex flex-1 items-center justify-center bg-white px-4 text-[12px] font-semibold uppercase text-black transition-all duration-300 hover:bg-white/90"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    >
                                                        Book Now
                                                    </button>
                                                    <Link
                                                        href={`/services/${item.id}`}
                                                        className="flex flex-1 items-center justify-center border-2 border-white px-4 text-[12px] font-semibold uppercase text-white transition-all duration-300 hover:bg-white hover:text-black text-center"
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
                                    <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>No services found for this category</p>
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
