/**
 * Land cover dashboard data types.
 * All areas in sq km.
 */
export interface LandCoverKpis {
  total_2020: number
  total_2023: number
  change_percent: number
}

export interface ProportionItem {
  category: string
  area: number
  percent: number
}

export interface PhysicalItem {
  category: string
  '2020': number
  '2023': number
  change: number
}

export interface ByProvinceRow {
  province: string
  year: number
  category: string
  area: number
}

export interface LandCoverData {
  years: number[]
  provinces: string[]
  categories: string[]
  kpis: LandCoverKpis
  proportions_2023: ProportionItem[]
  physical: PhysicalItem[]
  by_province: ByProvinceRow[]
}

export type YearView = '2020' | '2023' | 'change'
