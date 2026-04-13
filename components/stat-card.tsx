import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div className={cn("bg-card rounded-xl p-5 border border-border", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className={cn("w-5 h-5 text-muted-foreground", iconClassName)} />
      </div>
      <p className="text-3xl font-semibold text-foreground mt-2">{value}</p>
      <p className="text-xs text-muted-foreground uppercase mt-1">{subtitle}</p>
    </div>
  )
}
