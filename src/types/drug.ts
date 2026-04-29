export interface DrugRecord {
  drugCode: string
  insurancePlan: string
  packageName: string
  genericCode: string
  genericName: string
  strength: string
  dosageForm: string
  packageSize: string
  dispenseMode: string
  dispenseModeNormalized: string
  packagePricePublic: number | null
  packagePricePharmacy: number | null
  unitPricePublic: number | null
  unitPricePharmacy: number | null
  status: string
  deleteEffectiveDate: string
  lastChangeDate: string
  agentName: string
  manufacturerName: string
  insuranceCoverageGovt: string
  uppScope: string
  thiqaFormulary: boolean
  basicFormulary: boolean
  abm1Formulary: boolean
  abm7Formulary: boolean
  unitMarkup: string
  packageMarkup: string
  thiqaMaxReimbursement: number | null
  thiqaCopay: number | null
  basicCopay: number | null
  uppEffectiveDate: string
  uppUpdatedDate: string
  uppExpiryDate: string
}

export interface DrugFilters {
  q?: string
  formulary?: Array<'thiqa' | 'basic' | 'abm1' | 'abm7'>
  dosageForm?: string
  dispenseMode?: string
  minPrice?: number
  maxPrice?: number
}

export interface DrugSearchParams extends DrugFilters {
  page?: number
  pageSize?: number
  sortBy?: keyof DrugRecord
  sortDir?: 'asc' | 'desc'
}

export interface DrugSearchResult {
  data: DrugRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  queryTimeMs: number
}

export interface StoreStatus {
  source: 'bundled' | 'uploaded'
  filename?: string
  rowCount: number
  activeCount: number
  uploadedAt?: string
  releaseDate?: string
  effectiveDate?: string
}
