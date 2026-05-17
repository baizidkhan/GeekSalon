"use client"

import { useBusiness } from "@/context/BusinessContext"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const socials = [
    {
        label: "Facebook",
        href: "#",
        icon: (
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
        ),
    },
    {
        label: "Instagram",
        href: "#",
        icon: (
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
            </svg>
        ),
    },
    {
        label: "TikTok",
        href: "#",
        icon: (
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
        ),
    },
]

export function Footer() {
    const { businessInfo } = useBusiness()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/news-letter-subscriber`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to subscribe")
            }

            toast.success("Successfully subscribed to our newsletter!")
            setEmail("")
        } catch (error: any) {
            console.error("Newsletter subscription error:", error)
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <footer className="bg-[#000000] border-t border-white/5">
            <div className="mx-auto w-full max-w-7xl px-6 pt-24 pb-12 sm:px-8 lg:px-10">
                <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1.7fr]">

                    {/* Column 1: Brand */}
                    <div>
                        <span
                            className="block mb-6 text-2xl font-bold text-white tracking-normal"
                            style={{ fontFamily: 'var(--font-josefin), sans-serif' }}
                        >
                            {businessInfo?.businessName || "Makeover"}
                        </span>

                        <p
                            className="mb-8 max-w-sm text-[13px] leading-relaxed text-gray-400"
                            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                        >
                            Where luxury meets artistry. Experience the finest in beauty and wellness, crafted for the modern connoisseur.
                        </p>

                        {/* Social icons */}
                        <div className="flex gap-3">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="flex h-10 w-10 items-center justify-center border border-white/20 text-gray-400 transition-all duration-300 hover:border-white hover:text-white rounded-sm"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Explore Us */}
                    <div>
                        <p
                            className="mb-6 text-[18px] font-semibold text-white"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Explore Us
                        </p>
                        <ul className="space-y-4">
                            {[
                                { name: "SERVICES", href: "/services" },
                                { name: "PACKAGES", href: "/packages" },
                                { name: "About US", href: "/about" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-[12px] font-bold text-gray-400 uppercase tracking-widest transition-colors duration-300 hover:text-white"
                                        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Us */}
                    <div>
                        <p
                            className="mb-6 text-[18px] font-semibold text-white"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Contact Us
                        </p>
                        <ul className="space-y-4 text-[13px] text-gray-400 leading-relaxed" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                            <li>
                                {businessInfo?.address || "Mirpur DOHS, Pallabi, Dhaka 1216, Bangladesh."}
                            </li>
                            <li>
                                {businessInfo?.phone || "+880 0000000000"}
                            </li>
                            <li>
                                {businessInfo?.email || "admin@admin.com"}
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <p
                            className="mb-6 text-[18px] font-semibold text-white"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Subscribe To Newsletter
                        </p>
                        <p
                            className="mb-8 text-[13px] leading-relaxed text-gray-400"
                            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                        >
                            Get monthly beauty insights, salon trends, and real-world experiences from leading salons and beauty experts around the globe.
                        </p>

                        <form onSubmit={handleSubscribe} className="flex border border-white/20 bg-transparent w-full">
                            <input
                                type="email"
                                placeholder="Email your mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-grow bg-transparent px-4 py-3 text-[12px] text-white placeholder-gray-500 focus:outline-none w-[50%]"
                                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                            >
                                {isLoading ? "SUBSCRIBING..." : "SUBSCRIBE"}
                            </button>
                        </form>
                    </div>

                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mt-20 mb-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <p
                        className="text-[11px] text-gray-500"
                        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                    >
                        © 2026 {businessInfo?.businessName || "Makeover"} All Rights Reserved
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <Link href="/" className="hover:text-white transition-colors" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                            TERMS & CONDITIONS
                        </Link>
                        <Link href="/" className="hover:text-white transition-colors" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                            PRIVACY POLICY
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    )
}
