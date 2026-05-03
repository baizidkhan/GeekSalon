import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

interface ExcellenceData {
    title?: string;
    description?: string;
    videoUrl?: string;
}

export function TheExperienceSection({ excellence }: { excellence: ExcellenceData | null }) {
    const displayTitle = excellence?.title || "Crafted for Those Who Appreciate Excellence";
    const displayDescription = excellence?.description || "Every visit to PrivéforYou is a journey through refined luxury. From our curated environments to our bespoke treatments, we create moments that transcend the ordinary.";
    const videoUrl = excellence?.videoUrl;

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
                            {displayTitle.split('Appreciate Excellence')[0]}
                            <span className="text-stone-400">
                                {displayTitle.includes('Appreciate Excellence') ? 'Appreciate Excellence' : displayTitle}
                            </span>
                        </h2>
                        <p className="mb-10 max-w-md text-sm leading-7 text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {displayDescription}
                        </p>

                        <Link href={"/services"}>
                            <button
                                type="button"
                                className="border border-white bg-white px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Book Your Experience
                            </button>
                        </Link>
                    </div>

                    {/* Right: Video Container */}
                    <div className="relative aspect-video overflow-hidden rounded-sm bg-gradient-to-br from-zinc-800 via-stone-900 to-black group">
                        {videoUrl ? (
                            <video
                                src={getMediaUrl(videoUrl)}
                                className="h-full w-full object-cover opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <div className="absolute inset-0 bg-black/30" />
                        )}

                        {/* Aesthetic Overlays */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Dynamic label */}
                        <div className="absolute bottom-4 left-4">
                            <div
                                className="border border-white/20 bg-black/40 px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-white/90 backdrop-blur-md"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {videoUrl ? "Featured Experience" : "Video Placeholder"}
                            </div>
                        </div>

                        {/* Top corner detail */}
                        <div className="absolute top-4 right-4">
                            <div className="h-[1px] w-8 bg-white/30" />
                            <div className="mt-1 h-[1px] w-4 bg-white/20" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
