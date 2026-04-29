"use client"

import { useBusiness } from "@/context/BusinessContext"

import Link from "next/link"

const footerLinks = {
    Experience: [
        { name: "Our Services", href: "/services" },
        { name: "Packages", href: "/packages" },
    ],
    Company: [
        { name: "Our Team", href: "/our-team" },
    ],
    Support: [
        { name: "Book Appointment", href: "/services" }, // Directing to services for booking
    ],
}

const socials = [
    {
        label: "Instagram",
        href: "#",
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        ),
    },
    {
        label: "Facebook",
        href: "#",
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        label: "Twitter",
        href: "#",
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        label: "YouTube",
        href: "#",
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
]

export function Footer() {
    const { businessInfo, businessName } = useBusiness()

    return (
        <footer className="bg-[#080808]">
            <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-20 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

                    {/* Brand column */}
                    <div>
                        <p className="mb-5 text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                            <span className="text-white">{businessName.split(/(?=[A-Z])/)[0] || businessName}</span>
                            <span className="text-teal-400">{businessName.split(/(?=[A-Z])/)[1] || ""}</span>
                        </p>
                        <p className="mb-8 text-sm leading-7 text-white/50" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Where luxury meets artistry. Experience the finest in beauty and wellness services, crafted for the modern connoisseur.
                        </p>

                        <ul className="mb-8 space-y-3">
                            {[
                                {
                                    icon: (
                                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                        </svg>
                                    ),
                                    text: businessInfo?.address || "123 Luxury Avenue, Beverly Hills, CA 90210",
                                },
                                {
                                    icon: (
                                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                        </svg>
                                    ),
                                    text: businessInfo?.phone || "+1 (555) 123-4567",
                                },
                                {
                                    icon: (
                                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                        </svg>
                                    ),
                                    text: businessInfo?.email || "hello@geeksalon.com",
                                },
                            ].map((item) => (
                                <li key={item.text} className="flex items-start gap-3 text-sm text-white/50" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <span className="mt-0.5 text-white/40">{item.icon}</span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>

                        {/* Social icons */}
                        <div className="flex gap-3">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/50 transition-all duration-300 hover:border-white/40 hover:text-white"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([heading, items]) => (
                        <div key={heading}>
                            <p className="mb-6 text-[11px] uppercase tracking-[0.45em] text-white/40" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {heading}
                            </p>
                            <ul className="space-y-4">
                                {items.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-white/55 transition-colors duration-300 hover:text-white"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
                    <p className="flex items-center gap-3 text-xs text-white/35" style={{ fontFamily: 'Inter, sans-serif' }}>
                        © 2026 {businessName}. All rights reserved.
                        <span className="text-white/20">•</span>
                        Developed by <a href="https://geekssort.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/55 underline transition-colors duration-300 hover:text-white">GeekSSort</a>
                    </p>
                    <div className="flex gap-6">
                        {["Terms", "Privacy", "Cookies"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-xs text-white/35 transition-colors duration-300 hover:text-white"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
