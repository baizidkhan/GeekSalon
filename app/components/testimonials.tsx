"use client"

import { useState } from "react"

const testimonials = [
    {
        quote: "PrivéforYou transformed my entire outlook on self-care. The attention to detail and personalized approach made me feel truly special.",
        name: "Alexandra Chen",
        title: "Fashion Designer",
        avatar: null,
    },
    {
        quote: "An unparalleled experience from start to finish. The team's artistry and dedication to excellence left me feeling like a completely new person.",
        name: "Sophia Laurent",
        title: "Creative Director",
        avatar: null,
    },
    {
        quote: "I've visited luxury salons around the world, but nothing compares to the bespoke care and refined atmosphere of PrivéforYou.",
        name: "Isabella Monroe",
        title: "Lifestyle Blogger",
        avatar: null,
    },
]

export function TestimonialsSection() {
    const [current, setCurrent] = useState(0)

    const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
    const next = () => setCurrent((c) => (c + 1) % testimonials.length)

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
                <blockquote
                    className="mb-4 text-2xl font-semibold italic leading-relaxed text-white sm:text-3xl"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-stone-400 via-stone-500 to-stone-700" />
                    <div className="text-left">
                        <p className="text-base font-medium text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {t.name}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {t.title}
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
