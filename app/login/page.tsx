"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Scissors } from "lucide-react"
import api from "@admin/api/base"
import { useBusiness } from "@/context/BusinessContext"

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
                window.location.href = "/"
            } else {
                window.location.href = "/admin"
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid email or password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "Manrope, Inter, sans-serif" }}>

            {/* ── Left hero panel ── */}
            <div
                className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-14 overflow-hidden"
                style={{
                    backgroundImage: "url('/hero-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/75" />

                {/* Corner brackets */}
                <div className="pointer-events-none absolute inset-8">
                    <span className="absolute top-0 left-0 block h-12 w-12 border-l border-t border-white/20" />
                    <span className="absolute top-0 right-0 block h-12 w-12 border-r border-t border-white/20" />
                    <span className="absolute bottom-0 left-0 block h-12 w-12 border-l border-b border-white/20" />
                    <span className="absolute bottom-0 right-0 block h-12 w-12 border-r border-b border-white/20" />
                </div>

                {/* Logo / brand */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-500/40">
                        <Scissors className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-white/90 font-semibold tracking-wide">{businessName}</span>
                </div>

                {/* Center quote */}
                <div className="relative z-10">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-amber-400/80 mb-4">Welcome back</p>
                    <h2
                        className="text-4xl xl:text-5xl font-semibold text-white leading-[1.15] mb-6"
                        style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
                    >
                        Beauty is an<br />art. Your salon<br />is the canvas.
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                        Sign in to manage your appointments, clients, and team — all in one place.
                    </p>
                </div>

                {/* Footer tagline */}
                <div className="relative z-10">
                    <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase">{businessName} &mdash; Salon Management</p>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-[#faf9f7]">
                {/* Mobile logo */}
                <div className="lg:hidden mb-10 flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
                        <Scissors className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="text-stone-900 font-semibold tracking-wide text-lg">{businessName}</span>
                </div>

                <div className="w-full max-w-[400px]">
                    <div className="mb-8">
                        <h1
                            className="text-3xl font-semibold text-stone-900 mb-2"
                            style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
                        >
                            Sign in
                        </h1>
                        <p className="text-stone-500 text-sm">Enter your credentials to access your account.</p>
                    </div>

                    {/* Success banner */}
                    {registered && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <p className="text-emerald-700 text-sm font-medium">Account created! Please sign in.</p>
                        </div>
                    )}

                    {/* Error banner */}
                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 pr-11 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl bg-stone-900 text-white text-sm font-semibold tracking-wide transition-all hover:bg-stone-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Signing in…
                                </>
                            ) : "Sign in"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-stone-200 text-center">
                        <p className="text-stone-500 text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                                Create one
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
