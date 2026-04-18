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
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground text-sm">Today&apos;s Schedule</h3>
          <p className="text-xs text-muted-foreground">{appointments.length} appointments</p>
        </div>
      </div>
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
          <Calendar className="w-8 h-8 text-muted-foreground/30" />
          <span>No appointments today</span>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((appt) => (
            <div key={appt.id} className="flex items-start gap-3 p-3 bg-secondary/40 rounded-xl border border-border/50 hover:bg-secondary/70 transition-colors">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getStatusDot(appt.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground text-sm truncate">{appt.clientName}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{appt.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {appt.services?.join(", ") || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-amber-100 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-medium text-foreground text-sm">Low Stock</h3>
          <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} need restocking</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-xs">✓</span>
          </div>
          <span>All items well stocked</span>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <span className="shrink-0 ml-3 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {item.stockQty} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopServices({ services }: TopServicesProps) {
  const maxCount = services.length > 0 ? Math.max(...services.map((s) => s.count)) : 1

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground text-sm">Top Services</h3>
          <p className="text-xs text-muted-foreground">Most popular this month</p>
        </div>
      </div>
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
          <Sparkles className="w-8 h-8 text-muted-foreground/30" />
          <span>No data this month</span>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={service.name}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-foreground font-medium truncate pr-2">{service.name}</span>
                <span className="text-muted-foreground text-xs shrink-0 font-medium">{service.count}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(service.count / maxCount) * 100}%`,
                    background: i === 0
                      ? 'oklch(0.48 0.16 8)'
                      : i === 1
                      ? 'oklch(0.60 0.11 330)'
                      : 'oklch(0.73 0.10 68)',
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
