import { NextRequest, NextResponse } from 'next/server'
import { getDrugStore } from '@/lib/drug-store'
import { filterAndPaginate } from '@/lib/drug-search'
import type { DrugSearchParams } from '@/types/drug'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const store = getDrugStore()

    const formularyParam = searchParams.get('formulary')
    const formulary = formularyParam
      ? (formularyParam.split(',').filter(Boolean) as DrugSearchParams['formulary'])
      : undefined

    const params: DrugSearchParams = {
      q: searchParams.get('q') ?? undefined,
      formulary,
      dosageForm: searchParams.get('dosageForm') ?? undefined,
      dispenseMode: searchParams.get('dispenseMode') ?? undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 50,
      sortBy: (searchParams.get('sortBy') as DrugSearchParams['sortBy']) ?? 'packageName',
      sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') ?? 'asc',
    }

    const result = filterAndPaginate(store.activeRows, params)

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('GET /api/drugs error:', error)
    return NextResponse.json({ error: 'Failed to query drugs' }, { status: 500 })
  }
}
