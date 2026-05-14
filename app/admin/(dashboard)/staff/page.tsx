"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowUpRight,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Clock3,
    ClipboardCheck,
    Sparkles,
    UserRound,
} from "lucide-react"
import { useAuth } from "@admin/hooks/use-auth"
import { hasPermission } from "@admin/lib/auth-utils"
import { getAppointments } from "@admin/api/appointments/appointments"

interface AppointmentRecord {
    id: string
    clientName: string
    date: string
    time: string
    status: string
}

function toTimestamp(date: string, time: string) {
    return new Date(`${date}T${time}`).getTime()
}

function formatTime12h(raw: string) {
    const [h = "0", m = "00"] = raw.split(":")
    const hour = Number.parseInt(h, 10) || 0
    const suffix = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${suffix}`
}

function getStatusTheme(status?: string) {
    const normalized = (status ?? "pending").toLowerCase()
    if (normalized === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (normalized === "confirmed") return "bg-sky-50 text-sky-700 border-sky-200"
    if (normalized === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
}

export default function StaffDashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(true)

    useEffect(() => {
        if (!loading && !hasPermission(user, "staff-dashboard")) {
            router.replace("/admin")
        }
    }, [loading, user, router])

    useEffect(() => {
        const load = async () => {
            try {
                setAppointmentsLoading(true)
                const res = await getAppointments({ page: 1, limit: 300 })
                const list: AppointmentRecord[] = res?.data ?? []
                setAppointments(list)
            } catch {
                setAppointments([])
            } finally {
                setAppointmentsLoading(false)
            }
        }

        if (!loading && user?.role === "staff") {
            void load()
        }
    }, [loading, user?.role])

    const todayIso = new Date().toISOString().split("T")[0]
    const now = Date.now()

    const todays = useMemo(() => appointments.filter((a) => a.date === todayIso), [appointments, todayIso])
    const pending = useMemo(() => todays.filter((a) => a.status?.toLowerCase() === "pending").length, [todays])
    const completed = useMemo(() => todays.filter((a) => a.status?.toLowerCase() === "completed").length, [todays])
    const upcoming = useMemo(
        () => appointments
            .filter((a) => toTimestamp(a.date, a.time) >= now)
            .sort((a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time))
            .slice(0, 6),
        [appointments, now],
    )

    const nextAppointment = upcoming[0]

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }).format(new Date()),
        [],
    )

    if (loading || !hasPermission(user, "staff-dashboard")) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] p-5 lg:p-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 mb-5">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xs tracking-[0.18em] uppercase text-slate-500">Staff Workspace</p>
                        <h1 className="text-[30px] font-bold text-slate-900 mt-1">Staff Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">{todayLabel}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 min-w-[240px]">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-600">Next Appointment</p>
                        {appointmentsLoading ? (
                            <p className="mt-1 text-sm text-slate-600">Loading...</p>
                        ) : nextAppointment ? (
                            <>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{nextAppointment.clientName}</p>
                                <p className="text-xs text-slate-600">{nextAppointment.date} at {formatTime12h(nextAppointment.time)}</p>
                            </>
                        ) : (
                            <p className="mt-1 text-sm text-slate-600">No upcoming appointment</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                <Card
                    title="Today"
                    value={appointmentsLoading ? "—" : String(todays.length)}
                    subLabel="Appointments scheduled"
                    icon={<CalendarDays className="w-4 h-4" />}
                />
                <Card
                    title="Pending"
                    value={appointmentsLoading ? "—" : String(pending)}
                    subLabel="Need action"
                    icon={<Clock3 className="w-4 h-4" />}
                />
                <Card
                    title="Completed"
                    value={appointmentsLoading ? "—" : String(completed)}
                    subLabel="Done today"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                />
                <Card
                    title="Upcoming"
                    value={appointmentsLoading ? "—" : String(upcoming.length)}
                    subLabel="In your queue"
                    icon={<CalendarClock className="w-4 h-4" />}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
                        <Link
                            href="/admin/appointments"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0076E9] hover:text-[#0067cd]"
                        >
                            Open full schedule
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    {appointmentsLoading ? (
                        <p className="text-sm text-slate-400">Loading appointments...</p>
                    ) : upcoming.length === 0 ? (
                        <p className="text-sm text-slate-400">No upcoming appointments.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {upcoming.map((appt) => (
                                <div key={appt.id} className="rounded-xl border border-slate-100 p-3.5 hover:border-slate-200 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{appt.clientName}</p>
                                            <p className="text-xs text-slate-500 mt-1">{appt.date} at {formatTime12h(appt.time)}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium capitalize ${getStatusTheme(appt.status)}`}>
                                            {appt.status || "pending"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Today&apos;s Focus</h2>
                        <div className="space-y-2.5 text-sm">
                            <FocusItem
                                title="Pending confirmations"
                                value={appointmentsLoading ? "—" : String(pending)}
                                icon={<Clock3 className="w-4 h-4 text-amber-500" />}
                            />
                            <FocusItem
                                title="Completed services"
                                value={appointmentsLoading ? "—" : String(completed)}
                                icon={<ClipboardCheck className="w-4 h-4 text-emerald-500" />}
                            />
                            <FocusItem
                                title="Walk-in support"
                                value="Ready"
                                icon={<Sparkles className="w-4 h-4 text-[#0076E9]" />}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
                        <div className="space-y-2 text-sm">
                            <QuickLink href="/admin/appointments" label="Appointment List" icon={<CalendarDays className="w-4 h-4 text-slate-500" />} />
                            <QuickLink href="/admin/clients" label="Clients" icon={<UserRound className="w-4 h-4 text-slate-500" />} />
                            <QuickLink href="/admin/leave-request" label="Leave Request" icon={<Clock3 className="w-4 h-4 text-slate-500" />} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Card({
    title,
    value,
    icon,
    subLabel,
}: {
    title: string
    value: string
    icon: React.ReactNode
    subLabel: string
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{title}</p>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">{icon}</span>
            </div>
            <p className="text-4xl font-bold text-slate-900 mt-3">{value}</p>
            <p className="text-xs text-slate-500 mt-2">{subLabel}</p>
        </div>
    )
}

function FocusItem({
    title,
    value,
    icon,
}: {
    title: string
    value: string
    icon: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-50">{icon}</span>
                <p className="text-slate-700">{title}</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">{value}</p>
        </div>
    )
}

function QuickLink({
    href,
    label,
    icon,
}: {
    href: string
    label: string
    icon: React.ReactNode
}) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
        >
            <span className="flex items-center gap-2">
                {icon}
                {label}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
    )
}
