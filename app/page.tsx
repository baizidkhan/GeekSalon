import Link from "next/link"
import { Sparkles, Calendar, Users, BarChart3, Clock, Scissors } from "lucide-react"

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
            {/* Navigation */}
            <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">GeekSalon</span>
                    </div>
                    <Link
                        href="/admin/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Admin Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Salon Management Made Simple
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            GeekSalon is a modern, all-in-one management platform for salons and beauty businesses. Streamline appointments, manage clients, track inventory, and grow your business.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="/admin/login"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Get Started
                            </Link>
                            <button className="px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium">
                                Learn More
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-3xl opacity-30"></div>
                        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                            <div className="space-y-4">
                                <div className="h-3 bg-white/30 rounded w-3/4"></div>
                                <div className="h-3 bg-white/20 rounded w-1/2"></div>
                                <div className="space-y-2 mt-6">
                                    <div className="h-2 bg-white/30 rounded w-full"></div>
                                    <div className="h-2 bg-white/30 rounded w-5/6"></div>
                                    <div className="h-2 bg-white/20 rounded w-4/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
                        Powerful Features
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Calendar,
                                title: "Appointment Management",
                                description: "Schedule, manage, and track all your client appointments in one place."
                            },
                            {
                                icon: Users,
                                title: "Client Management",
                                description: "Keep detailed client profiles and appointment history for better service."
                            },
                            {
                                icon: Scissors,
                                title: "Service Management",
                                description: "Create and manage all your salon services with pricing and duration."
                            },
                            {
                                icon: BarChart3,
                                title: "Analytics & Reports",
                                description: "Get insights into your business performance with detailed analytics."
                            },
                            {
                                icon: Clock,
                                title: "Staff Management",
                                description: "Manage employee schedules, attendance, and performance."
                            },
                            {
                                icon: Users,
                                title: "Billing & Invoicing",
                                description: "Generate professional invoices and manage payments easily."
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                                <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Salon?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join hundreds of salons already using GeekSalon to streamline their operations.
                    </p>
                    <Link
                        href="/admin/login"
                        className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-lg"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-white">GeekSalon</span>
                            </div>
                            <p className="text-sm">Professional salon management platform.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Features</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Appointments</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Clients</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8">
                        <p className="text-center text-sm">
                            &copy; 2026 GeekSalon. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
