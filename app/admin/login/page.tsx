"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import { login } from "@admin/api/auth/auth"

import { useBusiness } from "@/context/BusinessContext"

export default function LoginPage() {
  const { businessName } = useBusiness()
  const router = useRouter()
  const [useremail, setUseremail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const persistAccessTokenCookie = (token: string) => {
    const maxAge = 10 * 24 * 60 * 60
    document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=strict`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await login(useremail, password)
      const token = data?.accessToken
      if (token) {
        localStorage.setItem('accessToken', token)
        persistAccessTokenCookie(token)
      } else {
        console.warn('No token found in login response!')
      }

      // Hard redirect to ensure server-side auth gets correct cookies on initial page load
      window.location.href = "/admin"
    } catch (err: any) {
      console.error('Login failed:', err)
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-root min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
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

      <div className="w-full max-w-sm px-4 relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 mb-4 shadow-xl shadow-blue-500/20">
            <Sparkles className="w-7 h-7 text-white fill-white/25" />
          </div>
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
            <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to manage your salon
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={useremail}
                onChange={(e) => setUseremail(e.target.value)}
                placeholder="admin@salon.com"
                required
                autoComplete="email"
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
                autoComplete="current-password"
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:border-blue-500/50 focus:bg-white transition-all duration-200 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold mt-2 shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in to Dashboard"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6 tracking-wide">
          Premium Salon Management · {businessName}
        </p>
      </div>
    </div>
  )
}
