'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { LogoMark, ThemeToggle } from '@/components/layout'

// ─── Données ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free', name: 'Free', price: '0', currency: '€', per: 'pour toujours',
    tokens: '100K tokens/jour', rate: '10 req/min', highlight: false, popular: false,
    features: ['Syntax Free (hybride)', '1 clé API', 'Historique 7 jours'],
    locked:   ['Mode Solo', 'Modèles avancés', 'Export ZIP'],
    cta: 'Commencer',
  },
  {
    id: 'starter', name: 'Starter', price: '4,99', currency: '€', per: '/mois',
    tokens: '500K tokens/jour', rate: '30 req/min', highlight: false, popular: true,
    features: ['Free + Starter hybride', 'Mode Solo ✦ débloqué', '3 clés API', 'Historique 30 jours'],
    locked:   ['Modèles Pro & Team'],
    cta: 'Choisir Starter',
  },
  {
    id: 'pro', name: 'Pro', price: '14,99', currency: '€', per: '/mois',
    tokens: '2M tokens/jour', rate: '100 req/min', highlight: true, popular: false,
    features: ['Free → Pro hybride', 'Solo complet', '10 clés API', 'Historique illimité', 'Export ZIP'],
    locked:   [],
    cta: 'Choisir Pro',
  },
  {
    id: 'team', name: 'Team', price: '49,99', currency: '€', per: '/mois',
    tokens: '10M tokens/jour', rate: '500 req/min', highlight: false, popular: false,
    features: ['Tous les modèles', 'Solo maximal', 'API keys illimitées', 'Support dédié 24/7'],
    locked:   [],
    cta: 'Contacter',
  },
  {
    id: 'reseller', name: 'Reseller', price: '5', currency: '$', per: '/mois + usage',
    tokens: 'Illimité*', rate: '2 000 req/min', highlight: false, popular: false,
    features: ['Tokens pass-through', 'White-label', 'Domaines autorisés', 'Dashboard clients'],
    locked:   [],
    cta: 'Nous contacter',
  },
]

const FAQS = [
  { q: 'Comment les 3 IA travaillent-elles ensemble ?', a: 'Un orchestrateur décompose votre demande en 3 tâches spécialisées (backend, frontend, assets) et les distribue simultanément. Un contrat de synchronisation garantit la cohérence des types, endpoints et variables entre les 3 réponses.' },
  { q: 'Qu\'est-ce que le mode Solo ?', a: 'En mode Solo, vous interagissez directement avec une IA spécifique — Claude, GPT-4o ou Gemini — sans orchestration. Idéal pour une question ciblée sur un domaine précis. Disponible dès le plan Starter.' },
  { q: 'Comment fonctionne l\'API Reseller ?', a: 'Vous payez 5$/mois et vos clients utilisent vos tokens via votre clé sk-syntax-res-xxx. Ils ne voient jamais Syntax AI — c\'est votre propre service. Vous validez leurs domaines et recevez les webhooks d\'usage.' },
  { q: 'Les tokens se remettent à zéro quand ?', a: 'Chaque jour à minuit UTC. Les tokens non utilisés ne sont pas reportés. Vous recevez une alerte à 80% du quota.' },
  { q: 'Les réponses sont-elles traduites automatiquement ?', a: 'Oui, via Google Translate API. Le code n\'est jamais traduit — seulement les explications. Vous choisissez la langue dans les paramètres.' },
]

// ─── Hero Demo ────────────────────────────────────────────────────────────────
const DEMO_SEQUENCE = [
  { delay: 0,    text: 'Crée une API FastAPI' },
  { delay: 500,  text: 'Crée une API FastAPI avec' },
  { delay: 1000, text: 'Crée une API FastAPI avec auth JWT' },
  { delay: 1500, text: 'Crée une API FastAPI avec auth JWT et PostgreSQL' },
]

const DEMO_RESPONSES = {
  backend: `@app.post("/auth/token")
async def login(form: OAuth2Form, db = Depends()):
    user = await authenticate(db, form)
    if not user:
        raise HTTPException(401)
    return {"token": create_jwt(user.id)}`,
  frontend: `export function LoginForm() {
  const { login, loading } = useAuth()
  return (
    <form onSubmit={login} className="auth-form">
      <Input name="email" type="email" required />
      <Input name="password" type="password" required />
      <Button loading={loading}>Connexion</Button>
    </form>
  )
}`,
  docs: `# Auth API

## Endpoints
POST /auth/token  → JWT
GET  /me          → Profil

## Stack
- FastAPI + PostgreSQL
- Next.js + TypeScript
- Docker Compose`,
}

function HeroDemo() {
  const [typed, setTyped]     = useState('')
  const [phase, setPhase]     = useState<'typing' | 'loading' | 'done'>('typing')
  const [visible, setVisible] = useState({ backend: false, frontend: false, docs: false })
  const [backText, setBackText]  = useState('')
  const [frontText, setFrontText] = useState('')
  const [docsText, setDocsText]   = useState('')

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>

    // 1. Tape le prompt
    t = setTimeout(() => setTyped('Crée une API FastAPI avec auth JWT et PostgreSQL'), 600)

    // 2. Passe en loading
    const t2 = setTimeout(() => setPhase('loading'), 2200)

    // 3. Affiche les résultats
    const t3 = setTimeout(() => {
      setPhase('done')
      setVisible({ backend: true, frontend: false, docs: false })
      // Stream backend
      let i = 0
      const iv = setInterval(() => {
        i += 3
        setBackText(DEMO_RESPONSES.backend.slice(0, i))
        if (i >= DEMO_RESPONSES.backend.length) clearInterval(iv)
      }, 20)
    }, 3400)

    const t4 = setTimeout(() => {
      setVisible((v) => ({ ...v, frontend: true }))
      let i = 0
      const iv = setInterval(() => {
        i += 3
        setFrontText(DEMO_RESPONSES.frontend.slice(0, i))
        if (i >= DEMO_RESPONSES.frontend.length) clearInterval(iv)
      }, 20)
    }, 4000)

    const t5 = setTimeout(() => {
      setVisible((v) => ({ ...v, docs: true }))
      let i = 0
      const iv = setInterval(() => {
        i += 3
        setDocsText(DEMO_RESPONSES.docs.slice(0, i))
        if (i >= DEMO_RESPONSES.docs.length) clearInterval(iv)
      }, 20)
    }, 4600)

    return () => { clearTimeout(t); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: 860, marginTop: 64 }}>
      {/* Input simulé */}
      <div style={{
        background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: 'var(--sh)', marginBottom: 16,
      }}>
        <span style={{ fontSize: 15, color: 'var(--text3)' }}>⬡</span>
        <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>
          {typed}
          {phase === 'typing' && <span style={{ borderRight: '2px solid var(--v)', animation: 'pulse 1s infinite', marginLeft: 1 }}>&nbsp;</span>}
        </span>
        {phase === 'loading' && (
          <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--v)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        )}
        {phase === 'done' && <span style={{ fontSize: 12, color: 'var(--v)', fontWeight: 700 }}>✓</span>}
      </div>

      {/* 3 panneaux */}
      {phase !== 'typing' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { key: 'backend',  label: '🔵 Claude', color: '#FF6B35', sub: 'Backend', text: backText,  show: visible.backend },
            { key: 'frontend', label: '🟢 GPT',    color: '#10A37F', sub: 'Frontend', text: frontText, show: visible.frontend },
            { key: 'docs',     label: '🔴 Gemini', color: '#4285F4', sub: 'Docs',    text: docsText,  show: visible.docs },
          ].map((panel) => (
            <div key={panel.key} style={{
              background: 'var(--bg2)', border: '1px solid var(--bsoft)', borderRadius: 'var(--r)',
              overflow: 'hidden',
              opacity: panel.show ? 1 : 0,
              transform: panel.show ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 0.4s var(--ease)',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--bsoft)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: panel.color }}>{panel.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>— {panel.sub}</span>
              </div>
              <pre style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: 1.6,
                color: 'var(--text2)', padding: 12, margin: 0, overflow: 'hidden',
                whiteSpace: 'pre-wrap', minHeight: 100,
              }}>
                {panel.text}
                {panel.show && panel.text.length < DEMO_RESPONSES[panel.key as keyof typeof DEMO_RESPONSES].length && (
                  <span style={{ borderRight: '1px solid var(--v)', animation: 'pulse 0.8s infinite' }}>&nbsp;</span>
                )}
              </pre>
            </div>
          ))}
        </div>
      )}

      {phase === 'loading' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--r)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: 1100, height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', zIndex: 100, borderRadius: 'var(--rpill)',
      transition: 'all 0.3s var(--ease)',
      ...(scrolled
        ? { background: 'var(--surface)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }
        : { background: 'transparent', border: '1px solid transparent' }
      ),
    }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'var(--text)' }}>
        <WordMarkInline />
      </Link>

      <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0 }}>
        {[['#fonctionnalités','Fonctionnalités'],['#modèles','Modèles'],['#tarifs','Tarifs'],['#faq','FAQ']].map(([h, l]) => (
          <li key={l}>
            <a href={h} style={{ padding: '6px 13px', borderRadius: 'var(--rpill)', fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', transition: 'color var(--t)' }}>
              {l}
            </a>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <ThemeToggle />
        <Link href="/login" className="btn btn-ghost btn-sm">Connexion</Link>
        <Link href="/login" className="btn btn-primary btn-sm">Commencer →</Link>
      </div>
    </nav>
  )
}

function WordMarkInline() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>
      <LogoMark size={30} /> Syntax AI
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,78,255,.18),transparent 65%)', top: '0%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.14),transparent 65%)', bottom: '10%', left: '5%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'float 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,53,.1),transparent 65%)', top: '25%', right: '5%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'float 11s ease-in-out infinite reverse' }} />

        <div className="anim-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 10px', borderRadius: 'var(--rpill)', background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', fontSize: 12, fontWeight: 600, color: 'var(--v)', marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--v)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          Claude · GPT-4o · Gemini — Disponible maintenant
        </div>

        <h1 className="syne anim-up d1" style={{ fontSize: 'clamp(44px,7.5vw,88px)', lineHeight: 1.04, maxWidth: 860, marginBottom: 24 }}>
          Codez avec<br />
          <span style={{ background: 'linear-gradient(135deg,#6B4EFF,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>l'intelligence</span><br />
          collective
        </h1>

        <p className="anim-up d2" style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 500, lineHeight: 1.75, marginBottom: 44 }}>
          Trois IA spécialisées, une interface. Claude gère votre backend,
          GPT compose votre frontend, Gemini documente tout.
        </p>

        <div className="anim-up d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          <Link href="/login" className="btn btn-primary btn-xl">Commencer gratuitement →</Link>
          <a href="#fonctionnalités" className="btn btn-ghost btn-xl">Voir les fonctionnalités</a>
        </div>

        <div className="anim-up d4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['#FF6B35','Claude — Backend'],['#10A37F','GPT — Frontend'],['#4285F4','Gemini — Docs']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 'var(--rpill)', background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />{l}
            </div>
          ))}
        </div>

        <HeroDemo />
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: '1px solid var(--bsoft)', borderBottom: '1px solid var(--bsoft)', padding: '28px 24px', background: 'var(--bg2)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, flexWrap: 'wrap' }}>
          {[['3','IA collaborent'],['4','modèles hybrides'],['9','modèles solo'],['5','plans tarifaires']].map(([n, l]) => (
            <div key={n} style={{ textAlign: 'center' }}>
              <div className="syne" style={{ fontSize: 36, color: 'var(--v)', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" style={{ padding: '100px 24px' }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v)', marginBottom: 14 }}>Fonctionnalités</div>
          <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 56, maxWidth: 560 }}>Tout ce dont un développeur a besoin</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { icon: '⚡', t: '3 IA en parallèle',     d: 'Claude, GPT-4o et Gemini travaillent simultanément. Résultat cohérent en quelques secondes.' },
              { icon: '🎛', t: 'Hybride & Solo',         d: 'Mode Hybride pour les projets complets, mode Solo pour cibler le meilleur spécialiste.' },
              { icon: '🔗', t: 'Code synchronisé',       d: 'Un contrat de synchronisation garantit que backend et frontend partagent les mêmes types et endpoints.' },
              { icon: '🌍', t: 'Multilingue',             d: 'L\'IA répond dans votre langue via Google Translate. Le code n\'est jamais traduit.' },
              { icon: '🔑', t: 'API professionnelle',    d: 'Clés sk-syntax-xxx, mode reseller pour intégrer Syntax AI dans votre propre produit.' },
              { icon: '📊', t: 'Suivi des tokens',       d: 'Quotas journaliers clairs, dashboard en temps réel, alertes à 80%.' },
              { icon: '🚀', t: 'Streaming SSE',           d: 'Réponses en temps réel. Regardez les IA coder devant vous, panneau par panneau.' },
              { icon: '🔐', t: 'Auth complète',           d: 'Google, GitHub et email/password. OAuth2 côté backend, session sécurisée côté client.' },
              { icon: '📦', t: 'Export ZIP',              d: 'Exportez votre projet organisé : /backend, /frontend, /docs, README. Plan Pro.' },
            ].map((f) => (
              <div key={f.t} className="card" style={{ padding: 26, cursor: 'default' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--v-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 7 }}>{f.t}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ROLES ── */}
      <section id="modèles" style={{ padding: '100px 24px', background: 'var(--bg3)' }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v)', marginBottom: 14 }}>Mode Hybride</div>
          <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 48 }}>Chaque IA, son rôle</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 48 }}>
            {[
              { color: '#FF6B35', name: 'Claude', company: 'Anthropic', role: 'L\'Architecte', desc: 'Backend, logique métier, sécurité, APIs.', tasks: ['APIs REST & GraphQL','Auth & sécurité','Base de données','Tests backend'] },
              { color: '#10A37F', name: 'GPT-4o', company: 'OpenAI',    role: 'Le Designer',   desc: 'Frontend, composants React, UI/UX, CSS.', tasks: ['Composants React/Vue','CSS & Tailwind','State management','Tests composants'] },
              { color: '#4285F4', name: 'Gemini', company: 'Google',    role: 'Le Scribe',     desc: 'Docs, design system, Docker, CI/CD.', tasks: ['README & architecture','Docker & CI/CD','Design system','Schémas Mermaid'] },
            ].map((ai) => (
              <div key={ai.name} style={{ padding: 28, borderRadius: 'var(--rlg)', border: '1px solid var(--border)', background: 'var(--surface)', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ai.color }} />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--rpill)', background: `${ai.color}18`, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ai.color, marginBottom: 14 }}>{ai.name} — {ai.company}</div>
                <h3 className="syne" style={{ fontSize: 22, marginBottom: 10 }}>{ai.role}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 18 }}>{ai.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ai.tasks.map((t) => (
                    <div key={t} style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: ai.color, fontWeight: 700 }}>→</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Solo notice */}
          <div style={{ padding: '18px 22px', borderRadius: 'var(--r)', background: 'rgba(107,78,255,0.06)', border: '1px solid rgba(107,78,255,0.18)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🎛</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Mode Solo — dès le plan Starter</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
                Accédez directement à Claude, GPT-4o ou Gemini sans orchestration. Idéal pour les questions ciblées. Le plan Free est limité au mode Hybride uniquement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" style={{ padding: '100px 24px' }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v)', marginBottom: 14 }}>Tarifs</div>
          <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 56 }}>Simple. Transparent.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, alignItems: 'start' }}>
            {PLANS.map((plan) => (
              <div key={plan.id} style={{
                padding: 22, borderRadius: 'var(--rlg)', position: 'relative',
                border: `1.5px solid ${plan.highlight ? 'var(--v)' : 'var(--bsoft)'}`,
                background: plan.highlight ? 'linear-gradient(160deg,rgba(107,78,255,0.06),var(--bg2))' : 'var(--bg2)',
                boxShadow: plan.highlight ? 'var(--glow)' : 'none',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -1, right: 16, background: 'var(--v)', color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>Populaire</div>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>{plan.name}</div>
                <div className="syne" style={{ fontSize: 34, lineHeight: 1, marginBottom: 3 }}>{plan.currency}{plan.price}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 5 }}>{plan.per}</div>
                <div style={{ fontSize: 11, color: 'var(--v)', fontWeight: 600, marginBottom: 18 }}>{plan.tokens}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--v)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                  {plan.locked.map((f) => (
                    <li key={f} style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 7, alignItems: 'flex-start', textDecoration: 'line-through' }}>
                      <span style={{ flexShrink: 0 }}>✗</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ width: '100%' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 24px', background: 'var(--bg3)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v)', marginBottom: 14 }}>FAQ</div>
          <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 48 }}>Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden', borderRadius: 'var(--r)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', textAlign: 'left', gap: 16, cursor: 'pointer', background: 'none', border: 'none' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{faq.q}</span>
                  <span style={{ color: 'var(--v)', fontSize: 20, fontWeight: 700, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform var(--t) var(--ease)' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg,#4B2EDF,#6B4EFF,#3B82F6)', borderRadius: 'var(--rlg)', padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(255,255,255,0.08),transparent 65%)', pointerEvents: 'none' }} />
            <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,52px)', color: 'white', marginBottom: 14, position: 'relative' }}>Prêt à coder plus vite ?</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7, position: 'relative' }}>
              Rejoignez les développeurs qui utilisent l'intelligence collective pour livrer du code propre en quelques secondes.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <Link href="/login" style={{ background: 'white', color: '#4B2EDF', padding: '14px 28px', borderRadius: 'var(--rpill)', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Commencer gratuitement →
              </Link>
              <a href="https://platform.ai.syntax-lab.site" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', padding: '14px 28px', borderRadius: 'var(--rpill)', fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Voir la doc API →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--bsoft)', background: 'var(--bg2)' }}>
      <div className="container" style={{ padding: '56px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ marginBottom: 14 }}><WordMarkInline /></div>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>
              L'IA collaborative pour développeurs. Claude, GPT-4o et Gemini synchronisés pour du code propre et cohérent.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { href: 'https://twitter.com/syntaxai_dev', label: 'X', icon: '𝕏' },
                { href: 'https://github.com/syntax-lab',    label: 'GitHub',  icon: '⌥' },
                { href: 'https://discord.gg/syntaxai',      label: 'Discord', icon: '◈' },
                { href: 'https://linkedin.com/company/syntax-ai', label: 'LinkedIn', icon: 'in' },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} style={{ width: 34, height: 34, borderRadius: 'var(--rsm)', background: 'var(--bg3)', border: '1px solid var(--bsoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text3)', textDecoration: 'none', transition: 'all var(--t) var(--ease)' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Produit',     links: [['Fonctionnalités','#fonctionnalités'],['Modèles','#modèles'],['Tarifs','#tarifs'],['Changelog','/changelog'],['Status','/status']] },
            { title: 'Développeurs', links: [['Documentation','https://platform.ai.syntax-lab.site'],['API Reference','https://platform.ai.syntax-lab.site/reference'],['Exemples','https://platform.ai.syntax-lab.site/examples']] },
            { title: 'Légal',       links: [['CGU','/terms'],['Confidentialité','/privacy'],['Mentions légales','/legal'],['Cookies','/cookies']] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>{col.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} style={{ fontSize: 13, color: 'var(--text2)', transition: 'color var(--t)', textDecoration: 'none' }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--bsoft)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>© 2026 Syntax Lab — ai.syntax-lab.site — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['CGU','/terms'],['Confidentialité','/privacy'],['Mentions','/legal']].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function WordMarkInline() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--text)' }}>
      <LogoMark size={28} /> Syntax AI
    </div>
  )
}
