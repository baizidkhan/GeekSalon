import Link from "next/link"
import { ChevronLeft, Sparkles } from "lucide-react"
import { getPackages } from "@admin/api/packages/packages"
import PackagesGrid from "./PackagesGrid"

export default async function PackagesPage() {
  let packages: any[] = []
  try {
    packages = await getPackages()
  } catch (error) {
    console.log(error)
    console.error("Failed to fetch packages:", error)
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
        <div className="text-center mb-24 space-y-4">
          <span className="text-[#c4a484] text-xs font-bold tracking-[0.4em] uppercase block">
            Curated Packages
          </span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">
            Luxury Experiences <br />
            <span className="text-white/40 italic">Bundled for You</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed pt-4">
            Our carefully curated packages combine our finest treatments for an
            elevated experience at exceptional value.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/30 italic">No packages available at the moment.</p>
          </div>
        ) : (
          <PackagesGrid initialPackages={packages} />
        )}

        {/* Footer Info */}
        <div className="mt-32 p-12 rounded-3xl bg-white/5 border border-white/5 text-center">
          <h2 className="text-2xl font-serif mb-4">Need a Custom Package?</h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
            Can't find exactly what you're looking for? Our consultants can help you create a
            bespoke experience tailored specifically to your needs and preferences.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[#c4a484] text-xs font-bold tracking-widest uppercase hover:text-white transition-colors"
          >
            Contact our specialists <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}
