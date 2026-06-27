'use client'
import { useState, useEffect } from 'react'
import { AppShell, ThemeToggle, useToast, Toast } from '@/components/layout'
import { useAuthStore, useThemeStore } from '@/lib/store'
import { auth as authApi, apiKeys as apiKeysApi, billing as billingApi, usage as usageApi, type APIKeyItem, type UsageToday } from '@/lib/api'

type Section = 'profile'|'plan'|'appearance'|'language'|'apikeys'|'usage'

const SECTIONS = [
  {id:'profile',    icon:'👤', label:'Profil',           group:'Compte'},
  {id:'plan',       icon:'⚡', label:'Plan & Facturation',group:'Compte'},
  {id:'appearance', icon:'🎨', label:'Apparence',         group:'Préférences'},
  {id:'language',   icon:'🌍', label:'Langue',            group:'Préférences'},
  {id:'apikeys',    icon:'🔑', label:'Clés API',          group:'Développeur'},
  {id:'usage',      icon:'📊', label:'Usage & Tokens',    group:'Développeur'},
] as const

const LANGS = [
  {code:'fr',flag:'🇫🇷',label:'Français'},{code:'en',flag:'🇬🇧',label:'English'},
  {code:'es',flag:'🇪🇸',label:'Español'},{code:'de',flag:'🇩🇪',label:'Deutsch'},
  {code:'it',flag:'🇮🇹',label:'Italiano'},{code:'pt',flag:'🇧🇷',label:'Português'},
  {code:'ja',flag:'🇯🇵',label:'日本語'},{code:'zh',flag:'🇨🇳',label:'中文'},
  {code:'ar',flag:'🇸🇦',label:'العربية'},{code:'ko',flag:'🇰🇷',label:'한국어'},
  {code:'ru',flag:'🇷🇺',label:'Русский'},{code:'nl',flag:'🇳🇱',label:'Nederlands'},
]

export default function SettingsPage() {
  const { user, accessToken, setUser, clearAuth } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const { toasts, show, remove } = useToast()
  const [active, setActive] = useState<Section>('profile')
  const [keys, setKeys]     = useState<APIKeyItem[]>([])
  const [tod, setTod]       = useState<UsageToday|null>(null)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string|null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyType, setNewKeyType] = useState('user_free')
  const [showNewKey, setShowNewKey] = useState<string|null>(null)

  // Form state
  const [fullName, setFullName]   = useState(user?.full_name || '')
  const [uiLang, setUiLang]       = useState(user?.ui_language || 'fr')
  const [aiLang, setAiLang]       = useState(user?.ai_language || 'fr')
  const [translate, setTranslate] = useState(user?.translate_enabled ?? true)
  const [preserveCode, setPreserveCode] = useState(user?.preserve_code ?? true)

  useEffect(() => {
    if (!accessToken) return
    if (active==='apikeys') apiKeysApi.list(accessToken).then(r => setKeys(r.keys)).catch(()=>{})
    if (active==='usage') usageApi.today(accessToken).then(setTod).catch(()=>{})
  }, [active, accessToken])

  const saveProfile = async () => {
    if (!accessToken) return
    setSaving(true)
    try {
      const u = await authApi.updateMe(accessToken, { full_name:fullName })
      setUser(u)
      show('Profil sauvegardé', 'success')
    } catch { show('Erreur', 'error') }
    setSaving(false)
  }

  const saveLang = async () => {
    if (!accessToken) return
    try {
      const u = await authApi.updateMe(accessToken, { ui_language:uiLang, ai_language:aiLang, translate_enabled:translate, preserve_code:preserveCode })
      setUser(u)
      show('Préférences de langue sauvegardées', 'success')
    } catch { show('Erreur', 'error') }
  }

  const createKey = async () => {
    if (!accessToken || !newKeyName) return
    try {
      const res = await apiKeysApi.create(accessToken, newKeyName, newKeyType)
      setShowNewKey(res.key)
      setNewKeyName('')
      const updated = await apiKeysApi.list(accessToken)
      setKeys(updated.keys)
    } catch (e:any) { show(e.message || 'Erreur', 'error') }
  }

  const revokeKey = async (id: string) => {
    if (!accessToken) return
    try {
      await apiKeysApi.revoke(accessToken, id)
      setKeys(k => k.filter(x => x.id !== id))
      show('Clé révoquée', 'success')
    } catch { show('Erreur', 'error') }
  }

  const copyKey = (val: string, id: string) => {
    navigator.clipboard.writeText(val)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    show('Clé copiée', 'success')
  }

  const openPortal = async () => {
    if (!accessToken) return
    try {
      const { portal_url } = await billingApi.portal(accessToken)
      window.open(portal_url, '_blank')
    } catch { show('Erreur portail Stripe', 'error') }
  }

  const upgrade = async (plan: string) => {
    if (!accessToken) return
    try {
      const { checkout_url } = await billingApi.checkout(accessToken, plan)
      window.location.href = checkout_url
    } catch { show('Erreur paiement', 'error') }
  }

  const groups = [...new Set(SECTIONS.map(s => s.group))]
  const pct = tod?.today.percentage ?? 0

  return (
    <AppShell>
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />)}

      <div className="topbar">
        <span style={{ fontSize:15, fontWeight:700 }}>Paramètres</span>
        <ThemeToggle />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', flex:1, overflow:'hidden' }}>
        {/* Settings nav */}
        <nav style={{ borderRight:'1px solid var(--bsoft)', padding:'16px 10px', overflowY:'auto', background:'var(--bg)' }}>
          {groups.map(g => (
            <div key={g}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', padding:'12px 10px 5px' }}>{g}</div>
              {SECTIONS.filter(s => s.group===g).map(s => (
                <button key={s.id} onClick={() => setActive(s.id as Section)} style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:'var(--rsm)', fontSize:13, fontWeight: active===s.id ? 600 : 500, color: active===s.id ? 'var(--v)' : 'var(--text2)', background: active===s.id ? 'var(--v-mist)' : 'transparent', border:'none', cursor:'pointer', textAlign:'left', marginBottom:2, transition:'all var(--t) var(--ease)' }}>
                  <span style={{ fontSize:15 }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          ))}
          <div style={{ marginTop:16, padding:'0 10px' }}>
            <button onClick={() => { clearAuth(); window.location.href='/' }} style={{ width:'100%', padding:'8px 10px', borderRadius:'var(--rsm)', fontSize:13, fontWeight:500, color:'#ef4444', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', cursor:'pointer', textAlign:'left' }}>
              ↩ Se déconnecter
            </button>
          </div>
        </nav>

        {/* Content */}
        <div style={{ overflowY:'auto', padding:28, background:'var(--bg)' }}>

          {/* ── Profile ── */}
          {active==='profile' && (
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Profil</h1>
              <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>Gérez vos informations.</p>
              <Card>
                <Row label="Avatar">
                  <div style={{ width:48, height:48, borderRadius:'50%', background: user?.avatar_url ? 'none' : 'linear-gradient(135deg,var(--v),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'white', overflow:'hidden' }}>
                    {user?.avatar_url ? <img src={user.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (user?.full_name||user?.username||'U').slice(0,2).toUpperCase()}
                  </div>
                </Row>
                <Row label="Nom complet">
                  <input className="input" value={fullName} onChange={e=>setFullName(e.target.value)} style={{ maxWidth:240 }} />
                </Row>
                <Row label="Email" desc={`Via ${user?.auth_provider}`}>
                  <input className="input" value={user?.email||''} disabled style={{ maxWidth:240, opacity:0.6 }} />
                </Row>
                <Row label="">
                  <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>{saving?'Sauvegarde...':'Sauvegarder'}</button>
                </Row>
              </Card>
            </div>
          )}

          {/* ── Plan ── */}
          {active==='plan' && (
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Plan & Facturation</h1>
              <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>Gérez votre abonnement.</p>
              <Card>
                <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--bsoft)', gap:16 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800 }}>Plan {user?.plan}</span>
                      <span style={{ padding:'3px 8px', borderRadius:'var(--rpill)', background:'linear-gradient(135deg,var(--v),var(--blue))', color:'white', fontSize:10, fontWeight:700 }}>Actif</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={openPortal}>Gérer →</button>
                  </div>
                </div>
                {tod && (
                  <Row label="Tokens aujourd'hui" desc={`${(tod.today.used/1000).toFixed(0)}K / ${tod.today.limit===-1?'∞':`${(tod.today.limit/1000000).toFixed(1)}M`}`}>
                    <div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'var(--v)' }}>{pct}%</div>
                      <div style={{ height:3, width:160, background:'var(--bsoft)', borderRadius:2, overflow:'hidden', marginTop:6 }}>
                        <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:'linear-gradient(90deg,var(--v),var(--blue))' }} />
                      </div>
                    </div>
                  </Row>
                )}
              </Card>
              {user?.plan==='free' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:16 }}>
                  {[{id:'starter',n:'Starter',p:'4,99€'},{id:'pro',n:'Pro',p:'14,99€'},{id:'team',n:'Team',p:'49,99€'}].map(pl => (
                    <div key={pl.id} className="card" style={{ padding:20 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, marginBottom:4 }}>{pl.n}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:'var(--v)', marginBottom:12 }}>{pl.p}/mois</div>
                      <button className="btn btn-outline btn-sm" onClick={() => upgrade(pl.id)} style={{ width:'100%' }}>Passer à {pl.n}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Appearance ── */}
          {active==='appearance' && (
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Apparence</h1>
              <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>Personnalisez l'interface.</p>
              <Card>
                <div style={{ padding:'16px 24px 0' }}><div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Thème</div></div>
                <div style={{ padding:'14px 24px 20px', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                  {[{id:'light',l:'Clair',i:'☀️',bg:'#F8F7FF'},{id:'dark',l:'Sombre',i:'🌙',bg:'#09091A'}].map(t => (
                    <button key={t.id} onClick={() => toggle()} style={{ padding:16, borderRadius:'var(--r)', background:t.bg, cursor:'pointer', textAlign:'left', border:`2px solid ${(dark&&t.id==='dark')||(!dark&&t.id==='light')?'var(--v)':'transparent'}`, transition:'border-color var(--t) var(--ease)' }}>
                      <div style={{ fontSize:24, marginBottom:8 }}>{t.i}</div>
                      <div style={{ fontSize:13, fontWeight:700, color: t.id==='dark'?'#EEE9FF':'#0D0B1E' }}>{t.l}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── Language ── */}
          {active==='language' && (
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Langue</h1>
              <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>L'IA répond dans la langue choisie via Google Translate.</p>
              <Card>
                <div style={{ padding:'16px 24px 0' }}><div style={{ fontSize:15, fontWeight:700 }}>Interface</div></div>
                <div style={{ padding:'8px 24px 20px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => setUiLang(l.code)} style={{ padding:'9px 12px', borderRadius:'var(--r)', display:'flex', alignItems:'center', gap:8, cursor:'pointer', border:`1.5px solid ${uiLang===l.code?'var(--v)':'var(--bsoft)'}`, background: uiLang===l.code?'var(--v-mist)':'var(--bg)', fontSize:12, fontWeight: uiLang===l.code?700:500, color: uiLang===l.code?'var(--v)':'var(--text2)', transition:'all var(--t) var(--ease)' }}>
                      <span style={{ fontSize:16 }}>{l.flag}</span>{l.label}
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <div style={{ padding:'16px 24px 0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <span style={{ fontSize:15, fontWeight:700 }}>Réponses IA</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:'var(--rpill)', background:'rgba(66,133,244,.1)', color:'#4285F4' }}>Google Translate</span>
                  </div>
                </div>
                <Row label="Traduction automatique" desc="Traduit les explications de l'IA">
                  <Toggle checked={translate} onChange={setTranslate} />
                </Row>
                {translate && (
                  <>
                    <Row label="Langue cible">
                      <select value={aiLang} onChange={e=>setAiLang(e.target.value)} style={{ padding:'8px 12px', borderRadius:'var(--r)', background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)', fontSize:13, cursor:'pointer', outline:'none' }}>
                        {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                      </select>
                    </Row>
                    <Row label="Préserver le code" desc="Ne traduit que les explications">
                      <Toggle checked={preserveCode} onChange={setPreserveCode} />
                    </Row>
                  </>
                )}
                <Row label=""><button className="btn btn-primary btn-sm" onClick={saveLang}>Sauvegarder</button></Row>
              </Card>
            </div>
          )}

          {/* ── API Keys ── */}
          {active==='apikeys' && (
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Clés API</h1>
              <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>Intégrez Syntax AI dans vos applications. La clé complète n'est visible qu'à la création.</p>

              {showNewKey && (
                <div style={{ padding:16, borderRadius:'var(--r)', background:'rgba(16,163,127,0.08)', border:'1px solid rgba(16,163,127,0.25)', marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#10A37F', marginBottom:8 }}>✅ Clé créée — copiez-la maintenant !</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <code style={{ flex:1, fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'var(--text)', background:'var(--bg3)', padding:'8px 12px', borderRadius:'var(--rsm)', overflow:'auto', whiteSpace:'nowrap' }}>{showNewKey}</code>
                    <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(showNewKey); show('Copié !','success') }}>Copier</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowNewKey(null)}>✕</button>
                  </div>
                </div>
              )}

              <Card>
                <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>Vos clés ({keys.length})</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input className="input" placeholder="Nom de la clé" value={newKeyName} onChange={e=>setNewKeyName(e.target.value)} style={{ maxWidth:180 }} />
                    <select value={newKeyType} onChange={e=>setNewKeyType(e.target.value)} style={{ padding:'10px 12px', borderRadius:'var(--r)', background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)', fontSize:13, outline:'none' }}>
                      <option value="user_free">Free</option>
                      <option value="user_pay">Pay</option>
                      <option value="reseller">Reseller</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={createKey} disabled={!newKeyName}>+ Créer</button>
                  </div>
                </div>
                {keys.length===0 ? (
                  <div style={{ padding:'20px 24px', fontSize:13, color:'var(--text3)' }}>Aucune clé API</div>
                ) : keys.map(k => (
                  <div key={k.id} style={{ padding:'14px 24px', borderTop:'1px solid var(--bsoft)', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'var(--v-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      {k.key_type==='user_free'?'🔑':k.is_reseller?'🏪':'⚡'}
                    </div>
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{ fontSize:13, fontWeight:700 }}>{k.name}</span>
                        <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--v)', background:'var(--v-mist)', padding:'2px 7px', borderRadius:'var(--rpill)' }}>{k.key_type}</span>
                      </div>
                      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'var(--text3)' }}>{k.key_preview}</div>
                      {k.monthly_token_limit && (
                        <div style={{ marginTop:5, height:3, background:'var(--bsoft)', borderRadius:2, overflow:'hidden', width:160 }}>
                          <div style={{ height:'100%', width:`${Math.min(Math.round(k.tokens_used_month/k.monthly_token_limit*100),100)}%`, background:'linear-gradient(90deg,var(--v),var(--blue))' }} />
                        </div>
                      )}
                      {k.monthly_token_limit===null && <div style={{ fontSize:11, color:'#10A37F', fontWeight:600, marginTop:3 }}>Tokens illimités</div>}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => copyKey(k.key_preview, k.id)}>{copiedId===k.id?'✓':'Copier'}</button>
                      <button onClick={() => revokeKey(k.id)} style={{ padding:'7px 12px', borderRadius:'var(--rpill)', fontSize:12, fontWeight:600, color:'#ef4444', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.15)', cursor:'pointer' }}>Révoquer</button>
                    </div>
                  </div>
                ))}
              </Card>

              <div style={{ padding:14, borderRadius:'var(--r)', background:'var(--v-mist)', border:'1px solid rgba(107,78,255,0.2)', display:'flex', gap:10, alignItems:'flex-start', marginTop:16 }}>
                <span>💡</span>
                <div style={{ fontSize:13, color:'var(--v)', lineHeight:1.6 }}>
                  Utilisez vos clés dans vos apps : <code style={{ fontFamily:'monospace', background:'rgba(107,78,255,0.1)', padding:'2px 6px', borderRadius:4 }}>Authorization: Bearer sk-syntax-xxx</code>. Documentation complète sur <a href="https://platform.ai.syntax-lab.site" style={{ color:'var(--v)', fontWeight:600 }}>platform.ai.syntax-lab.site</a>.
                </div>
              </div>
            </div>
          )}

          {/* ── Usage ── */}
          {active==='usage' && (
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Usage & Tokens</h1>
              <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>Consommation en temps réel.</p>
              <Card>
                <div style={{ padding:'16px 24px 0' }}><div style={{ fontSize:15, fontWeight:700 }}>Aujourd'hui</div></div>
                {tod ? (
                  <>
                    <Row label="Tokens" desc={`${(tod.today.used/1000).toFixed(0)}K / ${tod.today.limit===-1?'∞':`${(tod.today.limit/1000000).toFixed(1)}M`}`}>
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:'var(--v)' }}>{pct}%</div>
                        <div style={{ height:4, width:180, background:'var(--bsoft)', borderRadius:2, overflow:'hidden', marginTop:6 }}>
                          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:'linear-gradient(90deg,var(--v),var(--blue))' }} />
                        </div>
                      </div>
                    </Row>
                    <Row label="Reset à"><span style={{ fontSize:13, fontWeight:600 }}>Minuit UTC</span></Row>
                  </>
                ) : <div style={{ padding:'20px 24px', fontSize:13, color:'var(--text3)' }}>Chargement...</div>}
              </Card>
              {tod && (
                <Card>
                  <div style={{ padding:'16px 24px 0' }}><div style={{ fontSize:15, fontWeight:700 }}>Ce mois</div></div>
                  <Row label="Total tokens"><span style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'var(--v)' }}>{(tod.month.used/1000000).toFixed(2)}M</span></Row>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background:'var(--bg2)', border:'1px solid var(--bsoft)', borderRadius:'var(--rlg)', overflow:'hidden', marginBottom:16 }}>{children}</div>
}
function Row({ label, desc, children }: { label:string; desc?:string; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 24px', borderTop: label?'1px solid var(--bsoft)':'none', gap:16 }}>
      <div style={{ flex:1 }}>
        {label && <div style={{ fontSize:14, fontWeight:600, marginBottom:desc?2:0 }}>{label}</div>}
        {desc && <div style={{ fontSize:12, color:'var(--text3)' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  )
}
function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div className={`toggle ${checked?'on':''}`} onClick={() => onChange(!checked)}>
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </div>
  )
}
