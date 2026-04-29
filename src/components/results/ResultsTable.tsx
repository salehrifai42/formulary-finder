'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CoverageBadges } from './CoverageBadge'
import type { DrugRecord, DrugSearchResult } from '@/types/drug'

interface Props {
  result: DrugSearchResult | null
  loading: boolean
  page: number
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string, sortDir: 'asc' | 'desc') => void
  sortBy: string
  sortDir: 'asc' | 'desc'
}

const columnHelper = createColumnHelper<DrugRecord>()

const columns = [
  columnHelper.accessor('packageName', {
    header: 'Package Name',
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('genericName', {
    header: 'Generic Name',
    cell: info => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('strength', {
    header: 'Strength',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('dosageForm', {
    header: 'Form',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('dispenseModeNormalized', {
    header: 'Dispense',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('unitPricePublic', {
    header: 'Unit Price (AED)',
    cell: info => {
      const v = info.getValue()
      return v !== null ? `AED ${v.toFixed(2)}` : '—'
    },
  }),
  columnHelper.accessor('packagePricePublic', {
    header: 'Pack Price (AED)',
    cell: info => {
      const v = info.getValue()
      return v !== null ? `AED ${v.toFixed(2)}` : '—'
    },
  }),
  columnHelper.display({
    id: 'coverage',
    header: 'Coverage',
    cell: info => <CoverageBadges drug={info.row.original} />,
  }),
]

function SortIcon({ col, sortBy, sortDir }: { col: string; sortBy: string; sortDir: string }) {
  if (sortBy !== col) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp className="ml-1 h-3.5 w-3.5" />
    : <ChevronDown className="ml-1 h-3.5 w-3.5" />
}

const SORTABLE = ['packageName', 'genericName', 'unitPricePublic', 'packagePricePublic']

export function ResultsTable({ result, loading, page, onPageChange, onSortChange, sortBy, sortDir }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: result?.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  const exportCSV = () => {
    if (!result?.data.length) return
    const headers = ['Package Name', 'Generic Name', 'Strength', 'Dosage Form', 'Dispense Mode', 'Unit Price (AED)', 'Pack Price (AED)', 'Thiqa', 'Basic', 'ABM1', 'ABM7']
    const rows = result.data.map(d => [
      d.packageName, d.genericName, d.strength, d.dosageForm, d.dispenseModeNormalized,
      d.unitPricePublic ?? '', d.packagePricePublic ?? '',
      d.thiqaFormulary ? 'Yes' : 'No',
      d.basicFormulary ? 'Yes' : 'No',
      d.abm1Formulary ? 'Yes' : 'No',
      d.abm7Formulary ? 'Yes' : 'No',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formulary-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Searching...' : result ? (
            <>Showing <span className="font-medium text-foreground">{((page - 1) * (result.pageSize)) + 1}–{Math.min(page * result.pageSize, result.total)}</span> of <span className="font-medium text-foreground">{result.total.toLocaleString()}</span> drugs · {result.queryTimeMs}ms</>
          ) : ''}
        </p>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!result?.data.length}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => {
                  const colId = header.column.id
                  const isSortable = SORTABLE.includes(colId)
                  return (
                    <TableHead
                      key={header.id}
                      className={isSortable ? 'cursor-pointer select-none whitespace-nowrap' : 'whitespace-nowrap'}
                      onClick={isSortable ? () => {
                        const newDir = sortBy === colId && sortDir === 'asc' ? 'desc' : 'asc'
                        onSortChange(colId, newDir)
                      } : undefined}
                    >
                      <span className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && <SortIcon col={colId} sortBy={sortBy} sortDir={sortDir} />}
                      </span>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No drugs found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline" size="sm"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {result.totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={page === result.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
