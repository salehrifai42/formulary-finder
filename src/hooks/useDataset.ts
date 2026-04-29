'use client'

import { useState, useEffect } from 'react'
import type { StoreStatus } from '@/types/drug'

export function useDataset() {
  const [status, setStatus] = useState<StoreStatus | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const uploadFile = async (file: File): Promise<boolean> => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Upload failed.')
        return false
      }
      await fetchStatus()
      return true
    } catch {
      setError('Upload failed. Please try again.')
      return false
    } finally {
      setUploading(false)
    }
  }

  return { status, uploading, error, uploadFile, refetchStatus: fetchStatus }
}
