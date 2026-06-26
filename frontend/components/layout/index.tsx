'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useThemeStore, useAuthStore, useChatStore } from '@/lib/store'
import { usage as usageApi, type UsageToday } from '@/lib/api'

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function LogoMark({ size = 32 }: { size?: number }) {
  const r = Math.round(size * 0.28)
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: 'linear-gradient(135deg,#6B4EFF,#3B82F6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(107,78,255,0.38)', flexShrink: 0,
    }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.5 3.75v7.5L12 19.4l-7.5-3.75v-7.5L12 4.4z" />
      </svg>
    </div>
  )
}

export function WordMark({ size = 18 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <LogoMark size={size === 18 ? 30 : size} />
      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size, letterSpacing: '-0.03em' }}>
        Syntax AI
      </span>
    </div>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
export function ThemeToggle() {
  const { dark, toggle } = useThemeStore()
  return (
    <button className="btn-round btn-ghost" onClick={toggle}
      style={{ fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      title={dark ? 'Mode clair' : 'Mode sombre'}>
      {dark ? '🌙' : '☀️'}
    </button>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }
export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="toast" onClick={onClose} style={{ cursor: 'pointer' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {message}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID()
    setToasts((p) => [...p, { id, message, type }])
  }, [])
  const remove = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id))
  }, [])
  return { toasts, show, remove }
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/chat',      icon: '💬', label: 'Nouveau chat' },
  { href: '/history',   icon: '🕐', label: 'Historique' },
]

export function Sidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { user, accessToken, clearAuth } = useAuthStore()
  const { resetChat } = useChatStore()
  const [todayUsage, setTodayUsage] = useState<UsageToday | null>(null)

  useEffect(() => {
    if (!accessToken) return
    usageApi.today(accessToken)
      .then(setTodayUsage)
      .catch(() => {})
  }, [accessToken])

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const pct = todayUsage?.today.percentage ?? 0

  return (
    <aside className="sidebar">
      {/* Header */}
      <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid var(--bsoft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          <WordMark size={16} />
        </Link>
        <Link href="/chat" onClick={resetChat} title="Nouveau chat" style={{
          width: 30, height: 30, borderRadius: 8, background: 'var(--v)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 300, transition: 'all var(--t) var(--ease)', textDecoration: 'none',
        }}>+</Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flexShrink: 0 }}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px',
              borderRadius: 'var(--rsm)', fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? 'var(--v)' : 'var(--text2)',
              background: active ? 'var(--v-mist)' : 'transparent',
              textDecoration: 'none', marginBottom: 2,
              transition: 'all var(--t) var(--ease)',
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1, overflowY: 'auto' }} />

      {/* Token bar */}
      {todayUsage && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--bsoft)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 600 }}>
            <span>Tokens aujourd'hui</span>
            <span style={{ color: pct > 80 ? '#ef4444' : 'var(--v)' }}>{pct}%</span>
          </div>
          <div style={{ height: 3, background: 'var(--bsoft)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 80 ? '#ef4444' : 'linear-gradient(90deg,var(--v),var(--blue))', borderRadius: 2, transition: 'width 1s var(--ease)' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
            {(todayUsage.today.used / 1000).toFixed(0)}K / {todayUsage.today.limit === -1 ? '∞' : `${(todayUsage.today.limit / 1000000).toFixed(todayUsage.today.limit >= 1000000 ? 1 : 0)}${todayUsage.today.limit >= 1000000 ? 'M' : 'K'}`}
          </div>
        </div>
      )}

      {/* Bottom */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--bsoft)', flexShrink: 0 }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px',
          borderRadius: 'var(--rsm)', fontSize: 13, fontWeight: 500,
          color: pathname === '/settings' ? 'var(--v)' : 'var(--text2)',
          background: pathname === '/settings' ? 'var(--v-mist)' : 'transparent',
          textDecoration: 'none', marginBottom: 4, transition: 'all var(--t) var(--ease)',
        }}>
          <span style={{ fontSize: 15 }}>⚙️</span> Paramètres
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 'var(--rsm)' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: user.avatar_url ? 'none' : 'linear-gradient(135deg,var(--v),var(--blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0, overflow: 'hidden',
            }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user.full_name || user.username).slice(0, 2).toUpperCase()
              }
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name || user.username}
              </div>
              <div style={{ fontSize: 10, color: 'var(--v)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Plan {user.plan}
              </div>
            </div>
            <button onClick={handleLogout} title="Se déconnecter" style={{ fontSize: 14, color: 'var(--text3)', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color var(--t)' }}>
              ↩
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── App Shell Wrapper ────────────────────────────────────────────────────────
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  )
}
