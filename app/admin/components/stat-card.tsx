import { memo } from "react"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number | React.ReactNode
  subtitle?: string | React.ReactNode
  icon: LucideIcon
  className?: string
  iconWrapperClassName?: string
  iconClassName?: string
  trend?: string
  trendLabel?: string
  trendUp?: boolean
  bottomContent?: React.ReactNode
}

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  iconWrapperClassName,
  iconClassName,
  trend,
  trendLabel,
  trendUp,
  bottomContent,
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">{title}</h3>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", iconWrapperClassName)}>
          <Icon className={cn("w-5 h-5", iconClassName)} />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-2">
          {value}
        </div>
        {subtitle && (
          <div className="text-[12px] font-medium">
            {subtitle}
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {trend && (
          <div className="flex items-center gap-1 text-[12px] font-bold">
            <span className={cn(
              trendUp ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend} {trendUp ? "increase" : "lower"} from {trendLabel.split('from ')[1] || trendLabel}
            </span>
            {trendUp ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500 rotate-[135deg]" />
            )}
          </div>
        )}
      </div>
    </div>
  )
})
