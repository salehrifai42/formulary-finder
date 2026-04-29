'use client'

import ReactMarkdown from 'react-markdown'
import { Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { cn } from '@/lib/utils'

interface Props {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: Props) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={cn('flex gap-3', isAssistant ? 'items-start' : 'items-start flex-row-reverse')}>
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
        isAssistant
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      )}>
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
        isAssistant
          ? 'bg-muted rounded-tl-sm'
          : 'bg-primary text-primary-foreground rounded-tr-sm'
      )}>
        {isAssistant ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-table:text-xs">
            <ReactMarkdown>{message.content || (isStreaming ? '▊' : '')}</ReactMarkdown>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    </div>
  )
}
