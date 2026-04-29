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

interface UploadMeta {
  filename: string
  uploadedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const META_PATH = path.join(DATA_DIR, 'upload-meta.json')

export function getUploadedFilePath(): string | null {
  for (const ext of ['xlsx', 'xls', 'csv']) {
    const p = path.join(DATA_DIR, `uploaded.${ext}`)
    if (fs.existsSync(p)) return p
  }
  return null
}

export function saveUploadedFile(buffer: Buffer, ext: string): void {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  // Remove any previous uploaded file
  for (const e of ['xlsx', 'xls', 'csv']) {
    const p = path.join(DATA_DIR, `uploaded.${e}`)
    if (fs.existsSync(p)) fs.unlinkSync(p)
  }
  fs.writeFileSync(path.join(DATA_DIR, `uploaded.${ext}`), buffer)
}

export function saveUploadMeta(meta: UploadMeta): void {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(META_PATH, JSON.stringify(meta))
}

function readUploadMeta(): UploadMeta | null {
  try {
    return JSON.parse(fs.readFileSync(META_PATH, 'utf8')) as UploadMeta
  } catch {
    return null
  }
}

// Module-level singleton — persists across requests in the same Node process
let store: DrugStore | null = null

function buildIndexes(rows: DrugRecord[]): Pick<DrugStore, 'dosageForms' | 'dispenseModes'> {
  const dosageForms = [...new Set(rows.map(r => r.dosageForm).filter(Boolean))].sort()
  const dispenseModes = [...new Set(rows.map(r => r.dispenseModeNormalized).filter(Boolean))].sort()
  return { dosageForms, dispenseModes }
}

function initStore(): DrugStore {
  // Prefer a previously uploaded file over the bundled dataset
  const uploadedPath = getUploadedFilePath()
  const bundledXlsx = path.join(process.cwd(), 'public', 'data', 'Drugs_bundled.xlsx')
  const bundledCsv = path.join(process.cwd(), 'public', 'data', 'Drugs_bundled.csv')
  const filePath = uploadedPath ?? (fs.existsSync(bundledXlsx) ? bundledXlsx : bundledCsv)
  const isUploaded = filePath === uploadedPath

  const buffer = fs.readFileSync(filePath)
  const rows = parseBuffer(buffer)
  const versionInfo = parseVersionInfo(buffer)
  const activeRows = rows.filter(r => r.status === 'Active')
  const indexes = buildIndexes(activeRows)

  const meta = isUploaded ? readUploadMeta() : null

  return {
    rows,
    activeRows,
    ...indexes,
    status: {
      source: isUploaded ? 'uploaded' : 'bundled',
      filename: meta?.filename,
      rowCount: rows.length,
      activeCount: activeRows.length,
      uploadedAt: meta?.uploadedAt,
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
  versionInfo?: { releaseDate?: string; effectiveDate?: string; uploadedAt?: string }
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
      uploadedAt: versionInfo?.uploadedAt ?? new Date().toISOString(),
      releaseDate: versionInfo?.releaseDate,
      effectiveDate: versionInfo?.effectiveDate,
    },
  }
}

export function getStoreStatus(): StoreStatus {
  return getDrugStore().status
}
