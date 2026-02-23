import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FilterSelect } from './FilterSelect'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RotateCcw } from 'lucide-react'
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

export function Filters({
  provinces,
  categories,
  filters,
  onFiltersChange,
}: FiltersProps) {
  const handleReset = () => {
    onFiltersChange({
      provinces: [],
      categories: [],
      yearView: 'change',
    })
  }

  return (
    <Card className="sticky top-0 z-10 border-border/60 bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-[160px] flex-1 lg:max-w-[200px]">
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
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
          <div className="min-w-[160px] flex-1 lg:max-w-[240px]">
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
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
      </CardContent>
    </Card>
  )
}
