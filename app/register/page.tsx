"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Inter, Josefin_Sans, Playfair_Display } from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] })
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["600"] })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"] })

export default function RegisterPage() {
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

  const BD_PHONE = /^(?:(?:\+?88)?01[3-9]\d{8}|1[3-9]\d{8})$/

  const handlePhoneChange = (val: string) => {
    setPhone(val)
    if (val.length > 0 && !BD_PHONE.test(val)) {
      setPhoneError("Enter a valid Bangladeshi number (e.g. 017XXXXXXXX)")
    } else {
      setPhoneError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
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
    sessionStorage.setItem(
      "pendingSignup",
      JSON.stringify({ name, email, phone, password }),
    )
    router.push(`/register/verify-otp?email=${encodeURIComponent(email)}`)
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
              <p className={`${josefin.className} text-[32px] font-semibold leading-none text-white`}>
                MakeOver
              </p>
            </div>

            <div className="relative z-10 flex flex-1 items-center">
              <div className="max-w-[620px]">
                <h2 className={`${playfair.className} text-[44px] font-semibold capitalize leading-[1.15] text-white`}>
                  Build your beauty profile in <span className="italic font-normal">moments.</span>
                </h2>
                <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/78">
                  Register once to unlock personalized bookings, favorite-stylist tracking, and a seamless salon experience every visit.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between gap-6">
              <div className="flex gap-8 text-white/80">
                <div>
                  <p className="text-[20px] font-semibold leading-none text-[#eccd80]">24/7</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Online Booking</p>
                </div>
                <div>
                  <p className="text-[20px] font-semibold leading-none text-[#eccd80]">1 Min</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Quick Sign-Up</p>
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
              Build your beauty profile in <span className="italic font-normal">moments.</span>
            </h2>
            <div className="flex gap-8 text-white/80">
              <div>
                <p className="text-[18px] font-semibold leading-none text-[#eccd80]">24/7</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Online Booking</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold leading-none text-[#eccd80]">1 Min</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em]">Quick Sign-Up</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:w-[44%] lg:px-8 lg:py-6 xl:px-11">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,205,128,0.12),transparent_45%)]" />
          <div className="relative w-full max-w-[480px]">
            <div className="mb-5">
              <h1 className={`${playfair.className} text-[32px] font-semibold leading-[1.08] text-white sm:text-[36px]`}>
                Create <span className="italic font-normal">Account</span>
              </h1>
              <p className="mt-1.5 max-w-[460px] text-[13px] leading-relaxed text-white/82">
                Create your account to book appointments, track your visit history, and manage your salon experience.
              </p>
              <div className="mt-3 h-px w-full bg-gradient-to-r from-[#eccd80]/70 via-white/20 to-transparent" />
            </div>

            {error && (
              <div className="mb-6 border border-red-400/70 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-2.5">
                <label htmlFor="name" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  autoComplete="name"
                  className="h-9 w-full border border-[#f2f2f2]/85 bg-transparent px-4 text-[13px] text-white placeholder:text-white/55 outline-none transition-all focus:border-[#eccd80] focus:shadow-[0_0_0_1px_rgba(236,205,128,0.38)]"
                />
              </div>

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
                <label htmlFor="phone" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="017XXXXXXXX"
                  required
                  autoComplete="tel"
                  className={`h-9 w-full border bg-transparent px-4 text-[13px] text-white placeholder:text-white/55 outline-none transition-all ${phoneError
                    ? "border-red-400/85 focus:border-red-400 focus:shadow-[0_0_0_1px_rgba(248,113,113,0.45)]"
                    : "border-[#f2f2f2]/85 focus:border-[#eccd80] focus:shadow-[0_0_0_1px_rgba(236,205,128,0.38)]"
                    }`}
                />
                {phoneError && <p className="text-sm text-red-300">{phoneError}</p>}
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
                    minLength={6}
                    autoComplete="new-password"
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

              <div className="space-y-2.5">
                <label htmlFor="confirm-password" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter password again"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-9 w-full border border-[#f2f2f2]/85 bg-transparent px-4 pr-11 text-[13px] text-white placeholder:text-white/55 outline-none transition-all focus:border-[#eccd80] focus:shadow-[0_0_0_1px_rgba(236,205,128,0.38)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/65 transition-colors hover:text-white"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="flex h-9 w-full items-center justify-center bg-white px-8 text-[13px] font-semibold uppercase tracking-[0.1em] text-black transition-all hover:-translate-y-0.5 hover:bg-[#f5f5f5] hover:shadow-[0_24px_50px_-24px_rgba(255,255,255,0.95)]"
              >
                Create Account
              </button>
            </form>

            <p className="mt-5 text-[13px] text-white/92">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#eccd80] underline underline-offset-4 transition-colors hover:text-[#f4dfa9]">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
