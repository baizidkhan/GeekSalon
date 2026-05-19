"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Menu, X, UserCircle, History, LogOut } from "lucide-react"
import { useBusiness } from "@/context/BusinessContext"

const navItems = [
    { label: "SERVICES", href: "/services" },
    { label: "PACKAGES", href: "/packages" },
    { label: "ABOUT US", href: "/about-us" },
]

function getUserFromToken(token: string): { name?: string; email?: string; role?: string } | null {
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        return { name: decoded.name, email: decoded.useremail, role: decoded.role }
    } catch {
        return null
    }
}

function getDashboardLink(role?: string): { label: string; href: string } | null {
    if (!role || role === 'customer') return null

    if (role === 'stylist') return { label: 'Stylist Dashboard', href: '/admin/stylist' }
    if (role === 'storeManager') return { label: 'Manager Dashboard', href: '/admin/manager' }
    if (role === 'staff') return { label: 'Staff Dashboard', href: '/admin/staff' }

    return { label: 'Admin Dashboard', href: '/admin' }
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
    const { businessName } = useBusiness()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (token) setUser(getUserFromToken(token))
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        document.cookie = 'accessToken=; path=/; max-age=0'
        window.location.href = '/'
    }

    const isCustomer = !user?.role || user.role === 'customer'
    const dashboardLink = getDashboardLink(user?.role)

    return (
        <header
            className={`sticky top-0 z-50 transition-colors duration-300 ${solid
                ? "bg-[#0b0b0b] border-b border-white/10"
                : "bg-transparent border-b border-white/8"
                }`}
        >
            <div className="relative mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">

                {/* Logo */}
                <Link href="/" className="flex items-center group min-w-[140px]">
                    <span
                        className="transition-colors duration-300 text-white group-hover:text-white/90"
                        style={{
                            fontFamily: 'var(--font-josefin), sans-serif',
                            fontSize: '24px',
                            fontWeight: 700,
                            letterSpacing: 'normal'
                        }}
                    >
                        {businessName || "MakeOver"}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center justify-center gap-9 lg:gap-11">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`relative text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "text-[#CDB37F] after:bg-[#CDB37F]" : "text-white/90 hover:text-white after:bg-white"}`}
                                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex min-w-[140px] justify-end items-center gap-4">
                    {user ? (
                        <>
                            {dashboardLink && (
                                <Link
                                    href={dashboardLink.href}
                                    className="inline-flex items-center gap-2 border border-white/25 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/65 transition-all hover:border-white/50 hover:text-white"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    {dashboardLink.label}
                                </Link>
                            )}

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/[0.04] text-white/70 shadow-[0_4px_18px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#eccd80]/65 hover:bg-white/[0.08] hover:text-white"
                                    aria-label="User menu"
                                >
                                    <UserCircle size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-105" />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-white/15 bg-[#111111]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(236,205,128,0.22),transparent_45%)] pointer-events-none" />
                                        <div className="relative border-b border-white/10 px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eccd80]/35 bg-[#eccd80]/10 text-[#eccd80]">
                                                    <UserCircle size={18} strokeWidth={1.7} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[12px] font-semibold text-white/95">{user.name || 'Guest'}</p>
                                                    <p className="mt-0.5 truncate text-[10px] text-white/55">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative p-2">
                                            {isCustomer && (
                                                <Link
                                                    href="/customer-dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[10.5px] uppercase tracking-[0.2em] text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 transition-colors group-hover:border-[#eccd80]/50 group-hover:text-[#eccd80]">
                                                        <History size={13} strokeWidth={1.7} />
                                                    </span>
                                                    History
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10.5px] uppercase tracking-[0.2em] text-white/55 transition-all duration-200 hover:bg-[#ff4f4f]/10 hover:text-white"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70 transition-colors group-hover:border-[#ff6b6b]/45 group-hover:text-[#ff6b6b]">
                                                    <LogOut size={13} strokeWidth={1.7} />
                                                </span>
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="group relative inline-flex items-center justify-center border border-white px-7 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/10"
                                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                            >
                                <span className="relative">LOGIN</span>
                            </Link>
                            <Link
                                href="/"
                                className="group relative inline-flex items-center justify-center bg-white px-7 py-2.5 text-[10px] font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-white/90"
                                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                            >
                                <span className="relative">CONTACT US</span>
                            </Link>
                        </div>
                    )}
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
                        <div className="pt-5 border-t border-white/10 flex flex-col gap-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 mb-1">
                                        <UserCircle size={18} className="text-white/50" strokeWidth={1.5} />
                                        <div>
                                            <p className="text-[11px] text-white/80 font-medium">{user.name || 'Guest'}</p>
                                            <p className="text-[10px] text-white/35">{user.email}</p>
                                        </div>
                                    </div>
                                    {isCustomer && (
                                        <Link
                                            href="/customer-dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/65 transition-all hover:border-white/50 hover:text-white w-fit"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            <History size={13} strokeWidth={1.5} />
                                            History
                                        </Link>
                                    )}
                                    {dashboardLink && (
                                        <Link
                                            href={dashboardLink.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/65 transition-all hover:border-white/50 hover:text-white w-fit"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            {dashboardLink.label}
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/40 transition-all hover:border-white/35 hover:text-white/70 w-fit"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        <LogOut size={13} strokeWidth={1.5} />
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/65 transition-all hover:border-white/50 hover:text-white w-fit"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
