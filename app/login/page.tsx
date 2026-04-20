"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import { login } from "@/api/auth/auth"

export default function LoginPage() {
  const router = useRouter()
  const [useremail, setUseremail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await login(useremail, password)
      console.log('Login successful, response data:', data)

      const token = data?.accessToken
      if (token) {
        console.log('Storing token in localStorage:', token.substring(0, 10) + '...')
        localStorage.setItem('accessToken', token)
      } else {
        console.warn('No token found in login response!')
      }

      // Hard redirect to ensure server-side auth gets correct cookies on initial page load
      window.location.href = "/"
    } catch (err: any) {
      console.error('Login failed:', err)
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, oklch(0.988 0.007 58) 0%, oklch(0.972 0.018 14) 50%, oklch(0.982 0.012 30) 100%)' }}
    >
      {/* Decorative blurred orbs */}
      <div className="absolute top-16 left-16 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: 'oklch(0.48 0.16 8 / 0.12)' }} />
      <div className="absolute bottom-16 right-16 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: 'oklch(0.76 0.09 66 / 0.18)' }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full blur-3xl opacity-20"
        style={{ background: 'oklch(0.60 0.11 330 / 0.15)' }} />

      <div className="w-full max-w-sm px-4 relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-xl"
            style={{ boxShadow: '0 8px 32px oklch(0.48 0.16 8 / 0.35)' }}
          >
            <Sparkles className="w-7 h-7 text-primary-foreground fill-primary-foreground/25" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            GeekSalon
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mt-1.5">
            Salon Management Platform
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-2xl"
          style={{ boxShadow: '0 20px 60px oklch(0.18 0.022 18 / 0.08), 0 4px 16px oklch(0.18 0.022 18 / 0.04)' }}
        >
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
                className="mt-1.5 h-11 bg-muted/40 border-border focus:border-primary/50 focus:bg-card transition-colors"
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
                className="mt-1.5 h-11 bg-muted/40 border-border focus:border-primary/50 focus:bg-card transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold mt-2 shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ boxShadow: '0 4px 16px oklch(0.48 0.16 8 / 0.30)' }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in to Dashboard"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6 tracking-wide">
          Premium Salon Management · GeekSalon
        </p>
      </div>
    </div>
  )
}
