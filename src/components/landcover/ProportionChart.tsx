import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryColor } from '@/lib/landCoverColors'
import type { ProportionItem } from '@/types/landCover'

interface ProportionChartProps {
  proportions: ProportionItem[]
  year: 2020 | 2023
}

export const ProportionChart = memo(function ProportionChart({
  proportions,
  year,
}: ProportionChartProps) {
  if (proportions.length === 0) {
    return (
      <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle>Proportion of Land Cover ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data for selected filters.</p>
        </CardContent>
      </Card>
    )
  }

  const data = proportions.map((p) => ({
    name: p.category,
    y: p.percent,
    area: p.area,
  }))
  const totalArea = proportions.reduce((s, p) => s + p.area, 0)
  const totalFormatted = totalArea.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })

  const centerLabel = { totalFormatted, year }

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: 380,
      animation: true,
      events: {
        load(this: Highcharts.Chart) {
          const chart = this
          const series = chart.series[0] as Highcharts.SeriesPieOptions
          if (!series?.center) return
          const info = (chart.options.chart as unknown as { _centerLabel?: { totalFormatted: string; year: number } })._centerLabel ?? centerLabel
          let label = (chart as unknown as { _centerLabelEl?: Highcharts.SVGElement })._centerLabelEl
          if (!label) {
            label = chart.renderer
              .label(
                `<div style="text-align:center;line-height:1.3">Total ${info.year}<br/><strong style="font-size:17px;color:#6366f1">${info.totalFormatted}</strong><br/><span style="font-size:10px;color:#64748b">sq km</span></div>`,
                0,
                0,
                'rect',
                0.5,
                0.5,
                true
              )
              .attr({ zIndex: 7 })
              .add()
            ;(chart as unknown as { _centerLabelEl?: Highcharts.SVGElement })._centerLabelEl = label
          }
          const [cx, cy] = series.center
          const x = chart.plotLeft + cx - (label.getBBox().width / 2)
          const y = chart.plotTop + cy - (label.getBBox().height / 2)
          label.attr({ x, y })
        },
        redraw(this: Highcharts.Chart) {
          const chart = this
          const series = chart.series[0] as Highcharts.SeriesPieOptions
          const label = (chart as unknown as { _centerLabelEl?: Highcharts.SVGElement })._centerLabelEl
          if (series?.center && label) {
            const [cx, cy] = series.center
            const x = chart.plotLeft + cx - (label.getBBox().width / 2)
            const y = chart.plotTop + cy - (label.getBBox().height / 2)
            label.attr({ x, y })
          }
        },
      },
    } as Highcharts.ChartOptions,
    title: { text: undefined },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        innerSize: '55%',
        animation: { duration: 600 },
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
          style: { fontSize: '11px' },
        },
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.9)',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: 'rgba(0,0,0,0.08)',
      borderRadius: 8,
      formatter() {
        const p = this.point as unknown as { area?: number }
        return `<b>${this.key}</b><br/>${this.y?.toFixed(1)}%<br/>${(p.area ?? 0).toLocaleString()} sq km`
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Share',
        center: ['50%', '50%'],
        size: '90%',
        data: data.map((d) => ({
          name: d.name,
          y: d.y,
          area: d.area,
          color: getCategoryColor(d.name),
        })),
      },
    ],
    credits: { enabled: false },
  }

  // Pass center label data to chart (used in load/redraw)
  ;(options.chart as Highcharts.ChartOptions & { _centerLabel?: typeof centerLabel })._centerLabel = centerLabel

  return (
    <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Proportion of Land Cover ({year})</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share of total land area by category (%). Hover for sq km.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[380px]">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            key={`${year}-${totalFormatted}`}
          />
        </div>
      </CardContent>
    </Card>
  )
})
