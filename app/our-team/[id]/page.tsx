import Link from "next/link"
import { ChevronLeft, Award, Loader2, Sparkles } from "lucide-react"
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

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams?.id

  let employee: any = null
  try {
    const data = await getBasicEmployees()
    const teamArray = Array.isArray(data) ? data : (data?.data || data?.items || [])
    employee = teamArray.find((e: any) => e.id === id)
  } catch (error) {
    console.error("Failed to fetch employee:", error)
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <p className="text-white/50 mb-4">Employee not found.</p>
        <Link href="/our-team" className="text-[#c4a484] hover:underline">
          Return to Our Team
        </Link>
      </div>
    )
  }

  const imageIndex = getHash(employee.id || "") % TEAM_IMAGES.length
  const imageUrl = TEAM_IMAGES[imageIndex]
  
  // Extract specialties, handling cases where it might be a comma-separated string or array
  let specialties: string[] = []
  if (Array.isArray(employee.specializations)) {
    specialties = employee.specializations
  } else if (typeof employee.specializations === 'string' && employee.specializations.length > 0) {
    specialties = employee.specializations.split(',').map((s: string) => s.trim())
  }

  const experience = employee.experience || 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#c4a484]/30 selection:text-[#c4a484]">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/our-team" className="flex items-center gap-2 group">
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

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a] animate-fade-up">
            <img
              src={imageUrl}
              alt={employee.name}
              className="w-full h-full object-cover grayscale"
            />
          </div>

          {/* Right Column: Details */}
          <div className="space-y-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
            
            {/* Header section */}
            <div>
              <span className="text-[#c4a484] text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                {employee.role || "Specialist"}
              </span>
              <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
                {employee.name}
              </h1>
              
              {/* Stats / Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
                {experience > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-white/40" />
                    <span>{experience}+ Years</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-white/60 leading-relaxed font-light">
                {ROLE_BIOS[employee.role] || "Dedicated beauty expert bringing passion and precision to every client interaction. Known for exceptional attention to detail and creating personalized looks that highlight individual beauty."}
                {" "}With years of expertise, {employee.name.split(' ')[0]} has transformed countless clients into the best version of themselves. Their signature style combines timeless elegance with modern techniques.
              </p>
            </div>

            {/* Specializations */}
            {specialties.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">
                  Specializes In
                </h3>
                <div className="flex flex-wrap gap-3">
                  {specialties.map((spec, index) => (
                    <div 
                      key={index}
                      className="px-4 py-2 border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors"
                    >
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action */}
            {employee.role?.toLowerCase() === 'stylist' && (
              <div className="pt-8 border-t border-white/10">
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#c4a484] text-black font-semibold rounded hover:bg-white transition-all duration-300 group"
                >
                  Book Appointment with {employee.name?.split(' ')[0]}
                  <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-sm mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-white/20 tracking-widest uppercase">
            © 2026 GeekSalon. All Rights Reserved.
          </p>
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
