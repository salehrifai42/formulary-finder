'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Columns3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

// Default visible columns — key ones on first load
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

const SORTABLE = ['packageName', 'genericName', 'unitPricePublic', 'packagePricePublic', 'unitPricePharmacy', 'lastChangeDate']


function SortIcon({ col, sortBy, sortDir }: { col: string; sortBy: string; sortDir: string }) {
  if (sortBy !== col) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp className="ml-1 h-3 w-3" />
    : <ChevronDown className="ml-1 h-3 w-3" />
}

export function ResultsTable({ result, loading, page, onPageChange, onSortChange, sortBy, sortDir }: Props) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY)

  const table = useReactTable({
    data: result?.data ?? [],
    columns: ALL_COLUMNS,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  const visibleColumnCount = table.getVisibleLeafColumns().length

  const exportCSV = () => {
    if (!result?.data.length) return
    const visibleCols = table.getVisibleLeafColumns()
    const headers = visibleCols.map(c => String(c.columnDef.header ?? c.id))
    const rows = result.data.map(d =>
      visibleCols.map(col => {
        if (col.id === 'coverage') {
          return [
            d.thiqaFormulary ? 'Thiqa' : '',
            d.basicFormulary ? 'Basic' : '',
            d.abm1Formulary ? 'ABM1' : '',
            d.abm7Formulary ? 'ABM7' : '',
          ].filter(Boolean).join('+')
        }
        const v = d[col.id as keyof DrugRecord]
        return v ?? ''
      })
    )
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'formulary-results.csv'
    a.click()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Searching...' : result ? (
            <>
              Showing{' '}
              <span className="font-medium text-foreground">
                {((page - 1) * result.pageSize) + 1}–{Math.min(page * result.pageSize, result.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-foreground">{result.total.toLocaleString()}</span>
              {' '}drugs · {result.queryTimeMs}ms
            </>
          ) : ''}
        </p>
        <div className="flex items-center gap-2">
          {/* Column toggle */}
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
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => {
                  const colId = header.column.id
                  const isSortable = SORTABLE.includes(colId)
                  return (
                    <TableHead
                      key={header.id}
                      className={`whitespace-nowrap ${isSortable ? 'cursor-pointer select-none' : ''}`}
                      onClick={isSortable ? () => {
                        onSortChange(colId, sortBy === colId && sortDir === 'asc' ? 'desc' : 'asc')
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
                  {Array.from({ length: visibleColumnCount }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse w-full min-w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="h-24 text-center text-muted-foreground">
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

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === result.totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
