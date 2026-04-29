'use client'

import { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { DrugFilters } from '@/types/drug'

const FORMULARY_OPTIONS = [
  { id: 'thiqa', label: 'Thiqa / ABM', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'basic', label: 'Basic', color: 'text-green-600 dark:text-green-400' },
  { id: 'abm1', label: 'ABM 1', color: 'text-purple-600 dark:text-purple-400' },
  { id: 'abm7', label: 'ABM 7', color: 'text-orange-600 dark:text-orange-400' },
] as const

const DISPENSE_MODES = ['OTC', 'Prescription', 'Controlled', 'Narcotic', 'Pharmacist Only', 'Professional Only']

interface Props {
  filters: DrugFilters
  dosageForms: string[]
  onChange: (filters: DrugFilters) => void
  onReset: () => void
}

export function SearchPanel({ filters, dosageForms, onChange, onReset }: Props) {
  const [priceRange, setPriceRange] = useState([0, 500])

  const update = (partial: Partial<DrugFilters>) => onChange({ ...filters, ...partial })

  const toggleFormulary = (val: 'thiqa' | 'basic' | 'abm1' | 'abm7') => {
    const current = filters.formulary ?? []
    const next = current.includes(val) ? current.filter(f => f !== val) : [...current, val]
    update({ formulary: next.length ? next : undefined })
  }

  const hasFilters = !!(filters.q || filters.formulary?.length || filters.dosageForm || filters.dispenseMode || filters.minPrice || filters.maxPrice)

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drugs, generics..."
          value={filters.q ?? ''}
          onChange={e => update({ q: e.target.value || undefined })}
          className="pl-8"
        />
        {filters.q && (
          <button
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => update({ q: undefined })}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="justify-start -mt-1 h-7 text-muted-foreground hover:text-foreground">
          <X className="mr-1.5 h-3.5 w-3.5" />
          Clear all filters
        </Button>
      )}

      <Separator />

      {/* Insurance coverage */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Insurance Coverage
        </Label>
        {FORMULARY_OPTIONS.map(opt => (
          <div key={opt.id} className="flex items-center gap-2">
            <Checkbox
              id={`formulary-${opt.id}`}
              checked={filters.formulary?.includes(opt.id) ?? false}
              onCheckedChange={() => toggleFormulary(opt.id)}
            />
            <label htmlFor={`formulary-${opt.id}`} className={`text-sm cursor-pointer font-medium ${opt.color}`}>
              {opt.label}
            </label>
          </div>
        ))}
      </div>

      <Separator />

      {/* Dosage Form */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Dosage Form</Label>
        <Select
          value={filters.dosageForm ?? '__all__'}
          onValueChange={(v: string | null | undefined) => update({ dosageForm: (v && v !== '__all__') ? v : undefined })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="All forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All forms</SelectItem>
            {dosageForms.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dispense Mode */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Dispense Mode</Label>
        <Select
          value={filters.dispenseMode ?? '__all__'}
          onValueChange={(v: string | null | undefined) => update({ dispenseMode: (v && v !== '__all__') ? v : undefined })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="All modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All modes</SelectItem>
            {DISPENSE_MODES.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price range */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Unit Price (AED): {priceRange[0]} – {priceRange[1] === 500 ? '500+' : priceRange[1]}
        </Label>
        <Slider
          min={0}
          max={500}
          step={5}
          value={priceRange}
          onValueChange={(val: number | readonly number[]) => {
            const arr = Array.isArray(val) ? val : [val, 500]
            const next = [arr[0] ?? 0, arr[1] ?? 500]
            setPriceRange(next)
            update({
              minPrice: next[0] > 0 ? next[0] : undefined,
              maxPrice: next[1] < 500 ? next[1] : undefined,
            })
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>AED 0</span>
          <span>AED 500+</span>
        </div>
      </div>
    </div>
  )
}
