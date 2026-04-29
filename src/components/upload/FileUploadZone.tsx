'use client'

import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  onUpload: (file: File) => Promise<boolean>
  uploading: boolean
  error: string | null
}

export function FileUploadZone({ onUpload, uploading, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file: File) => {
    await onUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors cursor-pointer',
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30',
          uploading && 'pointer-events-none opacity-60'
        )}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Drop CSV / XLSX here'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">or click to browse · max 15MB</p>
        </div>
        {!uploading && (
          <Button variant="outline" size="sm" className="mt-1 pointer-events-none">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Choose file
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
