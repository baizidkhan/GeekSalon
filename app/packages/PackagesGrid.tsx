"use client"

import { useMemo, useState } from "react"
import { formatCurrency, getMediaUrl } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PackageBookingModal from "./PackageBookingModal"

interface Package {
  id: string
  category: string
  title: string
  price: number | string
  billingCycle: string
  description: string
  features: string[]
  position?: number | string
  imageUrl?: string
  image?: string
  coverImage?: string
  popular?: boolean
}

export default function PackagesGrid({ initialPackages }: { initialPackages: Package[] }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [bookingPkg, setBookingPkg] = useState<Package | null>(null)

  const arrangedPackages = useMemo(() => {
    const list = [...initialPackages]
    const popularIndex = list.findIndex((pkg) => pkg.popular === true)

    if (popularIndex > -1) {
      const [popularPackage] = list.splice(popularIndex, 1)
      const centeredIndex = Math.min(1, list.length)
      list.splice(centeredIndex, 0, popularPackage)
    }

    return list
  }, [initialPackages])

  const displayedPackages = showAll ? arrangedPackages : arrangedPackages.slice(0, 6)

  return (
    <>
      <div className="space-y-24">
        <div className="grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10 max-w-7xl mx-auto">
          {displayedPackages.map((pkg, i) => {
            const isFeaturedCard = pkg.popular === true
            const packageImageRaw = pkg.imageUrl || pkg.image || pkg.coverImage
            const packageImage = packageImageRaw ? (getMediaUrl(packageImageRaw) || "/login-cover.avif") : "/login-cover.avif"

            return (
              <div
                key={pkg.id}
                onClick={() => router.push(`/packages/${pkg.id}`)}
                className={`relative flex flex-col cursor-pointer transition-all duration-700 ${isFeaturedCard
                  ? "z-0 scale-100 opacity-100 lg:z-10 lg:scale-[1.02] lg:shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
                  : "z-0 scale-100 opacity-100"
                  }`}
              >
                {/* Most Popular Header for Middle Card */}
                {isFeaturedCard && (
                  <div className="hidden lg:flex items-center justify-center bg-[#eccd80] py-2.5">
                    <span className="text-black text-[10px] font-bold tracking-[0.35em] uppercase">
                      Popular
                    </span>
                  </div>
                )}

                <div
                  className="h-[180px] w-full bg-cover bg-center bg-no-repeat lg:h-[190px]"
                  style={{ backgroundImage: `url('${packageImage}')` }}
                />

                <div className={`flex-grow border border-white/10 bg-[#1a1a1a] flex flex-col ${isFeaturedCard ? "p-10 lg:border-white/20 space-y-8" : "px-6 pb-6 pt-6 space-y-6"
                  }`}>
                  {/* Header Section */}
                  <div className={isFeaturedCard ? "space-y-5" : "space-y-4"}>
                    <div className={isFeaturedCard ? "space-y-2" : "space-y-1"}>
                      <span className={`uppercase block ${isFeaturedCard ? "text-white/35 text-[10px] font-bold tracking-[0.32em]" : "text-[#eccd80] text-[11px] font-semibold tracking-[0.28em]"
                        }`}>
                        {pkg.category || (i === 0 ? "Essential" : isFeaturedCard ? "Signature" : "Ultimate")}
                      </span>
                      <Link href={`/packages/${pkg.id}`}>
                        <h3 className={`${isFeaturedCard ? "text-[30px]" : "text-[28px] leading-[1.15]"} font-serif text-white tracking-tight transition-colors hover:text-[#eccd80]`}>
                          {pkg.title}
                        </h3>
                      </Link>
                    </div>

                    <p className={`${isFeaturedCard ? "text-[13px] text-white/40 font-light leading-[1.7]" : "text-[14px] text-white/72 font-normal leading-[1.65]"}`}>
                      {pkg.description}
                    </p>

                    <div className={`flex items-baseline ${isFeaturedCard ? "gap-1" : "gap-1.5"}`}>
                      <span className={`${isFeaturedCard ? "text-[42px] font-serif text-white" : "text-[26px] font-semibold text-[#eccd80]"}`}>
                        {formatCurrency(pkg.price)}
                      </span>
                      {isFeaturedCard && <span className="text-white/30 text-sm">/ {pkg.billingCycle || "session"}</span>}
                    </div>

                    {!isFeaturedCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!localStorage.getItem('accessToken')) {
                            window.location.href = '/login'
                            return
                          }
                          setBookingPkg(pkg)
                        }}
                        className={`w-full ${isFeaturedCard ? "py-4 text-[10px]" : "py-2.5 text-[13px]"} font-bold tracking-[0.2em] uppercase transition-all duration-500 flex items-center justify-center gap-2 group/btn ${isFeaturedCard
                          ? "bg-transparent text-white border border-white/10 hover:border-white/40 lg:bg-white lg:text-black lg:border-transparent lg:hover:bg-[#c4a484] lg:hover:text-white"
                          : "bg-white text-black hover:bg-[#c4a484] hover:text-white"
                          }`}
                      >
                        {isFeaturedCard ? "Book This Package" : "Book Now"}
                      </button>
                    )}

                    <div className="h-px w-full bg-white/30" />
                  </div>

                  {/* Features List */}
                  <ul className={`${isFeaturedCard ? "space-y-4 py-1" : "space-y-2 py-0"} flex-grow`}>
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-white text-[12px] leading-[1.5]">
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  {isFeaturedCard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!localStorage.getItem('accessToken')) {
                          window.location.href = '/login'
                          return
                        }
                        setBookingPkg(pkg)
                      }}
                      className="w-full py-4 font-bold tracking-[0.2em] text-[10px] uppercase transition-all duration-500 flex items-center justify-center gap-2 group/btn bg-transparent text-white border border-white/10 hover:border-white/40 lg:bg-white lg:text-black lg:border-transparent lg:hover:bg-[#c4a484] lg:hover:text-white"
                    >
                      Book This Package
                    </button>
                  )}
                </div>

                {/* Bottom Glow for Middle Card */}
                {isFeaturedCard && (
                  <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_5px_20px_rgba(255,255,255,0.2)] hidden lg:block" />
                )}
              </div>
            )
          })}
        </div>

        {arrangedPackages.length > 6 && !showAll && (
          <div className="flex justify-center pt-12">
            <button
              onClick={() => setShowAll(true)}
              className="px-12 py-4 rounded-full border border-white/5 text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-700"
            >
              Show All Packages
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <PackageBookingModal
        pkg={bookingPkg}
        onClose={() => setBookingPkg(null)}
      />
    </>
  )
}
