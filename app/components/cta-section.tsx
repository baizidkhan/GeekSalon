"use client"

import { useBooking } from "@/context/BookingContext"

export function CtaSection() {
    const { openBooking } = useBooking()
    return (
        <section className="bg-[#0b0b0b] px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">

                <p className="mb-5 text-[11px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Begin Your Journey
                </p>

                <h2 className="mb-6 text-5xl font-semibold leading-tight text-white sm:text-6xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Ready to Experience
                    <br />
                    <span className="text-stone-400">True Luxury?</span>
                </h2>

                <p className="mb-3 max-w-lg text-sm leading-7 text-white/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Join the exclusive community of those who understand that beauty is not just about appearance—it&apos;s about the experience.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => openBooking()}
                        className="border border-white bg-white px-10 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Book an Appointment
                    </button>
                    <button
                        type="button"
                        className="border border-white/40 bg-transparent px-10 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Packages
                    </button>
                </div>

            </div>
        </section>
    )
}
