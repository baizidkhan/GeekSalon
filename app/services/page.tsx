"use client"

import { useState } from "react"
import { SiteHeader } from "../components/site-header"
import { Footer } from "../components/footer"

const categories = ["All", "Hair", "Skincare", "Makeup", "Spa", "Wedding"]

const services = [
    {
        category: "Wedding",
        title: "Bridal Elegance",
        description: "A complete bridal transformation experience with personalized styling, luxury makeup application, and timeless finishing touches that last all day.",
        price: "From $599",
        tone: "from-amber-200 via-stone-300 to-stone-500",
    },
    {
        category: "Skincare",
        title: "Signature Facial",
        description: "Advanced skincare treatment combining cutting-edge technology with pure botanical extracts for a visibly radiant, deeply nourished complexion.",
        price: "From $189",
        tone: "from-orange-100 via-rose-100 to-amber-200",
    },
    {
        category: "Hair",
        title: "Hair Transformation",
        description: "Complete hair makeover with precision cut, custom color, and expert styling by our master stylists for a bold, modern, refreshed look.",
        price: "From $299",
        tone: "from-rose-200 via-pink-200 to-fuchsia-200",
    },
    {
        category: "Hair",
        title: "Color & Highlights",
        description: "Hand-painted balayage and bespoke highlights crafted to complement your skin tone, lifestyle, and personal aesthetic with lasting vibrancy.",
        price: "From $199",
        tone: "from-amber-100 via-yellow-200 to-orange-200",
    },
    {
        category: "Hair",
        title: "Keratin Treatment",
        description: "Professional smoothing treatment that eliminates frizz, restores shine, and dramatically reduces styling time for up to five months.",
        price: "From $349",
        tone: "from-stone-200 via-neutral-300 to-stone-400",
    },
    {
        category: "Skincare",
        title: "Deep Cleanse Ritual",
        description: "Intensive pore-clearing treatment with steam, extractions, and a customized mask to purify, balance, and revitalize congested skin.",
        price: "From $149",
        tone: "from-green-100 via-emerald-100 to-teal-200",
    },
    {
        category: "Skincare",
        title: "Anti-Aging Renewal",
        description: "Clinically inspired lifting and firming treatment using peptide-rich serums and microcurrent technology to visibly restore youthful contours.",
        price: "From $249",
        tone: "from-sky-100 via-blue-100 to-indigo-100",
    },
    {
        category: "Makeup",
        title: "Glamour Artistry",
        description: "Full-face luxury makeup application for special events, editorial shoots, or any occasion where you want to look and feel extraordinary.",
        price: "From $129",
        tone: "from-pink-200 via-rose-200 to-red-200",
    },
    {
        category: "Makeup",
        title: "Bridal Makeup",
        description: "Long-wear bridal makeup designed to photograph beautifully and stay flawless from ceremony to reception, tailored to your vision.",
        price: "From $199",
        tone: "from-amber-50 via-rose-100 to-pink-200",
    },
    {
        category: "Spa",
        title: "Luxury Body Wrap",
        description: "Indulgent full-body treatment using mineral-rich muds and aromatic oils to detoxify, deeply hydrate, and leave skin silky smooth.",
        price: "From $179",
        tone: "from-teal-100 via-cyan-100 to-sky-200",
    },
    {
        category: "Spa",
        title: "Hot Stone Massage",
        description: "Therapeutic heated basalt stone massage that melts tension, improves circulation, and delivers profound relaxation from head to toe.",
        price: "From $159",
        tone: "from-stone-300 via-neutral-400 to-stone-500",
    },
    {
        category: "Wedding",
        title: "Bridal Party Package",
        description: "A coordinated beauty experience for the entire bridal party — hair, makeup, and finishing details delivered seamlessly on your special day.",
        price: "From $899",
        tone: "from-rose-100 via-pink-100 to-fuchsia-100",
    },
]

export default function ServicesPage() {
    const [active, setActive] = useState("All")

    const filtered = active === "All" ? services : services.filter((s) => s.category === active)

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
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((item) => (
                            <article
                                key={item.title}
                                className="group border border-white/10 bg-[#101010] text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${item.tone}`}>
                                    <div className="absolute inset-0 bg-black/20" />
                                    {/* Arrow icon */}
                                    <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center border border-white/30 bg-black/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
                                        <svg className="h-4 w-4 text-white transition-colors duration-300 group-hover:text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 sm:p-7">
                                    <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {item.category}
                                    </p>
                                    <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {item.description}
                                    </p>

                                    <div className="my-5 border-t border-white/10" />

                                    <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {item.price}
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 border border-white/15 bg-transparent px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            type="button"
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
                            </article>
                        ))}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    )
}
