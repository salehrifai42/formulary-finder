import fs from 'fs'
import path from 'path'
import { parseBuffer, parseVersionInfo } from './csv-parser'
import type { DrugRecord, StoreStatus } from '@/types/drug'

interface DrugStore {
  rows: DrugRecord[]
  activeRows: DrugRecord[]
  dosageForms: string[]
  dispenseModes: string[]
  status: StoreStatus
}

// Module-level singleton — persists across requests in the same Node process
let store: DrugStore | null = null

function buildIndexes(rows: DrugRecord[]): Pick<DrugStore, 'dosageForms' | 'dispenseModes'> {
  const dosageForms = [...new Set(rows.map(r => r.dosageForm).filter(Boolean))].sort()
  const dispenseModes = [...new Set(rows.map(r => r.dispenseModeNormalized).filter(Boolean))].sort()
  return { dosageForms, dispenseModes }
}

function initStore(): DrugStore {
  const xlsxPath = path.join(process.cwd(), 'public', 'data', 'Drugs_bundled.xlsx')
  const csvPath = path.join(process.cwd(), 'public', 'data', 'Drugs_bundled.csv')
  const filePath = fs.existsSync(xlsxPath) ? xlsxPath : csvPath
  const buffer = fs.readFileSync(filePath)
  const rows = parseBuffer(buffer)
  const versionInfo = parseVersionInfo(buffer)
  const activeRows = rows.filter(r => r.status === 'Active')
  const indexes = buildIndexes(activeRows)

  return {
    rows,
    activeRows,
    ...indexes,
    status: {
      source: 'bundled',
      rowCount: rows.length,
      activeCount: activeRows.length,
      releaseDate: versionInfo.releaseDate,
      effectiveDate: versionInfo.effectiveDate,
    },
  }
}

export function getDrugStore(): DrugStore {
  if (!store) {
    store = initStore()
  }
  return store
}

export function setDrugStore(
  rows: DrugRecord[],
  filename: string,
  versionInfo?: { releaseDate?: string; effectiveDate?: string }
): void {
  const activeRows = rows.filter(r => r.status === 'Active')
  const indexes = buildIndexes(activeRows)
  store = {
    rows,
    activeRows,
    ...indexes,
    status: {
      source: 'uploaded',
      filename,
      rowCount: rows.length,
      activeCount: activeRows.length,
      uploadedAt: new Date().toISOString(),
      releaseDate: versionInfo?.releaseDate,
      effectiveDate: versionInfo?.effectiveDate,
    },
  }
}

export function getStoreStatus(): StoreStatus {
  return getDrugStore().status
}
