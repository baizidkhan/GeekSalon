"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import api from "@admin/api/base"

import { useBusiness } from "@/context/BusinessContext"

export default function RegisterPage() {
  const { businessName } = useBusiness()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await api.post("/auth/customer/register", { name, email, phone, password })

      if (res.status !== 201 && res.status !== 200) {
        throw new Error(res.data.message || "Registration failed")
      }

      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-root min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 py-12">
      <style>{`
        .admin-root {
          --primary: oklch(0.6 0.155 258.8); /* #3b82f6 */
          --primary-foreground: oklch(1 0 0);
          --background: oklch(0.975 0.005 258);
          --border: oklch(0.92 0.01 260);
          --card: oklch(1 0 0);
        }
      `}</style>

      {/* Decorative blurred orbs - Blue/Slate palette */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] opacity-40 bg-blue-100" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 bg-emerald-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] opacity-20 bg-slate-100" />

      <div className="w-full max-w-md px-4 relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 mb-4 shadow-xl shadow-blue-500/20 cursor-pointer">
            <Sparkles className="w-7 h-7 text-white fill-white/25" />
          </Link>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            {businessName}
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mt-1.5">
            Salon Management Platform
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-200/50 relative">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Create an account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Join {businessName} to book appointments and track your history
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground/80">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:border-blue-500/50 focus:bg-white transition-all duration-200 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:border-blue-500/50 focus:bg-white transition-all duration-200 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                required
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:border-blue-500/50 focus:bg-white transition-all duration-200 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:border-blue-500/50 focus:bg-white transition-all duration-200 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold mt-2 shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? "Registering…" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6 tracking-wide">
          Premium Salon Management · {businessName}
        </p>
      </div>
    </div>
  )
}
