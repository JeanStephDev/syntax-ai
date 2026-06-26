'use client'
import { useEffect } from 'react'
import { LogoMark } from '@/components/layout'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
      <LogoMark size={48} />
      <div style={{ fontSize:64, margin:'20px 0 0' }}>⚠️</div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:10, marginTop:12 }}>Une erreur est survenue</h1>
      <p style={{ fontSize:14, color:'var(--text2)', marginBottom:28, maxWidth:360, lineHeight:1.65 }}>
        {error.message || 'Erreur inattendue. Réessayez ou contactez le support.'}
      </p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={reset} className="btn btn-primary">Réessayer</button>
        <a href="/" className="btn btn-ghost">← Accueil</a>
      </div>
    </div>
  )
}
