import * as XLSX from 'xlsx'
import { normalizeRow } from './drug-normalizer'
import type { DrugRecord } from '@/types/drug'

export function parseBuffer(buffer: Buffer): DrugRecord[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', codepage: 65001 })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
    raw: false,
  })

  return rows.map(normalizeRow)
}
