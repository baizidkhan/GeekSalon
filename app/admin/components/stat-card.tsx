import { memo } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FilterOption {
  label: string
  value: string
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  className?: string
  iconClassName?: string
  href?: string
  filterOptions?: FilterOption[]
  filterValue?: string
  onFilterChange?: (value: string) => void
}

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  iconClassName,
  href,
  filterOptions,
  filterValue,
  onFilterChange,
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-5 border border-border relative overflow-hidden",
      "shadow-sm hover:shadow-md transition-all duration-200 group",
      className
    )}>
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full transition-all duration-300 group-hover:scale-125 group-hover:bg-primary/8" />

      <div className="flex items-start justify-between relative">
        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/10">
          <Icon className={cn("w-5 h-5 text-primary", iconClassName)} />
        </div>
        {filterOptions && filterOptions.length > 0 ? (
          <div className="relative">
            <select
              value={filterValue}
              onChange={(e) => onFilterChange?.(e.target.value)}
              className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase bg-muted pl-2 pr-5 py-1 rounded-full border border-border/60 cursor-pointer appearance-none focus:outline-none"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground/70 pointer-events-none" />
          </div>
        ) : (
          <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase bg-muted px-2 py-1 rounded-full border border-border/60">
            {subtitle}
          </span>
        )}
      </div>

      <p className="text-3xl font-semibold text-foreground mt-4 relative tracking-tight">
        {value}
      </p>
      <div className="flex items-center justify-between mt-1 relative">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {href && (
          <Link
            href={href}
            className="text-xs font-semibold text-primary/80 hover:text-primary px-2.5 py-1 rounded-lg bg-primary/8 hover:bg-primary/15 border border-primary/15 transition-all duration-150"
          >
            View
          </Link>
        )}
      </div>
    </div>
  )
})
