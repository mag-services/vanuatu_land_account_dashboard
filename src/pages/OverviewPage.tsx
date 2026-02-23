import { useMemo } from 'react'
import { Clock, Scale, TrendingUp, FileText, Users, Layers, ArrowUp, ArrowDown, Info } from 'lucide-react'
import { Sparkline } from '../components/Sparkline'
import { DVSummaryCard } from '../components/DVSummaryCard'
import type { StatRow } from '../types'

function parseVal(v: string): number {
  if (!v || String(v).toLowerCase() === 'na') return 0
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
  onNavigateToMethodology?: () => void
}

const CARD_COLORS = {
  pending: '#422AFB',
  clearance: '#7551ff',
  backlog: '#6B7FFF',
  dv: '#a855f7',
  gender: '#4318FF',
  filings: '#6366f1',
  disposals: '#047857',   // emerald-700 (WCAG)
  netPending: '#0284c7',  // sky-600 (WCAG)
} as const

export function OverviewPage({ data, selectedYears, compareMode = false, getValue, onNavigateToMethodology }: Props) {
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])
  const [yearA, yearB] = compareMode && sortedYears.length >= 2 ? [sortedYears[0], sortedYears[1]] : [null, null]
  const courts = useMemo(() => [...new Set(data.map((r) => r.Court))], [data])

  // Total Pending + sparkline data
  const pendingByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'Pending' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])
  const totalPending = pendingByYear.length > 0 ? pendingByYear[pendingByYear.length - 1] : 0

  // Clearance Rate trend (avg per year)
  const clearanceByYear = useMemo(() => sortedYears.map((y) => {
    const rows = data.filter((r) => r.Metric === 'ClearanceRate' && r.Year === String(y))
    return rows.length > 0 ? rows.reduce((s, r) => s + parseVal(r.Value), 0) / rows.length : 0
  }), [sortedYears, data])
  const avgClearance = clearanceByYear.length > 0 ? clearanceByYear.reduce((a, b) => a + b, 0) / clearanceByYear.length : 0

  // Top 3 Backlog Courts (by latest year's pending)
  const latestYear = sortedYears[sortedYears.length - 1] ?? sortedYears[0]
  const pendingByCourt = useMemo(() => courts
    .map((court) => ({
      court,
      pending: getValue(court, 'Pending', latestYear) ?? data.filter((r) => r.Court === court && r.Metric === 'Pending' && r.Year === String(latestYear)).reduce((s, r) => s + parseVal(r.Value), 0),
    }))
    .filter((x) => x.pending > 0)
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 3), [courts, latestYear, getValue, data])

  // DV Trend
  const dvByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'DV_Filings' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])

  // Gender Avg
  const avgMale = useMemo(() => {
    const rows = data.filter((r) => r.Metric === 'Gender_Male')
    return rows.length > 0 ? rows.reduce((s, r) => s + parseVal(r.Value), 0) / rows.length : 0
  }, [data])
  const avgFemale = useMemo(() => {
    const rows = data.filter((r) => r.Metric === 'Gender_Female')
    return rows.length > 0 ? rows.reduce((s, r) => s + parseVal(r.Value), 0) / rows.length : 0
  }, [data])

  // Total Filings + sparkline
  const filingsByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'Filings' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])
  const totalFilings = filingsByYear.reduce((a, b) => a + b, 0)

  // Total Disposals + sparkline
  const disposalsByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'Disposals' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])
  const totalDisposals = disposalsByYear.reduce((a, b) => a + b, 0)

  // Net Pending YoY
  const pendingYoY =
    pendingByYear.length >= 2
      ? (() => {
          const prev = pendingByYear[pendingByYear.length - 2]
          const curr = pendingByYear[pendingByYear.length - 1]
          const net = curr - prev
          const pct = prev > 0 ? (100 * net) / prev : 0
          return { net, pct }
        })()
      : null

  // YoY change helper (prev, curr) -> { pct, direction }; null if flat or single year
  const yoy = (arr: number[]) =>
    arr.length >= 2
      ? (() => {
          const prev = arr[arr.length - 2]
          const curr = arr[arr.length - 1]
          const pct = prev > 0 ? (100 * (curr - prev)) / prev : (curr > prev ? 100 : 0)
          const dir = curr > prev ? 'up' : curr < prev ? 'down' : 'flat'
          return dir === 'flat' ? null : { pct, dir }
        })()
      : null

  const getValForYear = (y: number) => ({
    pending: data.filter((r) => r.Metric === 'Pending' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    clearance: (() => {
      const rows = data.filter((r) => r.Metric === 'ClearanceRate' && r.Year === String(y))
      return rows.length > 0 ? rows.reduce((s, r) => s + parseVal(r.Value), 0) / rows.length : 0
    })(),
    filings: data.filter((r) => r.Metric === 'Filings' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    disposals: data.filter((r) => r.Metric === 'Disposals' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    dv: data.filter((r) => r.Metric === 'DV_Filings' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
  })

  const cards: Array<{
    label: string
    value: string
    valueCompare?: string
    icon: typeof Clock
    color: string
    sparklineData: number[] | null
    yoy: { pct: number; dir: 'up' | 'down' } | null
    yoyGood: 'up' | 'down' | null
    subtitle?: string
  }> = [
    {
      label: 'Total Pending',
      value: totalPending.toLocaleString(),
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).pending
        const b = getValForYear(yearB).pending
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toLocaleString()} → ${yearB}: ${b.toLocaleString()} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: Clock,
      color: CARD_COLORS.pending,
      sparklineData: pendingByYear,
      yoy: yoy(pendingByYear),
      yoyGood: 'down', // lower pending is good
    },
    {
      label: 'Clearance Rate Trend',
      value: `${avgClearance.toFixed(1)}%`,
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).clearance
        const b = getValForYear(yearB).clearance
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toFixed(1)}% → ${yearB}: ${b.toFixed(1)}% (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: Scale,
      color: CARD_COLORS.clearance,
      sparklineData: clearanceByYear,
      yoy: yoy(clearanceByYear),
      yoyGood: 'up', // higher clearance is good
    },
    {
      label: 'Top 3 Backlog Courts',
      value: pendingByCourt.length > 0 ? pendingByCourt.map((x) => x.court.replace(/ Court$/, '')).join(', ') : 'N/A',
      icon: Layers,
      color: CARD_COLORS.backlog,
      sparklineData: null,
      yoy: null,
      subtitle:
        pendingByCourt.length > 0
          ? pendingByCourt.map((x) => `${x.court.replace(/ Court$/, '')}: ${x.pending.toLocaleString()}`).join(' · ')
          : undefined,
    },
    {
      label: 'Gender Balance',
      value: avgMale > 0 || avgFemale > 0 ? `${avgMale.toFixed(0)}% Male / ${avgFemale.toFixed(0)}% Female` : 'N/A',
      icon: Users,
      color: CARD_COLORS.gender,
      sparklineData: null,
      yoy: null,
    },
    {
      label: 'Total Filings',
      value: totalFilings.toLocaleString(),
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).filings
        const b = getValForYear(yearB).filings
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toLocaleString()} → ${yearB}: ${b.toLocaleString()} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: TrendingUp,
      color: CARD_COLORS.filings,
      sparklineData: filingsByYear,
      yoy: yoy(filingsByYear),
      yoyGood: null,
    },
    {
      label: 'Total Disposals',
      value: totalDisposals.toLocaleString(),
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).disposals
        const b = getValForYear(yearB).disposals
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toLocaleString()} → ${yearB}: ${b.toLocaleString()} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: TrendingUp,
      color: CARD_COLORS.disposals,
      sparklineData: disposalsByYear,
      yoy: yoy(disposalsByYear),
      yoyGood: 'up', // higher disposals is good
    },
    {
      label: 'Net Pending (YoY)',
      value:
        pendingYoY != null
          ? `${pendingYoY.net >= 0 ? '+' : ''}${pendingYoY.net.toLocaleString()} (${pendingYoY.pct >= 0 ? '+' : ''}${pendingYoY.pct.toFixed(1)}%)`
          : 'Needs 2+ years',
      icon: TrendingUp,
      color: pendingYoY?.net != null && pendingYoY.net < 0 ? '#047857' : CARD_COLORS.netPending,
      sparklineData: pendingByYear.length >= 2 ? pendingByYear : null,
      yoy: null, // already shows YoY in value
    },
  ]

  const hasDVData = dvByYear.length > 0 && dvByYear.some((v) => v > 0)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This dashboard summarizes key performance indicators from the Vanuatu Judiciary across the Court of Appeal, Supreme Court, Magistrates Court, and Island Court. Use the cards below to scan caseload (pending, filings, disposals), clearance and backlog trends, domestic violence protection orders, and gender representation. Select years and courts in the sidebar to filter the data. For detailed breakdowns, see the Pending Cases, Workload, Performance, Outcomes, and Other Metrics pages.
        </p>
        {onNavigateToMethodology && (
          <button
            type="button"
            onClick={onNavigateToMethodology}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Data notes and limitations"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            <span>See Methodology for data notes and limitations</span>
          </button>
        )}
      </div>
      {hasDVData && (
        <DVSummaryCard dvByYear={dvByYear} sortedYears={sortedYears} />
      )}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${card.color}18` }}
              >
                <card.icon className="size-6" style={{ color: card.color }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                {compareMode && card.valueCompare ? (
                  <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">{card.valueCompare}</p>
                ) : (
                  <p className="mt-0.5 truncate text-xl font-bold text-foreground">{card.value}</p>
                )}
                {card.subtitle && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-muted-foreground" title={card.subtitle}>
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
            {(card.sparklineData?.length >= 2 || card.yoy) && (
              <div className="flex shrink-0 items-center gap-1">
                {card.yoy && (
                  <span
                    title={`YoY: ${card.yoy.pct >= 0 ? '+' : ''}${card.yoy.pct.toFixed(1)}%`}
                    className={
                      card.yoyGood != null
                        ? card.yoy.dir === card.yoyGood
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                        : 'text-muted-foreground'
                    }
                  >
                    {card.yoy.dir === 'up' ? <ArrowUp className="size-3.5" strokeWidth={2.5} /> : <ArrowDown className="size-3.5" strokeWidth={2.5} />}
                  </span>
                )}
                {card.sparklineData && card.sparklineData.length >= 2 && (
                  <Sparkline data={card.sparklineData} width={80} height={36} color={card.color} strokeWidth={2} />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
