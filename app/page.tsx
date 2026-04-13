import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RevenueChart, AppointmentChart } from "@/components/dashboard-charts"
import {
  TodaysAppointments,
  LowStockAlerts,
  TopServices,
} from "@/components/dashboard-widgets"
import {
  Calendar,
  TrendingUp,
  Users,
  Layers,
  Clock,
  Footprints,
  UserCheck,
  AlertTriangle,
} from "lucide-react"

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back — {today}</p>
        </div>

        {/* Stats Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Today's Appointments"
            value={0}
            subtitle="TODAY"
            icon={Calendar}
          />
          <StatCard
            title="Total Revenue"
            value="₹9,800"
            subtitle="WEEK"
            icon={TrendingUp}
          />
          <StatCard
            title="Total Clients"
            value={4}
            subtitle="MONTH"
            icon={Users}
          />
          <StatCard
            title="Services"
            value={7}
            subtitle="ACTIVE"
            icon={Layers}
          />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Online Bookings"
            value={1}
            subtitle="MONTH"
            icon={Clock}
          />
          <StatCard
            title="Walk-ins"
            value={2}
            subtitle="MONTH"
            icon={Footprints}
          />
          <StatCard
            title="Employees"
            value={4}
            subtitle="ATTENDANCE"
            icon={UserCheck}
          />
          <StatCard
            title="Low Stock Items"
            value={2}
            subtitle="ALERT"
            icon={AlertTriangle}
            iconClassName="text-amber-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <RevenueChart />
          <AppointmentChart />
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TodaysAppointments />
          <LowStockAlerts />
          <TopServices />
        </div>
      </div>
    </DashboardLayout>
  )
}
