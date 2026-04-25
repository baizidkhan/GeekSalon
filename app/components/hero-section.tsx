export function HeroSection() {
    return (
        <section
            className="relative z-10 overflow-hidden min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8"
        >
            <div className="relative z-10 mx-auto w-full max-w-5xl text-center text-white py-20 sm:py-24 lg:py-28">
                <p className="mb-4 text-xs sm:text-sm uppercase tracking-[0.35em] text-white/80">
                    Welcome to the new experience
                </p>
                <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Timeless elegance for modern salon experiences.
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-white/85" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Streamline appointments, service packages, and your team in one polished platform designed to feel balanced, refined, and easy to use.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <a
                        href="/admin/login"
                        className="inline-flex items-center justify-center rounded-none border border-white bg-white px-8 py-3 text-sm font-medium text-slate-900 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-transparent hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Enter Dashboard
                    </a>
                    <a
                        href="#services"
                        className="inline-flex items-center justify-center rounded-none border border-white bg-transparent px-8 py-3 text-sm font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Explore Services
                    </a>
                </div>
            </div>
        </section>
    )
}
