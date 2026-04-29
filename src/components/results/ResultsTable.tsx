'use client'

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type VisibilityState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useState, useRef } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Columns3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function price(v: number | null) {
  return v !== null ? `AED ${v.toFixed(2)}` : '—'
}

// Columns in original sheet order
const ALL_COLUMNS = [
  columnHelper.accessor('drugCode', {
    id: 'drugCode',
    header: 'Drug Code',
    cell: info => <span className="font-mono text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('insurancePlan', {
    id: 'insurancePlan',
    header: 'Insurance Plan',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('packageName', {
    id: 'packageName',
    header: 'Package Name',
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('genericCode', {
    id: 'genericCode',
    header: 'Generic Code',
    cell: info => <span className="font-mono text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('genericName', {
    id: 'genericName',
    header: 'Generic Name',
    cell: info => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('strength', {
    id: 'strength',
    header: 'Strength',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('dosageForm', {
    id: 'dosageForm',
    header: 'Dosage Form',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('packageSize', {
    id: 'packageSize',
    header: 'Package Size',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('dispenseModeNormalized', {
    id: 'dispenseModeNormalized',
    header: 'Dispense Mode',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('packagePricePublic', {
    id: 'packagePricePublic',
    header: 'Package Price (Public)',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('packagePricePharmacy', {
    id: 'packagePricePharmacy',
    header: 'Package Price (Pharmacy)',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('unitPricePublic', {
    id: 'unitPricePublic',
    header: 'Unit Price (Public)',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('unitPricePharmacy', {
    id: 'unitPricePharmacy',
    header: 'Unit Price (Pharmacy)',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
    cell: info => info.getValue() || '—',
  }),
  columnHelper.accessor('deleteEffectiveDate', {
    id: 'deleteEffectiveDate',
    header: 'Delete Effective Date',
    cell: info => <span className="text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('lastChangeDate', {
    id: 'lastChangeDate',
    header: 'Last Change Date',
    cell: info => <span className="text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('agentName', {
    id: 'agentName',
    header: 'Agent Name',
    cell: info => <span className="text-muted-foreground text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('manufacturerName', {
    id: 'manufacturerName',
    header: 'Manufacturer Name',
    cell: info => <span className="text-muted-foreground text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.display({
    id: 'coverage',
    header: 'Coverage',
    cell: info => <CoverageBadges drug={info.row.original} />,
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('thiqaMaxReimbursement', {
    id: 'thiqaMaxReimbursement',
    header: 'Thiqa Max. Reimbursement',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('thiqaCopay', {
    id: 'thiqaCopay',
    header: 'Thiqa Co-pay',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('basicCopay', {
    id: 'basicCopay',
    header: 'Basic Co-pay',
    cell: info => price(info.getValue()),
  }),
  columnHelper.accessor('uppEffectiveDate', {
    id: 'uppEffectiveDate',
    header: 'UPP Effective Date',
    cell: info => <span className="text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('uppUpdatedDate', {
    id: 'uppUpdatedDate',
    header: 'UPP Updated Date',
    cell: info => <span className="text-xs">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('uppExpiryDate', {
    id: 'uppExpiryDate',
    header: 'UPP Expiry Date',
    cell: info => <span className="text-xs">{info.getValue() || '—'}</span>,
  }),
]

// Columns visible by default
const DEFAULT_VISIBILITY: VisibilityState = {
  drugCode: false,
  insurancePlan: false,
  packageName: true,
  genericCode: false,
  genericName: true,
  strength: true,
  dosageForm: true,
  packageSize: false,
  dispenseModeNormalized: true,
  packagePricePublic: true,
  packagePricePharmacy: false,
  unitPricePublic: true,
  unitPricePharmacy: false,
  status: false,
  deleteEffectiveDate: false,
  lastChangeDate: false,
  agentName: false,
  manufacturerName: false,
  coverage: true,
  thiqaMaxReimbursement: false,
  thiqaCopay: false,
  basicCopay: false,
  uppEffectiveDate: false,
  uppUpdatedDate: false,
  uppExpiryDate: false,
}

// Columns that support server-side sort
const SORTABLE = new Set([
  'packageName', 'genericName', 'strength', 'dosageForm', 'dispenseModeNormalized',
  'packagePricePublic', 'unitPricePublic', 'packagePricePharmacy', 'unitPricePharmacy',
  'status', 'lastChangeDate', 'agentName', 'manufacturerName',
])

// Columns that don't get a filter input
const NO_FILTER = new Set(['coverage', 'drugCode', 'genericCode', 'insurancePlan'])

// Numeric columns — filter as "≥ value"
const NUMERIC_COLS = new Set([
  'packagePricePublic', 'packagePricePharmacy', 'unitPricePublic', 'unitPricePharmacy',
  'thiqaMaxReimbursement', 'thiqaCopay', 'basicCopay',
])

// Categorical columns — filter via select
const CATEGORICAL: Record<string, string[]> = {
  dispenseModeNormalized: ['OTC', 'Prescription', 'Controlled', 'Narcotic', 'Pharmacist Only', 'Professional Only'],
  status: ['Active', 'Deleted', 'Grace'],
}

function SortIcon({ col, sortBy, sortDir }: { col: string; sortBy: string; sortDir: string }) {
  if (sortBy !== col) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-30 shrink-0" />
  return sortDir === 'asc'
    ? <ChevronUp className="ml-1 h-3 w-3 shrink-0 text-primary" />
    : <ChevronDown className="ml-1 h-3 w-3 shrink-0 text-primary" />
}

function ColumnFilterInput({
  colId,
  value,
  onChange,
}: {
  colId: string
  value: string
  onChange: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  if (NO_FILTER.has(colId)) return <div className="h-6" />

  if (CATEGORICAL[colId]) {
    return (
      <Select value={value || null} onValueChange={(v: string | null) => onChange((v && v !== '__clear__') ? v : '')}>
        <SelectTrigger className="h-6 text-xs px-1.5 border-0 bg-muted/50 focus:ring-0 min-w-0 w-full">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__clear__">All</SelectItem>
          {CATEGORICAL[colId].map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (NUMERIC_COLS.has(colId)) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="number"
          placeholder="≥ AED"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-6 text-xs px-1.5 border-0 bg-muted/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none pr-5 w-full min-w-0"
        />
        {value && (
          <button onClick={() => onChange('')} className="absolute right-1 top-1 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder="Filter..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-6 text-xs px-1.5 border-0 bg-muted/50 pr-5 w-full min-w-0"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-1 top-1 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export function ResultsTable({ result, loading, page, onPageChange, onSortChange, sortBy, sortDir }: Props) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Get filter value for a column
  const getFilter = (id: string) =>
    (columnFilters.find(f => f.id === id)?.value as string) ?? ''

  const setFilter = (id: string, value: string) => {
    setColumnFilters(prev => {
      const without = prev.filter(f => f.id !== id)
      return value ? [...without, { id, value }] : without
    })
  }

  const clearAllFilters = () => setColumnFilters([])
  const hasColumnFilters = columnFilters.length > 0

  const table = useReactTable({
    data: result?.data ?? [],
    columns: ALL_COLUMNS,
    state: { columnVisibility, columnFilters },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    filterFns: {
      // numeric: filter rows where value >= filter
      numericGte: (row, columnId, filterValue) => {
        const v = row.getValue<number | null>(columnId)
        if (v === null) return false
        return v >= Number(filterValue)
      },
    },
  })

  // Apply numeric filter function to numeric columns
  ALL_COLUMNS.forEach(col => {
    const id = col.id
    if (id && NUMERIC_COLS.has(id)) {
      const column = table.getColumn(id)
      if (column) column.columnDef.filterFn = 'numericGte' as never
    }
  })

  const visibleColumnCount = table.getVisibleLeafColumns().length
  const filteredRows = table.getFilteredRowModel().rows

  const exportCSV = () => {
    if (!result?.data.length) return
    const visibleCols = table.getVisibleLeafColumns()
    const rows = filteredRows.length > 0 ? filteredRows.map(r => r.original) : result.data
    const headers = visibleCols.map(c => String(c.columnDef.header ?? c.id))
    const csvRows = rows.map(d =>
      visibleCols.map(col => {
        if (col.id === 'coverage') {
          return [d.thiqaFormulary ? 'Thiqa' : '', d.basicFormulary ? 'Basic' : '', d.abm1Formulary ? 'ABM1' : '', d.abm7Formulary ? 'ABM7' : ''].filter(Boolean).join('+')
        }
        const v = d[col.id as keyof DrugRecord]
        return v ?? ''
      })
    )
    const csv = [headers, ...csvRows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'formulary-results.csv'
    a.click()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Searching...' : result ? (
              hasColumnFilters ? (
                <>
                  <span className="font-medium text-foreground">{filteredRows.length}</span>
                  <span> of {result.data.length} on this page</span>
                  <span className="text-xs"> · {result.total.toLocaleString()} total matched</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">{result.total.toLocaleString()}</span> drugs found
                </>
              )
            ) : ''}
          </p>
          {hasColumnFilters && (
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={clearAllFilters}>
              <X className="mr-1 h-3 w-3" /> Clear column filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <Columns3 className="mr-1.5 h-3.5 w-3.5" />
              Columns
              <span className="ml-1 text-xs text-muted-foreground">({visibleColumnCount})</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              {ALL_COLUMNS.map(col => {
                const column = table.getColumn(col.id!)
                if (!column) return null
                return (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={v => column.toggleVisibility(!!v)}
                  >
                    {String(col.header ?? col.id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!result?.data.length}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {/* Sort row */}
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map(header => {
                  const colId = header.column.id
                  const isSortable = SORTABLE.has(colId)
                  return (
                    <TableHead
                      key={header.id}
                      className={`whitespace-nowrap align-bottom pb-1 ${isSortable ? 'cursor-pointer select-none' : ''}`}
                      onClick={isSortable ? () => {
                        onSortChange(colId, sortBy === colId && sortDir === 'asc' ? 'desc' : 'asc')
                      } : undefined}
                    >
                      <div className="flex items-center gap-0.5 text-xs font-medium">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && <SortIcon col={colId} sortBy={sortBy} sortDir={sortDir} />}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
            {/* Filter row */}
            <TableRow className="hover:bg-transparent border-t-0">
              {table.getVisibleLeafColumns().map(column => (
                <TableHead key={`filter-${column.id}`} className="py-1 px-2">
                  <ColumnFilterInput
                    colId={column.id}
                    value={getFilter(column.id)}
                    onChange={v => setFilter(column.id, v)}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: visibleColumnCount }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse w-full min-w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="h-24 text-center text-muted-foreground">
                  {hasColumnFilters ? 'No rows match the column filters.' : 'No drugs found. Try adjusting your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(row => (
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

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {result.totalPages}
            {hasColumnFilters && ` · ${filteredRows.length} visible`}
          </span>
          <Button variant="outline" size="sm" disabled={page === result.totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
