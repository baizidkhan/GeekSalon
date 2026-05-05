import Link from "next/link"
import { ChevronLeft, Sparkles } from "lucide-react"
import { getPackages } from "@admin/api/packages/packages"
import PackagesGrid from "./PackagesGrid"
import ContactSpecialistsModal from "./ContactSpecialistsModal"
import { SiteHeader } from "@/app/components/site-header"
import { Footer } from "@/app/components/footer"

export const dynamic = 'force-dynamic'

export default async function PackagesPage() {
  let packages: any[] = []
  try {
    const data = await getPackages(true)
    packages = Array.isArray(data) ? data : (data?.data || [])
    // Robust sorting by position
    packages.sort((a, b) => {
      const posA = Number(a.position) || 0
      const posB = Number(b.position) || 0
      return posA - posB
    })
  } catch (error) {
    console.log(error)
    console.error("Failed to fetch packages:", error)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#c4a484]/30 selection:text-[#c4a484]">
      {/* Navigation */}
      <SiteHeader solid />

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
          <ContactSpecialistsModal />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

