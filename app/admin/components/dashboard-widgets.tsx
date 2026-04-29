import { Calendar, AlertTriangle, Sparkles } from "lucide-react"
interface DashboardAppointment {
  id: string
  clientName: string
  time: string
  services: string[]
  status: string
  staff: string | null
}

interface LowStockItem {
  id: string
  name: string
  category: string
  stockQty: number
  minStockLevel: number
}

interface TopService {
  name: string
  count: number
}

interface TodaysAppointmentsProps {
  appointments: DashboardAppointment[]
}

interface LowStockAlertsProps {
  items: LowStockItem[]
}

interface TopServicesProps {
  services: TopService[]
}

function getStatusDot(status: string) {
  switch (status?.toLowerCase()) {
    case "completed": return "bg-green-500"
    case "in service": return "bg-amber-400"
    case "confirmed": return "bg-blue-400"
    case "checked in": return "bg-purple-400"
    case "cancelled": return "bg-red-400"
    default: return "bg-muted-foreground/40"
  }
}

export function TodaysAppointments({ appointments }: TodaysAppointmentsProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
          Today's schedule
        </h3>
        <span className="text-[12px] text-slate-500 cursor-pointer hover:underline">View All</span>
      </div>
      
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
          <span>No appointments today</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-slate-800 border-b border-slate-100">
                <th className="py-2 font-semibold">Name</th>
                <th className="py-2 font-semibold">Service</th>
                <th className="py-2 font-semibold">Employee</th>
                <th className="py-2 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map((appt) => (
                <tr key={appt.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-slate-500">{appt.clientName}</td>
                  <td className="py-3 text-slate-500 truncate max-w-[120px] pr-2">{appt.services?.join(", ") || "—"}</td>
                  <td className="py-3 text-slate-500">{appt.staff || "Any"}</td>
                  <td className="py-3 text-slate-500">{appt.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return null // Rendered inside StatCard directly now based on the new design
}

export function TopServices({ services }: TopServicesProps) {
  const maxCount = services.length > 0 ? Math.max(...services.map((s) => s.count)) : 1

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          Top Services
        </h3>
        <select className="text-[12px] text-slate-500 border border-slate-200 rounded-md px-2 py-1 bg-transparent">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
          <span>No data this period</span>
        </div>
      ) : (
        <div className="space-y-4">
          {services.slice(0, 4).map((service, i) => (
            <div key={service.name}>
              <div className="flex items-center justify-between text-[12px] mb-1.5 text-slate-500">
                <span className="truncate pr-2">{service.name}</span>
                <span className="shrink-0">{service.count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(service.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
