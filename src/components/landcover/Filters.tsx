import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FilterSelect } from './FilterSelect'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LandFilters } from '@/hooks/useLandData'

interface FiltersProps {
  provinces: string[]
  categories: string[]
  filters: LandFilters
  onFiltersChange: (f: LandFilters) => void
}

const YEAR_VIEW_OPTIONS = [
  { value: '2020' as const, label: '2020' },
  { value: '2023' as const, label: '2023' },
  { value: 'change' as const, label: 'Change (2023−2020)' },
]

function FilterContent({
  provinces,
  categories,
  filters,
  onFiltersChange,
  className,
}: FiltersProps & { className?: string }) {
  const handleReset = () => {
    onFiltersChange({
      provinces: [],
      categories: [],
      yearView: 'change',
    })
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="min-w-[140px] flex-1 sm:max-w-[180px]">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Provinces
        </label>
        <FilterSelect
          options={provinces}
          selected={filters.provinces}
          onChange={(p) =>
            onFiltersChange({ ...filters, provinces: p })
          }
          allLabel="All"
        />
      </div>
      <div className="min-w-[140px] flex-1 sm:max-w-[220px]">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Land cover categories
        </label>
        <FilterSelect
          options={categories}
          selected={filters.categories}
          onChange={(c) =>
            onFiltersChange({ ...filters, categories: c })
          }
          allLabel="All"
        />
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Year / change
          </label>
          <Tabs
            value={filters.yearView}
            onValueChange={(v) =>
              onFiltersChange({
                ...filters,
                yearView: v as LandFilters['yearView'],
              })
            }
          >
            <TabsList className="h-9">
              {YEAR_VIEW_OPTIONS.map((o) => (
                <TabsTrigger key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-1.5"
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}

export function Filters({
  provinces,
  categories,
  filters,
  onFiltersChange,
}: FiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = () => {
      if (mq.matches) setSheetOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <>
      {/* Mobile: FAB icon only */}
      <button
        onClick={() => setSheetOpen(true)}
        className={cn(
          'fixed bottom-0 right-0 z-[1100] flex size-14 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 md:hidden'
        )}
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))', right: 'max(1.5rem, env(safe-area-inset-right, 0px))' }}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="size-6" strokeWidth={2} />
      </button>

      {/* Mobile: Sheet with filters */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] rounded-t-2xl border-white/20 dark:border-gray-700/30 bg-white/75 dark:bg-gray-900/65 backdrop-blur-md pb-8 md:hidden transition-[transform] duration-300 ease-out data-[state=closed]:duration-200"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/60 pb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Filter by provinces, land cover categories, and year.
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto py-4">
            <FilterContent
              provinces={provinces}
              categories={categories}
              filters={filters}
              onFiltersChange={onFiltersChange}
              className="[&_button]:min-h-[44px] [&_[role=combobox]]:min-h-[44px] md:[&_button]:min-h-0 md:[&_[role=combobox]]:min-h-0"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: floating bar at bottom */}
      <div className="fixed bottom-0 left-1/2 z-[1100] hidden -translate-x-1/2 md:block">
        <div className="w-fit rounded-t-xl border border-b-0 border-white/20 dark:border-gray-700/30 bg-white/75 dark:bg-gray-900/65 px-4 py-3 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-center">
            <FilterContent
              provinces={provinces}
              categories={categories}
              filters={filters}
              onFiltersChange={onFiltersChange}
              className="!flex-row !flex-wrap !items-end !justify-center !gap-3"
            />
          </div>
        </div>
      </div>
    </>
  )
}
