import { memo, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryColor } from '@/lib/landCoverColors'
import type { ByProvinceRow } from '@/types/landCover'

interface ProvinceStackedChartProps {
  byProvince: ByProvinceRow[]
  year: 2020 | 2023
}

export const ProvinceStackedChart = memo(function ProvinceStackedChart({
  byProvince,
  year,
}: ProvinceStackedChartProps) {
  const { provinces, categories, series } = useMemo(() => {
    const filtered = byProvince.filter((r) => r.year === year)
    const provinces = [...new Set(filtered.map((r) => r.province))].sort()
    const categories = [...new Set(filtered.map((r) => r.category))].sort()
    const series = categories.map((cat) => ({
      name: cat,
      data: provinces.map(
        (prov) =>
          filtered.find((r) => r.province === prov && r.category === cat)
            ?.area ?? 0
      ),
      stack: 'province',
      color: getCategoryColor(cat),
    }))
    return { provinces, categories, series }
  }, [byProvince, year])

  if (provinces.length === 0) {
    return (
      <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle>Land Cover by Province ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data for selected filters.</p>
        </CardContent>
      </Card>
    )
  }

  const options: Highcharts.Options = {
    chart: { type: 'bar', height: 340 },
    xAxis: {
      categories: provinces,
      labels: {
        style: { fontSize: '12px', fontWeight: '500' },
        x: -8,
      },
      lineWidth: 0,
      tickWidth: 0,
      gridLineColor: 'rgba(0,0,0,0.06)',
    },
    yAxis: {
      title: { text: 'Area (sq km)' },
      gridLineColor: 'rgba(0,0,0,0.06)',
      gridLineDashStyle: 'Dot',
      lineWidth: 0,
      tickWidth: 0,
      labels: { style: { fontSize: '11px' } },
    },
    plotOptions: {
      bar: {
        stacking: 'normal',
        borderWidth: 0,
        borderRadius: 4,
        dataLabels: { enabled: false },
      },
    },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: 'rgba(0,0,0,0.08)',
      borderRadius: 8,
    },
    series: series as Highcharts.SeriesOptionsType[],
    legend: { enabled: true },
    credits: { enabled: false },
  }

  return (
    <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Land Cover by Province ({year})</CardTitle>
        <p className="text-sm text-muted-foreground">
          Stacked area (sq km) per province.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[340px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
