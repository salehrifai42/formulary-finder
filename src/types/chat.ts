export type Provider = 'claude' | 'openai'

export type ClaudeModel = 'claude-sonnet-4-6' | 'claude-haiku-4-5-20251001'
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini'
export type AIModel = ClaudeModel | OpenAIModel

export interface ApiKeyConfig {
  provider: Provider
  model: AIModel
  apiKey: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface ChatRequest {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  provider: Provider
  model: AIModel
  filters?: Record<string, unknown>
}
