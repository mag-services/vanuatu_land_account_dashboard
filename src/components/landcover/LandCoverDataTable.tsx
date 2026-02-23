import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowUpDown, Download } from 'lucide-react'
import type { ByProvinceRow } from '@/types/landCover'

const PAGE_SIZE = 15

export function LandCoverDataTable({ data }: { data: ByProvinceRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'province', desc: false },
  ])

  const columns: ColumnDef<ByProvinceRow>[] = [
    {
      accessorKey: 'province',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Province
          <ArrowUpDown className="size-4" />
        </button>
      ),
    },
    {
      accessorKey: 'year',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Year
          <ArrowUpDown className="size-4" />
        </button>
      ),
      cell: ({ getValue }) => getValue<number>(),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Land cover type
          <ArrowUpDown className="size-4" />
        </button>
      ),
    },
    {
      accessorKey: 'area',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Area (sq km)
          <ArrowUpDown className="size-4" />
        </button>
      ),
      cell: ({ getValue }) =>
        getValue<number>().toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      meta: { className: 'text-right tabular-nums' },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      pagination: { pageSize: PAGE_SIZE, pageIndex: 0 },
    },
  })

  const totalRows = data.length
  const pageCount = table.getPageCount()
  const { pageIndex } = table.getState().pagination
  const from = pageIndex * PAGE_SIZE + 1
  const to = Math.min((pageIndex + 1) * PAGE_SIZE, totalRows)

  const exportCsv = () => {
    const header = 'Province,Year,Land cover type,Area (sq km)'
    const rows = data
      .map((r) => `${r.province},${r.year},${r.category},${r.area.toFixed(2)}`)
      .join('\n')
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vanuatu-land-cover.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detailed Data</h3>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { className?: string } | undefined
                  return (
                    <TableHead key={header.id} className={meta?.className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined
                    return (
                      <TableCell key={cell.id} className={meta?.className}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalRows > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {totalRows}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
