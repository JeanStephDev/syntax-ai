'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell, ThemeToggle } from '@/components/layout'
import { useChatStore, useAuthStore, type Message } from '@/lib/store'
import { useChat } from '@/hooks/useChat'
import { conversations as convsApi } from '@/lib/api'

const PLAN_SOLO: Record<string,boolean> = { free:false, starter:true, pro:true, team:true }

const HYBRID_MODELS = [
  { id:'syntax-free-1',    name:'Syntax Free',    tier:'free' },
  { id:'syntax-starter-1', name:'Syntax Starter', tier:'starter' },
  { id:'syntax-pro-1',     name:'Syntax Pro',     tier:'pro' },
  { id:'syntax-team-1',    name:'Syntax Team',    tier:'team' },
]
const SOLO_MODELS = [
  { id:'claude-haiku',  name:'Claude Haiku',  provider:'claude', color:'#FF6B35', tier:'starter' },
  { id:'claude-sonnet', name:'Claude Sonnet', provider:'claude', color:'#FF6B35', tier:'starter' },
  { id:'claude-opus',   name:'Claude Opus',   provider:'claude', color:'#FF6B35', tier:'pro' },
  { id:'gpt-4o-mini',   name:'GPT-4o Mini',   provider:'openai', color:'#10A37F', tier:'starter' },
  { id:'gpt-4o',        name:'GPT-4o',        provider:'openai', color:'#10A37F', tier:'starter' },
  { id:'gemini-flash',  name:'Gemini Flash',  provider:'gemini', color:'#4285F4', tier:'starter' },
  { id:'gemini-pro',    name:'Gemini Pro',    provider:'gemini', color:'#4285F4', tier:'pro' },
]
const STARTERS = [
  { e:'⚡', t:'API complète',      d:'FastAPI + JWT + BDD', m:'Crée une API REST FastAPI avec auth JWT et PostgreSQL.' },
  { e:'📊', t:'Dashboard React',   d:'Composants + charts', m:'Crée un dashboard React avec recharts et gestion d\'état.' },
  { e:'🐳', t:'Infrastructure',    d:'Docker + Nginx + CI', m:'Configure Docker Compose full-stack avec Nginx et SSL.' },
  { e:'🔐', t:'Auth OAuth2',       d:'Google + GitHub',     m:'Implémente OAuth2 Google et GitHub avec FastAPI.' },
]
const TIER_ORDER = ['free','starter','pro','team']

export default function ChatPage() {
  const searchParams = useSearchParams()
  const { user, accessToken } = useAuthStore()
  const store = useChatStore()
  const { sendMessage } = useChat()
  const [input, setInput] = useState('')
  const [showModels, setShowModels] = useState(false)
  const [showSoloMenu, setShowSoloMenu] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const canSolo = PLAN_SOLO[user?.plan || 'free']
  const userTier = TIER_ORDER.indexOf(user?.plan || 'free')

  // Load conversation from URL param
  useEffect(() => {
    const id = searchParams.get('id')
    if (!id || !accessToken) return
    convsApi.get(accessToken, id).then(conv => {
      store.resetChat()
      store.setConvId(id)
      conv.messages.forEach(m => {
        store.addMessage({
          id: m.id, role: m.role as any,
          content: m.content, provider: m.provider || undefined,
          time: new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
        })
      })
    }).catch(() => {})
  }, [searchParams, accessToken])

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior:'smooth' }) }, [store.messages, store.typing])

  const send = useCallback(() => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
    if (textarea.current) textarea.current.style.height = 'auto'
  }, [input, sendMessage])

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const currentSoloModel = SOLO_MODELS.find(m => m.id === store.soloModel)
  const currentHybridModel = HYBRID_MODELS.find(m => m.id === store.hybridModel)

  return (
    <AppShell>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Mode selector */}
          <button onClick={() => store.setMode('hybrid')} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--rpill)', fontSize:13, fontWeight:600, background: store.mode==='hybrid' ? 'var(--v)' : 'var(--surface)', color: store.mode==='hybrid' ? 'white' : 'var(--text2)', border: store.mode==='hybrid' ? 'none' : '1px solid var(--border)', cursor:'pointer', transition:'all var(--t) var(--ease)' }}>
            ⬡ Hybride
          </button>

          {canSolo ? (
            <div style={{ display:'flex', gap:4 }}>
              {['claude','openai','gemini'].map(p => {
                const label = p==='claude'?'🔵 Claude':p==='openai'?'🟢 GPT':'🔴 Gemini'
                const active = store.mode==='solo' && currentSoloModel?.provider===p
                return (
                  <button key={p} onClick={() => { store.setMode('solo'); setShowSoloMenu(true) }} style={{ padding:'6px 11px', borderRadius:'var(--rpill)', fontSize:12, fontWeight:600, background: active ? (p==='claude'?'#FF6B35':p==='openai'?'#10A37F':'#4285F4') : 'var(--surface)', color: active ? 'white' : 'var(--text2)', border: active ? 'none' : '1px solid var(--border)', cursor:'pointer', transition:'all var(--t) var(--ease)' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--rpill)', background:'var(--bg3)', border:'1px solid var(--bsoft)', fontSize:12, color:'var(--text3)' }}>
              🔒 Solo — Plan Starter requis
            </div>
          )}

          {/* Model picker */}
          {store.mode==='hybrid' && (
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowModels(!showModels)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:'var(--rpill)', fontSize:12, fontWeight:600, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer' }}>
                {currentHybridModel?.name || 'Modèle'} ▾
              </button>
              {showModels && (
                <div style={{ position:'absolute', top:'110%', left:0, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r)', boxShadow:'var(--sh-lg)', zIndex:50, minWidth:180, overflow:'hidden' }}>
                  {HYBRID_MODELS.map(m => {
                    const locked = TIER_ORDER.indexOf(m.tier) > userTier
                    return (
                      <button key={m.id} onClick={() => { if(!locked){ store.setHybridModel(m.id as any); setShowModels(false) } }} style={{ width:'100%', padding:'10px 14px', textAlign:'left', fontSize:13, fontWeight:500, color: locked ? 'var(--text3)' : 'var(--text)', background: m.id===store.hybridModel ? 'var(--v-mist)' : 'transparent', cursor: locked ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', border:'none' }}>
                        {m.name} {locked && <span style={{ fontSize:10, color:'var(--text3)' }}>🔒 {m.tier}</span>}
                        {!locked && m.id===store.hybridModel && <span style={{ color:'var(--v)' }}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Solo model picker */}
          {store.mode==='solo' && showSoloMenu && (
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowSoloMenu(!showSoloMenu)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:'var(--rpill)', fontSize:12, fontWeight:600, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer' }}>
                {SOLO_MODELS.find(m=>m.id===store.soloModel)?.name || 'Modèle'} ▾
              </button>
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={store.resetChat}>Nouveau</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 20px', display:'flex', flexDirection:'column', gap:20 }}>
        {store.messages.length === 0 ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:40, gap:12 }}>
            <div style={{ width:72, height:72, borderRadius:20, background:'var(--v-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>⬡</div>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>
              {store.mode==='hybrid' ? 'Que voulez-vous construire ?' : `Mode Solo — ${SOLO_MODELS.find(m=>m.id===store.soloModel)?.name}`}
            </h2>
            <p style={{ fontSize:14, color:'var(--text2)', maxWidth:380, lineHeight:1.65 }}>
              {store.mode==='hybrid' ? 'Claude, GPT-4o et Gemini vont collaborer sur votre projet.' : 'Posez votre question directement.'}
            </p>
            {store.mode==='hybrid' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, maxWidth:500, width:'100%', marginTop:8 }}>
                {STARTERS.map(s => (
                  <button key={s.t} onClick={() => { setInput(s.m); setTimeout(()=>{ sendMessage(s.m); setInput('') },100) }} style={{ padding:16, borderRadius:'var(--r)', background:'var(--bg2)', border:'1px solid var(--bsoft)', textAlign:'left', cursor:'pointer', transition:'all var(--t) var(--ease)' }}>
                    <div style={{ fontSize:22, marginBottom:8 }}>{s.e}</div>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{s.t}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{s.d}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {store.messages.map(msg => <ChatMessage key={msg.id} msg={msg} activeTab={store.activeTab} setActiveTab={store.setActiveTab} />)}
            {store.typing && <TypingIndicator mode={store.mode} />}
          </>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div style={{ padding:'14px 20px 18px', borderTop:'1px solid var(--bsoft)', background:'var(--bg)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, background:'var(--bg2)', border:'1.5px solid var(--border)', borderRadius:'var(--rlg)', padding:'10px 10px 10px 16px', transition:'border-color var(--t) var(--ease)' }}>
          <textarea ref={textarea} value={input} onChange={e => { setInput(e.target.value); autoResize(e.target) }} onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send() } }} placeholder={store.mode==='hybrid' ? 'Décrivez votre projet...' : 'Votre question...'} rows={1} style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:14, color:'var(--text)', resize:'none', minHeight:24, maxHeight:160, lineHeight:1.6, fontFamily:'inherit' }} />
          <button onClick={send} style={{ width:36, height:36, borderRadius:10, background: input.trim() ? 'var(--v)' : 'var(--border)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, transition:'all var(--t) var(--ease)', flexShrink:0, border:'none', cursor:'pointer' }}>➤</button>
        </div>
        <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
          {['en Python','en TypeScript','avec tests','avec Docker','avec docs'].map(h => (
            <button key={h} onClick={() => setInput(i => i + (i ? ' ' : '') + h)} style={{ fontSize:11, color:'var(--text3)', padding:'4px 10px', borderRadius:'var(--rpill)', background:'var(--bg3)', border:'1px solid var(--bsoft)', cursor:'pointer', transition:'all var(--t) var(--ease)' }}>
              {h}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

function ChatMessage({ msg, activeTab, setActiveTab }: { msg: Message; activeTab: string; setActiveTab: (t:any)=>void }) {
  const [copied, setCopied] = useState(false)
  const isHybrid = msg.mode === 'hybrid' && (msg.backend || msg.frontend || msg.assets_docs)

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (msg.role === 'user') {
    return (
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <div style={{ maxWidth:'72%' }}>
          <div style={{ background:'var(--v)', color:'white', padding:'11px 15px', borderRadius:'var(--r) var(--r) 4px var(--r)', fontSize:14, lineHeight:1.6 }}>{msg.content}</div>
          <div style={{ fontSize:11, color:'var(--text3)', textAlign:'right', marginTop:4 }}>{msg.time}</div>
        </div>
        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--v),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', flexShrink:0, marginTop:2 }}>
          {(user?.full_name || user?.username || 'U').slice(0,2).toUpperCase()}
        </div>
      </div>
    )
  }

  const curTab = activeTab as 'backend'|'frontend'|'docs'
  const tabContent = curTab==='backend' ? msg.backend : curTab==='frontend' ? msg.frontend : msg.assets_docs

  return (
    <div style={{ display:'flex', gap:10, maxWidth:'92%' }}>
      <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--v-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, marginTop:2 }}>⬡</div>
      <div style={{ flex:1 }}>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bsoft)', borderRadius:'var(--r) var(--r) var(--r) 4px', padding:16 }}>
          {msg.streaming && !isHybrid && (
            <div style={{ display:'flex', gap:5, marginBottom:8 }}>
              {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', display:'inline-block', animation:`typing 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              <style>{`@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
            </div>
          )}

          {isHybrid ? (
            <>
              <div style={{ display:'flex', gap:4, marginBottom:12 }}>
                {([['backend','🔵 Claude','#FF6B35'],['frontend','🟢 GPT','#10A37F'],['docs','🔴 Gemini','#4285F4']] as const).map(([tab,label,color]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'4px 10px', borderRadius:'var(--rpill)', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all var(--t) var(--ease)', background: activeTab===tab ? `${color}14` : 'transparent', border: activeTab===tab ? `1px solid ${color}44` : '1px solid transparent', color }}>
                    {label}
                  </button>
                ))}
                <button onClick={() => copyContent(tabContent || '')} style={{ marginLeft:'auto', fontSize:11, color: copied ? '#10A37F' : 'var(--text3)', fontWeight:600, cursor:'pointer', background:'none', border:'none' }}>
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
              </div>
              <div className="code-wrap">
                <div className="code-body">{tabContent || '...'}</div>
              </div>
            </>
          ) : (
            <div style={{ fontSize:14, lineHeight:1.65, color:'var(--text)', whiteSpace:'pre-wrap' }}>{msg.content}</div>
          )}
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>
          {msg.time}{msg.model ? ` · ${msg.model}` : ''}{msg.tokens ? ` · ${msg.tokens.toLocaleString()} tokens` : ''}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator({ mode }: { mode: string }) {
  return (
    <div style={{ display:'flex', gap:10 }}>
      <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--v-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>⬡</div>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--bsoft)', borderRadius:'var(--r)', padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:5 }}>
          {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', display:'inline-block', animation:`typing 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
        </div>
      </div>
    </div>
  )
}
