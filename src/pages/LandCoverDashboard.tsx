import { lazy, Suspense, useState, useMemo } from 'react'
import { Globe, TrendingUp, TreeDeciduous, Wheat } from 'lucide-react'
import { useLandData, useFilteredLandData, type LandFilters } from '@/hooks/useLandData'
import { Filters } from '@/components/landcover/Filters'
import { KpiCard } from '@/components/landcover/KpiCard'
import { LAND_COVER_COLORS } from '@/lib/landCoverColors'
import { LandCoverDataTable } from '@/components/landcover/LandCoverDataTable'
import { ChartSkeleton } from '@/components/landcover/ChartSkeleton'
import { MapSkeleton } from '@/components/landcover/MapSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const PhysicalChart = lazy(() =>
  import('@/components/landcover/PhysicalChart').then((m) => ({ default: m.PhysicalChart }))
)
const ProportionChart = lazy(() =>
  import('@/components/landcover/ProportionChart').then((m) => ({ default: m.ProportionChart }))
)
const ProvinceStackedChart = lazy(() =>
  import('@/components/landcover/ProvinceStackedChart').then((m) => ({ default: m.ProvinceStackedChart }))
)
const ProvinceMap = lazy(() =>
  import('@/components/landcover/ProvinceMap').then((m) => ({ default: m.ProvinceMap }))
)

const DEFAULT_FILTERS: LandFilters = {
  provinces: [],
  categories: [],
  yearView: 'change',
}

export function LandCoverDashboard() {
  const { data, loading, error } = useLandData()
  const [filters, setFilters] = useState<LandFilters>(DEFAULT_FILTERS)
  const filtered = useFilteredLandData(data, filters)

  const yearForProportion = filters.yearView === 'change' ? 2023 : Number(filters.yearView) as 2020 | 2023

  const denseForestItem = useMemo(() => {
    if (!filtered?.physical) return null
    return filtered.physical.find((p) => p.category === 'Dense Forest')
  }, [filtered])

  const agricultureItem = useMemo(() => {
    if (!filtered?.physical) return null
    return filtered.physical.find((p) => p.category === 'Agriculture')
  }, [filtered])

  const denseForestChange =
    denseForestItem && denseForestItem['2020'] > 0
      ? ((denseForestItem['2023'] - denseForestItem['2020']) / denseForestItem['2020']) * 100
      : null
  const agricultureChange =
    agricultureItem && agricultureItem['2020'] > 0
      ? ((agricultureItem['2023'] - agricultureItem['2020']) / agricultureItem['2020']) * 100
      : null

  const overallChangePercent =
    filtered && filtered.total2020 > 0
      ? ((filtered.total2023 - filtered.total2020) / filtered.total2020) * 100
      : 0

  const summaryText = useMemo(() => {
    if ((denseForestChange == null || denseForestChange === 0) && (agricultureChange == null || agricultureChange === 0))
      return null
    const parts: string[] = []
    if (denseForestChange != null && denseForestChange !== 0) {
      const dir = denseForestChange > 0 ? 'increased' : 'decreased'
      parts.push(`Dense forest ${dir} ${Math.abs(denseForestChange).toFixed(1)}% nationally`)
    }
    if (agricultureChange != null && agricultureChange !== 0) {
      const dir = agricultureChange > 0 ? 'increased' : 'decreased'
      parts.push(`Agriculture ${dir} ${Math.abs(agricultureChange).toFixed(1)}%`)
    }
    return parts.length > 0 ? parts.join('; ') + '.' : null
  }, [denseForestChange, agricultureChange])

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-28" role="main" aria-label="Land cover dashboard">
      <Filters
        provinces={data.provinces}
        categories={data.categories}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {summaryText && (
        <section
          className="rounded-xl border border-white/20 dark:border-gray-700/30 bg-white/60 dark:bg-gray-900/50 px-4 py-3 text-sm text-muted-foreground backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <strong className="text-foreground">Summary:</strong> {summaryText}
        </section>
      )}

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
        aria-label="Key performance indicators"
      >
        <KpiCard
          title={`Total Land Area (${yearForProportion})`}
          value={filtered?.totalArea ?? 0}
          unit="sq km"
          subtitle={filters.yearView === 'change' ? '2020 → 2023' : undefined}
          icon={Globe}
          sparklineData={
            filtered
              ? [filtered.total2020, filtered.total2023]
              : undefined
          }
        />
        <KpiCard
          title="Overall Change"
          value={`${overallChangePercent >= 0 ? '+' : ''}${overallChangePercent.toFixed(1)}%`}
          subtitle="2020 → 2023"
          unit=""
          changePercent={overallChangePercent}
          icon={TrendingUp}
          sparklineData={
            filtered
              ? [filtered.total2020, filtered.total2023]
              : undefined
          }
        />
        <KpiCard
          title="Dense Forest (2023)"
          value={denseForestItem?.['2023'] ?? 0}
          changePercent={denseForestChange ?? undefined}
          unit="sq km"
          icon={TreeDeciduous}
          sparklineData={
            denseForestItem
              ? [denseForestItem['2020'], denseForestItem['2023']]
              : undefined
          }
          sparklineColor={LAND_COVER_COLORS['Dense Forest']}
        />
        <KpiCard
          title="Agriculture (2023)"
          value={agricultureItem?.['2023'] ?? 0}
          changePercent={agricultureChange ?? undefined}
          unit="sq km"
          icon={Wheat}
          sparklineData={
            agricultureItem
              ? [agricultureItem['2020'], agricultureItem['2023']]
              : undefined
          }
          sparklineColor={LAND_COVER_COLORS['Agriculture']}
        />
      </section>

      <section
        className="grid gap-6 lg:grid-cols-2"
        aria-label="Land cover charts"
      >
        <Suspense fallback={<ChartSkeleton />}>
          <PhysicalChart
            physical={filtered?.physical ?? []}
            yearView={filters.yearView}
          />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <ProportionChart
            proportions={filtered?.proportions ?? []}
            year={yearForProportion}
          />
        </Suspense>
      </section>

      <section
        className="grid gap-6 lg:grid-cols-2"
        aria-label="Province breakdown and map"
      >
        <Suspense fallback={<ChartSkeleton />}>
          <ProvinceStackedChart
            byProvince={filtered?.by_province ?? []}
            year={2023}
          />
        </Suspense>
        <Suspense fallback={<MapSkeleton />}>
          <ProvinceMap byProvince={filtered?.by_province ?? []} />
        </Suspense>
      </section>

      <section>
        <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue="table">
              <TabsList>
                <TabsTrigger value="table">Data Table</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="mt-4">
                <LandCoverDataTable data={filtered?.by_province ?? []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
