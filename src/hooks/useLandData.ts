import { useState, useEffect, useMemo } from 'react'
import type { LandCoverData, PhysicalItem, ProportionItem, ByProvinceRow } from '@/types/landCover'

const BASE = import.meta.env.BASE_URL

export function useLandData() {
  const [data, setData] = useState<LandCoverData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`${BASE}data/land_cover.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load land_cover.json`)
        return res.json()
      })
      .then((json: LandCoverData) => {
        if (!cancelled) setData(json)
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

export interface LandFilters {
  provinces: string[]
  categories: string[]
  yearView: '2020' | '2023' | 'change'
}

const ALL_PROVINCES = 'All'
const ALL_CATEGORIES = 'All'

export function useFilteredLandData(
  data: LandCoverData | null,
  filters: LandFilters
) {
  return useMemo(() => {
    if (!data) return null

    const provinces =
      filters.provinces.length === 0 || filters.provinces.includes(ALL_PROVINCES)
        ? [...data.provinces]
        : filters.provinces
    const categories =
      filters.categories.length === 0 || filters.categories.includes(ALL_CATEGORIES)
        ? [...data.categories]
        : filters.categories

    // Filter by_province
    const filteredByProvince = data.by_province.filter(
      (r) => provinces.includes(r.province) && categories.includes(r.category)
    )

    // Aggregate physical by province filter
    const physicalByProvince = aggregatePhysicalByProvinces(
      filteredByProvince,
      data.years
    )

    // Aggregate proportions for selected year
    const year = filters.yearView === 'change' ? 2023 : Number(filters.yearView)
    const proportions = aggregateProportions(filteredByProvince, year)

    return {
      physical: physicalByProvince,
      proportions,
      by_province: filteredByProvince,
      totalArea:
        year === 2020
          ? physicalByProvince.reduce((s, p) => s + p['2020'], 0)
          : physicalByProvince.reduce((s, p) => s + p['2023'], 0),
      total2020: physicalByProvince.reduce((s, p) => s + p['2020'], 0),
      total2023: physicalByProvince.reduce((s, p) => s + p['2023'], 0),
    }
  }, [data, filters])
}

function aggregatePhysicalByProvinces(
  rows: ByProvinceRow[],
  years: number[]
): PhysicalItem[] {
  const agg = new Map<string, Record<number, number>>()
  for (const row of rows) {
    if (!agg.has(row.category)) {
      agg.set(row.category, { 2020: 0, 2023: 0 })
    }
    const cat = agg.get(row.category)!
    if (row.year === 2020) cat[2020] += row.area
    else if (row.year === 2023) cat[2023] += row.area
  }
  const categories = [...new Set(rows.map((r) => r.category))].sort()
  return categories.map((category) => {
    const d = agg.get(category) ?? { 2020: 0, 2023: 0 }
    return {
      category,
      '2020': Math.round(d[2020] * 100) / 100,
      '2023': Math.round(d[2023] * 100) / 100,
      change: Math.round((d[2023] - d[2020]) * 100) / 100,
    }
  })
}

function aggregateProportions(
  rows: ByProvinceRow[],
  year: number
): ProportionItem[] {
  const filtered = rows.filter((r) => r.year === year)
  const total = filtered.reduce((s, r) => s + r.area, 0)
  const byCat = new Map<string, number>()
  for (const r of filtered) {
    byCat.set(r.category, (byCat.get(r.category) ?? 0) + r.area)
  }
  const categories = [...new Set(filtered.map((r) => r.category))].sort()
  return categories.map((category) => {
    const area = byCat.get(category) ?? 0
    return {
      category,
      area: Math.round(area * 100) / 100,
      percent: total > 0 ? Math.round((100 * area) / total * 10) / 10 : 0,
    }
  })
}
