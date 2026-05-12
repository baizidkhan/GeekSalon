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

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {/* Page header */}
                <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/35 mb-1">My Account</p>
                    <h1
                        className="text-2xl font-semibold text-white/90"
                        style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
                    >
                        {data.name}
                    </h1>
                    <p className="text-xs text-white/35 mt-0.5">{data.email} · {data.phone}</p>
                </div>

                {/* Bookings table */}
                {bookings.length === 0 ? (
                    <div className="border border-white/10 rounded-sm py-16 text-center">
                        <p className="text-white/30 text-sm tracking-widest uppercase">No bookings yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-white/10 rounded-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {["Date", "Time", "Services", "Stylist", "Amount", "Status", ""].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-white/35 font-medium whitespace-nowrap"
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
                                        className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${i === bookings.length - 1 ? "border-b-0" : ""}`}
                                    >
                                        {/* Date */}
                                        <td className="px-4 py-3.5 text-white/70 whitespace-nowrap text-xs">
                                            {b.date ? formatDate(b.date) : "—"}
                                        </td>

                                        {/* Time */}
                                        <td className="px-4 py-3.5 text-white/50 whitespace-nowrap text-xs">
                                            {b.time ? formatTime(b.time) : "—"}
                                        </td>

                                        {/* Services */}
                                        <td className="px-4 py-3.5 text-white/70 text-xs max-w-[200px]">
                                            {b.services?.length
                                                ? b.services.join(", ")
                                                : <span className="text-white/25">—</span>}
                                        </td>

                                        {/* Stylist */}
                                        <td className="px-4 py-3.5 text-white/50 text-xs whitespace-nowrap">
                                            {b.staff
                                                ? b.staff.toLowerCase() === "any"
                                                    ? <span className="text-white/40 italic">Any</span>
                                                    : b.staff
                                                : <span className="text-white/20">—</span>}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-3.5 text-xs whitespace-nowrap font-medium">
                                            {b.total != null
                                                ? b.invoiceId
                                                    ? <span className="text-white/80">{`৳${Number(b.total).toFixed(2)}`}</span>
                                                    : <span className="text-white/40" title="Estimated based on selected services">{`~৳${Number(b.total).toFixed(2)}`}</span>
                                                : <span className="text-white/20">—</span>}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            {b.invoiceStatus ? (
                                                <span className={`inline-block text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm font-medium ${b.invoiceStatus === "Paid"
                                                        ? "bg-emerald-500/15 text-emerald-400"
                                                        : b.invoiceStatus === "Partial"
                                                            ? "bg-amber-500/15 text-amber-400"
                                                            : "bg-white/8 text-white/40"
                                                    }`}>
                                                    {b.invoiceStatus}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                                                    {b.appointmentStatus}
                                                </span>
                                            )}
                                        </td>

                                        {/* Download */}
                                        <td className="px-4 py-3.5 text-right">
                                            {b.invoiceId ? (
                                                <button
                                                    onClick={() => handleDownload(b)}
                                                    disabled={downloading === b.id}
                                                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title="Download invoice"
                                                >
                                                    {downloading === b.id ? (
                                                        <span className="h-3.5 w-3.5 rounded-full border border-white/30 border-t-white animate-spin" />
                                                    ) : (
                                                        <Download size={13} strokeWidth={1.5} />
                                                    )}
                                                    <span className="hidden sm:inline">PDF</span>
                                                </button>
                                            ) : (
                                                <span className="text-white/15 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="mt-6 text-[10px] text-white/20 tracking-widest uppercase text-right">
                    {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
                </p>
            </div>
        </div>
    )
}



