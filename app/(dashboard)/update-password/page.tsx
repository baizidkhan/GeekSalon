"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, Lock, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updatePassword } from "@/api/update-password/update-password"

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

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
    <div className="premium-page p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div className="mb-6 w-full max-w-md text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Security</p>
        <h1 className="text-2xl font-semibold text-foreground">Change Password</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Keep your account secure with a strong password</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm">Update Password</h3>
            <p className="text-xs text-muted-foreground">Enter your current password then choose a new one</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="oldPassword">Current Password</Label>
            <div className="relative mt-1">
              <Input
                id="oldPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
          </div>

          <div className="pt-1 space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
