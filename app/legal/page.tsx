'use client'
import Link from 'next/link'
import { LogoMark } from '@/components/layout'

export default function LegalNoticePage() {
  return <LegalPage title="Mentions Légales" updated="20 juin 2026">
    <S title="Éditeur">
      <table style={{ fontSize:14, borderCollapse:'collapse', width:'100%' }}>
        {[['Société','Syntax Lab SAS'],['Siège','Paris, France'],['Email','contact@syntax-lab.site']].map(([k,v]) => (
          <tr key={k} style={{ borderBottom:'1px solid var(--bsoft)' }}>
            <td style={{ padding:'10px 0', fontWeight:600, color:'var(--text2)', width:200 }}>{k}</td>
            <td style={{ padding:'10px 0' }}>{v}</td>
          </tr>
        ))}
      </table>
    </S>
    <S title="Hébergement">
      <p>Amazon Web Services (AWS) — eu-west-3 (Paris) — Cloudflare CDN — Supabase PostgreSQL</p>
    </S>
    <S title="Propriété intellectuelle">
      <p>L'ensemble du contenu est protégé par le droit d'auteur. Toute reproduction sans autorisation écrite est interdite.</p>
    </S>
    <S title="Contact"><p><a href="mailto:contact@syntax-lab.site" style={{ color:'var(--v)' }}>contact@syntax-lab.site</a></p></S>
  </LegalPage>
}

function LegalPage({ title, updated, children }: { title:string; updated:string; children:React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ borderBottom:'1px solid var(--bsoft)', background:'var(--bg2)', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'var(--text)', textDecoration:'none' }}><LogoMark size={28}/> Syntax AI</Link>
        <Link href="/" className="btn btn-ghost btn-sm">← Retour</Link>
      </nav>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'60px 24px 100px' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--v)', marginBottom:12 }}>Légal</div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, letterSpacing:'-0.03em', marginBottom:8 }}>{title}</h1>
        <p style={{ fontSize:13, color:'var(--text3)', marginBottom:32 }}>Dernière mise à jour : {updated}</p>
        <div style={{ display:'flex', gap:6, marginBottom:48, flexWrap:'wrap' }}>
          {[['CGU','/terms'],['Confidentialité','/privacy'],['Mentions','/legal']].map(([l,h]) => (
            <Link key={l} href={h} style={{ padding:'6px 14px', borderRadius:'var(--rpill)', fontSize:13, fontWeight:600, background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--text2)', textDecoration:'none' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>{children}</div>
      </div>
    </div>
  )
}

function S({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ borderBottom:'1px solid var(--bsoft)', paddingBottom:24, marginBottom:24 }}>
      <h2 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>{title}</h2>
      <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.8 }}>{children}</div>
    </div>
  )
}
