"use client"

import Link from "next/link";
import { useBooking } from "@/context/BookingContext";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    const { openBooking } = useBooking()
    return (
        <section className="hero-alive relative z-10 overflow-hidden min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 -mt-16">

            {/* Decorative corner brackets */}
            <div className="pointer-events-none absolute inset-x-6 inset-y-6 hidden lg:block">
                <span className="absolute top-0 left-0 block h-14 w-14 border-l border-t border-white/20" />
                <span className="absolute top-0 right-0 block h-14 w-14 border-r border-t border-white/20" />
                <span className="absolute bottom-0 left-0 block h-14 w-14 border-l border-b border-white/20" />
                <span className="absolute bottom-0 right-0 block h-14 w-14 border-r border-b border-white/20" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-5xl text-center text-white py-20 sm:py-24 lg:py-28">

                {/* Headline */}
                <h1
                    className="mx-auto max-w-6xl text-[2.6rem] font-semibold leading-[1.1] sm:text-[4rem] lg:text-[5.5rem]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    <span className="block">
                        <span className="hero-line-1 inline-block">The Art Of Beauty,</span>
                    </span>
                    <span className="block font-normal italic text-[#d4af37]">
                        <span className="hero-line-2 inline-block">Redefined</span>
                    </span>
                </h1>

                {/* Description */}
                <p
                    className="hero-sub mx-auto mt-6"
                    style={{
                        fontFamily: 'var(--font-inter), sans-serif',
                        fontSize: '15px',
                        fontWeight: 400,
                        lineHeight: '24px',
                        color: 'rgba(255, 255, 255, 0.85)',
                    }}
                >
                    Luxury experiences crafted for modern elegance.
                </p>

                {/* Buttons */}
                <div className="hero-btns mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => openBooking()}
                        className="hero-btn inline-flex items-center justify-center bg-white px-10 py-3.5 text-[11px] font-bold uppercase tracking-widest text-black hover:bg-gray-200"
                        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                    >
                        BOOK AN APPOINTMENT
                    </button>
                    <Link
                        href="/services"
                        className="hero-btn inline-flex items-center justify-center gap-2 border-t-[3px] border-l-[3px] border-b border-r border-solid border-white bg-transparent px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black"
                        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                    >
                        EXPLORE OUR SERVICES <ArrowRight size={15} strokeWidth={2} />
                    </Link>
                </div>


            </div>

        </section>
    )
}
