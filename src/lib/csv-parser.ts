import * as XLSX from 'xlsx'
import { normalizeRow } from './drug-normalizer'
import type { DrugRecord } from '@/types/drug'

export function parseBuffer(buffer: Buffer): DrugRecord[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', codepage: 65001 })

  // The official DOH/HAAD XLSX has a "Version" sheet + a "Drugs" sheet.
  // Fall back to first sheet for plain CSV uploads.
  const sheetName =
    workbook.SheetNames.find(n => n.toLowerCase() === 'drugs') ??
    workbook.SheetNames[0]

  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
    raw: false,
  })

  return rows.map(normalizeRow)
}

export function parseVersionInfo(buffer: Buffer): { releaseDate?: string; effectiveDate?: string } {
  const workbook = XLSX.read(buffer, { type: 'buffer', codepage: 65001 })
  const versionSheet = workbook.Sheets['Version']
  if (!versionSheet) return {}

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(versionSheet, {
    defval: '',
    raw: false,
  })

  if (!rows[0]) return {}
  return {
    releaseDate: rows[0]['Release Date'],
    effectiveDate: rows[0]['Effective Date'],
  }
}
