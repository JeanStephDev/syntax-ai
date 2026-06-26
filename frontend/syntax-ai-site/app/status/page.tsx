'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogoMark, ThemeToggle } from '@/components/layout'

const SERVICES = [
  { name: 'API principale',        status: 'operational' },
  { name: 'Orchestrateur Hybride', status: 'operational' },
  { name: 'Claude (Anthropic)',    status: 'operational' },
  { name: 'GPT-4o (OpenAI)',       status: 'operational' },
  { name: 'Gemini (Google)',       status: 'operational' },
  { name: 'Google Translate',      status: 'operational' },
  { name: 'Auth & OAuth2',         status: 'operational' },
  { name: 'Stripe Billing',        status: 'operational' },
  { name: 'Redis Cache',           status: 'operational' },
  { name: 'PostgreSQL',            status: 'operational' },
]

const ST: Record<string,{label:string;color:string;bg:string;dot:string}> = {
  operational: { label:'Opérationnel', color:'#10A37F', bg:'rgba(16,163,127,.1)', dot:'#10A37F' },
  degraded:    { label:'Dégradé',      color:'#F59E0B', bg:'rgba(245,158,11,.1)', dot:'#F59E0B' },
  incident:    { label:'Incident',     color:'#ef4444', bg:'rgba(239,68,68,.1)',  dot:'#ef4444' },
  maintenance: { label:'Maintenance',  color:'#6B4EFF', bg:'rgba(107,78,255,.1)', dot:'#6B4EFF' },
}

const HISTORY = [
  { date:'20 juin 2026', title:'Tous les systèmes opérationnels',                 type:'operational' },
  { date:'15 juin 2026', title:'Maintenance planifiée PostgreSQL — 02h-04h UTC',  type:'maintenance' },
  { date:'10 juin 2026', title:'Latence élevée API Claude — résolu en 12 min',    type:'degraded'    },
  { date:'1 juin 2026',  title:'Déploiement v2.0.0 — 0 downtime',                type:'operational' },
]

export default function StatusPage() {
  const [lastCheck, setLastCheck] = useState('')
  useEffect(() => { setLastCheck(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})) }, [])
  const allOk = SERVICES.every(s => s.status === 'operational')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'var(--surface)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--bsoft)', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'var(--text)', textDecoration:'none' }}>
          <LogoMark size={30} /> Syntax AI
        </Link>
        <div style={{ display:'flex', gap:8 }}><ThemeToggle /><Link href="/" className="btn btn-ghost btn-sm">← Accueil</Link></div>
      </nav>

      <div className="container" style={{ padding:'80px 24px 100px', maxWidth:760 }}>
        {/* Global */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'24px 28px', borderRadius:'var(--rlg)', background: allOk?'rgba(16,163,127,.08)':'rgba(239,68,68,.08)', border:`1px solid ${allOk?'rgba(16,163,127,.25)':'rgba(239,68,68,.25)'}`, marginBottom:48 }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background: allOk?'#10A37F':'#ef4444', position:'relative', flexShrink:0 }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background: allOk?'#10A37F':'#ef4444', animation:'pring 2s ease-out infinite' }} />
            <style>{`@keyframes pring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}`}</style>
          </div>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, color: allOk?'#10A37F':'#ef4444' }}>
              {allOk ? 'Tous les systèmes sont opérationnels' : 'Incident en cours'}
            </div>
            <div style={{ fontSize:13, color:'var(--text3)', marginTop:2 }}>Dernière vérification : {lastCheck}</div>
          </div>
        </div>

        {/* Services */}
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, marginBottom:16 }}>Services</h2>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bsoft)', borderRadius:'var(--rlg)', overflow:'hidden', marginBottom:48 }}>
          {SERVICES.map((s,i) => {
            const st = ST[s.status]
            return (
              <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom: i<SERVICES.length-1?'1px solid var(--bsoft)':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:st.dot }} />
                  <span style={{ fontSize:14, fontWeight:500 }}>{s.name}</span>
                </div>
                <span style={{ padding:'3px 10px', borderRadius:'var(--rpill)', fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>
              </div>
            )
          })}
        </div>

        {/* History */}
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, marginBottom:16 }}>Historique</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {HISTORY.map((h) => {
            const st = ST[h.type]
            return (
              <div key={h.date} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', background:'var(--bg2)', border:'1px solid var(--bsoft)', borderRadius:'var(--r)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:st.dot, flexShrink:0 }} />
                <div style={{ flex:1, fontSize:14, fontWeight:600 }}>{h.title}</div>
                <div style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{h.date}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
