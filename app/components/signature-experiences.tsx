import Link from "next/link"

const experiences = [
    {
        category: "Wedding",
        title: "Bridal Elegance",
        description: "A complete bridal transformation experience with personalized styling, luxury makeup, and timeless finishing touches.",
        price: "From $599",
        imageTone: "from-amber-200 via-stone-300 to-stone-500",
        label: "Dummy Image 1",
    },
    {
        category: "Skincare",
        title: "Signature Facial",
        description: "Advanced skincare treatment combining cutting-edge technology with pure botanical care for radiant results.",
        price: "From $189",
        imageTone: "from-orange-100 via-rose-100 to-amber-200",
        label: "Dummy Image 2",
    },
    {
        category: "Hair",
        title: "Hair Transformation",
        description: "Complete hair makeover with color, cut, and styling by our master stylists for a modern refreshed look.",
        price: "From $299",
        imageTone: "from-rose-200 via-pink-200 to-fuchsia-200",
        label: "Dummy Image 3",
    },
]

export function SignatureExperiencesSection() {
    return (
        <section id="services" className="bg-[#0b0b0b] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-3 text-[11px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Our Expertise
                        </p>
                        <h2 className="text-4xl font-semibold leading-none text-white sm:text-5xl lg:text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Signature Experiences
                        </h2>
                    </div>

                    <Link
                        href="#services"
                        className="inline-flex items-center gap-2 self-start text-sm font-medium text-white/65 transition-all duration-300 hover:text-white"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        View All Services
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {experiences.map((item, index) => (
                        <article key={item.title} className="border border-white/10 bg-[#101010] text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1">
                            <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${item.imageTone}`}>
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                    <div className="rounded-none border border-white/35 bg-black/25 px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {item.label}
                                    </div>
                                </div>
                                <div className="absolute right-4 bottom-4 border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/80 backdrop-blur-sm">
                                    {index + 1}
                                </div>
                            </div>

                            <div className="p-6 sm:p-7">
                                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {item.category}
                                </p>
                                <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {item.title}
                                </h3>
                                <p className="mt-4 text-sm leading-7 text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {item.description}
                                </p>

                                <div className="my-6 border-t border-white/10" />

                                <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {item.price}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 rounded-none border border-white/15 bg-transparent px-4 py-3 text-sm font-light uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 rounded-none border border-white bg-white px-4 py-3 text-sm font-light uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
