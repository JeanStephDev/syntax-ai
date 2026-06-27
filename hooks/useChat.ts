'use client'

import { useCallback } from 'react'
import { useAuthStore, useChatStore, type Message } from '@/lib/store'
import { chat as chatApi, APIError } from '@/lib/api'

export function useChat() {
  const token       = useAuthStore((s) => s.accessToken)
  const chatStore   = useChatStore()

  const sendMessage = useCallback(async (content: string) => {
    if (!token || !content.trim()) return

    // Ajouter le message user
    const userMsg: Message = {
      id:    crypto.randomUUID(),
      role:  'user',
      content,
      time:  now(),
    }
    chatStore.addMessage(userMsg)
    chatStore.setTyping(true)

    // Préparer l'historique
    const history = chatStore.messages
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }))

    const model = chatStore.mode === 'hybrid'
      ? chatStore.hybridModel
      : chatStore.soloModel

    try {
      // Créer un message assistant en streaming
      const assistantId = crypto.randomUUID()
      chatStore.addMessage({
        id:       assistantId,
        role:     'assistant',
        content:  '',
        mode:     chatStore.mode,
        model,
        time:     now(),
        streaming: true,
      })

      const stream = await chatApi.stream(token, {
        mode:            chatStore.mode,
        model,
        messages:        [...history, { role: 'user', content }],
        conversation_id: chatStore.convId || undefined,
        stream:          true,
      })

      const reader  = stream.getReader()
      const decoder = new TextDecoder()

      let backend  = ''
      let frontend = ''
      let docs     = ''
      let soloContent = ''
      let convId   = chatStore.convId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.done) {
              convId = data.conversation_id
              chatStore.setConvId(convId)
              continue
            }

            if (data.error) {
              chatStore.updateMessage(assistantId, {
                content:  `Erreur : ${data.error}`,
                streaming: false,
              })
              continue
            }

            // Chunk de streaming
            if (data.content && !data.is_final) {
              if (data.role === 'backend')     backend    += data.content
              else if (data.role === 'frontend')  frontend   += data.content
              else if (data.role === 'assets_docs') docs     += data.content
              else if (data.role === 'solo')    soloContent += data.content

              // Mettre à jour en live
              if (chatStore.mode === 'hybrid') {
                chatStore.updateMessage(assistantId, {
                  backend,
                  frontend,
                  assets_docs: docs,
                  content: backend || frontend || docs,
                })
              } else {
                chatStore.updateMessage(assistantId, { content: soloContent })
              }
            }

            // Traduction reçue post-stream
            if (data.translated) {
              if (chatStore.mode === 'hybrid') {
                chatStore.updateMessage(assistantId, {
                  backend:     data.backend,
                  frontend:    data.frontend,
                  assets_docs: data.docs,
                })
              } else {
                chatStore.updateMessage(assistantId, { content: data.content })
              }
            }
          } catch {}
        }
      }

      // Finaliser
      chatStore.updateMessage(assistantId, { streaming: false })

    } catch (err) {
      const msg = err instanceof APIError
        ? handleAPIError(err)
        : 'Une erreur est survenue.'

      chatStore.addMessage({
        id:    crypto.randomUUID(),
        role:  'assistant',
        content: msg,
        time:  now(),
      })
    } finally {
      chatStore.setTyping(false)
    }
  }, [token, chatStore])

  return { sendMessage }
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function handleAPIError(err: APIError): string {
  if (err.status === 401) return '🔒 Session expirée. Reconnectez-vous.'
  if (err.status === 403) {
    const d = err.detail
    if (d?.error === 'mode_not_allowed')  return `🔒 Le mode Solo nécessite le plan Starter. [Mettre à niveau](https://ai.syntax-lab.site/settings?tab=plan)`
    if (d?.error === 'model_not_allowed') return `🔒 Ce modèle nécessite le plan ${d.required_plan}. [Mettre à niveau](https://ai.syntax-lab.site/settings?tab=plan)`
    return '🔒 Accès refusé.'
  }
  if (err.status === 429) {
    const d = err.detail
    if (d?.error === 'daily_quota_exceeded') return `⚠️ Quota journalier atteint (${(d.tokens_limit/1000).toFixed(0)}K tokens). Reset à minuit UTC.`
    if (d?.error === 'rate_limit_exceeded')  return `⚠️ Trop de requêtes. Réessayez dans ${d.retry_after}s.`
    return '⚠️ Limite atteinte.'
  }
  return `Erreur : ${err.message}`
}
