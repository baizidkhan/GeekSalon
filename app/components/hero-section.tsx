"use client"

import Link from "next/link";
import { useBooking } from "@/context/BookingContext";

export function HeroSection() {
    const { openBooking } = useBooking()
    return (
        <section className="relative z-10 overflow-hidden min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 -mt-16">

            {/* Decorative corner brackets */}
            <div className="pointer-events-none absolute inset-x-6 inset-y-6 hidden lg:block">
                <span className="absolute top-0 left-0 block h-14 w-14 border-l border-t border-white/20" />
                <span className="absolute top-0 right-0 block h-14 w-14 border-r border-t border-white/20" />
                <span className="absolute bottom-0 left-0 block h-14 w-14 border-l border-b border-white/20" />
                <span className="absolute bottom-0 right-0 block h-14 w-14 border-r border-b border-white/20" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-5xl text-center text-white py-20 sm:py-24 lg:py-28">

                {/* Headline — exactly 2 lines */}
                <h1
                    className="mx-auto max-w-6xl text-[2.6rem] font-semibold leading-[1.1] sm:text-5xl lg:text-[4rem]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    <span className="block">The Art of Beauty,</span>
                    <span className="block font-normal italic text-white/70">Redefined</span>
                </h1>

                {/* Description */}
                <p
                    className="mx-auto mt-7 uppercase tracking-[0.2em]"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '24px',
                        color: 'rgba(255, 255, 255, 0.6)',
                    }}
                >
                    Luxury experiences crafted for modern elegance
                </p>

                {/* Buttons */}
                <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => openBooking()}
                        className="inline-flex items-center justify-center border border-white bg-white px-10 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-slate-900 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-transparent hover:text-white hover:shadow-[0_14px_36px_rgba(0,0,0,0.3)]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Book an Appointment
                    </button>
                    <Link
                        href="/services"
                        className="inline-flex items-center justify-center border border-white/40 bg-transparent px-10 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white/85 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white hover:bg-white/8 hover:text-white hover:shadow-[0_14px_36px_rgba(0,0,0,0.3)]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Explore Services
                    </Link>
                </div>

            </div>

        </section>
    )
}
