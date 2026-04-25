const stats = [
    { value: "15+", label: "Years of Excellence" },
    { value: "50K+", label: "Happy Clients" },
    { value: "200+", label: "Expert Stylists" },
    { value: "25", label: "Premium Locations" },
]

const dummyImages = [
    { tone: "from-stone-400 via-stone-500 to-stone-700", label: "Dummy Image 1" },
    { tone: "from-zinc-300 via-zinc-400 to-zinc-600", label: "Dummy Image 2" },
    { tone: "from-neutral-400 via-stone-500 to-neutral-700", label: "Dummy Image 3" },
    { tone: "from-stone-300 via-neutral-400 to-zinc-600", label: "Dummy Image 4" },
]

export function WhyChooseUsSection() {
    return (
        <section className="bg-[#0b0b0b] px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">

                    {/* Left: Text content */}
                    <div>
                        <p className="mb-4 text-[11px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Why Choose Us
                        </p>
                        <h2 className="mb-6 text-4xl font-semibold leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Where Luxury Meets{" "}
                            <span className="text-stone-400">Artistry</span>
                        </h2>
                        <p className="mb-12 max-w-md text-sm leading-7 text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                            At PrivéforYou, we believe beauty is an art form. Our world-class team of stylists and aestheticians are dedicated to crafting personalized experiences that celebrate your unique elegance.
                        </p>

                        <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-4xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Image grid */}
                    <div className="relative">
                        {/* Decorative corner brackets */}
                        <div className="absolute -top-5 -right-5 h-14 w-14 border-t border-r border-white/20" />
                        <div className="absolute -bottom-5 -left-5 h-14 w-14 border-b border-l border-white/20" />

                        <div className="grid grid-cols-2 gap-3">
                            {dummyImages.map((img) => (
                                <div
                                    key={img.label}
                                    className={`aspect-square overflow-hidden bg-gradient-to-br ${img.tone}`}
                                >
                                    <div className="flex h-full items-center justify-center">
                                        <div
                                            className="border border-white/35 bg-black/25 px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            {img.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
