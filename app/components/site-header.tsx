"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useBusiness } from "@/context/BusinessContext"

const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Packages", href: "/packages" },
    { label: "Our Team", href: "/our-team" },
]

export function SiteHeader({ solid = false }: { solid?: boolean }) {
    const { businessName } = useBusiness()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header
            className={`sticky top-0 z-50 transition-colors duration-300 ${
                solid
                    ? "bg-[#0b0b0b] border-b border-white/10"
                    : "bg-transparent border-b border-white/8"
            }`}
        >
            <div className="relative mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group min-w-[140px]">
                    <div className="flex h-7 w-7 items-center justify-center border border-white/25 transition-all duration-300 group-hover:border-white/60">
                        <span className="h-1 w-1 rounded-full bg-white/70 transition-all duration-300 group-hover:bg-white" />
                    </div>
                    <span
                        className="transition-colors duration-300 group-hover:text-white/90"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.80)',
                        }}
                    >
                        {businessName}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center justify-center gap-9 lg:gap-11">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="relative text-[10.5px] uppercase tracking-[0.28em] text-white/55 transition-colors duration-200 hover:text-white/90 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-white/40 after:transition-all after:duration-300 hover:after:w-full"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex min-w-[140px] justify-end">
                    <Link
                        href="/admin/login"
                        className="group relative inline-flex items-center gap-2 overflow-hidden border border-white/25 px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/65 transition-all duration-300 hover:border-white/50 hover:text-white"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        <span className="absolute inset-0 -translate-x-full bg-white/6 transition-transform duration-300 group-hover:translate-x-0" />
                        <span className="relative">Admin</span>
                        <span className="relative h-px w-4 bg-white/40 transition-all duration-300 group-hover:w-5 group-hover:bg-white/70" />
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    type="button"
                    onClick={() => setMobileOpen((o) => !o)}
                    className="flex md:hidden items-center justify-center p-1 text-white/65 hover:text-white transition-colors duration-200"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 bg-black/85 backdrop-blur-xl">
                    <div className="flex flex-col px-6 py-8 gap-7">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-[10.5px] uppercase tracking-[0.3em] text-white/55 hover:text-white transition-colors duration-200"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-5 border-t border-white/10">
                            <Link
                                href="/admin/login"
                                onClick={() => setMobileOpen(false)}
                                className="inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/65 transition-all hover:border-white/50 hover:text-white"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Admin
                                <span className="h-px w-4 bg-white/40" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
