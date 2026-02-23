import { memo, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  changePercent?: number
  unit?: string
  /** [2020, 2023] values for mini sparkline */
  sparklineData?: [number, number]
  /** Icon component (e.g. Globe, TreeDeciduous, Wheat) */
  icon?: LucideIcon
  sparklineColor?: string
  className?: string
}

function KpiSparkline({
  data,
  color = '#6366f1',
}: {
  data: [number, number]
  color?: string
}) {
  const options = useMemo<Highcharts.Options>(() => {
    const [v0, v1] = data
    const min = Math.min(v0, v1)
    const max = Math.max(v0, v1)
    const padding = max > min ? (max - min) * 0.1 : 1
    return {
      chart: {
        type: 'line',
        height: 56,
        width: 72,
        margin: [2, 2, 2, 2],
        backgroundColor: 'transparent',
        style: { overflow: 'visible' },
      },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      legend: { enabled: false },
      navigation: { buttonOptions: { enabled: false } },
      accessibility: { enabled: false },
      xAxis: {
        visible: false,
        min: 0,
        max: 1,
      },
      yAxis: {
        visible: false,
        min: min - padding,
        max: max + padding,
        startOnTick: false,
        endOnTick: false,
      },
      tooltip: { enabled: false },
      plotOptions: {
        series: {
          lineWidth: 2,
          marker: { enabled: true, radius: 2.5 },
          states: { hover: { enabled: false } },
        },
      },
      series: [
        {
          type: 'line',
          data: [v0, v1],
          color,
        },
      ],
    }
  }, [data, color])

  return (
    <div className="h-14 w-[72px] shrink-0" aria-hidden>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        immutable
        containerProps={{ style: { height: 56, width: 72 } }}
      />
    </div>
  )
}

export const KpiCard = memo(function KpiCard({
  title,
  value,
  subtitle,
  changePercent,
  unit = 'sq km',
  sparklineData,
  icon: Icon,
  sparklineColor,
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
    <Card
      className={cn(
        'border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg',
        'transition-transform duration-200 hover:scale-[1.02]',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {Icon && (
                <span className="rounded-md bg-primary/10 p-1 text-primary">
                  <Icon className="size-4" />
                </span>
              )}
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums leading-tight">
                {typeof value === 'number'
                  ? value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  : value}
              </span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
            {(subtitle != null || changePercent != null) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                {changePercent != null && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 font-semibold',
                      trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
                      trend === 'down' && 'text-red-600 dark:text-red-400',
                      trend === 'neutral' && 'text-muted-foreground'
                    )}
                  >
                    {trend === 'up' && <TrendingUp className="size-3.5" />}
                    {trend === 'down' && (
                      <TrendingDown className="size-3.5" />
                    )}
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
          </div>
          {sparklineData != null && (
            <KpiSparkline
              data={sparklineData}
              color={sparklineColor}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
})
