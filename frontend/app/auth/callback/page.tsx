'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { auth as authApi } from '@/lib/api'
import { LogoMark } from '@/components/layout'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) {
      setStatus('error')
      setMessage('Aucun token reçu.')
      return
    }

    const params = new URLSearchParams(hash.slice(1))
    const access  = params.get('access_token')
    const refresh = params.get('refresh_token')
    const isNew   = params.get('new_user') === '1'

    if (!access || !refresh) {
      setStatus('error')
      setMessage('Token manquant dans la réponse OAuth.')
      return
    }

    authApi.me(access)
      .then((user) => {
        setAuth(user, access, refresh)

        // Stocker le token dans un cookie pour le middleware
        document.cookie = `syntax-access-token=${access}; path=/; max-age=3600; SameSite=Lax`

        setStatus('success')
        setMessage(isNew ? `Bienvenue, ${user.full_name || user.username} !` : `Content de vous revoir, ${user.full_name || user.username} !`)

        setTimeout(() => router.push('/dashboard'), 1200)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Erreur lors de la connexion.')
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: 24,
    }}>
      <LogoMark size={48} />

      {status === 'loading' && (
        <>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--v)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontSize: 15, color: 'var(--text2)', fontWeight: 500 }}>Connexion en cours...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,163,127,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✅</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{message}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)' }}>Redirection vers le dashboard...</p>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>❌</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Erreur de connexion</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>{message}</p>
            <button onClick={() => router.push('/login')} className="btn btn-primary btn-sm">
              Réessayer
            </button>
          </div>
        </>
      )}
    </div>
  )
}
