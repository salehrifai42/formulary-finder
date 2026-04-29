import OpenAI from 'openai'
import type { OpenAIModel } from '@/types/chat'

export async function streamOpenAI(
  apiKey: string,
  model: OpenAIModel,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<void> {
  const client = new OpenAI({ apiKey })

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ''
    if (text) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
      )
    }
  }
}
