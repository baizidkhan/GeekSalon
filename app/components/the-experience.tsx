export function TheExperienceSection() {
    return (
        <section className="bg-[#0b0b0b] px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">

                    {/* Left: Text content */}
                    <div>
                        <p className="mb-4 text-[11px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            The Experience
                        </p>
                        <h2 className="mb-6 text-4xl font-semibold leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Crafted for Those Who{" "}
                            <span className="text-stone-400">Appreciate Excellence</span>
                        </h2>
                        <p className="mb-10 max-w-md text-sm leading-7 text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Every visit to PrivéforYou is a journey through refined luxury. From our curated environments to our bespoke treatments, we create moments that transcend the ordinary.
                        </p>

                        <button
                            type="button"
                            className="border border-white bg-white px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Book Your Experience
                        </button>
                    </div>

                    {/* Right: Video placeholder */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-zinc-400 via-stone-500 to-neutral-700">
                        <div className="absolute inset-0 bg-black/30" />

                        {/* Play button */}
                        <button
                            type="button"
                            aria-label="Play video"
                            className="absolute inset-0 flex items-center justify-center group"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                                <svg
                                    className="ml-1 h-6 w-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </button>

                        {/* Dummy label */}
                        <div className="absolute bottom-4 left-4">
                            <div
                                className="border border-white/35 bg-black/25 px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Video Placeholder
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
