import type { DrugRecord, DrugFilters, DrugSearchParams, DrugSearchResult } from '@/types/drug'

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(t => t.length > 1)
}

function matchesText(row: DrugRecord, tokens: string[]): boolean {
  const haystack = `${row.packageName} ${row.genericName}`.toLowerCase()
  return tokens.every(token => haystack.includes(token))
}

function matchesFormulary(row: DrugRecord, formulary: DrugFilters['formulary']): boolean {
  if (!formulary || formulary.length === 0) return true
  return formulary.some(f => {
    if (f === 'thiqa') return row.thiqaFormulary
    if (f === 'basic') return row.basicFormulary
    if (f === 'abm1') return row.abm1Formulary
    if (f === 'abm7') return row.abm7Formulary
    return false
  })
}

export function filterAndPaginate(
  rows: DrugRecord[],
  params: DrugSearchParams
): DrugSearchResult {
  const start = Date.now()
  const {
    q,
    formulary,
    dosageForm,
    dispenseMode,
    minPrice,
    maxPrice,
    manufacturer,
    agent,
    status,
    page = 1,
    pageSize = 50,
    sortBy = 'packageName',
    sortDir = 'asc',
  } = params

  const tokens = q ? tokenize(q) : []
  const manufacturerTokens = manufacturer ? tokenize(manufacturer) : []
  const agentTokens = agent ? tokenize(agent) : []

  let filtered = rows.filter(row => {
    if (tokens.length > 0 && !matchesText(row, tokens)) return false
    if (!matchesFormulary(row, formulary)) return false
    if (dosageForm && row.dosageForm !== dosageForm) return false
    if (dispenseMode && row.dispenseModeNormalized !== dispenseMode) return false
    if (minPrice !== undefined && minPrice !== null) {
      if ((row.unitPricePublic ?? Infinity) < minPrice) return false
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      if ((row.unitPricePublic ?? 0) > maxPrice) return false
    }
    if (manufacturerTokens.length > 0) {
      const hay = row.manufacturerName.toLowerCase()
      if (!manufacturerTokens.every(t => hay.includes(t))) return false
    }
    if (agentTokens.length > 0) {
      const hay = row.agentName.toLowerCase()
      if (!agentTokens.every(t => hay.includes(t))) return false
    }
    if (status && status.length > 0) {
      if (!status.includes(row.status as 'Active' | 'Deleted' | 'Grace')) return false
    }
    return true
  })

  // Sort
  filtered.sort((a, b) => {
    const aVal = a[sortBy as keyof DrugRecord]
    const bVal = b[sortBy as keyof DrugRecord]
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    const cmp = aStr.localeCompare(bStr)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const offset = (page - 1) * pageSize
  const data = filtered.slice(offset, offset + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    queryTimeMs: Date.now() - start,
  }
}

export function getTopMatches(rows: DrugRecord[], query: string, limit = 100): DrugRecord[] {
  if (!query.trim()) return rows.slice(0, limit)
  const tokens = tokenize(query)
  return rows.filter(row => matchesText(row, tokens)).slice(0, limit)
}
