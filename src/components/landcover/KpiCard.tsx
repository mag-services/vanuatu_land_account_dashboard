import { Card, CardContent } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  changePercent?: number
  unit?: string
  className?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  changePercent,
  unit = 'sq km',
  className,
}: KpiCardProps) {
  const trend =
    changePercent == null
      ? null
      : changePercent > 0
        ? 'up'
        : changePercent < 0
          ? 'down'
          : 'neutral'

  return (
    <Card className={cn('border-border/60 shadow-sm', className)}>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">
            {typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 1 })
              : value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        {(subtitle != null || changePercent != null) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {changePercent != null && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  trend === 'up' && 'text-emerald-600',
                  trend === 'down' && 'text-amber-600',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && <TrendingUp className="size-3.5" />}
                {trend === 'down' && <TrendingDown className="size-3.5" />}
                {trend === 'neutral' && <Minus className="size-3.5" />}
                {changePercent > 0 ? '+' : ''}
                {changePercent.toFixed(1)}%
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
