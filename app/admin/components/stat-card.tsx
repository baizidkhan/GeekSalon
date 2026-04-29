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
      "bg-white rounded-xl p-5 border border-slate-200 flex flex-col justify-between",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[15px] font-medium text-slate-700">{title}</h3>
        <div className={cn("p-2 rounded-lg flex items-center justify-center", iconWrapperClassName)}>
          <Icon className={cn("w-4 h-4", iconClassName)} />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-[13px] text-slate-500 mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </div>

      <div className="mt-auto">
        {trend && (
          <div className="flex items-center gap-1.5 text-[13px] font-medium">
            <span className={cn(
              "flex items-center",
              trendUp ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend} {trendUp ? "Increase" : "lower"}
            </span>
            <span className="text-slate-500">{trendLabel}</span>
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 ml-auto" />
            )}
          </div>
        )}
        {bottomContent && (
          <div className="mt-1">
            {bottomContent}
          </div>
        )}
      </div>
    </div>
  )
})
