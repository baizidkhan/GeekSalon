"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "../components/site-header"
import api from "@admin/api/base"
import { Download } from "lucide-react"

interface Booking {
    id: string
    date: string
    time: string
    appointmentStatus: string
    services: string[]
    invoiceId: string | null
    invoiceNumber: string | null
    staff: string | null
    total: number | null
    paymentMethod: string | null
    invoiceStatus: string | null
    invoicedAt: string | null
}

interface DashboardData {
    name: string
    email: string
    phone: string
    bookings: Booking[]
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    } catch { return dateStr }
}

function formatTime(timeStr: string) {
    try {
        const [h, m] = timeStr.split(":")
        const hour = parseInt(h)
        return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`
    } catch { return timeStr }
}

async function downloadInvoicePDF(booking: Booking, customerName: string, businessName: string) {
    const { default: jsPDF } = await import("jspdf/dist/jspdf.es.min.js")
    const { default: autoTable } = await (import("jspdf-autotable") as any)

    const doc = new (jsPDF as any)()

    // Header
    doc.setFontSize(18)
    doc.setTextColor(20)
    doc.text(businessName, 105, 18, { align: "center" })

    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text("CUSTOMER COPY", 105, 25, { align: "center" })

    // Divider
    doc.setDrawColor(220)
    doc.line(14, 29, 196, 29)

    // Invoice meta
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text(`Invoice No: ${booking.invoiceNumber ?? "N/A"}`, 14, 36)
    doc.text(`Date: ${booking.date ? formatDate(booking.date) : "—"}  Time: ${booking.time ? formatTime(booking.time) : "—"}`, 14, 42)
    doc.text(`Customer: ${customerName}`, 14, 48)

    doc.setFontSize(9)
    doc.setTextColor(40)

    // Services table
    const serviceRows = (booking.services ?? []).map((s: string) => [s])
    autoTable(doc, {
        startY: 55,
        head: [["Services"]],
        body: serviceRows.length ? serviceRows : [["—"]],
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: 50 },
        columnStyles: { 0: { cellWidth: "auto" } },
    })

    const afterServices = (doc as any).lastAutoTable.finalY + 8

    // Summary table
    const summary: string[][] = []
    if (booking.staff) summary.push(["Stylist", booking.staff])
    summary.push(["Payment Method", booking.paymentMethod ?? "—"])
    summary.push(["Payment Status", booking.invoiceStatus ?? "—"])
    summary.push(["Total", `BDT ${Number(booking.total ?? 0).toFixed(2)}`])

    autoTable(doc, {
        startY: afterServices,
        body: summary,
        theme: "plain",
        bodyStyles: { fontSize: 9, textColor: 50 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { halign: "right" } },
    })

    const afterSummary = (doc as any).lastAutoTable.finalY + 8
    doc.setDrawColor(220)
    doc.line(14, afterSummary, 196, afterSummary)

    doc.setFontSize(8)
    doc.setTextColor(160)
    doc.text("Thank you for choosing us. This is a computer-generated receipt.", 105, afterSummary + 7, { align: "center" })

    doc.save(`Invoice_${booking.invoiceNumber ?? booking.id.slice(0, 8)}.pdf`)
}

export default function CustomerDashboard() {
    const router = useRouter()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [downloading, setDownloading] = useState<string | null>(null)
    const [businessName, setBusinessName] = useState("Salon")

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/auth/customer-dashboard", { cache: false } as any)
                setData(res.data)
            } catch (err: any) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    router.push("/login")
                    return
                }
                setError("Failed to load your bookings. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        // Get business name from API
        api.get("/bussiness-info/active", { cache: false } as any)
            .then((r: any) => { if (r.data?.name) setBusinessName(r.data.name) })
            .catch(() => { })
        fetchDashboard()
    }, [router])

    const handleDownload = async (booking: Booking) => {
        if (!booking.invoiceId) return
        setDownloading(booking.id)
        try {
            await downloadInvoicePDF(booking, data?.name ?? "Customer", businessName)
        } finally {
            setDownloading(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white">
                <SiteHeader solid />
                <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                    <p className="text-white/50 animate-pulse tracking-widest text-xs uppercase">Loading…</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white">
                <SiteHeader solid />
                <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                    <p className="text-red-400 tracking-widest text-xs uppercase">{error || "Failed to load data"}</p>
                </div>
            </div>
        )
    }

    const bookings = data.bookings ?? []

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white" style={{ fontFamily: "Manrope, Inter, sans-serif" }}>
            <SiteHeader solid />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">

                {/* Page header */}
                <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[#eccd80] mb-2">My Account</p>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-0.5 bg-gradient-to-b from-[#eccd80] to-[#eccd80]/20 rounded-full" />
                            <div>
                                <h1
                                    className="text-2xl font-semibold text-white"
                                    style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
                                >
                                    {data.name}
                                </h1>
                                <p className="text-[11px] text-white/60 mt-0.5">{data.email}{data.phone ? ` · ${data.phone}` : ""}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#eccd80]">Booking History</p>
                        <p className="text-xl font-semibold text-[#eccd80] mt-0.5">{bookings.length}</p>
                    </div>
                </div>

                {/* Bookings table */}
                {bookings.length === 0 ? (
                    <div className="border border-[#eccd80]/15 rounded-sm py-20 text-center bg-[#eccd80]/[0.02]">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#eccd80]/30 to-transparent mx-auto mb-6" />
                        <p className="text-white/30 text-[11px] tracking-[0.4em] uppercase">No bookings yet</p>
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#eccd80]/30 to-transparent mx-auto mt-6" />
                    </div>
                ) : (
                    <div className="rounded-sm border border-[#eccd80]/20 overflow-hidden shadow-[0_0_40px_rgba(236,205,128,0.04)]">
                        {/* Golden top accent line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[#eccd80]/50 to-transparent" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#eccd80]/12 bg-[#eccd80]/[0.04]">
                                        {["Date", "Time", "Services", "Stylist", "Amount", "Status", ""].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3.5 text-left text-[10px] uppercase tracking-[0.25em] text-[#eccd80] font-semibold whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b, i) => (
                                        <tr
                                            key={b.id}
                                            className={`border-b border-white/[0.05] transition-colors duration-150 hover:bg-[#eccd80]/[0.03] ${i === bookings.length - 1 ? "border-b-0" : ""}`}
                                        >
                                            {/* Date */}
                                            <td className="px-4 py-4 text-white whitespace-nowrap text-xs font-medium">
                                                {b.date ? formatDate(b.date) : "—"}
                                            </td>

                                            {/* Time */}
                                            <td className="px-4 py-4 text-white whitespace-nowrap text-xs">
                                                {b.time ? formatTime(b.time) : "—"}
                                            </td>

                                            {/* Services */}
                                            <td className="px-4 py-4 text-white text-xs max-w-[200px]">
                                                {b.services?.length
                                                    ? b.services.join(", ")
                                                    : <span className="text-white/30">—</span>}
                                            </td>

                                            {/* Stylist */}
                                            <td className="px-4 py-4 text-white text-xs whitespace-nowrap">
                                                {b.staff
                                                    ? b.staff.toLowerCase() === "any"
                                                        ? <span className="text-white/50 italic">Any</span>
                                                        : b.staff
                                                    : <span className="text-white/30">—</span>}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-4 text-xs whitespace-nowrap font-semibold">
                                                {b.total != null
                                                    ? b.invoiceId
                                                        ? <span className="text-[#eccd80]">{`৳${Number(b.total).toFixed(2)}`}</span>
                                                        : <span className="text-white/70" title="Estimated based on selected services">{`~৳${Number(b.total).toFixed(2)}`}</span>
                                                    : <span className="text-white/30">—</span>}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {b.invoiceStatus ? (
                                                    <span className={`inline-flex items-center text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-sm font-semibold border ${
                                                        b.invoiceStatus === "Paid"
                                                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                                            : b.invoiceStatus === "Partial"
                                                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                                                : "bg-white/8 text-white/60 border-white/15"
                                                    }`}>
                                                        {b.invoiceStatus}
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-sm font-semibold border ${
                                                        b.appointmentStatus?.toLowerCase() === "confirmed"
                                                            ? "bg-[#eccd80]/12 text-[#eccd80] border-[#eccd80]/35"
                                                            : "bg-white/8 text-white/55 border-white/15"
                                                    }`}>
                                                        {b.appointmentStatus || "—"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Download */}
                                            <td className="px-4 py-4 text-right">
                                                {b.invoiceId ? (
                                                    <button
                                                        onClick={() => handleDownload(b)}
                                                        disabled={downloading === b.id}
                                                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#eccd80]/70 hover:text-[#eccd80] border border-[#eccd80]/30 hover:border-[#eccd80]/70 rounded-sm px-2.5 py-1 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title="Download invoice"
                                                    >
                                                        {downloading === b.id ? (
                                                            <span className="h-3 w-3 rounded-full border border-[#eccd80]/50 border-t-[#eccd80] animate-spin" />
                                                        ) : (
                                                            <Download size={11} strokeWidth={1.7} />
                                                        )}
                                                        <span className="hidden sm:inline">PDF</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-white/25 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Golden bottom accent line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[#eccd80]/30 to-transparent" />
                    </div>
                )}

                <p className="mt-5 text-[10px] text-[#eccd80]/60 tracking-[0.3em] uppercase text-right">
                    {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
                </p>
            </div>
        </div>
    )
}



