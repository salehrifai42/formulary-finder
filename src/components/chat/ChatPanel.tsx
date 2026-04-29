'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Trash2, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ApiKeyConfig } from './ApiKeyConfig'
import { ChatMessage } from './ChatMessage'
import { useChat } from '@/hooks/useChat'
import { useApiKey } from '@/hooks/useApiKey'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'What antihypertensives are covered by Thiqa?',
  'Show me OTC painkillers with prices',
  'What antibiotics are in the Basic formulary?',
  'List statins covered by ABM 1',
]

export function ChatPanel() {
  const { config, loaded, setProvider, setModel, setApiKey } = useApiKey()
  const { messages, streaming, error, sendMessage, clearMessages } = useChat(config)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleSend = async () => {
    if (!input.trim() || streaming) return
    const msg = input
    setInput('')
    await sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!loaded) return null

  return (
    <div className="flex h-full flex-col">
      <ApiKeyConfig
        config={config}
        onProviderChange={setProvider}
        onModelChange={setModel}
        onApiKeyChange={setApiKey}
      />

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Ask about the Abu Dhabi formulary</p>
              <p className="text-xs text-muted-foreground mt-1">Coverage, pricing, drug classes, co-pays</p>
            </div>
            {config.apiKey && (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs text-left rounded-lg border bg-muted/50 px-3 py-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {!config.apiKey && (
              <p className="text-xs text-muted-foreground">Configure your API key above to start chatting.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t px-4 py-3">
        {messages.length > 0 && (
          <Button
            variant="ghost" size="sm"
            className="mb-2 h-6 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearMessages}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Clear chat
          </Button>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.apiKey ? 'Ask about drugs, prices, coverage...' : 'Add API key to start chatting'}
            disabled={!config.apiKey || streaming}
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              'max-h-32 overflow-y-auto'
            )}
            style={{ minHeight: '38px' }}
          />
          <Button
            size="icon"
            className="h-[38px] w-[38px] shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || !config.apiKey || streaming}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
