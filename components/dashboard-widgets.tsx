import { Calendar, AlertTriangle, Layers } from "lucide-react"
import type { DashboardAppointment, LowStockItem, TopService } from "@/lib/api"

interface TodaysAppointmentsProps {
  appointments: DashboardAppointment[]
}

interface LowStockAlertsProps {
  items: LowStockItem[]
}

interface TopServicesProps {
  services: TopService[]
}

export function TodaysAppointments({ appointments }: TodaysAppointmentsProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Today&apos;s Appointments</h3>
      </div>
      {appointments.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No appointments today
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground text-sm">{appt.clientName}</p>
                <span className="text-xs text-muted-foreground">{appt.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {appt.services?.join(", ") || "—"} &middot; {appt.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Low Stock Alerts</h3>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          All items are well stocked
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-3 bg-secondary/50 rounded-lg">
              <p className="font-medium text-foreground text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.category} &middot; {item.stockQty} left
              </p>
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
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Top Services</h3>
      </div>
      {services.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No service data this month
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground">{service.name}</span>
                <span className="text-muted-foreground">{service.count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(service.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
