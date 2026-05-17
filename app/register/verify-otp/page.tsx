"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Inter, Josefin_Sans, Playfair_Display } from "next/font/google"
import api from "@admin/api/base"
import { useBusiness } from "@/context/BusinessContext"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] })
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["600"] })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"] })

type PendingSignup = {
    name: string
    email: string
    phone: string
    password: string
}

export default function VerifyOtpPage() {
    const { businessName } = useBusiness()
    const router = useRouter()
    const searchParams = useSearchParams()
    const emailFromQuery = searchParams.get("email") || ""

    const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null)
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [info, setInfo] = useState("")
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)

    useEffect(() => {
        const raw = sessionStorage.getItem("pendingSignup")
        if (!raw) {
            router.replace("/register")
            return
        }

        try {
            const parsed = JSON.parse(raw) as PendingSignup
            if (!parsed?.email) {
                router.replace("/register")
                return
            }

            if (emailFromQuery && parsed.email !== emailFromQuery) {
                router.replace("/register")
                return
            }

            setPendingSignup(parsed)
        } catch {
            router.replace("/register")
        }
    }, [emailFromQuery, router])

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pendingSignup) return

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP")
            return
        }

        setError("")
        setInfo("")
        setLoading(true)

        try {
            await api.post("/auth/verify-signup-code", { email: pendingSignup.email, code: otp })
            await api.post("/auth/customer-signup", pendingSignup)

            sessionStorage.removeItem("pendingSignup")
            router.push("/login?registered=true")
        } catch (err: any) {
            setError(err.response?.data?.message || "OTP verification failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (!pendingSignup) return

        setError("")
        setInfo("")
        setResending(true)

        try {
            const { data } = await api.post("/auth/send-signup-code", { email: pendingSignup.email })
            setInfo(data?.otp ? `A new OTP was sent. (Testing OTP: ${data.otp})` : "A new OTP was sent to your email")
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP. Please try again.")
        } finally {
            setResending(false)
        }
    }

    return (
        <div className={`${inter.className} min-h-screen bg-black text-white`}>
            <div className="flex min-h-screen w-full">
                <div
                    className="relative hidden overflow-hidden border-r border-[#eccd80]/25 lg:flex lg:w-[56%]"
                    style={{
                        backgroundImage: "url('/login-cover.avif')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="relative flex min-h-screen w-full flex-col justify-between bg-black/56 p-8 xl:p-10">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_34%,rgba(255,255,255,0.16),transparent_46%)]" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/52 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black/25 to-transparent" />

                        <div className="relative z-10">
                            <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#eccd80]/90">Email Verification</p>
                            <p className={`${josefin.className} text-[32px] font-semibold leading-none text-white`}>
                                {businessName || "MakeOver"}
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-1 items-center">
                            <div className="max-w-[620px]">
                                <h2 className={`${playfair.className} text-[44px] font-semibold capitalize leading-[1.15] text-white`}>
                                    Confirm your code, unlock your <span className="italic font-normal">account.</span>
                                </h2>
                                <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/78">
                                    Enter the 6-digit OTP from your inbox to verify ownership and instantly activate your MakeOver profile.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-end justify-between gap-6">
                            <div className="flex gap-8 text-white/80">
                                <div>
                                    <p className="text-[20px] font-semibold leading-none text-[#eccd80]">6 Digit</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">OTP Code</p>
                                </div>
                                <div>
                                    <p className="text-[20px] font-semibold leading-none text-[#eccd80]">15 Min</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Code Expiry</p>
                                </div>
                            </div>

                            <p className="text-right text-[11px] uppercase tracking-[0.2em] text-white/70">
                                {businessName || "MakeOver"} &mdash; Signup Verification
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex w-full items-center justify-center px-6 py-6 sm:px-6 lg:w-[44%] lg:px-8 xl:px-11">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,205,128,0.12),transparent_45%)]" />
                    <div className="relative w-full max-w-[480px]">
                        <div className="mb-5">
                            <h1 className={`${playfair.className} text-[32px] font-semibold leading-[1.08] text-white sm:text-[36px]`}>
                                Verify <span className="italic font-normal">OTP</span>
                            </h1>
                            <p className="mt-1.5 max-w-[460px] text-[13px] leading-relaxed text-white/82">
                                We sent a 6-digit code to {pendingSignup?.email || emailFromQuery}.
                            </p>
                            <div className="mt-3 h-px w-full bg-gradient-to-r from-[#eccd80]/70 via-white/20 to-transparent" />
                        </div>

                        {error && (
                            <div className="mb-6 border border-red-400/70 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        {info && (
                            <div className="mb-6 border border-[#eccd80]/50 bg-[#eccd80]/10 px-4 py-3">
                                <p className="text-sm text-[#f4dfa9]">{info}</p>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                            <div className="space-y-2.5">
                                <label htmlFor="otp" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                                    6 Digit OTP <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    required
                                    className="h-9 w-full border border-[#f2f2f2]/85 bg-transparent px-4 text-[13px] tracking-[0.2em] text-white placeholder:text-white/55 outline-none transition-all focus:border-[#eccd80] focus:shadow-[0_0_0_1px_rgba(236,205,128,0.38)]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-9 w-full items-center justify-center bg-white px-8 text-[13px] font-semibold uppercase tracking-[0.1em] text-black transition-all hover:-translate-y-0.5 hover:bg-[#f5f5f5] hover:shadow-[0_24px_50px_-24px_rgba(255,255,255,0.95)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </button>
                        </form>

                        <div className="mt-5 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resending || loading}
                                className="text-[13px] text-white/75 underline underline-offset-4 transition-colors hover:text-[#eccd80] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {resending ? "Resending..." : "Resend OTP"}
                            </button>

                            <Link href="/register" className="text-[13px] text-white/75 underline underline-offset-4 transition-colors hover:text-[#eccd80]">
                                Back to Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
