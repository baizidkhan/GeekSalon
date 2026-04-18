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
    <div className={cn(
      "bg-card rounded-2xl p-5 border border-border relative overflow-hidden",
      "shadow-sm hover:shadow-md transition-all duration-200 group",
      className
    )}>
      {/* Decorative soft circle in top-right corner */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full transition-all duration-300 group-hover:scale-125 group-hover:bg-primary/8" />

      <div className="flex items-start justify-between relative">
        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/10">
          <Icon className={cn("w-5 h-5 text-primary", iconClassName)} />
        </div>
        <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase bg-muted px-2 py-1 rounded-full border border-border/60">
          {subtitle}
        </span>
      </div>

      <p className="text-3xl font-semibold text-foreground mt-4 relative tracking-tight">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1 relative font-medium">{title}</p>
    </div>
  )
}
