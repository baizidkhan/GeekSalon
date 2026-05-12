"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Scissors } from "lucide-react"
import api from "@admin/api/base"
import { useBusiness } from "@/context/BusinessContext"

export default function RegisterPage() {
  const { businessName } = useBusiness()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const BD_PHONE = /^(?:(?:\+?88)?01[3-9]\d{8}|1[3-9]\d{8})$/

  const handlePhoneChange = (val: string) => {
    setPhone(val)
    if (val.length > 0 && !BD_PHONE.test(val)) {
      setPhoneError("Enter a valid Bangladeshi number (e.g. 017XXXXXXXX)")
    } else {
      setPhoneError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!BD_PHONE.test(phone)) {
      setPhoneError("Enter a valid Bangladeshi number (e.g. 017XXXXXXXX)")
      return
    }
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/customer-signup", { name, email, phone, password })
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-400/80 mb-4">Join us today</p>
          <h2
            className="text-4xl xl:text-5xl font-semibold text-white leading-[1.15] mb-6"
            style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
          >
            Your style<br />journey starts<br />right here.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Create your account to book appointments, track your visit history, and enjoy an exclusive salon experience.
          </p>
        </div>

        {/* Footer tagline */}
        <div className="relative z-10">
          <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase">{businessName} &mdash; Salon Management</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-[#faf9f7] overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
            <Scissors className="h-6 w-6 text-amber-600" />
          </div>
          <span className="text-stone-900 font-semibold tracking-wide text-lg">{businessName}</span>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1
              className="text-3xl font-semibold text-stone-900 mb-2"
              style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
            >
              Create account
            </h1>
            <p className="text-stone-500 text-sm">
              Join {businessName} to book appointments and manage your visits.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                autoComplete="name"
                className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                Email Address
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="017XXXXXXXX"
                required
                autoComplete="tel"
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all ${phoneError
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                    : "border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  }`}
              />
              {phoneError && (
                <p className="mt-1.5 text-xs text-red-500">{phoneError}</p>
              )}
            </div>

            {/* Password */}
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
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 pr-11 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-stone-900 text-white text-sm font-semibold tracking-wide transition-all hover:bg-stone-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <p className="text-stone-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
