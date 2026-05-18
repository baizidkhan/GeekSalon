"use client"

import { useState, useEffect } from "react"

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<any[]>([])
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

    if (loading) {
        return (
            <section className="bg-[#171717] px-4 py-24 text-center">
                <div className="animate-pulse text-white/20 uppercase tracking-[0.35em] text-xs font-medium">
                    Curating client experiences...
                </div>
            </section>
        )
    }

    const items = [
        testimonials[0] || {
            description: "Excellent service with high-quality products. The team understands client needs very well and delivers beyond expectations.",
            name: "Farhana Ahmed",
            position: "Entrepreneur",
        },
        testimonials[1] || {
            description: "Professional service and very friendly staff. The makeover was subtle yet elegant—exactly what I wanted for my office event.",
            name: "Ayesha Karim",
            position: "Corporate Professional",
        },
    ]

    return (
        <section className="bg-[#1a1a1a] px-4 py-16 sm:px-6 lg:px-[135px] lg:py-16">
            <div className="mx-auto flex w-full max-w-[1150px] flex-col items-center text-center">
                <div className="max-w-[770px]">
                    <p className="mb-4 text-[15px] font-medium uppercase tracking-[0.45em] text-[#eccd80]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                        TESTIMONIAL
                    </p>
                    <h2 className="text-[48px] leading-none text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Our Happy Client <span className="italic">Review</span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-[720px] text-[14px] leading-[1.5] text-white" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                        Trusted by clients who value modern style, professional care, and a relaxing beauty experience designed to make every visit feel special.
                    </p>
                </div>

                <div className="mt-16 flex w-full flex-col gap-6 lg:flex-row lg:gap-[30px]">
                    {items.map((item, index) => (
                        <div
                            key={`${item.name}-${index}`}
                            className="relative flex min-h-[264px] flex-1 flex-col justify-between border border-[#eccd80] px-8 pb-10 pt-12 text-left sm:px-10 lg:px-16"
                        >
                            <div className="absolute -top-7 left-6 bg-[#1a1a1a] px-2 sm:left-8 sm:px-4">
                                <svg className="h-14 w-14 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                            </div>

                            <p className="max-w-[370px] text-[18px] leading-[1.52] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {item.description}
                            </p>

                            <div className="mt-10 flex items-center gap-3">
                                <div className="h-[42px] w-[42px] flex-shrink-0 rounded-full bg-white" />
                                <div>
                                    <p className="text-[18px] font-semibold leading-none text-white" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                        {item.name}
                                    </p>
                                    <p className="mt-1 text-[12px] leading-none text-white/65" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                        {item.position}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex items-center gap-[2px]">
                    <span className="h-[6px] w-[6px] rounded-full bg-white" />
                    <span className="h-[6px] w-[24px] rounded-full bg-[#eccd80]" />
                    <span className="h-[6px] w-[6px] rounded-full bg-white" />
                    <span className="h-[6px] w-[6px] rounded-full bg-white" />
                    <span className="h-[6px] w-[6px] rounded-full bg-white" />
                </div>
            </div>
        </section>
    )
}
