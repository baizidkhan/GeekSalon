import Link from "next/link"

const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Packages", href: "#packages" },
    { label: "Our Team", href: "#our-team" },
]

export function SiteHeader({ solid = false }: { solid?: boolean }) {
    return (
        <header className={`sticky top-0 z-50 border-b border-white/15 ${solid ? "bg-[#0b0b0b]" : ""}`}>
            <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="min-w-[120px]">
                    <Link
                        href="/"
                        className="tracking-tight"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '16.5px',
                            color: 'rgba(255, 255, 255, 0.99)',
                        }}
                    >
                        Elgence
                    </Link>
                </div>

                <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-10">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="uppercase tracking-[0.18em] transition-colors hover:text-white/80"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                lineHeight: '16.5px',
                                color: 'rgb(255, 255, 255)',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex min-w-[120px] justify-end">
                    <Link
                        href="/admin/login"
                        className="inline-flex items-center justify-center rounded-full border border-white/60 bg-transparent px-4 py-2 text-base font-medium text-white transition-colors hover:border-white hover:bg-white/10 hover:text-white"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '16.5px',
                            color: 'rgb(255, 255, 255)',
                        }}
                    >
                        Admin Login
                    </Link>
                </div>
            </div>
        </header>
    )
}
