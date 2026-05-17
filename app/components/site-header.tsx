"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X, UserCircle, History, LogOut } from "lucide-react"
import { useBusiness } from "@/context/BusinessContext"

const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Packages", href: "/packages" },
    { label: "Our Team", href: "/our-team" },
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
                                    className="flex items-center justify-center w-9 h-9 rounded-full border border-white/25 text-white/65 hover:border-white/50 hover:text-white transition-all duration-200"
                                    aria-label="User menu"
                                >
                                    <UserCircle size={20} strokeWidth={1.5} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-12 w-56 bg-[#111] border border-white/12 shadow-2xl z-50">
                                        {/* User info */}
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-[11px] text-white/90 font-medium truncate">{user.name || 'Guest'}</p>
                                            <p className="text-[10px] text-white/40 truncate mt-0.5">{user.email}</p>
                                        </div>
                                        {/* History — only for customers */}
                                        {isCustomer && (
                                            <Link
                                                href="/customer-dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[10.5px] uppercase tracking-[0.2em] text-white/55 hover:text-white hover:bg-white/5 transition-colors"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                                <History size={13} strokeWidth={1.5} />
                                                History
                                            </Link>
                                        )}
                                        {/* Sign out */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[10.5px] uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            <LogOut size={13} strokeWidth={1.5} />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="group relative inline-flex items-center gap-2 overflow-hidden border border-white/25 px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/65 transition-all duration-300 hover:border-white/50 hover:text-white"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            <span className="absolute inset-0 -translate-x-full bg-white/6 transition-transform duration-300 group-hover:translate-x-0" />
                            <span className="relative">Login</span>
                        </Link>
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
