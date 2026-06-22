'use client'
import { useState } from 'react'
import Link from 'next/link'

const MODE_COLORS: Record<string,string> = {hybrid:'var(--v-500)',claude:'#FF6B35',gpt:'#10A37F',gemini:'#4285F4'}
const MODE_LABELS: Record<string,string> = {hybrid:'⬡ Hybride',claude:'🔵 Claude Solo',gpt:'🟢 GPT Solo',gemini:'🔴 Gemini Solo'}

const ALL_CHATS = [
  {id:'1',title:'API FastAPI avec JWT auth',preview:'API REST complète, JWT, refresh tokens.',model:'Syntax Pro',mode:'hybrid',time:'14:32',day:"Aujourd'hui",tokens:3420,icon:'💻'},
  {id:'2',title:'Composant carte produit React',preview:'Carte responsive, panier, animations.',model:'GPT Solo',mode:'gpt',time:'11:15',day:"Aujourd'hui",tokens:1840,icon:'🎨'},
  {id:'3',title:'Dashboard analytics recharts',preview:'Graphiques temps réel, export CSV.',model:'Syntax Starter',mode:'hybrid',time:'Hier',day:'Cette semaine',tokens:2950,icon:'📊'},
  {id:'4',title:'Docker Compose full-stack',preview:'PostgreSQL, Redis, Nginx, SSL auto.',model:'Claude Solo',mode:'claude',time:'Lun',day:'Cette semaine',tokens:2100,icon:'🐳'},
  {id:'5',title:'OAuth2 Google + GitHub',preview:'Auth sociale FastAPI, sessions JWT.',model:'Syntax Pro',mode:'hybrid',time:'Sam',day:'Cette semaine',tokens:4200,icon:'🔐'},
  {id:'6',title:'WebSocket chat temps réel',preview:'Chat Socket.io, rooms, présence.',model:'Syntax Pro',mode:'hybrid',time:'12 juin',day:'Ce mois',tokens:5100,icon:'💬'},
  {id:'7',title:'Stripe webhooks & abonnements',preview:'Plans récurrents, portail client.',model:'Claude Solo',mode:'claude',time:'10 juin',day:'Ce mois',tokens:3800,icon:'💳'},
  {id:'8',title:'Redis cache + rate limiting',preview:'Cache LRU, rate limiting par IP.',model:'Gemini Solo',mode:'gemini',time:'8 juin',day:'Ce mois',tokens:1600,icon:'⚡'},
]

export default function HistoryPage() {
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('Tout')
  const filters=['Tout','Hybride','Claude Solo','GPT Solo','Gemini Solo']
  const filtered=ALL_CHATS.filter(c=>{
    const ms=c.title.toLowerCase().includes(search.toLowerCase())||c.preview.toLowerCase().includes(search.toLowerCase())
    const mf=filter==='Tout'||(filter==='Hybride'&&c.mode==='hybrid')||(filter==='Claude Solo'&&c.mode==='claude')||(filter==='GPT Solo'&&c.mode==='gpt')||(filter==='Gemini Solo'&&c.mode==='gemini')
    return ms&&mf
  })
  const groups=[...new Set(filtered.map(c=>c.day))]
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
      <div style={{height:56,borderBottom:'1px solid var(--border-soft)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700}}>Historique</span>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{const d=document.documentElement.getAttribute('data-theme')==='dark';document.documentElement.setAttribute('data-theme',d?'light':'dark')}} style={{width:34,height:34,borderRadius:'var(--r-pill)',background:'var(--surface)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,cursor:'pointer'}}>☀️</button>
          <Link href="/chat" className="btn btn-primary btn-sm">+ Nouveau chat</Link>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:24}}>
        <div style={{position:'relative',marginBottom:14}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:15,color:'var(--text-3)',pointerEvents:'none'}}>🔍</span>
          <input className="input" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:42}}/>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:22,flexWrap:'wrap',alignItems:'center'}}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 13px',borderRadius:'var(--r-pill)',fontSize:12,fontWeight:600,background:filter===f?'var(--v-500)':'var(--bg-2)',color:filter===f?'white':'var(--text-2)',border:`1px solid ${filter===f?'var(--v-500)':'var(--border)'}`,cursor:'pointer',transition:'all var(--t) var(--ease)'}}>{f}</button>
          ))}
          <span style={{fontSize:12,color:'var(--text-3)',marginLeft:'auto'}}>{filtered.length} résultat{filtered.length!==1?'s':''}</span>
        </div>
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Aucun résultat</div>
            <div style={{fontSize:13}}>Essayez d'autres mots-clés.</div>
          </div>
        ):groups.map(group=>(
          <div key={group} style={{marginBottom:26}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:9}}>{group}</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {filtered.filter(c=>c.day===group).map(chat=>(
                <Link key={chat.id} href={`/chat/${chat.id}`} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 16px',borderRadius:'var(--r)',background:'var(--bg-2)',border:'1px solid var(--border-soft)',textDecoration:'none',transition:'all var(--t) var(--ease)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'var(--v-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{chat.icon}</div>
                  <div style={{flex:1,overflow:'hidden'}}>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{chat.title}</div>
                    <div style={{fontSize:12,color:'var(--text-3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{chat.preview}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:MODE_COLORS[chat.mode],textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2}}>{MODE_LABELS[chat.mode]}</div>
                    <div style={{fontSize:11,color:'var(--text-3)',marginBottom:1}}>{chat.model}</div>
                    <div style={{fontSize:11,color:'var(--text-3)'}}>{chat.time} · {chat.tokens.toLocaleString()} tokens</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
