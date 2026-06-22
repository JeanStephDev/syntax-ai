'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, createContext, useContext } from 'react'

/* ── Plan access control ── */
export const PLAN_LIMITS = {
  free:    { tokens_day: 100_000, rate: 10,  api_keys: 1,  history_days: 7,   solo: false, models: ['syntax-free-1'] },
  starter: { tokens_day: 500_000, rate: 30,  api_keys: 3,  history_days: 30,  solo: true,  models: ['syntax-free-1','syntax-starter-1'] },
  pro:     { tokens_day: 2000000, rate: 100, api_keys: 10, history_days: -1,  solo: true,  models: ['syntax-free-1','syntax-starter-1','syntax-pro-1'] },
  team:    { tokens_day: 10000000,rate: 500, api_keys: -1, history_days: -1,  solo: true,  models: ['syntax-free-1','syntax-starter-1','syntax-pro-1','syntax-team-1'] },
}

/* ── App context ── */
const AppCtx = createContext<any>({})
export const useApp = () => useContext(AppCtx)

/* ── Mock user ── */
const MOCK_USER = { name: 'Jean Dupont', email: 'jean@dupont.fr', plan: 'pro' as keyof typeof PLAN_LIMITS, initials: 'JD', tokens_used: 342000 }

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/chat',      icon: '💬', label: 'Nouveau chat' },
  { href: '/history',   icon: '🕐', label: 'Historique' },
]

const RECENT_CHATS = [
  { id: '1', title: 'API FastAPI JWT auth',          model: 'PRO',     icon: '💻' },
  { id: '2', title: 'Dashboard React recharts',      model: 'STARTER', icon: '📊' },
  { id: '3', title: 'Docker Compose full-stack',     model: 'PRO',     icon: '🐳' },
  { id: '4', title: 'OAuth2 Google + GitHub',        model: 'PRO',     icon: '🔐' },
  { id: '5', title: 'Stripe webhook integration',    model: 'TEAM',    icon: '💳' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = MOCK_USER
  const limits = PLAN_LIMITS[user.plan]
  const tokenPct = Math.round((user.tokens_used / limits.tokens_day) * 100)

  return (
    <AppCtx.Provider value={{ user, limits }}>
      <div style={{ display: 'grid', gridTemplateColumns: `${264}px 1fr`, height: '100vh', overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Syne', fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em', color: 'var(--text)' }}>
              <LogoMark size={28} />
              Syntax AI
            </Link>
            <Link href="/chat" title="Nouveau chat" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--v-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 300, transition: 'all var(--t) var(--ease)', flexShrink: 0 }}>
              +
            </Link>
          </div>

          {/* Main nav */}
          <nav style={{ padding: '10px 8px', flexShrink: 0 }}>
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 11px', borderRadius: 'var(--r-sm)',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--v-500)' : 'var(--text-2)',
                  background: active ? 'var(--v-50)' : 'transparent',
                  transition: 'all var(--t) var(--ease)', marginBottom: 2,
                  textDecoration: 'none',
                }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Recent chats */}
          <div style={{ flexShrink: 0, padding: '4px 8px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '8px 10px 4px' }}>
              Récent
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            {RECENT_CHATS.map(chat => (
              <Link key={chat.id} href={`/chat/${chat.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 'var(--r-sm)',
                textDecoration: 'none', transition: 'background var(--t) var(--ease)',
                marginBottom: 1,
              }}>
                <span style={{ fontSize: 13 }}>{chat.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {chat.title}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', flexShrink: 0 }}>{chat.model}</span>
              </Link>
            ))}
          </div>

          {/* Token usage bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-soft)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 5, fontWeight: 600 }}>
              <span>Tokens aujourd'hui</span>
              <span style={{ color: tokenPct > 80 ? '#ef4444' : 'var(--v-500)' }}>{tokenPct}%</span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${tokenPct}%`, background: tokenPct > 80 ? '#ef4444' : 'linear-gradient(90deg,var(--v-500),var(--b-500))', borderRadius: 2, transition: 'width 1s var(--ease)' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
              {(user.tokens_used / 1000).toFixed(0)}K / {(limits.tokens_day / 1000000).toFixed(0)}M
            </div>
          </div>

          {/* Bottom */}
          <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--border-soft)', flexShrink: 0 }}>
            <Link href="/settings" style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 10px', borderRadius: 'var(--r-sm)',
              fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
              textDecoration: 'none', transition: 'all var(--t) var(--ease)', marginBottom: 2,
            }}>
              <span style={{ fontSize: 15 }}>⚙️</span> Paramètres
            </Link>
            <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 'var(--r-sm)', textDecoration: 'none', transition: 'background var(--t) var(--ease)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user.initials}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--v-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan {user.plan}</div>
              </div>
            </Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </AppCtx.Provider>
  )
}

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(107,78,255,0.4)', flexShrink: 0 }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.5 3.75v7.5L12 19.4l-7.5-3.75v-7.5L12 4.4z" />
      </svg>
    </div>
  )
}
