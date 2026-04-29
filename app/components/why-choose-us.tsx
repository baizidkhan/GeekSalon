"use client"

import { useState, useEffect } from "react"

const stats = [
    { value: "15+", label: "Years of Excellence" },
    { value: "50K+", label: "Happy Clients" },
    { value: "200+", label: "Expert Stylists" },
    { value: "25", label: "Premium Locations" },
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
        "from-stone-400 via-stone-500 to-stone-700",
        "from-zinc-300 via-zinc-400 to-zinc-600",
        "from-neutral-400 via-stone-500 to-neutral-700",
        "from-stone-300 via-neutral-400 to-zinc-600",
    ]
    return (
        <section className="bg-[#0b0b0b] px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">

                    {/* Left: Text content */}
                    <div>
                        <p className="mb-4 text-[11px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Why Choose Us
                        </p>
                        <h2 className="mb-6 text-4xl font-semibold leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Where Luxury Meets{" "}
                            <span className="text-stone-400">Artistry</span>
                        </h2>
                        <p className="mb-12 max-w-md text-sm leading-7 text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                            At PrivéforYou, we believe beauty is an art form. Our world-class team of stylists and aestheticians are dedicated to crafting personalized experiences that celebrate your unique elegance.
                        </p>

                        <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-4xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Image grid */}
                    <div className="relative">
                        {/* Decorative corner brackets */}
                        <div className="absolute -top-5 -right-5 h-14 w-14 border-t border-r border-white/20" />
                        <div className="absolute -bottom-5 -left-5 h-14 w-14 border-b border-l border-white/20" />

                        <div className="grid grid-cols-2 gap-3">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`aspect-square overflow-hidden relative ${!img ? `bg-gradient-to-br ${placeholderTones[index]}` : 'bg-stone-900'}`}
                                >
                                    {img ? (
                                        <img 
                                            src={img} 
                                            alt={`Privé Experience ${index + 1}`} 
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <div
                                                className="border border-white/35 bg-black/25 px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
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
            </div>
        </section>
    )
}
