export const dynamic = 'force-dynamic'

import Link from "next/link"
import api from "@admin/api/base"
import { SiteHeader } from "@/app/components/site-header"
import { Footer } from "@/app/components/footer"
import { CtaSection } from "@/app/components/cta-section"
import { getMediaUrl } from "@/lib/utils"

async function fetchTeam() {
    const { data } = await api.get('/employee/basic', { cache: false as any })
    return Array.isArray(data) ? data : (data?.data || data?.items || [])
}

const ROLE_BIOS: Record<string, string> = {
    Stylist: "Master of transformative cuts and color artistry with an eye for detail.",
    Manager: "Expert in operational excellence and ensuring a seamless guest experience.",
    Receptionist: "The friendly face of GeekSalon, dedicated to perfect scheduling and hospitality.",
    Assistant: "A rising star focused on supporting our artists and mastering beauty techniques.",
    Other: "Dedicated professional bringing unique skills to our world-class team.",
}

// Ensure we have enough mock fallback images if needed
const getFallbackImage = (index: number) => {
    const images = [
        "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    ]
    return images[index % images.length]
}

function getRolePriority(member: any): number {
    const roleStr = (member.role === 'Other' ? (member.customRole || '') : (member.role || '')).toLowerCase().trim();

    if (roleStr === 'ceo and founder' || roleStr === 'ceo & founder' || roleStr === 'founder & ceo' || roleStr === 'founder and ceo') return 1;
    if (roleStr === 'ceo') return 2;
    if (roleStr === 'founder') return 3;
    if (roleStr === 'co-founder' || roleStr === 'co-funder') return 4;
    if (roleStr === 'co-founder and manger' || roleStr === 'co-founder and manager' || roleStr === 'co-founder & manager' || roleStr === 'co-founder & manger') return 5;

    // Substring matches for general safety
    if (roleStr.includes('ceo') && roleStr.includes('founder')) return 1;
    if (roleStr.includes('ceo')) return 2;
    if (roleStr.includes('founder') || roleStr.includes('funder')) return 3;

    return 100; // Default low priority for standard employees
}

export default async function AboutUsPage() {
    let employees: any[] = []
    try {
        const rawEmployees = await fetchTeam()
        // Sort employees so executives/founders rise to the top
        employees = [...rawEmployees].sort((a, b) => getRolePriority(a) - getRolePriority(b))
    } catch (error) {
        console.error("Failed to fetch team:", error)
    }

    return (
        <div className="min-h-screen bg-[#070707] text-white">

            {/* Hero Section */}
            <div className="relative h-[520px] flex flex-col bg-black">
                {/* Background image & overlays */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale opacity-60"
                    style={{ backgroundImage: "url('/BannerImage.png')" }}
                />
                <div className="absolute inset-0 z-0 bg-black/70" />

                {/* Header */}
                <div className="relative z-20">
                    <SiteHeader />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-20 text-center">
                    <h1 className="mb-6 text-[1.9rem] sm:text-5xl lg:text-7xl font-normal leading-tight text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Welcome To <em className="italic font-light">Makeover</em>
                    </h1>
                    <p className="mx-auto max-w-3xl text-[13px] text-white/80 leading-relaxed tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Makeover is your destination for beauty, care, and confidence with professional hair, skin, and styling<br className="hidden sm:block" />services designed just for you.
                    </p>
                </div>
            </div>

            {/* Salon Vision Section */}
            <section className="bg-[#070707] py-14 px-6 sm:py-20 sm:px-12 lg:py-24 lg:px-24">
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-20 w-full">
                    <div className="flex-1 max-w-lg">
                        <p className="text-[12px] font-normal uppercase tracking-[0.15em] text-[#CDB37F] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                            OUR MISSION & VISSION
                        </p>
                        <h2 className="text-[1.75rem] sm:text-4xl lg:text-[3rem] text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Where Beauty <em className="italic font-light">Begins</em>
                        </h2>
                        <p className="text-[14px] text-gray-300 leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Experience personalized salon care designed to enhance your natural beauty with expert treatments, modern styling, and a relaxing, premium environment tailored just for you.
                        </p>
                        <p className="text-[14px] text-gray-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                            To enhance natural beauty through professional, high-quality salon services while becoming a trusted beauty destination known for excellence, innovation, and personalized care in hair, skin, and beauty treatments.
                        </p>
                    </div>
                    <div className="flex-1 w-full">
                        <img
                            src="/our-mission.png"
                            alt="Salon Vision"
                            className="w-full h-full object-cover border-[8px] border-white shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* Meet Our Expert Team Section */}
            <section className="bg-[#0b0b0b] py-16 px-6 sm:py-20 sm:px-12 lg:py-28 lg:px-24">
                <div className="text-center mb-20">
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#CDB37F] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        THE ARTISTS
                    </p>
                    <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.75rem] text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Meet Our <em className="italic font-light">Expert Team</em>
                    </h2>
                    <p className="text-[13px] text-white/80 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Our world-class team of artists, stylists, and wellness experts bring decades of combined experience<br className="hidden sm:block" /> and an unwavering commitment to excellence.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    {employees.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/10 text-white/30 text-xs uppercase tracking-widest">
                            Team members are currently being updated.
                        </div>
                    ) : (
                        <>
                            {/* Top 2 Team Members */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 justify-center max-w-4xl mx-auto">
                                {employees.slice(0, 2).map((member, idx) => (
                                    <div key={member.id} className="text-left group cursor-pointer">
                                        <div className="w-full aspect-square bg-[#1c1c1c] mb-4 overflow-hidden relative">
                                            {member.image ? (
                                                <img
                                                    src={getMediaUrl(member.image)}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-[#CDB37F]/10 flex items-center justify-center select-none group-hover:border-[#CDB37F]/30 transition-all duration-500">
                                                    <span className="text-6xl font-normal text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-500" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                        {member.name ? member.name.trim().charAt(0).toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-[13px] font-bold uppercase tracking-wide text-white mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>{member.name}</h3>
                                        <p className="text-[13px] text-[#CDB37F] leading-snug mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            {member.role === 'Other' ? (member.customRole || member.role) : (member.role || "Specialist")}
                                        </p>
                                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            {member.about || ROLE_BIOS[member.role] || "Master of transformative cuts and color artistry."}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Rest of the Team (Grid of 4) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {employees.slice(2).map((member, idx) => (
                                    <div key={member.id} className="text-left group cursor-pointer">
                                        <div className="w-full aspect-square bg-[#1c1c1c] mb-4 overflow-hidden relative">
                                            {member.image ? (
                                                <img
                                                    src={getMediaUrl(member.image)}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-[#CDB37F]/10 flex items-center justify-center select-none group-hover:border-[#CDB37F]/30 transition-all duration-500">
                                                    <span className="text-5xl font-normal text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-500" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                        {member.name ? member.name.trim().charAt(0).toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-[13px] font-bold uppercase tracking-wide text-white mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>{member.name}</h3>
                                        <p className="text-[13px] text-[#CDB37F] leading-snug mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            {member.role === 'Other' ? (member.customRole || member.role) : (member.role || "Specialist")}
                                        </p>
                                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            {member.about || ROLE_BIOS[member.role] || "Master of transformative cuts and color artistry."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <CtaSection />

            {/* Footer */}
            <Footer />
        </div>
    )
}
