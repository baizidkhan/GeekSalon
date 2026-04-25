"use client"

import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"

interface Package {
  id: string
  category: string
  title: string
  price: number | string
  billingCycle: string
  description: string
  features: string[]
}

export default function PackagesGrid({ initialPackages }: { initialPackages: Package[] }) {
  const [showAll, setShowAll] = useState(false)

  const displayedPackages = showAll ? initialPackages : initialPackages.slice(0, 3)

  return (
    <div className="space-y-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 items-stretch max-w-5xl mx-auto">
        {displayedPackages.map((pkg, i) => {
          const isMiddle = i === 1;
          
          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col transition-all duration-700 ${
                isMiddle 
                  ? "z-10 scale-100 lg:scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                  : "z-0 scale-95 opacity-80"
              }`}
            >
              {/* Most Popular Header for Middle Card */}
              {isMiddle && (
                <div className="bg-white py-3 flex items-center justify-center gap-2">
                  <span className="text-black text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
                    <span className="text-xs">✦</span> MOST POPULAR
                  </span>
                </div>
              )}

              <div className={`flex-grow p-10 border border-white/10 bg-[#0d0d0d] flex flex-col space-y-8 ${
                isMiddle ? "border-white/20" : ""
              }`}>
                {/* Header Section */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase block">
                      {pkg.category || (i === 0 ? "Essential" : i === 1 ? "Signature" : "Ultimate")}
                    </span>
                    <h3 className="text-3xl font-serif text-white tracking-tight">{pkg.title}</h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-serif text-white">${pkg.price}</span>
                    <span className="text-white/30 text-sm">/ {pkg.billingCycle || "session"}</span>
                  </div>

                  <p className="text-sm text-white/40 leading-relaxed font-light">
                    {pkg.description}
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-5 flex-grow py-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 group/item">
                      <Check className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/60 font-light leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button className={`w-full py-4 font-bold tracking-[0.2em] text-[10px] uppercase transition-all duration-500 flex items-center justify-center gap-2 group/btn ${
                  isMiddle
                    ? "bg-white text-black hover:bg-[#c4a484] hover:text-white"
                    : "bg-transparent text-white border border-white/10 hover:border-white/40"
                }`}>
                  Select Package
                </button>
              </div>
              
              {/* Bottom Glow for Middle Card */}
              {isMiddle && (
                <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_5px_20px_rgba(255,255,255,0.2)]" />
              )}
            </div>
          )
        })}
      </div>

      {initialPackages.length > 3 && !showAll && (
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
  )
}
