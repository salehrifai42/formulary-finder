'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DrugSearchResult, DrugFilters } from '@/types/drug'

interface SearchOptions {
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

interface SearchState {
  data: DrugSearchResult | null
  loading: boolean
  error: string | null
}

export function useDrugSearch(filters: DrugFilters, page: number, pageSize = 50, options: SearchOptions = {}) {
  const [state, setState] = useState<SearchState>({ data: null, loading: true, error: null })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (f: DrugFilters, p: number, opts: SearchOptions) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const params = new URLSearchParams()
      if (f.q) params.set('q', f.q)
      if (f.formulary?.length) params.set('formulary', f.formulary.join(','))
      if (f.dosageForm) params.set('dosageForm', f.dosageForm)
      if (f.dispenseMode) params.set('dispenseMode', f.dispenseMode)
      if (f.minPrice !== undefined) params.set('minPrice', String(f.minPrice))
      if (f.maxPrice !== undefined) params.set('maxPrice', String(f.maxPrice))
      if (opts.sortBy) params.set('sortBy', opts.sortBy)
      if (opts.sortDir) params.set('sortDir', opts.sortDir)
      params.set('page', String(p))
      params.set('pageSize', String(pageSize))

      const res = await fetch(`/api/drugs?${params.toString()}`)
      if (!res.ok) throw new Error('Search failed')
      const data: DrugSearchResult = await res.json()
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Search failed' })
    }
  }, [pageSize])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const delay = filters.q ? 300 : 0
    debounceRef.current = setTimeout(() => {
      search(filters, page, options)
    }, delay)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, options.sortBy, options.sortDir, search])

  return state
}
