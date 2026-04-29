'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Pill, Menu, Upload as UploadIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { SearchPanel } from '@/components/search/SearchPanel'
import { ResultsTable } from '@/components/results/ResultsTable'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { FileUploadZone } from '@/components/upload/FileUploadZone'
import { DatasetStatus } from '@/components/upload/DatasetStatus'
import { useDataset } from '@/hooks/useDataset'
import { useDrugSearch } from '@/hooks/useDrugSearch'
import type { DrugFilters } from '@/types/drug'
import { toast } from 'sonner'

const DEFAULT_FILTERS: DrugFilters = {}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export default function Home() {
  const [filters, setFilters] = useState<DrugFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('packageName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false)
  const [dosageForms, setDosageForms] = useState<string[]>([])

  const { status, uploading, error: uploadError, uploadFile } = useDataset()
  const { data: result, loading } = useDrugSearch(filters, page, 50, { sortBy, sortDir })

  // Load dosage forms once on mount from a large sample
  useEffect(() => {
    fetch('/api/drugs?pageSize=200&page=1')
      .then(r => r.json())
      .then(data => {
        if (data?.data) {
          const forms = [...new Set<string>(
            data.data.map((d: import('@/types/drug').DrugRecord) => d.dosageForm).filter(Boolean)
          )].sort()
          setDosageForms(forms)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiltersChange = (f: DrugFilters) => {
    setFilters(f)
    setPage(1)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const handleSortChange = (col: string, dir: 'asc' | 'desc') => {
    setSortBy(col)
    setSortDir(dir)
    setPage(1)
  }

  const handleUpload = async (file: File) => {
    const ok = await uploadFile(file)
    if (ok) {
      toast.success('Dataset updated successfully')
      setUploadSheetOpen(false)
      setPage(1)
    } else if (uploadError) {
      toast.error(uploadError)
    }
    return ok
  }

  const SearchSidebar = (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <DatasetStatus status={status} />
      <SearchPanel
        filters={filters}
        dosageForms={dosageForms}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 gap-4">
        <div className="flex items-center gap-2.5">
          {/* Mobile sidebar trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              {SearchSidebar}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Pill className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">Formulary Finder</h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Abu Dhabi Drug Formulary</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Upload trigger */}
          <Sheet open={uploadSheetOpen} onOpenChange={setUploadSheetOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
              <UploadIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Update Dataset</span>
            </SheetTrigger>
            <SheetContent side="top" className="max-w-lg mx-auto rounded-b-xl">
              <div className="pt-2 pb-4 space-y-4">
                <div>
                  <h2 className="text-base font-semibold">Update Drug Dataset</h2>
                  <p className="text-sm text-muted-foreground mt-1">Upload the latest weekly CSV or XLSX from HAAD/DOH.</p>
                </div>
                <FileUploadZone onUpload={handleUpload} uploading={uploading} error={uploadError} />
                <DatasetStatus status={status} />
              </div>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar (desktop) */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r overflow-hidden">
          {SearchSidebar}
        </aside>

        {/* Results panel */}
        <main className="flex-1 overflow-auto p-4">
          <ResultsTable
            result={result ?? null}
            loading={loading}
            page={page}
            onPageChange={setPage}
            onSortChange={handleSortChange}
            sortBy={sortBy}
            sortDir={sortDir}
          />
        </main>

        {/* Chat panel (desktop) */}
        <aside className="hidden xl:flex w-96 shrink-0 flex-col border-l overflow-hidden">
          <ChatPanel />
        </aside>
      </div>

      {/* Mobile chat button */}
      <div className="xl:hidden fixed bottom-4 right-4 z-50">
        <Sheet>
          <SheetTrigger render={<Button size="icon" className="h-12 w-12 rounded-full shadow-lg" />}>
            <Pill className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
            <ChatPanel />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
