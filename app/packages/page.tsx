import Link from "next/link"
import { ChevronLeft, Sparkles } from "lucide-react"
import { getPackages } from "@admin/api/packages/packages"
import PackagesGrid from "./PackagesGrid"
import ContactSpecialistsModal from "./ContactSpecialistsModal"
import { TestimonialsSection } from "../components/testimonials"
import { SiteHeader } from "@/app/components/site-header"
import { Footer } from "@/app/components/footer"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"], style: ["normal", "italic"] })

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
    console.error("Failed to fetch packages:", error)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div
        className="relative flex min-h-[550px] w-full flex-col"
        style={{
          backgroundImage: "url('/login-cover.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/72" />
        <div className="relative z-10">
          <SiteHeader />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-20">
          <div className="flex flex-col items-center gap-6 text-center max-w-[769px]">
            <div className="flex flex-col items-center">
              <h1 className={`${playfair.className} text-[56px] font-semibold leading-[1.2] text-white sm:text-[64px]`}>
                Luxury Experiences
                <br />
                <span className="italic font-normal text-[#eccd80]">Bundled for You</span>
              </h1>
            </div>
            <p className="text-[16px] leading-relaxed text-white/80 max-w-[600px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Our carefully curated packages combine our finest treatments for an elevated experience at exceptional value.
            </p>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-24">
        <section className="bg-[#0a0a0a] py-10 sm:py-14 lg:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#eccd80]">Packages</p>
            <h2 className={`${playfair.className} text-[34px] font-semibold leading-tight text-white sm:text-[44px] lg:text-[56px]`}>
              Premium Beauty <span className="italic text-[#eccd80]">Experiences</span>
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-[13px] leading-7 text-white/55 sm:text-[15px]">
              Makeup, skincare, and grooming packages designed to bundle our most loved treatments into
              one elevated experience at exceptional value.
            </p>
          </div>
        </section>

        {packages.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/30 italic">No packages available at the moment.</p>
          </div>
        ) : (
          <PackagesGrid initialPackages={packages} />
        )}

        <div className="mt-24">
          <TestimonialsSection />
        </div>

        <section className="relative mt-24 overflow-hidden bg-[#111]">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/login-cover.avif')" }}
          />
          <div className="absolute inset-0 bg-black/56" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/35" />
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative mx-auto flex min-h-[340px] max-w-6xl items-center justify-center px-6 py-16 text-center sm:min-h-[380px]">
            <div className="max-w-3xl">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#f1d58d] drop-shadow-sm">
                Custom Package
              </p>
              <h2 className={`${playfair.className} text-[34px] font-semibold leading-tight text-white drop-shadow-sm sm:text-[44px] lg:text-[56px]`}>
                Need A Custom <span className="italic text-[#f1d58d]">Package?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[13px] leading-7 text-white/90 sm:text-[15px]">
                Can&apos;t find exactly what you&apos;re looking for? Our consultants can help you create a
                bespoke experience tailored specifically to your needs and preferences.
              </p>

              <div className="mt-10 flex justify-center">
                <ContactSpecialistsModal
                  triggerLabel="Contact Our Specialists"
                  triggerClassName="inline-flex items-center gap-3 border border-white/40 bg-transparent px-7 py-3 text-[10px] font-bold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:border-[#eccd80] hover:bg-white hover:text-black"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

