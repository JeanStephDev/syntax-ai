import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(107,78,255,.12),transparent 65%)', top:-100, left:'50%', transform:'translateX(-50%)', filter:'blur(80px)', pointerEvents:'none' }} />
      <div style={{ width:48, height:48, borderRadius:13, background:'linear-gradient(135deg,#6B4EFF,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.5 3.75v7.5L12 19.4l-7.5-3.75v-7.5L12 4.4z"/></svg>
      </div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(80px,15vw,160px)', fontWeight:800, letterSpacing:'-0.06em', color:'#6B4EFF', lineHeight:1 }}>404</div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginBottom:12 }}>Page introuvable</h1>
      <p style={{ fontSize:16, color:'var(--text2)', marginBottom:32, maxWidth:360, lineHeight:1.65 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div style={{ display:'flex', gap:10 }}>
        <Link href="/" style={{ padding:'10px 20px', background:'#6B4EFF', color:'white', borderRadius:999, fontWeight:700, fontSize:14, textDecoration:'none', display:'inline-flex', alignItems:'center' }}>← Accueil</Link>
        <Link href="/dashboard" style={{ padding:'10px 20px', background:'transparent', color:'var(--text)', border:'1px solid rgba(107,78,255,0.2)', borderRadius:999, fontWeight:600, fontSize:14, textDecoration:'none' }}>Dashboard</Link>
      </div>
    </div>
  )
}
