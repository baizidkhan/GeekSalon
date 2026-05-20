"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Check, Settings } from "lucide-react"
import { SiteHeader } from "@/app/components/site-header"
import api from "@admin/api/base"

function getUserFromToken(token: string): { name?: string; email?: string; role?: string } | null {
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        return { name: decoded.name, email: decoded.useremail, role: decoded.role }
    } catch {
        return null
    }
}

function persistToken(token: string) {
    localStorage.setItem("accessToken", token)
    const maxAge = 10 * 24 * 60 * 60
    document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=strict`
}

export default function AccountSettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)

    // Profile
    const [profileName, setProfileName] = useState("")
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileError, setProfileError] = useState("")
    const [profileSuccess, setProfileSuccess] = useState(false)

    // Password
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (!token) { router.replace("/login"); return }
        const decoded = getUserFromToken(token)
        if (!decoded) { router.replace("/login"); return }
        setUser(decoded)
        setProfileName(decoded.name || "")
    }, [router])

    const handleSaveName = async () => {
        if (!profileName.trim()) { setProfileError("Name cannot be empty"); return }
        setProfileSaving(true)
        setProfileError("")
        setProfileSuccess(false)
        try {
            const { data } = await (api as any).patch("/auth/update-profile", { name: profileName.trim() }, { cache: false })
            persistToken(data.accessToken)
            const updated = getUserFromToken(data.accessToken)
            setUser(updated)
            setProfileName(updated?.name || "")
            setProfileSuccess(true)
        } catch (err: any) {
            setProfileError(err?.response?.data?.message || "Failed to update name")
        } finally {
            setProfileSaving(false)
        }
    }

    const handleSavePassword = async () => {
        setPasswordError("")
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all fields")
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords don't match")
            return
        }
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            return
        }
        setPasswordSaving(true)
        setPasswordSuccess(false)
        try {
            await (api as any).patch("/auth/update-password", { oldPassword, newPassword }, { cache: false })
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setPasswordSuccess(true)
        } catch (err: any) {
            setPasswordError(err?.response?.data?.message || "Incorrect current password")
        } finally {
            setPasswordSaving(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white" style={{ fontFamily: "Manrope, Inter, sans-serif" }}>
            <SiteHeader solid />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">

                {/* Page header */}
                <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#eccd80] mb-1.5">My Account</p>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eccd80]/60 bg-[#eccd80]/15 text-[#eccd80]">
                            <Settings size={18} strokeWidth={1.7} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
                                Account Settings
                            </h1>
                            <p className="text-[11px] text-white/60 mt-0.5">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">

                    {/* ── Profile card ──────────────────────────────────────── */}
                    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 space-y-5">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#eccd80] mb-0.5">Profile</p>
                            <p className="text-[11px] text-white/65">Update your display name</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[11px] text-white/80 uppercase tracking-[0.15em]">
                                Display Name
                            </label>
                            <input
                                value={profileName}
                                onChange={(e) => {
                                    setProfileName(e.target.value)
                                    setProfileError("")
                                    setProfileSuccess(false)
                                }}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName() }}
                                placeholder="Your name"
                                className="w-full rounded-xl border border-white/20 bg-white/7 px-4 py-3 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[#eccd80] focus:bg-white/10 transition-all"
                            />
                            {profileError && (
                                <p className="text-[11px] text-red-400 mt-1">{profileError}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveName}
                                disabled={profileSaving || !profileName.trim()}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#eccd80] bg-[#eccd80]/15 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#eccd80] transition-all hover:border-[#eccd80] hover:bg-[#eccd80]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {profileSaving && <Loader2 size={12} className="animate-spin" />}
                                {profileSuccess && !profileSaving && <Check size={12} />}
                                {profileSuccess ? "Saved" : "Save Name"}
                            </button>
                            {profileSuccess && (
                                <p className="text-[11px] text-emerald-400">Name updated successfully</p>
                            )}
                        </div>
                    </div>

                    {/* ── Password card ─────────────────────────────────────── */}
                    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 space-y-5">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#eccd80] mb-0.5">Password</p>
                            <p className="text-[11px] text-white/65">Change your account password</p>
                        </div>

                        <div className="space-y-3">
                            {/* Current password */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] text-white/80 uppercase tracking-[0.15em]">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOld ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => { setOldPassword(e.target.value); setPasswordError(""); setPasswordSuccess(false) }}
                                        placeholder="Enter current password"
                                        className="w-full rounded-xl border border-white/20 bg-white/7 px-4 py-3 pr-11 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[#eccd80] focus:bg-white/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOld((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                    >
                                        {showOld ? <EyeOff size={15} strokeWidth={1.7} /> : <Eye size={15} strokeWidth={1.7} />}
                                    </button>
                                </div>
                            </div>

                            {/* New password */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] text-white/80 uppercase tracking-[0.15em]">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); setPasswordSuccess(false) }}
                                        placeholder="Enter new password"
                                        className="w-full rounded-xl border border-white/20 bg-white/7 px-4 py-3 pr-11 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[#eccd80] focus:bg-white/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                    >
                                        {showNew ? <EyeOff size={15} strokeWidth={1.7} /> : <Eye size={15} strokeWidth={1.7} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] text-white/80 uppercase tracking-[0.15em]">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); setPasswordSuccess(false) }}
                                        placeholder="Confirm new password"
                                        className={`w-full rounded-xl border bg-white/7 px-4 py-3 pr-11 text-[13px] text-white placeholder:text-white/35 outline-none focus:bg-white/10 transition-all ${
                                            confirmPassword && newPassword !== confirmPassword
                                                ? "border-red-500/60 focus:border-red-500"
                                                : "border-white/20 focus:border-[#eccd80]"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={15} strokeWidth={1.7} /> : <Eye size={15} strokeWidth={1.7} />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-[11px] text-red-400">Passwords don't match</p>
                                )}
                            </div>
                        </div>

                        {passwordError && (
                            <p className="text-[11px] text-red-400">{passwordError}</p>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSavePassword}
                                disabled={
                                    passwordSaving ||
                                    !oldPassword ||
                                    !newPassword ||
                                    !confirmPassword ||
                                    newPassword !== confirmPassword
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-[#eccd80] bg-[#eccd80]/15 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#eccd80] transition-all hover:border-[#eccd80] hover:bg-[#eccd80]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {passwordSaving && <Loader2 size={12} className="animate-spin" />}
                                {passwordSuccess && !passwordSaving && <Check size={12} />}
                                {passwordSuccess ? "Updated" : "Update Password"}
                            </button>
                            {passwordSuccess && (
                                <p className="text-[11px] text-emerald-400">Password updated successfully</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
