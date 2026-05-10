"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "../components/site-header"
import api from "@admin/api/base"

export default function CustomerDashboard() {
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (!token) {
                    router.push("/login")
                    return
                }
                const res = await api.get("/auth/customer/dashboard", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                setData(res.data)
            } catch (err: any) {
                if (err.response?.status === 401) {
                    router.push("/login")
                }
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white">
                <SiteHeader solid />
                <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                    <p className="text-white/50 animate-pulse tracking-widest text-xs uppercase">Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white">
                <SiteHeader solid />
                <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                    <p className="text-red-400 tracking-widest text-xs uppercase">Failed to load data</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white">
            <SiteHeader solid />
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-light mb-8 uppercase tracking-widest text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Welcome, {data.name}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Appointments Section */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm">
                        <h2 className="text-xl font-light mb-6 uppercase tracking-widest text-white/80 border-b border-white/10 pb-4">My Appointments</h2>
                        {data.appointments && data.appointments.length > 0 ? (
                            <div className="space-y-4">
                                {data.appointments.map((apt: any) => (
                                    <div key={apt.id} className="p-4 bg-white/5 border border-white/5 rounded">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm text-white/90">{apt.date} at {apt.time}</div>
                                            <div className="px-2 py-1 bg-white/10 text-xs rounded uppercase tracking-wider">{apt.status}</div>
                                        </div>
                                        <div className="text-xs text-white/50">{apt.services?.map((s: any) => s.name).join(', ') || 'Service'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/50 italic">No appointments found.</p>
                        )}
                    </div>

                    {/* Invoices Section */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm">
                        <h2 className="text-xl font-light mb-6 uppercase tracking-widest text-white/80 border-b border-white/10 pb-4">My Invoices</h2>
                        {data.invoices && data.invoices.length > 0 ? (
                            <div className="space-y-4">
                                {data.invoices.map((inv: any) => (
                                    <div key={inv.id} className="p-4 bg-white/5 border border-white/5 rounded flex justify-between items-center">
                                        <div>
                                            <div className="text-sm text-white/90 mb-1">Invoice #{inv.id.slice(0, 8)}</div>
                                            <div className="text-xs text-white/50">{new Date(inv.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white">৳{inv.total}</div>
                                            <div className={`text-[10px] uppercase tracking-wider mt-1 ${inv.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {inv.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/50 italic">No invoices found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
