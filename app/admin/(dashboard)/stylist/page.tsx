"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    CalendarCheck2,
    CalendarDays,
    CalendarFold,
    CheckCircle2,
    Clock3,
    Plus,
    Sparkles,
    User,
    UserRound,
    Users,
    Zap,
} from "lucide-react"
import { useAuth } from "@admin/hooks/use-auth"
import { hasPermission } from "@admin/lib/auth-utils"
import { getAppointments } from "@admin/api/appointments/appointments"

interface AppointmentRecord {
    id: string
    clientName: string
    phoneNumber: string
    date: string
    time: string
    source: string
    status: string
    staff: string | null
    services: string[] | null
}

function toTimestamp(date: string, time: string) {
    return new Date(`${date}T${time}`).getTime()
}

function normalizeStatus(raw: string) {
    return (raw ?? "pending").trim().toLowerCase()
}

function formatTime12h(raw: string) {
    const [h = "0", m = "00"] = raw.split(":")
    const hour = Number.parseInt(h, 10) || 0
    const suffix = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${suffix}`
}

function normalizeStaffName(raw?: string | null) {
    return (raw ?? "").trim().toLowerCase()
}

export default function StylistDashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(true)
    const canAccessStylistDashboard = hasPermission(user, "stylist-dashboard")
    const stylistName = (user?.employeeName ?? "").trim()

    useEffect(() => {
        if (!loading && !canAccessStylistDashboard) {
            router.replace("/admin")
        }
    }, [loading, canAccessStylistDashboard, router])

    useEffect(() => {
        const fetchStylistAppointments = async () => {
            if (!user || user.role !== "stylist") {
                setAppointmentsLoading(false)
                return
            }

            const stylistName = (user.employeeName ?? "").trim()
            if (!stylistName) {
                setAppointments([])
                setAppointmentsLoading(false)
                return
            }

            try {
                setAppointmentsLoading(true)
                const res = await getAppointments({ page: 1, limit: 1000, staff: stylistName } as any)
                const list: AppointmentRecord[] = res?.data ?? []
                // Backend staff filter is partial-match; enforce exact owner match on client for strict isolation.
                const ownedAppointments = list.filter(
                    (appt) => normalizeStaffName(appt.staff) === normalizeStaffName(stylistName),
                )
                setAppointments(ownedAppointments)
            } catch {
                setAppointments([])
            } finally {
                setAppointmentsLoading(false)
            }
        }

        if (!loading) {
            void fetchStylistAppointments()
        }
    }, [user, loading])

    const todayIso = new Date().toISOString().split("T")[0]
    const now = Date.now()

    const todaysAppointments = useMemo(
        () => appointments
            .filter((appt) => appt.date === todayIso)
            .sort((a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time)),
        [appointments, todayIso],
    )

    const uniqueClients = useMemo(() => {
        const ids = new Set(appointments.map((appt) => appt.phoneNumber || `${appt.clientName}-${appt.date}`))
        return ids.size
    }, [appointments])

    const upcomingAppointments = useMemo(
        () => appointments
            .filter((appt) => toTimestamp(appt.date, appt.time) >= now)
            .sort((a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time))
            .slice(0, 8),
        [appointments, now],
    )

    const thisWeekStart = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() - 6)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    }, [])

    const weekAppointments = useMemo(
        () => appointments.filter((appt) => toTimestamp(appt.date, appt.time) >= thisWeekStart),
        [appointments, thisWeekStart],
    )

    const statusCount = useMemo(() => {
        const result = {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        }

        for (const appt of weekAppointments) {
            const status = normalizeStatus(appt.status)
            if (status === "confirmed") result.confirmed += 1
            else if (status === "completed") result.completed += 1
            else if (status === "cancelled") result.cancelled += 1
            else result.pending += 1
        }

        return result
    }, [weekAppointments])

    const completionRate = useMemo(() => {
        if (weekAppointments.length === 0) return 0
        return Math.round((statusCount.completed / weekAppointments.length) * 100)
    }, [statusCount.completed, weekAppointments.length])

    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    })
    const todayLabel = formatter.format(new Date())

    if (loading || !canAccessStylistDashboard) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!stylistName) {
        return (
            <div className="min-h-screen bg-[#fafafa] p-6 lg:p-8">
                <div className="max-w-3xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 p-6">
                    <h1 className="text-2xl font-bold text-amber-700 mb-2">Stylist Profile Not Linked</h1>
                    <p className="text-sm text-amber-700/90">
                        Your login is not linked to an employee profile yet. Ask admin to connect this account to your stylist profile.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] p-5 lg:p-6">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xs tracking-[0.18em] uppercase text-slate-500">Stylist Workspace</p>
                        <h1 className="text-[30px] font-bold text-slate-900 mt-1">Hi, {stylistName}</h1>
                        <p className="text-sm text-slate-500 mt-1">{todayLabel}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/appointments?new=true"
                            className="inline-flex items-center gap-2 bg-[#0076E9] hover:bg-[#0067cd] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Appointment
                        </Link>
                        <Link
                            href="/admin/appointments"
                            className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            <CalendarDays className="w-4 h-4" />
                            Open Schedule
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Today</p>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0076E9]"><CalendarCheck2 className="w-4 h-4" /></span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 mt-3">{appointmentsLoading ? "—" : todaysAppointments.length}</p>
                    <p className="text-xs text-slate-500 mt-2">appointments assigned to you</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Upcoming</p>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><CalendarFold className="w-4 h-4" /></span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 mt-3">{appointmentsLoading ? "—" : upcomingAppointments.length}</p>
                    <p className="text-xs text-slate-500 mt-2">next appointments in queue</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">This Week Done</p>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 mt-3">{appointmentsLoading ? "—" : statusCount.completed}</p>
                    <p className="text-xs text-slate-500 mt-2">completed appointments</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Unique Clients</p>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><UserRound className="w-4 h-4" /></span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 mt-3">{appointmentsLoading ? "—" : uniqueClients}</p>
                    <p className="text-xs text-slate-500 mt-2">clients served by you</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-4 mb-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Queue</h2>
                        <span className="text-xs text-slate-500">Only your appointments</span>
                    </div>
                    {appointmentsLoading ? (
                        <div className="h-48 grid place-items-center text-sm text-slate-400">Loading appointments...</div>
                    ) : todaysAppointments.length === 0 ? (
                        <div className="h-48 grid place-items-center text-sm text-slate-400">No appointments for today.</div>
                    ) : (
                        <div className="max-h-[340px] overflow-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-slate-500 border-b border-slate-100">
                                        <th className="py-2">Client</th>
                                        <th className="py-2">Services</th>
                                        <th className="py-2">Time</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todaysAppointments.slice(0, 6).map((appt) => (
                                        <tr key={appt.id} className="border-b border-slate-50 last:border-b-0">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center">
                                                        <User className="w-4 h-4 text-slate-500" />
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{appt.clientName}</p>
                                                        <p className="text-xs text-slate-500">{appt.phoneNumber || "No phone"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm text-slate-700 max-w-[240px] truncate">{(appt.services ?? []).join(", ") || "—"}</td>
                                            <td className="py-3 text-sm text-slate-700">{formatTime12h(appt.time)}</td>
                                            <td className="py-3">
                                                <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                                    {normalizeStatus(appt.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Status</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Pending</span>
                                <span className="font-semibold text-slate-900">{statusCount.pending}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Confirmed</span>
                                <span className="font-semibold text-slate-900">{statusCount.confirmed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Completed</span>
                                <span className="font-semibold text-slate-900">{statusCount.completed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Cancelled</span>
                                <span className="font-semibold text-slate-900">{statusCount.cancelled}</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-sm text-slate-600">Completion Rate</p>
                            <p className="text-xl font-bold text-emerald-600">{completionRate}%</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Next Appointments</h2>
                        {appointmentsLoading ? (
                            <p className="text-sm text-slate-400">Loading...</p>
                        ) : upcomingAppointments.length === 0 ? (
                            <p className="text-sm text-slate-400">No upcoming appointments.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {upcomingAppointments.slice(0, 4).map((appt) => (
                                    <div key={appt.id} className="rounded-xl border border-slate-100 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{appt.clientName}</p>
                                                <p className="text-xs text-slate-500">{appt.date} at {formatTime12h(appt.time)}</p>
                                            </div>
                                            <Sparkles className="w-4 h-4 text-[#0076E9]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
                        <div className="space-y-2 text-sm">
                            <Link href="/admin/appointments" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"><CalendarDays className="w-4 h-4 text-slate-500" />My appointments list</Link>
                            <Link href="/admin/clients" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"><Users className="w-4 h-4 text-slate-500" />Client profiles</Link>
                            <Link href="/admin/leave-request" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"><Zap className="w-4 h-4 text-slate-500" />Request leave</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Data scope locked: this page shows only appointments assigned to <span className="font-semibold">{stylistName}</span>.
            </div>
        </div>
    )
}
