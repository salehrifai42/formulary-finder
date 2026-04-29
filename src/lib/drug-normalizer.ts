import type { DrugRecord } from '@/types/drug'

const DISPENSE_MODE_MAP: Record<string, string> = {
  'over the counter - pharmacy': 'OTC',
  'over the counter': 'OTC',
  'otc': 'OTC',
  'prescription only medicine': 'Prescription',
  'prescription only': 'Prescription',
  'pom': 'Prescription',
  'controlled drug': 'Controlled',
  'semi-controlled drug': 'Controlled',
  'semi - controlled drug': 'Controlled',
  'narcotic drug': 'Narcotic',
  'pharmacist only medicine': 'Pharmacist Only',
  'pharmacy only': 'Pharmacist Only',
  "health care professional's only": 'Professional Only',
  'pom-r (hospital only)': 'Professional Only',
  'hospital only': 'Professional Only',
}

export function normalizeDispenseMode(raw: string): string {
  if (!raw) return 'Other'
  const key = raw.toLowerCase().trim()
  return DISPENSE_MODE_MAP[key] ?? raw
}

export function normalizeBoolean(val: string | undefined | null): boolean {
  if (!val) return false
  return val.toString().toLowerCase().trim() === 'yes'
}

export function parsePrice(val: string | number | undefined | null): number | null {
  if (val === null || val === undefined || val === '') return null
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? null : n
}

export function normalizeRow(raw: Record<string, string>): DrugRecord {
  return {
    drugCode: raw['Drug Code'] ?? '',
    insurancePlan: raw['Insurance Plan'] ?? '',
    packageName: raw['Package Name'] ?? '',
    genericCode: raw['Generic Code'] ?? '',
    genericName: raw['Generic Name'] ?? '',
    strength: raw['Strength'] ?? '',
    dosageForm: raw['Dosage Form'] ?? '',
    packageSize: raw['Package Size'] ?? '',
    dispenseMode: raw['Dispense Mode'] ?? '',
    dispenseModeNormalized: normalizeDispenseMode(raw['Dispense Mode'] ?? ''),
    packagePricePublic: parsePrice(raw['Package Price to Public']),
    packagePricePharmacy: parsePrice(raw['Package Price to Pharmacy']),
    unitPricePublic: parsePrice(raw['Unit Price to Public']),
    unitPricePharmacy: parsePrice(raw['Unit Price to Pharmacy']),
    status: raw['Status'] ?? '',
    deleteEffectiveDate: raw['Delete Effective Date'] ?? '',
    lastChangeDate: raw['Last Change Date'] ?? '',
    agentName: raw['Agent Name'] ?? '',
    manufacturerName: raw['Manufacturer Name'] ?? '',
    insuranceCoverageGovt: raw['Insurance Coverage For Government Funded Program'] ?? '',
    uppScope: raw['UPP Scope'] ?? '',
    thiqaFormulary: normalizeBoolean(raw['Included in Thiqa/ ABM - other than 1&7- Drug Formulary']),
    basicFormulary: normalizeBoolean(raw['Included In Basic Drug Formulary']),
    abm1Formulary: normalizeBoolean(raw['Included In ABM 1 Drug Formulary']),
    abm7Formulary: normalizeBoolean(raw['Included In ABM 7 Drug Formulary']),
    unitMarkup: raw['Unit Markup'] ?? '',
    packageMarkup: raw['Package Markup'] ?? '',
    thiqaMaxReimbursement: parsePrice(raw['Thiqa Max. Reimbursement Price (Package)']),
    thiqaCopay: parsePrice(raw['Thiqa co-pay amount (package)']),
    basicCopay: parsePrice(raw['Basic co-pay amount (package)']),
    uppEffectiveDate: raw['UPP Effective Date'] ?? '',
    uppUpdatedDate: raw['UPP Updated Date'] ?? '',
    uppExpiryDate: raw['UPP Expiry Date'] ?? '',
  }
}
