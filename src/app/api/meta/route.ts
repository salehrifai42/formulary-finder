import { NextResponse } from 'next/server'
import { getDrugStore } from '@/lib/drug-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const store = getDrugStore()
  return NextResponse.json({
    dosageForms: store.dosageForms,
    dispenseModes: store.dispenseModes,
  })
}
