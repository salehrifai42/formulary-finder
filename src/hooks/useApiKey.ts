'use client'

import { useState, useEffect } from 'react'
import type { ApiKeyConfig, Provider, AIModel } from '@/types/chat'

const STORAGE_KEY = 'formulary_api_config'

const DEFAULT_CONFIG: ApiKeyConfig = {
  provider: 'claude',
  model: 'claude-sonnet-4-6',
  apiKey: '',
}

export function useApiKey() {
  const [config, setConfig] = useState<ApiKeyConfig>(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setConfig(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const saveConfig = (updates: Partial<ApiKeyConfig>) => {
    const next = { ...config, ...updates }
    setConfig(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const setProvider = (provider: Provider) => {
    const model: AIModel = provider === 'claude' ? 'claude-sonnet-4-6' : 'gpt-4o'
    saveConfig({ provider, model })
  }

  const setModel = (model: AIModel) => saveConfig({ model })
  const setApiKey = (apiKey: string) => saveConfig({ apiKey })

  return { config, loaded, setProvider, setModel, setApiKey }
}
