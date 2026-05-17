"use client"

import { useState, useEffect } from "react"
import { getMediaUrl } from "@/lib/utils"

const stats = [
    { value: "8+", label: "Years of Excellence" },
    { value: "15K+", label: "Happy Clients" },
    { value: "20+", label: "Expert Stylists" },
    { value: "45+", label: "Signature Services" },
]

export function WhyChooseUsSection() {
    const [images, setImages] = useState<(string | null)[]>([null, null, null, null])

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
                const res = await fetch(`${baseUrl}/why-choose-us-image`)
                const data = await res.json()
                if (data) {
                    setImages([
                        data.image1 || null,
                        data.image2 || null,
                        data.image3 || null,
                        data.image4 || null
                    ])
                }
            } catch (err) {
                console.error("Failed to fetch why-choose-us images:", err)
            }
        }
        fetchImages()
    }, [])

    const placeholderTones = [
        "from-stone-200 via-stone-300 to-stone-400",
        "from-zinc-200 via-zinc-300 to-zinc-400",
        "from-neutral-200 via-stone-300 to-neutral-400",
        "from-stone-200 via-neutral-300 to-zinc-400",
    ]

    return (
        <section className="bg-transparent px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                
                {/* Center Header */}
                <div className="text-center mb-20">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#d4af37]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                        WHY CHOOSE US
                    </p>
                    <h2 className="mb-6 text-[2.75rem] leading-tight text-black sm:text-[3.25rem]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Where Luxury Meets <span className="italic">Artistry</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-[13px] leading-relaxed text-gray-600" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                        Every visit to PrivéforYou is a journey through refined luxury. From our curated environments to our bespoke treatments, we create moments that transcend the ordinary.
                    </p>
                </div>

                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left: Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-14 pr-4 lg:pr-8">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="text-[2.75rem] font-semibold text-black leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {stat.value}
                                </p>
                                <p className="mt-4 pb-3 text-[11px] font-bold text-gray-500 border-b border-[#d4af37] w-[90%]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right: Image grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`aspect-[4/3] overflow-hidden relative ${!img ? `bg-gradient-to-br ${placeholderTones[index]}` : 'bg-stone-200'}`}
                            >
                                {img ? (
                                    <img
                                        src={getMediaUrl(img)}
                                        alt={`Privé Experience ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div
                                            className="border border-black/10 bg-white/40 px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-black/60 backdrop-blur-sm"
                                            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                                        >
                                            Signature Experience
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}
