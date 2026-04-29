'use client'

import { Database, Upload } from 'lucide-react'
import type { StoreStatus } from '@/types/drug'
import { Badge } from '@/components/ui/badge'

interface Props {
  status: StoreStatus | null
}

export function DatasetStatus({ status }: Props) {
  if (!status) return null

  const date = status.uploadedAt
    ? new Date(status.uploadedAt).toLocaleDateString('en-AE', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : null

  return (
    <div className="flex items-start gap-2 rounded-lg border bg-muted/50 px-3 py-2.5 text-sm">
      {status.source === 'uploaded' ? (
        <Upload className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium truncate">
            {status.source === 'uploaded' ? status.filename : 'Bundled formulary'}
          </span>
          <Badge variant="secondary" className="text-xs shrink-0">
            {status.activeCount.toLocaleString()} active drugs
          </Badge>
        </div>
        {date && (
          <p className="text-xs text-muted-foreground mt-0.5">Uploaded {date}</p>
        )}
        {status.source === 'bundled' && (
          <p className="text-xs text-muted-foreground mt-0.5">Upload a new file to refresh</p>
        )}
      </div>
    </div>
  )
}
