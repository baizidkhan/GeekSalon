"use client"

import { useState, useEffect } from "react"

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<any[]>([])
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("http://localhost:4000/testimonial", { cache: 'no-store' })
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
        <section className="bg-[#0b0b0b] px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">

                {/* Quote icon */}
                <div className="mb-12 flex h-16 w-16 items-center justify-center border border-white/20">
                    <svg className="h-6 w-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                </div>

                {/* Quote text */}
                <div className="min-h-[160px] flex items-center justify-center">
                    <blockquote
                        key={t.id}
                        className="mb-4 text-2xl font-semibold italic leading-relaxed text-white sm:text-3xl animate-in fade-in duration-700"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        &ldquo;{t.description}&rdquo;
                    </blockquote>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 mt-8">
                    <div className="text-left">
                        <p className="text-base font-medium text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {t.name}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {t.position}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-14 flex items-center gap-5">
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous"
                        className="flex h-12 w-12 items-center justify-center border border-white/20 text-white/60 transition-all duration-300 hover:border-white/50 hover:text-white"
                    >
                        &#8249;
                    </button>

                    <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setCurrent(i)}
                                aria-label={`Go to testimonial ${i + 1}`}
                                className={`h-2 transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2 rounded-full bg-white/30"}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next"
                        className="flex h-12 w-12 items-center justify-center border border-white/20 text-white/60 transition-all duration-300 hover:border-white/50 hover:text-white"
                    >
                        &#8250;
                    </button>
                </div>

            </div>
        </section>
    )
}

