'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell, ThemeToggle } from '@/components/layout'
import { useAuthStore, useChatStore } from '@/lib/store'
import { usage as usageApi, conversations as convsApi, type UsageToday, type ConversationItem } from '@/lib/api'

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore()
  const { resetChat } = useChatStore()
  const [tod, setTod] = useState<UsageToday | null>(null)
  const [recents, setRecents] = useState<ConversationItem[]>([])

  useEffect(() => {
    if (!accessToken) return
    usageApi.today(accessToken).then(setTod).catch(() => {})
    convsApi.list(accessToken, { page: 1 }).then(r => setRecents(r.conversations.slice(0, 4))).catch(() => {})
  }, [accessToken])

  const pct = tod?.today.percentage ?? 0
  const modeColor: Record<string,string> = { hybrid:'var(--v)', claude:'#FF6B35', openai:'#10A37F', gemini:'#4285F4' }
  const modeLabel: Record<string,string> = { hybrid:'⬡ Hybride', claude:'🔵 Claude', openai:'🟢 GPT', gemini:'🔴 Gemini' }

  return (
    <AppShell>
      <div className="topbar">
        <span style={{ fontSize:15, fontWeight:700 }}>Dashboard</span>
        <div style={{ display:'flex', gap:8 }}>
          <ThemeToggle />
          <Link href="/chat" onClick={resetChat} className="btn btn-primary btn-sm">+ Nouveau chat</Link>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:28, display:'flex', flexDirection:'column', gap:24 }}>
        {/* Welcome */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, letterSpacing:'-0.03em' }}>
              Bonjour, <span style={{ color:'var(--v)' }}>{user?.full_name?.split(' ')[0] || user?.username}</span> 👋
            </h1>
            <p style={{ fontSize:14, color:'var(--text2)', marginTop:4 }}>Vos 3 IA vous attendent.</p>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:'var(--rpill)', background:'linear-gradient(135deg,var(--v),var(--blue))', color:'white', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            ⚡ Plan {user?.plan}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { label:'Tokens aujourd\'hui', value: tod ? `${(tod.today.used/1000).toFixed(0)}K` : '—', sub: tod ? `${pct}% de ${tod.today.limit===-1?'∞':`${(tod.today.limit/1000000).toFixed(1)}M`}` : '', bar: true },
            { label:'Ce mois', value: tod ? `${(tod.month.used/1000000).toFixed(1)}M` : '—', sub:'tokens utilisés', bar:false },
            { label:'Conversations', value: String(recents.length > 0 ? '—' : '0'), sub:'chargement...', bar:false },
            { label:'Plan actuel', value: user?.plan?.toUpperCase() || '—', sub:'Voir les plans', bar:false },
          ].map((s,i) => (
            <div key={i} className="card" style={{ padding:20 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text3)', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, marginBottom:5, color:'var(--v)' }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text3)' }}>{s.sub}</div>
              {s.bar && (
                <div style={{ marginTop:10, height:3, background:'var(--bsoft)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:'linear-gradient(90deg,var(--v),var(--blue))', borderRadius:2 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick start */}
        <div style={{ background:'linear-gradient(135deg,#4B2EDF,var(--v))', borderRadius:'var(--rlg)', padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at top right,rgba(255,255,255,0.1),transparent 60%)', pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, color:'white', marginBottom:6 }}>Démarrez un nouveau projet</h3>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', marginBottom:18 }}>Hybride ou Solo — choisissez votre mode.</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['⬡ Hybride','🔵 Claude','🟢 GPT','🔴 Gemini'].map((m) => (
                <span key={m} style={{ padding:'5px 12px', borderRadius:'var(--rpill)', fontSize:12, fontWeight:600, background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.25)' }}>{m}</span>
              ))}
            </div>
          </div>
          <Link href="/chat" onClick={resetChat} style={{ background:'white', color:'#4B2EDF', padding:'12px 24px', borderRadius:'var(--rpill)', fontWeight:700, fontSize:14, whiteSpace:'nowrap', flexShrink:0, textDecoration:'none' }}>
            Ouvrir le chat →
          </Link>
        </div>

        {/* Recent */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Conversations récentes</h2>
            <Link href="/history" className="btn btn-ghost btn-sm">Voir tout →</Link>
          </div>
          {recents.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--text3)', fontSize:14 }}>
              Aucune conversation encore — <Link href="/chat" style={{ color:'var(--v)' }}>commencez maintenant</Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {recents.map((c) => (
                <Link key={c.id} href={`/chat?id=${c.id}`} style={{ padding:16, borderRadius:'var(--r)', background:'var(--bg2)', border:'1px solid var(--bsoft)', textDecoration:'none', display:'flex', flexDirection:'column', gap:6, transition:'all var(--t) var(--ease)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.5 }}>{c.preview}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:10, fontWeight:700, color: modeColor[c.mode] || 'var(--v)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{modeLabel[c.mode] || c.mode}</span>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>{new Date(c.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
