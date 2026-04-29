import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeModel } from '@/types/chat'

export async function streamClaude(
  apiKey: string,
  model: ClaudeModel,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<void> {
  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
      )
    }
  }
}
