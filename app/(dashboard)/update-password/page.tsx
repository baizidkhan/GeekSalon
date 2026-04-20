"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Lock, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updatePassword } from "@/api/update-password/update-password"
import { useRouter } from "next/navigation"

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match with the confirm password")
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      await updatePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })
      toast.success("Password updated successfully")
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error(error)
      const message = error.response?.data?.message || "Failed to update password"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8 flex justify-center items-start min-h-[calc(100-3.5rem)]">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-2 bg-gradient-to-r from-sidebar-primary/40 via-sidebar-primary to-sidebar-primary/40" />
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-sidebar-primary/10 flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6 text-sidebar-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Update Password</CardTitle>
          <CardDescription className="text-muted-foreground/70">
            Secure your account by choosing a strong password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <div className="relative group">
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 border-border/60 bg-background/50 focus:border-sidebar-primary transition-all group-hover:border-border"
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/50 group-focus-within:text-sidebar-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative group">
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 border-border/60 bg-background/50 focus:border-sidebar-primary transition-all group-hover:border-border"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                  />
                  <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/50 group-focus-within:text-sidebar-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 border-border/60 bg-background/50 focus:border-sidebar-primary transition-all group-hover:border-border"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/50 group-focus-within:text-sidebar-primary transition-colors" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold tracking-wide bg-sidebar-primary hover:bg-sidebar-primary/90 shadow-lg shadow-sidebar-primary/20 transition-all mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
