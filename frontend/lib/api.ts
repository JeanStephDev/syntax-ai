/**
 * Syntax AI — Client API
 * Toutes les requêtes vers api.ai.syntax-lab.site/api/v1
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.ai.syntax-lab.site/api/v1'

class APIError extends Error {
  constructor(public status: number, message: string, public detail?: any) {
    super(message)
    this.name = 'APIError'
  }
}

async function req<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new APIError(res.status, err.detail?.message || err.detail || `HTTP ${res.status}`, err.detail)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (email: string, username: string, password: string, full_name?: string) =>
    req<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, full_name }),
    }),

  login: (email: string, password: string) =>
    req<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refresh_token: string) =>
    req<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),

  me: (token: string) => req<User>('/auth/me', {}, token),

  updateMe: (token: string, data: Partial<UserPrefs>) =>
    req<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }, token),

  // OAuth redirects — le backend gère tout
  googleUrl:  () => `${BASE}/auth/google`,
  githubUrl:  () => `${BASE}/auth/github`,
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chat = {
  completions: (token: string, body: ChatRequest) =>
    req<ChatResponse>('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
    }, token),

  // Streaming — retourne un ReadableStream
  stream: async (token: string, body: ChatRequest): Promise<ReadableStream> => {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...body, stream: true }),
    })
    if (!res.ok) throw new APIError(res.status, 'Stream error')
    return res.body!
  },
}

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = {
  list: (token: string, params?: { page?: number; mode?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.mode)   q.set('mode',   params.mode)
    if (params?.search) q.set('search', params.search)
    return req<ConversationList>(`/conversations?${q}`, {}, token)
  },

  get: (token: string, id: string) =>
    req<ConversationDetail>(`/conversations/${id}`, {}, token),

  rename: (token: string, id: string, title: string) =>
    req(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }, token),

  delete: (token: string, id: string) =>
    req(`/conversations/${id}`, { method: 'DELETE' }, token),

  deleteAll: (token: string) =>
    req('/conversations', { method: 'DELETE' }, token),

  export: async (token: string, id: string): Promise<Blob> => {
    const res = await fetch(`${BASE}/conversations/${id}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new APIError(res.status, 'Export failed')
    return res.blob()
  },
}

// ─── Models ───────────────────────────────────────────────────────────────────
export const models = {
  list:   (token: string)  => req<ModelsResponse>('/models', {}, token),
  public: ()               => req<ModelsResponse>('/models/public'),
}

// ─── API Keys ─────────────────────────────────────────────────────────────────
export const apiKeys = {
  list: (token: string) => req<APIKeysResponse>('/apikeys', {}, token),

  create: (token: string, name: string, key_type: string) =>
    req<NewKeyResponse>('/apikeys', {
      method: 'POST',
      body: JSON.stringify({ name, key_type }),
    }, token),

  revoke: (token: string, id: string) =>
    req(`/apikeys/${id}`, { method: 'DELETE' }, token),

  update: (token: string, id: string, data: { name?: string; allowed_domains?: string[] }) =>
    req(`/apikeys/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export const billing = {
  plans:        ()            => req<PlansResponse>('/billing/plans'),
  subscription: (token: string) => req('/billing/subscription', {}, token),

  checkout: (token: string, plan: string) =>
    req<{ checkout_url: string }>('/billing/checkout/session', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }, token),

  portal: (token: string) =>
    req<{ portal_url: string }>('/billing/portal', { method: 'POST' }, token),
}

// ─── Usage ────────────────────────────────────────────────────────────────────
export const usage = {
  today:   (token: string) => req<UsageToday>('/usage', {}, token),
  history: (token: string, days = 30) => req(`/usage/history?days=${days}`, {}, token),
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'starter' | 'pro' | 'team'
  auth_provider: string
  ui_language: string
  ai_language: string
  translate_enabled: boolean
  preserve_code: boolean
}
export interface UserPrefs {
  full_name: string
  ui_language: string
  ai_language: string
  translate_enabled: boolean
  preserve_code: boolean
}
export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}
export interface ChatRequest {
  mode: 'hybrid' | 'solo'
  model: string
  messages: { role: string; content: string }[]
  conversation_id?: string
  stream?: boolean
  target_language?: string
}
export interface ChatResponse {
  mode: string
  model: string
  backend?: string
  frontend?: string
  assets_docs?: string
  content?: string
  provider?: string
  total_tokens: number
  conversation_id: string
}
export interface ConversationList {
  conversations: ConversationItem[]
  total: number
  page: number
  pages: number
}
export interface ConversationItem {
  id: string
  title: string
  mode: string
  model_id: string
  preview: string
  msg_count: number
  created_at: string
  updated_at: string
}
export interface ConversationDetail extends ConversationItem {
  messages: MessageItem[]
}
export interface MessageItem {
  id: string
  role: string
  content: string
  provider: string | null
  code_role: string | null
  created_at: string
}
export interface ModelsResponse {
  accessible?: any[]
  locked?: any[]
  models?: any[]
}
export interface APIKeysResponse {
  keys: APIKeyItem[]
  plan: string
  max_keys: number
}
export interface APIKeyItem {
  id: string
  name: string
  key_preview: string
  key_type: string
  tokens_used_month: number
  monthly_token_limit: number | null
  total_requests: number
  is_active: boolean
  is_reseller: boolean
  allowed_domains: string[]
  last_used_at: string | null
  created_at: string
}
export interface NewKeyResponse {
  key: string
  id: string
  name: string
  key_type: string
  monthly_token_limit: number | null
  message: string
}
export interface PlansResponse { plans: Record<string, any> }
export interface UsageToday {
  plan: string
  today: { used: number; limit: number; remaining: number; percentage: number }
  month: { used: number }
  reset_at: string
}

export { APIError }
