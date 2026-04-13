import { Calendar, AlertTriangle, Layers } from "lucide-react"

const lowStockItems = [
  { name: "Shampoo - Professional", category: "Hair Products", left: 3 },
  { name: "Nail Polish Set", category: "Nail Products", left: 2 },
]

const topServices = [
  { name: "Haircut - Men", count: 2, color: "bg-primary" },
  { name: "Haircut - Women", count: 1, color: "bg-primary" },
  { name: "Hair Spa", count: 1, color: "bg-destructive" },
  { name: "Facial - Basic", count: 1, color: "bg-primary" },
  { name: "Threading - Eyebrow", count: 1, color: "bg-primary" },
]

export function TodaysAppointments() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Today&apos;s Appointments</h3>
      </div>
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No appointments today
      </div>
    </div>
  )
}

export function LowStockAlerts() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Low Stock Alerts</h3>
      </div>
      <div className="space-y-3">
        {lowStockItems.map((item) => (
          <div
            key={item.name}
            className="p-3 bg-secondary/50 rounded-lg"
          >
            <p className="font-medium text-foreground text-sm">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.category} &middot; {item.left} left
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TopServices() {
  const maxCount = Math.max(...topServices.map((s) => s.count))

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Top Services</h3>
      </div>
      <div className="space-y-3">
        {topServices.map((service) => (
          <div key={service.name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-foreground">{service.name}</span>
              <span className="text-muted-foreground">{service.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${service.color} rounded-full transition-all`}
                style={{ width: `${(service.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
