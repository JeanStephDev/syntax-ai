'use client'
import Link from 'next/link'

const STATS = [
  { label: 'Tokens aujourd\'hui', value: '342K', sub: '17% de 2M', pct: 17, color: 'var(--v-500)' },
  { label: 'Conversations', value: '47', sub: '↑ 8 cette semaine', color: null },
  { label: 'Clés API actives', value: '3', sub: '7 disponibles', color: null },
  { label: 'Code généré', value: '~12K', sub: 'lignes ce mois', color: null },
]

const RECENT = [
  { title: 'API FastAPI avec JWT auth',        preview: 'Création d\'une API REST complète avec authentification JWT, refresh tokens et middleware de sécurité.',  model: 'Syntax Pro',     time: 'il y a 2h',  icon: '💻', mode: 'hybrid' },
  { title: 'Dashboard React recharts',          preview: 'Dashboard analytics avec graphiques en temps réel, filtres par date et export CSV.',                      model: 'Syntax Starter', time: 'hier',       icon: '📊', mode: 'hybrid' },
  { title: 'Docker Compose full-stack',         preview: 'Config Docker avec PostgreSQL, Redis, Nginx et certificats SSL automatiques.',                            model: 'Syntax Pro',     time: 'il y a 3j',  icon: '🐳', mode: 'hybrid' },
  { title: 'OAuth2 Google + GitHub (Claude)',   preview: 'Auth sociale directement avec Claude pour le backend FastAPI et gestion des sessions.',                   model: 'Claude Solo',    time: 'il y a 5j',  icon: '🔐', mode: 'claude' },
]

const MODE_COLORS: Record<string, string> = { hybrid: 'var(--v-500)', claude: '#FF6B35', gpt: '#10A37F', gemini: '#4285F4' }
const MODE_LABELS: Record<string, string> = { hybrid: '⬡ Hybride', claude: '🔵 Claude', gpt: '🟢 GPT', gemini: '🔴 Gemini' }

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Topbar */}
      <div style={{ height: 56, borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Dashboard</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <ThemeToggle />
          <Link href="/chat" className="btn btn-primary btn-sm">+ Nouveau chat</Link>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Welcome */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Bonjour, <span style={{ color: 'var(--v-500)' }}>Jean</span> 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Prêt à coder ? Vos 3 IA vous attendent.</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--r-pill)', background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ⚡ Plan Pro
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding: 20, background: 'var(--bg-2)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r)', transition: 'all var(--t) var(--ease)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 5, color: s.color || 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{s.sub}</div>
              {s.pct !== undefined && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: 'linear-gradient(90deg,var(--v-500),var(--b-500))', borderRadius: 2 }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick start banner */}
        <div style={{ background: 'linear-gradient(135deg,var(--v-600),var(--v-500))', borderRadius: 'var(--r-lg)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right,rgba(255,255,255,0.1),transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>Démarrez votre prochain projet</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 18 }}>Choisissez le mode et décrivez ce que vous voulez construire.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['⬡ Hybride', '🔵 Claude', '🟢 GPT', '🔴 Gemini'].map((m, i) => (
                <span key={m} style={{ padding: '5px 12px', borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 600, background: i === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: 'white', border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}` }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          <Link href="/chat" style={{ background: 'white', color: 'var(--v-600)', padding: '12px 24px', borderRadius: 'var(--r-pill)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            Ouvrir le chat →
          </Link>
        </div>

        {/* Recent chats */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Conversations récentes</h2>
            <Link href="/history" className="btn btn-ghost btn-sm">Voir tout →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {RECENT.map(chat => (
              <Link key={chat.title} href="/chat" style={{ padding: 16, borderRadius: 'var(--r)', background: 'var(--bg-2)', border: '1px solid var(--border-soft)', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, transition: 'all var(--t) var(--ease)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{chat.icon}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>{chat.title}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                  {chat.preview}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: MODE_COLORS[chat.mode], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {MODE_LABELS[chat.mode]}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>· {chat.model}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{chat.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  return (
    <button onClick={() => {
      const d = document.documentElement.getAttribute('data-theme') === 'dark'
      document.documentElement.setAttribute('data-theme', d ? 'light' : 'dark')
    }} style={{ width: 34, height: 34, borderRadius: 'var(--r-pill)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }}>
      ☀️
    </button>
  )
}
