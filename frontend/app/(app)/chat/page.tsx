'use client'
import { useState, useRef, useEffect } from 'react'
import { PLAN_LIMITS } from '../layout'

type ChatMode = 'hybrid' | 'claude' | 'gpt' | 'gemini'
type ActiveTab = 'backend' | 'frontend' | 'docs'

const PLAN = 'pro' as keyof typeof PLAN_LIMITS
const limits = PLAN_LIMITS[PLAN]

const HYBRID_MODELS = [
  { id: 'syntax-free-1',    name: 'Syntax Free',    plan: 'free' },
  { id: 'syntax-starter-1', name: 'Syntax Starter', plan: 'starter' },
  { id: 'syntax-pro-1',     name: 'Syntax Pro',     plan: 'pro' },
  { id: 'syntax-team-1',    name: 'Syntax Team',    plan: 'team' },
]

const SOLO_MODELS = [
  { id: 'claude', name: 'Claude', company: 'Anthropic', color: '#FF6B35', icon: '🔵', desc: 'Backend, logique, sécurité' },
  { id: 'gpt',    name: 'GPT',    company: 'OpenAI',    color: '#10A37F', icon: '🟢', desc: 'Frontend, UI, React' },
  { id: 'gemini', name: 'Gemini', company: 'Google',    color: '#4285F4', icon: '🔴', desc: 'Assets, docs, design' },
]

const STARTERS = [
  { emoji: '⚡', title: 'API complète',     desc: 'FastAPI + JWT + BDD + tests',    msg: 'Crée une API REST FastAPI complète avec authentification JWT, PostgreSQL et tests unitaires.' },
  { emoji: '📊', title: 'Dashboard React',  desc: 'Composants + charts + state',    msg: 'Crée un dashboard React avec recharts, gestion d\'état et appels API.' },
  { emoji: '🐳', title: 'Infrastructure',   desc: 'Docker + Nginx + CI/CD',         msg: 'Configure Docker Compose pour un projet full-stack avec Nginx, SSL et GitHub Actions.' },
  { emoji: '🔐', title: 'Authentification', desc: 'OAuth2 + sessions + JWT',        msg: 'Implémente OAuth2 Google et GitHub avec FastAPI et gestion des sessions JWT.' },
]

type Message = {
  id: string; role: 'user' | 'ai'; content: string; time: string;
  mode?: ChatMode; model?: string; tokens?: number;
  backend?: string; frontend?: string; docs?: string;
}

const DEMO_AI_REPLY: Omit<Message, 'id' | 'time'> = {
  role: 'ai',
  mode: 'hybrid',
  model: 'syntax-pro-1',
  tokens: 1842,
  content: 'Voici votre projet généré par les 3 IA en parallèle :',
  backend: `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI(title="Mon API", version="1.0.0")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"])

@app.post("/auth/token")
async def login(form: OAuth2Form, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Identifiants invalides")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def get_me(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return {"user_id": payload["sub"]}`,
  frontend: `import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <input type="email" value={form.email}
        onChange={e => setForm(f => ({...f, email: e.target.value}))}
        placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}`,
  docs: `# Architecture du projet

## Stack technique
- **Backend** : FastAPI 0.115 + Python 3.12
- **Base de données** : PostgreSQL 16 + SQLAlchemy (async)
- **Auth** : JWT (HS256) + bcrypt
- **Frontend** : Next.js 14 + TypeScript
- **Cache** : Redis 7

## Endpoints générés
\`\`\`
POST /auth/token    — Connexion (email + password)
GET  /me            — Profil utilisateur (JWT requis)
POST /auth/register — Créer un compte
POST /auth/logout   — Déconnexion
\`\`\`

## Variables d'environnement
\`\`\`env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
\`\`\`

## Lancer le projet
\`\`\`bash
docker compose up -d
uvicorn app.main:app --reload
\`\`\``
}

export default function ChatPage() {
  const [mode, setMode] = useState<ChatMode>('hybrid')
  const [hybridModel, setHybridModel] = useState('syntax-pro-1')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('backend')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const sendMessage = (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, time: now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      const reply: Message = {
        ...DEMO_AI_REPLY,
        id: (Date.now() + 1).toString(),
        time: now(),
        mode,
        model: mode === 'hybrid' ? hybridModel : mode,
      }
      setMessages(prev => [...prev, reply])
    }, 1800)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── TOPBAR ── */}
      <div style={{ height: 56, borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, background: 'var(--bg)' }}>

        {/* Mode selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Hybrid */}
          <button onClick={() => setMode('hybrid')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 'var(--r-pill)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: mode === 'hybrid' ? 'var(--v-500)' : 'var(--surface)',
            color: mode === 'hybrid' ? 'white' : 'var(--text-2)',
            border: mode === 'hybrid' ? 'none' : '1px solid var(--border)',
            transition: 'all var(--t) var(--ease)',
          }}>
            ⬡ Hybride
          </button>

          {/* Solo AIs */}
          {limits.solo ? (
            <div style={{ display: 'flex', gap: 4 }}>
              {SOLO_MODELS.map(ai => (
                <button key={ai.id} onClick={() => setMode(ai.id as ChatMode)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                  borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: mode === ai.id ? ai.color : 'var(--surface)',
                  color: mode === ai.id ? 'white' : 'var(--text-2)',
                  border: mode === ai.id ? 'none' : '1px solid var(--border)',
                  transition: 'all var(--t) var(--ease)',
                }}>
                  {ai.icon} {ai.name}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', border: '1px solid var(--border-soft)', fontSize: 12, color: 'var(--text-3)' }}>
              🔒 Mode Solo — Plan Starter requis
            </div>
          )}

          {/* Hybrid model picker */}
          {mode === 'hybrid' && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowModelPicker(!showModelPicker)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px',
                borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-2)', transition: 'all var(--t) var(--ease)',
              }}>
                {HYBRID_MODELS.find(m => m.id === hybridModel)?.name} ▾
              </button>
              {showModelPicker && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--shadow-lg)', zIndex: 50, minWidth: 180, overflow: 'hidden' }}>
                  {HYBRID_MODELS.map(m => {
                    const planOrder = ['free','starter','pro','team']
                    const locked = planOrder.indexOf(m.plan) > planOrder.indexOf(PLAN)
                    return (
                      <button key={m.id} onClick={() => { if (!locked) { setHybridModel(m.id); setShowModelPicker(false) } }}
                        style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: locked ? 'var(--text-3)' : 'var(--text)', background: m.id === hybridModel ? 'var(--v-50)' : 'transparent', cursor: locked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background var(--t) var(--ease)' }}>
                        {m.name}
                        {locked ? <span style={{ fontSize: 11, color: 'var(--text-3)' }}>🔒 {m.plan}</span> : m.id === hybridModel ? <span style={{ color: 'var(--v-500)' }}>✓</span> : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm">Exporter</button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {isEmpty ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40, gap: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--v-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 4 }}>⬡</div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {mode === 'hybrid' ? 'Que voulez-vous construire ?' : `Discutez avec ${SOLO_MODELS.find(m => m.id === mode)?.name}`}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 380, lineHeight: 1.65 }}>
              {mode === 'hybrid'
                ? 'Claude, GPT et Gemini vont collaborer pour vous livrer backend, frontend et documentation en une fois.'
                : `${SOLO_MODELS.find(m=>m.id===mode)?.desc}. Posez votre question directement.`}
            </p>
            {mode === 'hybrid' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, maxWidth: 500, width: '100%', marginTop: 8 }}>
                {STARTERS.map(s => (
                  <button key={s.title} onClick={() => sendMessage(s.msg)} style={{ padding: 16, borderRadius: 'var(--r)', background: 'var(--bg-2)', border: '1px solid var(--border-soft)', textAlign: 'left', cursor: 'pointer', transition: 'all var(--t) var(--ease)' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <ChatMessage key={msg.id} msg={msg} activeTab={activeTab} setActiveTab={setActiveTab} />
            ))}
            {typing && <TypingIndicator mode={mode} />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{ padding: '14px 20px 18px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '10px 10px 10px 16px', transition: 'border-color var(--t) var(--ease)', outline: 'none' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(e.target) }}
            onKeyDown={handleKey}
            placeholder={mode === 'hybrid' ? 'Décrivez votre projet...' : `Question pour ${SOLO_MODELS.find(m=>m.id===mode)?.name}...`}
            rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', resize: 'none', minHeight: 24, maxHeight: 160, lineHeight: 1.6, padding: '2px 0', fontFamily: 'inherit' }}
          />
          <button onClick={() => sendMessage()} style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() ? 'var(--v-500)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'all var(--t) var(--ease)', flexShrink: 0 }}>
            ➤
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {['en Python', 'en TypeScript', 'avec tests', 'avec Docker', 'avec documentation'].map(hint => (
            <button key={hint} onClick={() => setInput(i => i + (i ? ' ' : '') + hint)} style={{ fontSize: 11, color: 'var(--text-3)', padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'all var(--t) var(--ease)' }}>
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function ChatMessage({ msg, activeTab, setActiveTab }: { msg: Message; activeTab: ActiveTab; setActiveTab: (t: ActiveTab) => void }) {
  if (msg.role === 'user') {
    return (
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '72%' }}>
          <div style={{ background: 'var(--v-500)', color: 'white', padding: '11px 15px', borderRadius: 'var(--r) var(--r) 4px var(--r)', fontSize: 14, lineHeight: 1.6 }}>{msg.content}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right', marginTop: 4 }}>{msg.time}</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0, marginTop: 2 }}>JD</div>
      </div>
    )
  }

  const isHybrid = msg.mode === 'hybrid'
  const soloAi = SOLO_MODELS.find(m => m.id === msg.mode)

  return (
    <div style={{ display: 'flex', gap: 10, maxWidth: '90%' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: isHybrid ? 'var(--v-50)' : `${soloAi?.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isHybrid ? 16 : 14, flexShrink: 0, marginTop: 2 }}>
        {isHybrid ? '⬡' : soloAi?.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r) var(--r) var(--r) 4px', padding: 16, fontSize: 14 }}>
          <p style={{ marginBottom: isHybrid ? 14 : 0, color: 'var(--text)', lineHeight: 1.65 }}>{msg.content}</p>

          {isHybrid && (
            <>
              {/* AI Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {([['backend','🔵 Claude — Backend','#FF6B35'],['frontend','🟢 GPT — Frontend','#10A37F'],['docs','🔴 Gemini — Docs','#4285F4']] as const).map(([tab, label, color]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', transition: 'all var(--t) var(--ease)',
                    background: activeTab === tab ? `${color}14` : 'transparent',
                    border: activeTab === tab ? `1px solid ${color}44` : '1px solid transparent',
                    color,
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Code panels */}
              {activeTab === 'backend' && <CodeBlock code={msg.backend || ''} lang="python" />}
              {activeTab === 'frontend' && <CodeBlock code={msg.frontend || ''} lang="typescript" />}
              {activeTab === 'docs' && <CodeBlock code={msg.docs || ''} lang="markdown" />}
            </>
          )}

          {!isHybrid && msg.backend && <CodeBlock code={msg.backend} lang={msg.mode === 'claude' ? 'python' : msg.mode === 'gpt' ? 'typescript' : 'markdown'} />}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
          {msg.time} · {isHybrid ? HYBRID_MODELS.find(m=>m.id===msg.model)?.name || msg.model : soloAi?.name} · {msg.tokens?.toLocaleString()} tokens
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-sm)', position: 'relative', overflow: 'hidden', marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border-soft)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)' }}>{lang}</span>
        <button onClick={copy} style={{ fontSize: 11, color: copied ? '#10A37F' : 'var(--text-3)', fontWeight: 600, cursor: 'pointer', transition: 'color var(--t) var(--ease)' }}>
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
      <pre style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, lineHeight: 1.7, color: 'var(--text-2)', padding: 14, margin: 0, overflowX: 'auto', whiteSpace: 'pre' }}>
        {code}
      </pre>
    </div>
  )
}

function TypingIndicator({ mode }: { mode: ChatMode }) {
  const ai = SOLO_MODELS.find(m => m.id === mode)
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--v-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
        {mode === 'hybrid' ? '⬡' : ai?.icon}
      </div>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block', animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
          <style>{`@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const toggle = () => {
    setDark(d => !d)
    document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark')
  }
  return (
    <button onClick={toggle} className="btn-icon-round btn-ghost" style={{ fontSize: 16 }}>{dark ? '🌙' : '☀️'}</button>
  )
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
