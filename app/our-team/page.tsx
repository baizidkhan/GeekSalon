import Link from "next/link"
import { Instagram, Linkedin, ChevronLeft, Sparkles, Loader2 } from "lucide-react"
import { getBasicEmployees } from "@admin/api/employees/employees"


// Fallback images (premium grayscale portraits)
const TEAM_IMAGES = [
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
]

const ROLE_BIOS: Record<string, string> = {
  Stylist: "Master of transformative cuts and color artistry with an eye for detail.",
  Manager: "Expert in operational excellence and ensuring a seamless guest experience.",
  Receptionist: "The friendly face of GeekSalon, dedicated to perfect scheduling and hospitality.",
  Assistant: "A rising star focused on supporting our artists and mastering beauty techniques.",
  Other: "Dedicated professional bringing unique skills to our world-class team.",
}

export default async function OurTeamPage() {
  let employees: any[] = []
  try {
    const data = await getBasicEmployees()
    employees = Array.isArray(data) ? data : (data?.data || data?.items || [])
    console.log(employees)
    console.log(data)
  } catch (error) {
    console.error("Failed to fetch team:", error)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#c4a484]/30 selection:text-[#c4a484]">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#c4a484]/10 border border-[#c4a484]/20 group-hover:bg-[#c4a484]/20 transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#c4a484]" />
            </div>
            <span className="text-sm font-medium tracking-widest text-[#c4a484] uppercase">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c4a484]" />
            <span className="text-xl font-serif tracking-tight">GeekSalon</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-20 animate-fade-up">
          <span className="text-[#c4a484] text-xs font-bold tracking-[0.3em] uppercase block mb-4">
            The Artists
          </span>
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-[1.1]">
            Meet Our <br />
            <span className="text-white/40 italic">Expert Team</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            Our world-class team of artists, stylists, and wellness experts bring decades of
            combined experience and an unwavering commitment to excellence.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {employees.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/30 italic">No team members available at the moment.</p>
            </div>
          ) : (
            employees.map((member, i) => (
              <Link
                href={`/our-team/${member.id}`}
                key={member.id}
                className="group animate-fade-up block"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-[#1a1a1a]">
                  <img
                    src={TEAM_IMAGES[i % TEAM_IMAGES.length]}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                  />

                  {/* Social Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#c4a484] hover:border-[#c4a484] transition-all duration-300"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4 text-white" />
                    </div>
                    <div
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#c4a484] hover:border-[#c4a484] transition-all duration-300"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Bottom Gradient for Name Legibility on Image (Optional, matching image vibe) */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-serif group-hover:text-[#c4a484] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c4a484]">
                      {member.role || "Specialist"}
                    </span>
                    <div className="h-px w-8 bg-white/10" />
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed line-clamp-3">
                    {ROLE_BIOS[member.role] || "Dedicated beauty expert bringing passion and precision to every client interaction."}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-40 text-center border-t border-white/5 pt-24 pb-12 animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-serif mb-8">Ready to be transformed?</h2>
          <Link
            href="/appointments"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#c4a484] text-black font-semibold rounded-full hover:bg-white transition-all duration-300 group"
          >
            Book Your Session
            <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-white/20 tracking-widest uppercase">
            © 2026 GeekSalon. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-white/30 hover:text-[#c4a484] transition-colors uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-xs text-white/30 hover:text-[#c4a484] transition-colors uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Styles for animations */}
      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>
    </div>
  )
}
