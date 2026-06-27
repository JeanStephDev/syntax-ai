'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
      <div style={{ fontSize:56, marginBottom:16 }}>⚠️</div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:10 }}>Une erreur est survenue</h1>
      <p style={{ fontSize:14, color:'var(--text2)', marginBottom:28, maxWidth:360, lineHeight:1.65 }}>
        {error.message || 'Erreur inattendue. Réessayez ou contactez le support.'}
      </p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={reset} style={{ padding:'10px 20px', background:'#6B4EFF', color:'white', border:'none', borderRadius:999, fontWeight:700, fontSize:14, cursor:'pointer' }}>Réessayer</button>
        <a href="/" style={{ padding:'10px 20px', background:'transparent', color:'var(--text)', border:'1px solid var(--border)', borderRadius:999, fontWeight:600, fontSize:14, textDecoration:'none' }}>← Accueil</a>
      </div>
    </div>
  )
}
