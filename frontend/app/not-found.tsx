'use client'
import Link from 'next/link'
import { LogoMark } from '@/components/layout'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(107,78,255,.12),transparent 65%)', top:-100, left:'50%', transform:'translateX(-50%)', filter:'blur(80px)', pointerEvents:'none' }} />
      <LogoMark size={48} />
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(80px,15vw,160px)', fontWeight:800, letterSpacing:'-0.06em', color:'var(--v)', lineHeight:1, margin:'24px 0 0' }}>404</div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginBottom:12 }}>Page introuvable</h1>
      <p style={{ fontSize:16, color:'var(--text2)', marginBottom:32, maxWidth:360, lineHeight:1.65 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div style={{ display:'flex', gap:10 }}>
        <Link href="/" className="btn btn-primary">← Accueil</Link>
        <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
      </div>
    </div>
  )
}
