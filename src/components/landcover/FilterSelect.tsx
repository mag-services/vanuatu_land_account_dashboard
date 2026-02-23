import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface FilterSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  allLabel?: string
  placeholder?: string
  className?: string
}

export function FilterSelect({
  label,
  options,
  selected,
  onChange,
  allLabel = 'All',
  placeholder = 'Select...',
  className,
}: FilterSelectProps) {
  const [open, setOpen] = React.useState(false)
  const allOptions = [allLabel, ...options]
  const isAll =
    selected.length === 0 || selected.includes(allLabel)

  const handleToggle = (opt: string) => {
    if (opt === allLabel) {
      onChange([])
      return
    }
    if (isAll) {
      onChange([opt])
    } else {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
      onChange(next.length === options.length ? [] : next)
    }
  }

  const displayText =
    isAll
      ? allLabel
      : selected.length === 0
        ? placeholder
        : `${selected.length} selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-1">
          {allOptions.map((opt) => {
            const checked =
              opt === allLabel ? isAll : selected.includes(opt)
            return (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(opt)}
                />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
