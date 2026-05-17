"use client"

import { useState, useEffect } from "react"

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<any[]>([])
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/testimonial`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTestimonials(data)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error("Error fetching testimonials:", err)
                setLoading(false)
            })
    }, [])

    const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
    const next = () => setCurrent((c) => (c + 1) % testimonials.length)

    if (loading) {
        return (
            <section className="bg-[#0b0b0b] px-4 py-24 text-center">
                <div className="animate-pulse text-white/20 uppercase tracking-widest text-sm font-medium">
                    Curating client experiences...
                </div>
            </section>
        )
    }

    if (testimonials.length === 0) return null

    const t = testimonials[current]

    return (
        <section className="bg-[#171717] px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl flex flex-col items-center text-center">

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#d4af37]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    TESTIMONIAL
                </p>
                <h2 className="mb-6 text-[2.75rem] leading-tight text-white sm:text-[3.25rem]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Our Happy Client <span className="italic">Review</span>
                </h2>
                <p className="mb-16 max-w-3xl text-[14px] leading-relaxed text-gray-300" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    Trusted by clients who value modern style, professional care, and a relaxing beauty experience designed to make every visit feel special.
                </p>

                <div className="grid gap-12 w-full md:grid-cols-2">
                    {/* First Testimonial */}
                    <div className="relative border border-[#d4af37] p-10 pt-14 text-left bg-transparent flex flex-col justify-between">
                        <div className="absolute -top-7 left-10 bg-[#171717] px-4">
                            <svg className="h-14 w-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                        </div>
                        <div>
                            <p className="mb-10 text-[16px] leading-relaxed text-gray-200" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {testimonials[current]?.description || "Excellent service with high-quality products. The team understands client needs very well and delivers beyond expectations."}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-auto">
                            <div className="h-12 w-12 rounded-full bg-white flex-shrink-0" />
                            <div>
                                <p className="text-[14px] font-bold text-white" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                    {testimonials[current]?.name || "Farhana Ahmed"}
                                </p>
                                <p className="text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                    {testimonials[current]?.position || "Entrepreneur"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Second Testimonial (or next) */}
                    {testimonials.length > 1 && (
                        <div className="relative border border-[#d4af37] p-10 pt-14 text-left bg-transparent flex flex-col justify-between">
                            <div className="absolute -top-7 left-10 bg-[#171717] px-4">
                                <svg className="h-14 w-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                            </div>
                            <div>
                                <p className="mb-10 text-[16px] leading-relaxed text-gray-200" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {testimonials[(current + 1) % testimonials.length]?.description || "Professional service and very friendly staff. The makeover was subtle yet elegant—exactly what I wanted for my office event."}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="h-12 w-12 rounded-full bg-white flex-shrink-0" />
                                <div>
                                    <p className="text-[14px] font-bold text-white" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                        {testimonials[(current + 1) % testimonials.length]?.name || "Ayesha Karim"}
                                    </p>
                                    <p className="text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                        {testimonials[(current + 1) % testimonials.length]?.position || "Corporate Professional"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-14 flex gap-2.5 items-center justify-center">
                    {Array.from({ length: Math.ceil(testimonials.length / 2) || 1 }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setCurrent(i * 2)}
                            aria-label={`Go to page ${i + 1}`}
                            className={`h-2 transition-all duration-300 rounded-full ${i * 2 === current || i * 2 === current - 1 ? "w-8 bg-[#d4af37]" : "w-2 bg-white"}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    )
}
