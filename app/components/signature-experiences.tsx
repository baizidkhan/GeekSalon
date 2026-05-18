"use client"

import Link from "next/link"
import Image from "next/image"
import { useBooking } from "@/context/BookingContext"
import { Service } from "@/lib/types"
import { formatCurrency, getMediaUrl } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

const CATEGORY_GRADIENTS: Record<string, string> = {
    Hair: "from-rose-200 via-pink-200 to-fuchsia-200",
    Makeup: "from-amber-200 via-stone-300 to-stone-500",
    Skin: "from-orange-100 via-rose-100 to-amber-200",
    Bridal: "from-amber-200 via-stone-300 to-stone-500",
    Nails: "from-pink-200 via-purple-200 to-indigo-200",
    Spa: "from-teal-200 via-cyan-100 to-sky-200",
    Other: "from-stone-300 via-stone-400 to-stone-500",
}



export function SignatureExperiencesSection({ services }: { services: Service[] }) {
    const { openBooking } = useBooking()
    return (
        <section id="services" className="bg-[#0b0b0b] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#d4af37]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                            OUR EXPERTISE
                        </p>
                        <h2 className="text-[2.5rem] leading-none text-white sm:text-[3rem]" style={{ fontFamily: 'Playfair Display, serif' }}>
                            <span className="font-semibold">Signature</span> <span className="italic">Experiences</span>
                        </h2>
                    </div>

                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 self-start border-t-3 border-l-3 border-b border-r border-solid border-white bg-transparent px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black"
                        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                    >
                        VIEW ALL SERVICES <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 justify-items-center">
                    {services && services.length > 0 ? (
                        services.slice(0, 6).map((item, index) => {
                            const gradient = CATEGORY_GRADIENTS[item.category] ?? CATEGORY_GRADIENTS.Other
                            const imageUrl = item.imageUrl ?? null

                            return (
                                <article key={item.id} className="group flex flex-col h-full w-full max-w-[380px] bg-[#171717] text-white transition-all duration-300 border border-transparent hover:border-[#d4af37]">
                                    <div className={`relative aspect-[4/3] overflow-hidden shrink-0 ${imageUrl ? '' : `bg-gradient-to-br ${gradient}`}`}>
                                        {imageUrl && (
                                            <Image
                                                src={getMediaUrl(imageUrl) || ""}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                priority={index === 0}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/0" />
                                    </div>

                                    <div className="p-7 flex flex-col flex-grow">
                                        <div>
                                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] truncate" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                                {item.category}
                                            </p>
                                            <h3 className="text-[17px] font-bold text-white truncate" title={item.name} style={{ fontFamily: 'Playfair Display, serif' }}>
                                                {item.name}
                                            </h3>
                                            <p className="mt-3 text-[12px] leading-relaxed text-gray-400 line-clamp-2" title={item.description} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="my-6 border-t border-white/10" />

                                            <p className="mb-5 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                                                STARTING FROM <span className="text-white ml-1">{formatCurrency(item.price)}</span>
                                            </p>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openBooking(item)}
                                                    className="flex-1 flex items-center justify-center bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-gray-200"
                                                    style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                                                >
                                                    BOOK NOW
                                                </button>
                                                <Link
                                                    href={`/services/${item.id}`}
                                                    className="flex-1 flex items-center justify-center border border-white bg-transparent px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-t-[3px] border-l-[3px] border-b border-r border-solid text-white transition-all duration-300 hover:bg-white/10 text-center"
                                                    style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                                                >
                                                    VIEW DETAILS
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center text-white/30">
                            <p className="text-sm uppercase tracking-widest">No services available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
