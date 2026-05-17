import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

interface ExcellenceData {
    title?: string;
    description?: string;
    videoUrl?: string;
}

export function TheExperienceSection({ excellence }: { excellence: ExcellenceData | null }) {
    const displayTitle = excellence?.title || "Crafted For Those Who Appreciate Excellence";
    const displayDescription = excellence?.description || "Every visit to PrivéforYou is a journey through refined luxury. From our curated environments to our bespoke treatments, we create moments that transcend the ordinary.";
    const videoUrl = excellence?.videoUrl;

    // Split title to style "Excellence" as italic if it matches the default format
    const formatTitle = (title: string) => {
        if (title.toLowerCase().includes('excellence')) {
            const parts = title.split(/(excellence)/i);
            return parts.map((part, i) => 
                part.toLowerCase() === 'excellence' 
                ? <span key={i} className="italic">{part}</span> 
                : part
            );
        }
        return title;
    };

    return (
        <section className="bg-[#0b0b0b] px-4 py-24 sm:px-6 lg:px-12">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">

                    {/* Left: Text content */}
                    <div className="max-w-xl">
                        <h2 className="mb-6 text-[2.75rem] leading-tight text-white sm:text-[3.25rem]" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {formatTitle(displayTitle)}
                        </h2>
                        <p className="mb-12 text-[13px] leading-relaxed text-gray-300" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                            {displayDescription}
                        </p>

                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 self-start border-t-2 border-l-2 border-b border-r border-solid border-white bg-transparent px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black"
                            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                        >
                            EXPLORE SERVICES <span className="text-lg leading-none mb-[2px]">→</span>
                        </Link>
                    </div>

                    {/* Right: Video Container */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/80 bg-[#171717]">
                        {videoUrl ? (
                            <video
                                src={getMediaUrl(videoUrl)}
                                className="h-full w-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
                                <span className="text-xs uppercase tracking-widest text-white/30" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>Media Unavailable</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    )
}
