'use client'
import { useState } from 'react'
import Link from 'next/link'

type SettingsSection = 'profile' | 'plan' | 'appearance' | 'language' | 'apikeys' | 'usage'

const SECTIONS = [
  { id: 'profile',    icon: '👤', label: 'Profil',            group: 'Compte' },
  { id: 'plan',       icon: '⚡', label: 'Plan & Facturation', group: 'Compte' },
  { id: 'appearance', icon: '🎨', label: 'Apparence',          group: 'Préférences' },
  { id: 'language',   icon: '🌍', label: 'Langue',             group: 'Préférences' },
  { id: 'apikeys',    icon: '🔑', label: 'Clés API',           group: 'Développeur' },
  { id: 'usage',      icon: '📊', label: 'Usage & Tokens',     group: 'Développeur' },
] as const

const API_KEYS = [
  { id: '1', name: 'Clé gratuite',   key: 'sk-syntax-free-a1b2c3d4e5f6g7h8i9j0k1l2', type: 'Free',     used: 42130,  limit: 50000,   active: true },
  { id: '2', name: 'App production', key: 'sk-syntax-pay-x7y8z9a0b1c2d3e4f5g6h7i8',  type: 'Pay',      used: 820000, limit: 2000000, active: true },
  { id: '3', name: 'Reseller',       key: 'sk-syntax-res-f5g6h7i8j9k0l1m2n3o4p5q6',  type: 'Reseller', used: 0,      limit: -1,      active: true },
]

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
]

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>('profile')
  const [toast, setToast] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [uiLang, setUiLang] = useState('fr')
  const [aiLang, setAiLang] = useState('fr')
  const [translateOn, setTranslateOn] = useState(true)
  const [preserveCode, setPreserveCode] = useState(true)
  const [fontSize, setFontSize] = useState('normale')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    showToast('Clé copiée')
  }

  const toggleDark = (val: boolean) => {
    setDark(val)
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light')
  }

  const groups = [...new Set(SECTIONS.map(s => s.group))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 'var(--r)', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-lg)' }}>
          {toast}
        </div>
      )}

      <div style={{ height: 56, borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Paramètres</span>
        <button onClick={() => toggleDark(!dark)} style={{ width: 34, height: 34, borderRadius: 'var(--r-pill)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }}>
          {dark ? '🌙' : '☀️'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, overflow: 'hidden' }}>
        <nav style={{ borderRight: '1px solid var(--border-soft)', padding: '16px 10px', overflowY: 'auto', background: 'var(--bg)' }}>
          {groups.map(group => (
            <div key={group}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '12px 10px 5px' }}>{group}</div>
              {SECTIONS.filter(s => s.group === group).map(s => (
                <button key={s.id} onClick={() => setActive(s.id as SettingsSection)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                  borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: active === s.id ? 600 : 500,
                  color: active === s.id ? 'var(--v-500)' : 'var(--text-2)',
                  background: active === s.id ? 'var(--v-50)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  transition: 'all var(--t) var(--ease)',
                }}>
                  <span style={{ fontSize: 15 }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ overflowY: 'auto', padding: 28, background: 'var(--bg)' }}>

          {active === 'profile' && (
            <div>
              <PageHeader title="Profil" sub="Gérez vos informations personnelles." />
              <Card>
                <Row label="Photo de profil" desc="JPG, PNG — max 2 MB">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white' }}>JD</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => showToast('Upload disponible en production')}>Modifier</button>
                  </div>
                </Row>
                <Row label="Nom complet"><input className="input" defaultValue="Jean Dupont" style={{ maxWidth: 240 }} /></Row>
                <Row label="Email" desc="Connecté via Google"><input className="input" value="jean@dupont.fr" disabled style={{ maxWidth: 240, opacity: 0.6 }} /></Row>
                <Row label=""><button className="btn btn-primary btn-sm" onClick={() => showToast('✅ Profil sauvegardé')}>Sauvegarder</button></Row>
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Connexions sociales</div></div>
                {[
                  { label: 'Google', sub: 'jean@dupont.fr', connected: true },
                  { label: 'GitHub', sub: '@jean-dupont',   connected: false },
                ].map(s => (
                  <Row key={s.label} label={s.label} desc={s.sub}>
                    <button className={`btn btn-sm ${s.connected ? 'btn-ghost' : 'btn-outline'}`} onClick={() => showToast(`${s.connected ? '✅ Déconnecté de' : '🔗 Connecté à'} ${s.label}`)}>
                      {s.connected ? 'Déconnecter' : 'Connecter'}
                    </button>
                  </Row>
                ))}
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>Zone de danger</div></div>
                <Row label="Supprimer le compte" desc="Action irréversible.">
                  <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-pill)' }} onClick={() => showToast('⚠️ Confirmation requise')}>
                    Supprimer
                  </button>
                </Row>
              </Card>
            </div>
          )}

          {active === 'plan' && (
            <div>
              <PageHeader title="Plan & Facturation" sub="Gérez votre abonnement." />
              <Card>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800 }}>Plan Pro</span>
                      <span style={{ padding: '3px 8px', borderRadius: 'var(--r-pill)', background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', color: 'white', fontSize: 10, fontWeight: 700 }}>Actif</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>14,99€/mois · Renouvellement : 20 juil. 2026</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => showToast('📄 Portail Stripe')}>Gérer</button>
                    <Link href="/#tarifs" className="btn btn-primary btn-sm">Changer →</Link>
                  </div>
                </div>
                <Row label="Tokens aujourd'hui" desc="342 032 / 2 000 000">
                  <div>
                    <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: 'var(--v-500)' }}>17%</div>
                    <div style={{ height: 3, width: 160, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                      <div style={{ height: '100%', width: '17%', background: 'linear-gradient(90deg,var(--v-500),var(--b-500))', borderRadius: 2 }} />
                    </div>
                  </div>
                </Row>
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Factures récentes</div></div>
                {[['20 juin 2026','14,99€'],['20 mai 2026','14,99€'],['20 avr. 2026','14,99€']].map(([d,a]) => (
                  <Row key={d} label={d} desc={a}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10A37F', background: 'rgba(16,163,127,0.1)', padding: '3px 8px', borderRadius: 'var(--r-pill)' }}>Payée</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => showToast('📥 Facture téléchargée')}>PDF</button>
                    </div>
                  </Row>
                ))}
              </Card>
            </div>
          )}

          {active === 'appearance' && (
            <div>
              <PageHeader title="Apparence" sub="Personnalisez l'interface." />
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700 }}>Thème</div></div>
                <div style={{ padding: '14px 24px 20px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  {[
                    { id: 'light', label: 'Clair',  icon: '☀️', bg: '#F8F7FF' },
                    { id: 'dark',  label: 'Sombre', icon: '🌙', bg: '#09091A' },
                  ].map(t => (
                    <button key={t.id} onClick={() => toggleDark(t.id === 'dark')} style={{
                      padding: 16, borderRadius: 'var(--r)', background: t.bg, cursor: 'pointer', textAlign: 'left',
                      border: `2px solid ${(!dark && t.id==='light')||(dark && t.id==='dark') ? 'var(--v-500)' : 'transparent'}`,
                      transition: 'border-color var(--t) var(--ease)',
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.id === 'dark' ? '#EEE9FF' : '#0D0B1E' }}>{t.label}</div>
                    </button>
                  ))}
                </div>
                <Row label="Taille du texte">
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Petite','Normale','Grande'].map(s => (
                      <button key={s} onClick={() => { setFontSize(s); showToast(`Taille : ${s}`) }} style={{
                        padding: '6px 12px', borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: fontSize === s ? 'var(--v-500)' : 'var(--bg-3)', color: fontSize === s ? 'white' : 'var(--text-2)',
                        border: '1px solid var(--border-soft)', transition: 'all var(--t) var(--ease)',
                      }}>{s}</button>
                    ))}
                  </div>
                </Row>
              </Card>
            </div>
          )}

          {active === 'language' && (
            <div>
              <PageHeader title="Langue" sub="L'IA répondra dans la langue choisie via Google Translate API." />
              <Card>
                <div style={{ padding: '16px 24px 0' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Interface</div>
                </div>
                <div style={{ padding: '8px 24px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setUiLang(l.code); showToast(`✅ Interface : ${l.label}`) }} style={{
                      padding: '9px 12px', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      border: `1.5px solid ${uiLang === l.code ? 'var(--v-500)' : 'var(--border-soft)'}`,
                      background: uiLang === l.code ? 'var(--v-50)' : 'var(--bg)',
                      fontSize: 12, fontWeight: uiLang === l.code ? 700 : 500,
                      color: uiLang === l.code ? 'var(--v-600)' : 'var(--text-2)',
                      transition: 'all var(--t) var(--ease)',
                    }}>
                      <span style={{ fontSize: 16 }}>{l.flag}</span>{l.label}
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>Réponses IA</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'rgba(66,133,244,0.1)', color: '#4285F4' }}>Google Translate</span>
                  </div>
                </div>
                <Row label="Traduction automatique" desc="Traduit les explications de l'IA">
                  <Toggle checked={translateOn} onChange={val => { setTranslateOn(val); showToast(val ? '🌍 Traduction activée' : '🌍 Désactivée') }} />
                </Row>
                {translateOn && (
                  <>
                    <Row label="Langue cible">
                      <select value={aiLang} onChange={e => { setAiLang(e.target.value); showToast('✅ Langue IA mise à jour') }} style={{ padding: '8px 12px', borderRadius: 'var(--r)', background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                      </select>
                    </Row>
                    <Row label="Préserver le code" desc="Ne traduit que les explications, jamais le code">
                      <Toggle checked={preserveCode} onChange={setPreserveCode} />
                    </Row>
                  </>
                )}
              </Card>
              <div style={{ padding: 14, borderRadius: 'var(--r)', background: 'var(--v-50)', border: '1px solid var(--v-200)', display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--v-700)', lineHeight: 1.6 }}>
                <span>💡</span>
                <span>La traduction utilise Google Cloud Translate. Latence additionnelle ~200ms. Les blocs de code ne sont jamais traduits.</span>
              </div>
            </div>
          )}

          {active === 'apikeys' && (
            <div>
              <PageHeader title="Clés API" sub="La clé complète n'est visible qu'à la création." />
              <Card>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Clés actives (3 / 10)</div>
                  <button className="btn btn-primary btn-sm" onClick={() => showToast('🔑 Clé créée — visible une seule fois')}>+ Créer</button>
                </div>
                {API_KEYS.map(k => (
                  <div key={k.id} style={{ padding: '14px 24px', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--v-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {k.type === 'Free' ? '🔑' : k.type === 'Pay' ? '⚡' : '🏪'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{k.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--v-500)', background: 'var(--v-50)', padding: '2px 7px', borderRadius: 'var(--r-pill)' }}>{k.type}</span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--text-3)' }}>
                        {k.key.slice(0, 22)}•••{k.key.slice(-4)}
                      </div>
                      {k.limit !== -1 && (
                        <div style={{ marginTop: 5 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{(k.used/1000).toFixed(0)}K / {(k.limit/1000000).toFixed(1)}M tokens</div>
                          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', width: 160 }}>
                            <div style={{ height: '100%', width: `${Math.round(k.used/k.limit*100)}%`, background: 'linear-gradient(90deg,var(--v-500),var(--b-500))' }} />
                          </div>
                        </div>
                      )}
                      {k.limit === -1 && <div style={{ fontSize: 11, color: '#10A37F', fontWeight: 600, marginTop: 3 }}>Tokens illimités</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => copyKey(k.key)}>{copiedKey === k.key ? '✓' : 'Copier'}</button>
                      <button className="btn btn-sm" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--r-pill)', padding: '7px 12px', fontSize: 12, fontWeight: 600 }} onClick={() => showToast('🗑 Clé révoquée')}>Révoquer</button>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Config Reseller</div></div>
                <Row label="Domaines autorisés"><input className="input" defaultValue="monapp.com, autre.io" style={{ maxWidth: 280 }} /></Row>
                <Row label="Webhook tokens"><input className="input" placeholder="https://monapp.com/webhook" style={{ maxWidth: 280 }} /></Row>
                <Row label=""><button className="btn btn-primary btn-sm" onClick={() => showToast('✅ Config sauvegardée')}>Sauvegarder</button></Row>
              </Card>
            </div>
          )}

          {active === 'usage' && (
            <div>
              <PageHeader title="Usage & Tokens" sub="Consommation en temps réel." />
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700 }}>Aujourd'hui</div></div>
                <Row label="Tokens" desc="342 032 / 2 000 000">
                  <div>
                    <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--v-500)' }}>17%</div>
                    <div style={{ height: 4, width: 180, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                      <div style={{ height: '100%', width: '17%', background: 'linear-gradient(90deg,var(--v-500),var(--b-500))', borderRadius: 2 }} />
                    </div>
                  </div>
                </Row>
                <Row label="Requêtes"><span style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>47</span></Row>
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700 }}>Ce mois</div></div>
                <Row label="Total tokens"><span style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: 'var(--v-500)' }}>4,2M</span></Row>
                <Row label="Conversations"><span style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>312</span></Row>
              </Card>
              <Card>
                <div style={{ padding: '16px 24px 0' }}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Par mode</div></div>
                <div style={{ padding: '8px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: '⬡ Hybride', pct: 68, color: 'var(--v-500)' },
                    { label: '🔵 Claude', pct: 18, color: '#FF6B35' },
                    { label: '🟢 GPT',    pct: 10, color: '#10A37F' },
                    { label: '🔴 Gemini', pct: 4,  color: '#4285F4' },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5, color: 'var(--text-2)' }}>
                        <span>{m.label}</span><span>{m.pct}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return <div style={{ marginBottom: 24 }}><h1 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{title}</h1><p style={{ fontSize: 14, color: 'var(--text-2)' }}>{sub}</p></div>
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 16 }}>{children}</div>
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 24px', borderTop: label ? '1px solid var(--border-soft)' : 'none', gap: 16 }}>
      <div style={{ flex: 1 }}>
        {label && <div style={{ fontSize: 14, fontWeight: 600, marginBottom: desc ? 2 : 0 }}>{label}</div>}
        {desc && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }} onClick={() => onChange(!checked)}>
      <div style={{ position: 'absolute', inset: 0, background: checked ? 'var(--v-500)' : 'var(--border)', borderRadius: 12, transition: 'background var(--t) var(--ease)' }} />
      <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left var(--t) var(--ease-spring)' }} />
    </div>
  )
}
