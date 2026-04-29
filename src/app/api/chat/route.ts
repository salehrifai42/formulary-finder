import { NextRequest } from 'next/server'
import { getDrugStore } from '@/lib/drug-store'
import { getTopMatches } from '@/lib/drug-search'
import { buildSystemPrompt } from '@/lib/ai-context'
import { streamClaude } from '@/lib/claude-client'
import { streamOpenAI } from '@/lib/openai-client'
import type { ChatRequest } from '@/types/chat'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key provided.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: ChatRequest
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { message, history, provider, model } = body

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const store = getDrugStore()
  const matchingDrugs = getTopMatches(store.activeRows, message, 100)
  const systemPrompt = buildSystemPrompt(matchingDrugs)

  const messages = [
    ...history,
    { role: 'user' as const, content: message },
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (provider === 'claude') {
          await streamClaude(apiKey, model as import('@/types/chat').ClaudeModel, systemPrompt, messages, controller, encoder)
        } else if (provider === 'openai') {
          await streamOpenAI(apiKey, model as import('@/types/chat').OpenAIModel, systemPrompt, messages, controller, encoder)
        } else {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Unknown provider.' })}\n\n`))
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Streaming error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
