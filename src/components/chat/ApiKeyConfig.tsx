'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ApiKeyConfig, Provider, AIModel } from '@/types/chat'

const CLAUDE_MODELS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
]
const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
]

interface Props {
  config: ApiKeyConfig
  onProviderChange: (p: Provider) => void
  onModelChange: (m: AIModel) => void
  onApiKeyChange: (k: string) => void
}

export function ApiKeyConfig({ config, onProviderChange, onModelChange, onApiKeyChange }: Props) {
  const [showKey, setShowKey] = useState(false)
  const [expanded, setExpanded] = useState(!config.apiKey)

  const models = config.provider === 'claude' ? CLAUDE_MODELS : OPENAI_MODELS

  return (
    <div className="border-b bg-muted/30">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
          AI Configuration
          {config.apiKey && (
            <span className="text-xs text-green-600 dark:text-green-400 font-normal">● Connected</span>
          )}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Provider */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <div className="flex gap-1">
              {(['claude', 'openai'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => onProviderChange(p)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    config.provider === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground hover:bg-muted border-input'
                  )}
                >
                  {p === 'claude' ? 'Anthropic Claude' : 'OpenAI'}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Model</Label>
            <Select value={config.model} onValueChange={v => onModelChange(v as AIModel)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">API Key</Label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder={config.provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
                value={config.apiKey}
                onChange={e => onApiKeyChange(e.target.value)}
                className="pr-9 text-sm h-8 font-mono"
              />
              <button
                type="button"
                className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKey(s => !s)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Stored locally in your browser. Never sent to our servers.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
