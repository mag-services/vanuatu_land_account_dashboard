import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryColor } from '@/lib/landCoverColors'
import { YEAR_COLORS } from '@/lib/landCoverColors'
import type { PhysicalItem } from '@/types/landCover'

interface PhysicalChartProps {
  physical: PhysicalItem[]
  yearView: '2020' | '2023' | 'change'
}

export const PhysicalChart = memo(function PhysicalChart({
  physical,
  yearView,
}: PhysicalChartProps) {
  if (physical.length === 0) {
    return (
      <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle>Physical Account for Land Cover</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data for selected filters.</p>
        </CardContent>
      </Card>
    )
  }

  const categories = physical.map((p) => p.category)

  const series: Highcharts.SeriesOptionsType[] = [
    {
      type: 'column',
      name: '2020',
      data: physical.map((p) => p['2020']),
      color: YEAR_COLORS['2020'],
    },
    {
      type: 'column',
      name: '2023',
      data: physical.map((p) => p['2023']),
      color: YEAR_COLORS['2023'],
    },
    {
      type: 'spline',
      name: 'Change (2023−2020)',
      data: physical.map((p) => p.change),
      color: YEAR_COLORS.change,
      yAxis: 1,
      marker: { enabled: true, radius: 3 },
    },
  ]

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories,
      labels: { rotation: -35, style: { fontSize: '11px' } },
      crosshair: true,
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: [
      {
        title: { text: 'Area (sq km)' },
        labels: { format: '{value}' },
        gridLineColor: 'rgba(0,0,0,0.06)',
        gridLineDashStyle: 'Dot',
        lineWidth: 0,
        tickWidth: 0,
      },
      {
        title: { text: 'Change (sq km)' },
        opposite: true,
        labels: { format: '{value}' },
        gridLineWidth: 0,
        lineWidth: 0,
        tickWidth: 0,
      },
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: 'rgba(0,0,0,0.08)',
      borderRadius: 8,
      shadow: true,
      formatter() {
        if (!this.points) return ''
        const idx = this.points[0]?.point.index ?? 0
        const cat = categories[idx]
        const p = physical[idx]
        const changePct =
          p['2020'] > 0
            ? (((p['2023'] - p['2020']) / p['2020']) * 100).toFixed(1)
            : '0'
        const changeSign = Number(changePct) >= 0 ? '+' : ''
        return `
          <div style="padding:4px 0">
            <b>${cat}</b><br/>
            <span style="color:#4a5568">2020:</span> ${p['2020'].toLocaleString()} sq km<br/>
            <span style="color:#3182ce">2023:</span> ${p['2023'].toLocaleString()} sq km<br/>
            <span style="margin-top:4px;display:block;font-weight:600;color:${p.change >= 0 ? '#059669' : '#dc2626'}">
              Change: ${p.change >= 0 ? '+' : ''}${p.change.toLocaleString()} sq km (${changeSign}${changePct}%)
            </span>
          </div>
        `
      },
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        borderRadius: 5,
        grouping: true,
        pointPadding: 0.1,
        groupPadding: 0.15,
      },
    },
    series,
    legend: {
      enabled: true,
      symbolRadius: 4,
      itemStyle: { fontWeight: '500' },
    },
    credits: { enabled: false },
  }

  return (
    <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Physical Account for Land Cover</CardTitle>
        <p className="text-sm text-muted-foreground">
          Land cover area by category (sq km). Grouped 2020 vs 2023 with change line.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
