'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/components/layout'
import { auth as authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.ai.syntax-lab.site/api/v1'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, user } = useAuthStore()
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Redirect if already logged in
  useEffect(() => { if (user) router.push('/dashboard') }, [user, router])

  // Handle OAuth callback (token in URL hash)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash) return
    const params = new URLSearchParams(hash.slice(1))
    const access  = params.get('access_token')
    const refresh = params.get('refresh_token')
    if (access && refresh) {
      authApi.me(access).then((u) => {
        setAuth(u, access, refresh)
        router.push('/dashboard')
      }).catch(() => setError('Erreur lors de la connexion OAuth'))
    }
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) { setError('Remplissez tous les champs'); return }
    if (mode === 'register' && !username) { setError('Nom d\'utilisateur requis'); return }
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, username, password, fullName || undefined)
      setAuth(res.user, res.access_token, res.refresh_token)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,78,255,.15),transparent 65%)', top: -100, right: -100, filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.1),transparent 65%)', bottom: -80, left: -80, filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Link href="/" style={{ position: 'fixed', top: 20, left: 24, textDecoration: 'none' }} className="btn btn-ghost btn-sm">← Retour</Link>

      <div style={{ width: '100%', maxWidth: 420, padding: 40, borderRadius: 'var(--rlg)', background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(24px)', boxShadow: 'var(--sh-lg)', position: 'relative', zIndex: 1, animation: 'scaleIn 0.3s var(--spring) both' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', marginBottom: 28 }}>
          <LogoMark size={32} /> Syntax AI
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 'var(--rpill)', padding: 4, marginBottom: 28 }}>
          {(['login','register'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{ flex: 1, padding: '8px', borderRadius: 'var(--rpill)', fontSize: 13, fontWeight: 600, background: mode === m ? 'var(--bg2)' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--text3)', border: 'none', cursor: 'pointer', transition: 'all var(--t) var(--ease)', boxShadow: mode === m ? 'var(--sh)' : 'none' }}>
              {m === 'login' ? 'Se connecter' : 'Créer un compte'}
            </button>
          ))}
        </div>

        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 5 }}>
          {mode === 'login' ? 'Bon retour 👋' : 'Bienvenue 🎉'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
          {mode === 'login' ? 'Connectez-vous à votre compte.' : 'Créez votre compte gratuit.'}
        </p>

        {/* Social */}
        <a href={`${API}/auth/google`} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', borderRadius: 'var(--r)', background: 'var(--bg2)', border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8, textDecoration: 'none', transition: 'all var(--t) var(--ease)' }}>
          <GoogleIcon /> Continuer avec Google
        </a>
        <a href={`${API}/auth/github`} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', borderRadius: 'var(--r)', background: 'var(--text)', border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600, color: 'var(--bg)', marginBottom: 0, textDecoration: 'none', transition: 'all var(--t) var(--ease)' }}>
          <GitHubIcon /> Continuer avec GitHub
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> ou <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Form */}
        {mode === 'register' && (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Nom complet</label>
            <input className="input" type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ marginBottom: 12 }} />
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Nom d'utilisateur</label>
            <input className="input" type="text" placeholder="jean_dupont" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginBottom: 12 }} />
          </>
        )}

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Email</label>
        <input className="input" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Mot de passe</label>
          {mode === 'login' && <a href="#" style={{ fontSize: 12, color: 'var(--v)', fontWeight: 600, textDecoration: 'none' }}>Oublié ?</a>}
        </div>
        <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} style={{ marginBottom: 16 }} />

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--rsm)', fontSize: 13, color: '#ef4444', marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 13, background: 'var(--v)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all var(--t) var(--ease)', boxShadow: '0 4px 18px rgba(107,78,255,.35)' }}>
          {loading ? 'Connexion...' : mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
        </button>

        {mode === 'register' && (
          <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
            En créant un compte, vous acceptez nos <Link href="/terms" style={{ color: 'var(--v)' }}>CGU</Link> et notre <Link href="/privacy" style={{ color: 'var(--v)' }}>Politique de confidentialité</Link>.
          </p>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

// end 🔚 //