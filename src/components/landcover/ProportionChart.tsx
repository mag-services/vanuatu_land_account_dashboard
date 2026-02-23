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
      <Card>
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

  const options: Highcharts.Options = {
    chart: { type: 'pie', height: 380 },
    title: { text: undefined },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        innerSize: '45%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br/>{point.percent:.1f}%',
        },
      },
    },
    tooltip: {
      formatter() {
        const p = this.point as unknown as { area?: number }
        return `<b>${this.key}</b><br/>${this.y?.toFixed(1)}%<br/>${(p.area ?? 0).toLocaleString()} sq km`
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Share',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proportion of Land Cover ({year})</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share of total land area by category (%). Hover for sq km.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[380px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
