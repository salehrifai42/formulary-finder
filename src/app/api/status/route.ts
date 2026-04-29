import { NextResponse } from 'next/server'
import { getStoreStatus } from '@/lib/drug-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = getStoreStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('GET /api/status error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
