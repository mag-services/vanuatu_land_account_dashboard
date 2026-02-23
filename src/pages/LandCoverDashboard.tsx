import { useState, useMemo } from 'react'
import { useLandData, useFilteredLandData, type LandFilters } from '@/hooks/useLandData'
import { Filters } from '@/components/landcover/Filters'
import { KpiCard } from '@/components/landcover/KpiCard'
import { PhysicalChart } from '@/components/landcover/PhysicalChart'
import { ProportionChart } from '@/components/landcover/ProportionChart'
import { ProvinceStackedChart } from '@/components/landcover/ProvinceStackedChart'
import { ProvinceMap } from '@/components/landcover/ProvinceMap'
import { LandCoverDataTable } from '@/components/landcover/LandCoverDataTable'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
    <div className="space-y-6">
      <Filters
        provinces={data.provinces}
        categories={data.categories}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Land Area"
          value={filtered?.totalArea ?? 0}
          unit="sq km"
          subtitle={yearForProportion === 2023 ? '2023' : '2020'}
        />
        <KpiCard
          title="Overall Change"
          value={`${overallChangePercent >= 0 ? '+' : ''}${overallChangePercent.toFixed(1)}%`}
          subtitle="2020 → 2023"
        />
        <KpiCard
          title="Dense Forest (2023)"
          value={denseForestItem?.['2023'] ?? 0}
          changePercent={denseForestChange ?? undefined}
          unit="sq km"
        />
        <KpiCard
          title="Agriculture (2023)"
          value={agricultureItem?.['2023'] ?? 0}
          changePercent={agricultureChange ?? undefined}
          unit="sq km"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PhysicalChart
          physical={filtered?.physical ?? []}
          yearView={filters.yearView}
        />
        <ProportionChart
          proportions={filtered?.proportions ?? []}
          year={yearForProportion}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProvinceStackedChart
          byProvince={filtered?.by_province ?? []}
          year={2023}
        />
        <ProvinceMap byProvince={filtered?.by_province ?? []} />
      </section>

      <section>
        <Card>
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
