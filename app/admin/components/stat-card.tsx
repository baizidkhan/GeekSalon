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
      "bg-white rounded-[8px] px-5 py-4 border border-[#f2f2f2] hover:border-[#0076E9] transition-colors duration-200 flex flex-col h-full",
      className
    )}>
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-[16px] font-medium text-[#666666] leading-none">{title}</h3>
        <div className={cn("w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0", iconWrapperClassName)}>
          <Icon className={cn("w-5 h-5", iconClassName)} />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[40px] font-bold text-[#333333] tracking-tight leading-[0.95] mb-1.5">
          {value}
        </div>
        {subtitle && (
          <div className="text-[12px] font-normal text-[#666666]">
            {subtitle}
          </div>
        )}
      </div>

      <div className="mt-auto pt-1">
        {trend && (
          <div className="flex items-center gap-1 text-[13px] font-medium leading-none">
            <span className={cn(
              trendUp ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend} {trendUp ? "increase" : "lower"} {trendLabel}
            </span>
            {trendUp ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500 rotate-[135deg]" />
            )}
          </div>
        )}
        {bottomContent}
      </div>
    </div>
  )
})
