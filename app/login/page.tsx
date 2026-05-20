"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Inter, Josefin_Sans, Playfair_Display } from "next/font/google"
import api from "@admin/api/base"
import { useBusiness } from "@/context/BusinessContext"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] })
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["600"] })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"] })

function LoginForm() {
    const { businessName } = useBusiness()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [registered, setRegistered] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (searchParams.get("registered") === "true") setRegistered(true)
    }, [searchParams])

    const persistToken = (token: string) => {
        localStorage.setItem("accessToken", token)
        const maxAge = 10 * 24 * 60 * 60
        document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=strict`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const { data } = await api.post("/auth/public-login", { email, password })
            const token = data?.accessToken
            const user = data?.user
            if (token) persistToken(token)
            if (user?.isCustomer || user?.role === "customer") {
                if (user?.phone) localStorage.setItem("userPhone", user.phone)
            }
            window.location.href = "/"
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid email or password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${inter.className} min-h-screen bg-black text-white`}>
            <div className="flex min-h-screen w-full flex-col lg:flex-row">
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
                            <p
                                className={`${josefin.className} text-[32px] font-semibold leading-none text-white`}
                            >
                                MakeOver
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-1 items-center">
                            <div className="max-w-[620px]">
                                <h2
                                    className={`${playfair.className} text-[44px] font-semibold capitalize leading-[1.15] text-white`}
                                >
                                    Step into your <span className="italic font-normal">signature era.</span>
                                </h2>
                                <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/78">
                                    Sign in to revisit past looks, continue your beauty journey, and secure your next polished appointment in seconds.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-end justify-between gap-6">
                            <div className="flex gap-8 text-white/80">
                                <div>
                                    <p className="text-[20px] font-semibold leading-none text-[#eccd80]">12K+</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Sessions Styled</p>
                                </div>
                                <div>
                                    <p className="text-[20px] font-semibold leading-none text-[#eccd80]">98%</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Rebook Rate</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Mobile / Tablet Hero Banner */}
                <div
                    className="relative overflow-hidden lg:hidden"
                    style={{
                        backgroundImage: "url('/login-cover.avif')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-black/65" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
                    <div className="relative z-10 flex flex-col gap-5 px-6 py-8 sm:px-10 sm:py-10">
                        <p className={`${josefin.className} text-[26px] font-semibold leading-none text-white`}>
                            MakeOver
                        </p>
                        <h2 className={`${playfair.className} text-[28px] sm:text-[34px] font-semibold capitalize leading-[1.15] text-white`}>
                            Step into your <span className="italic font-normal">signature era.</span>
                        </h2>
                        <div className="flex gap-8 text-white/80">
                            <div>
                                <p className="text-[18px] font-semibold leading-none text-[#eccd80]">12K+</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Sessions Styled</p>
                            </div>
                            <div>
                                <p className="text-[18px] font-semibold leading-none text-[#eccd80]">98%</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Rebook Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex w-full items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:w-[44%] lg:px-8 lg:py-6 xl:px-11">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,205,128,0.12),transparent_45%)]" />
                    <div className="relative w-full max-w-[480px]">
                        <div className="mb-5">
                            <h1
                                className={`${playfair.className} text-[32px] font-semibold leading-[1.08] text-white sm:text-[36px]`}
                            >
                                Sign <span className="italic font-normal">In</span>
                            </h1>
                            <p className="mt-1.5 max-w-[460px] text-[13px] leading-relaxed text-white/82">
                                Sign in to book appointments, track your visit history, and manage your salon experience.
                            </p>
                            <div className="mt-3 h-px w-full bg-gradient-to-r from-[#eccd80]/70 via-white/20 to-transparent" />
                        </div>

                        {registered && (
                            <div className="mb-6 border border-emerald-300/60 bg-emerald-500/10 px-4 py-3">
                                <p className="text-sm font-medium text-emerald-200">Account created! Please sign in.</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 border border-red-400/70 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="space-y-2.5">
                                <label htmlFor="email" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    required
                                    autoComplete="email"
                                    className="h-9 w-full border border-[#f2f2f2]/85 bg-transparent px-4 text-[13px] text-white placeholder:text-white/55 outline-none transition-all focus:border-[#eccd80] focus:shadow-[0_0_0_1px_rgba(236,205,128,0.38)]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label htmlFor="password" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                        autoComplete="current-password"
                                        className="h-9 w-full border border-[#f2f2f2]/85 bg-transparent px-4 pr-11 text-[13px] text-white placeholder:text-white/55 outline-none transition-all focus:border-[#eccd80] focus:shadow-[0_0_0_1px_rgba(236,205,128,0.38)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/65 transition-colors hover:text-white"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Link href="/forgot-password" className="text-[13px] text-white/60 underline underline-offset-4 transition-colors hover:text-[#eccd80]">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-9 w-full items-center justify-center bg-white px-8 text-[13px] font-semibold uppercase tracking-[0.1em] text-black transition-all hover:-translate-y-0.5 hover:bg-[#f5f5f5] hover:shadow-[0_24px_50px_-24px_rgba(255,255,255,0.95)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        <p className="mt-5 text-[13px] text-white/92">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-medium text-[#eccd80] underline underline-offset-4 transition-colors hover:text-[#f4dfa9]">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}
