import { NextRequest, NextResponse } from 'next/server'
import { parseBuffer, parseVersionInfo } from '@/lib/csv-parser'
import { setDrugStore } from '@/lib/drug-store'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 15 * 1024 * 1024 // 15MB

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 15MB.' }, { status: 413 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      return NextResponse.json({ error: 'Only CSV and XLSX files are supported.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const rows = parseBuffer(buffer)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File parsed but contained no data rows.' }, { status: 400 })
    }

    const versionInfo = parseVersionInfo(buffer)
    setDrugStore(rows, file.name, versionInfo)

    const activeCount = rows.filter(r => r.status === 'Active').length

    return NextResponse.json({
      success: true,
      filename: file.name,
      rowCount: rows.length,
      activeCount,
      uploadedAt: new Date().toISOString(),
      ...versionInfo,
    })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: 'Failed to parse file.' }, { status: 500 })
  }
}
