'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from './api'

function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return
  document.cookie = `syntax-access-token=${token}; path=/; max-age=3600; SameSite=Lax`
}
function clearAuthCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'syntax-access-token=; path=/; max-age=0'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  setAuth: (user: User, access: string, refresh: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      setAuth: (user, accessToken, refreshToken) => {
        setAuthCookie(accessToken)
        set({ user, accessToken, refreshToken })
      },
      setUser: (user) => set({ user }),
      clearAuth: () => { clearAuthCookie(); set({ user: null, accessToken: null, refreshToken: null }) },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'syntax-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
)

export type ChatMode = 'hybrid' | 'solo'
export type SoloModel = 'claude-haiku' | 'claude-sonnet' | 'claude-opus' | 'gpt-4o-mini' | 'gpt-4o' | 'gemini-flash' | 'gemini-pro'
export type HybridModel = 'syntax-free-1' | 'syntax-starter-1' | 'syntax-pro-1' | 'syntax-team-1'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  backend?: string
  frontend?: string
  assets_docs?: string
  provider?: string
  mode?: string
  model?: string
  tokens?: number
  time: string
  streaming?: boolean
}

interface ChatState {
  mode: ChatMode
  hybridModel: HybridModel
  soloModel: SoloModel
  messages: Message[]
  convId: string | null
  typing: boolean
  activeTab: 'backend' | 'frontend' | 'docs'
  setMode: (m: ChatMode) => void
  setHybridModel: (m: HybridModel) => void
  setSoloModel: (m: SoloModel) => void
  addMessage: (m: Message) => void
  updateMessage: (id: string, patch: Partial<Message>) => void
  setTyping: (v: boolean) => void
  setConvId: (id: string | null) => void
  setActiveTab: (t: 'backend' | 'frontend' | 'docs') => void
  resetChat: () => void
}

export const useChatStore = create<ChatState>()((set) => ({
  mode: 'hybrid',
  hybridModel: 'syntax-free-1',
  soloModel: 'claude-sonnet',
  messages: [],
  convId: null,
  typing: false,
  activeTab: 'backend',
  setMode: (mode) => set({ mode }),
  setHybridModel: (hybridModel) => set({ hybridModel }),
  setSoloModel: (soloModel) => set({ soloModel }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateMessage: (id, patch) => set((s) => ({ messages: s.messages.map((m) => m.id === id ? { ...m, ...patch } : m) })),
  setTyping: (typing) => set({ typing }),
  setConvId: (convId) => set({ convId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  resetChat: () => set({ messages: [], convId: null, typing: false }),
}))

interface ThemeState {
  dark: boolean
  toggle: () => void
  set: (v: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => {
        const next = !s.dark
        if (typeof document !== 'undefined')
          document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
        return { dark: next }
      }),
      set: (dark) => {
        if (typeof document !== 'undefined')
          document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        set({ dark })
      },
    }),
    { name: 'syntax-theme' }
  )
)
