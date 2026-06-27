'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogoMark, ThemeToggle } from '@/components/layout'
import { useAuthStore } from '@/lib/store'
import { billing as billingApi } from '@/lib/api'

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, currency: '€', per: 'pour toujours',
    tokens: '100K', rate: '10/min', keys: 1, history: '7 jours',
    solo: false, highlight: false, popular: false,
    features: [
      'Modèle Syntax Free (hybride)',
      '1 clé API gratuite',
      'Historique 7 jours',
      'Support communauté',
    ],
    locked: ['Mode Solo', 'Modèles avancés', 'Export ZIP', 'Support email'],
  },
  {
    id: 'starter', name: 'Starter', price: 4.99, currency: '€', per: '/mois',
    tokens: '500K', rate: '30/min', keys: 3, history: '30 jours',
    solo: true, highlight: false, popular: true,
    features: [
      'Modèles Free + Starter hybride',
      'Mode Solo ✦ débloqué',
      '3 clés API',
      'Historique 30 jours',
      'Support email',
    ],
    locked: ['Modèles Pro & Team', 'Export ZIP'],
  },
  {
    id: 'pro', name: 'Pro', price: 14.99, currency: '€', per: '/mois',
    tokens: '2M', rate: '100/min', keys: 10, history: 'Illimité',
    solo: true, highlight: true, popular: false,
    features: [
      'Modèles Free → Pro',
      'Mode Solo complet',
      '10 clés API',
      'Historique illimité',
      'Export ZIP du code',
      'Support prioritaire',
    ],
    locked: [],
  },
  {
    id: 'team', name: 'Team', price: 49.99, currency: '€', per: '/mois',
    tokens: '10M', rate: '500/min', keys: -1, history: 'Illimité',
    solo: true, highlight: false, popular: false,
    features: [
      'Tous les modèles',
      'Mode Solo maximal',
      'Clés API illimitées',
      'Historique illimité',
      'Export ZIP',
      'Support dédié 24/7',
      'SLA 99,9%',
    ],
    locked: [],
  },
  {
    id: 'reseller', name: 'API Reseller', price: 5, currency: '$', per: '/mois + usage',
    tokens: 'Illimité', rate: '2000/min', keys: -1, history: 'Illimité',
    solo: true, highlight: false, popular: false,
    features: [
      'Tokens pass-through illimités',
      'White-label ready',
      'Domaines autorisés',
      'Dashboard analytics clients',
      'Webhooks d\'usage',
      'SLA 99,9%',
    ],
    locked: [],
  },
]

const COMPARE_ROWS = [
  { label: 'Tokens / jour',       values: ['100K', '500K', '2M', '10M', '∞'] },
  { label: 'Requêtes / minute',   values: ['10', '30', '100', '500', '2 000'] },
  { label: 'Clés API',            values: ['1', '3', '10', '∞', '∞'] },
  { label: 'Mode Hybride',        values: ['✓', '✓', '✓', '✓', '✓'] },
  { label: 'Mode Solo',           values: ['✗', '✓', '✓', '✓', '✓'] },
  { label: 'Historique',          values: ['7j', '30j', '∞', '∞', '∞'] },
  { label: 'Export ZIP',          values: ['✗', '✗', '✓', '✓', '✓'] },
  { label: 'Support',             values: ['Communauté', 'Email', 'Prioritaire', 'Dédié 24/7', 'Dédié 24/7'] },
  { label: 'SLA',                 values: ['—', '—', '—', '99,9%', '99,9%'] },
  { label: 'White-label',         values: ['✗', '✗', '✗', '✗', '✓'] },
]

export default function PricingPage() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  const handleCTA = async (planId: string) => {
    if (planId === 'free') { router.push('/login'); return }
    if (planId === 'reseller' || planId === 'team') {
      window.open('mailto:contact@syntax-lab.site?subject=Plan ' + planId, '_blank')
      return
    }
    if (!accessToken) { router.push('/login?redirect=/pricing'); return }

    setLoading(planId)
    try {
      const { checkout_url } = await billingApi.checkout(accessToken, planId)
      window.location.href = checkout_url
    } catch {
      router.push('/login')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--bsoft)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--text)', textDecoration: 'none' }}>
          <LogoMark size={30} /> Syntax AI
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <ThemeToggle />
          {user
            ? <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard →</Link>
            : <Link href="/login" className="btn btn-primary btn-sm">Commencer →</Link>
          }
        </div>
      </nav>

      <div className="container" style={{ padding: '80px 24px 100px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v)', marginBottom: 14 }}>Tarifs</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16 }}>Simple. Transparent.</h1>
          <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Commencez gratuitement. Passez à un plan supérieur quand vous en avez besoin.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 40, alignItems: 'start' }}>
          {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id
            return (
              <div key={plan.id} style={{
                padding: 22, borderRadius: 'var(--rlg)', position: 'relative',
                border: `1.5px solid ${plan.highlight ? 'var(--v)' : isCurrent ? 'var(--v)' : 'var(--bsoft)'}`,
                background: plan.highlight ? 'linear-gradient(160deg,rgba(107,78,255,0.06),var(--bg2))' : 'var(--bg2)',
                boxShadow: plan.highlight ? 'var(--glow)' : 'none',
              }}>
                {plan.popular && !isCurrent && (
                  <div style={{ position: 'absolute', top: -1, right: 16, background: 'var(--v)', color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>Populaire</div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -1, right: 16, background: '#10A37F', color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>Votre plan</div>
                )}

                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>{plan.name}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 3 }}>
                  {plan.currency}{plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.',',')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 5 }}>{plan.per}</div>
                <div style={{ fontSize: 11, color: 'var(--v)', fontWeight: 600, marginBottom: 18 }}>{plan.tokens} tokens/jour</div>

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

                <button
                  onClick={() => handleCTA(plan.id)}
                  disabled={loading === plan.id || isCurrent}
                  className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  style={{ width: '100%', opacity: isCurrent ? 0.6 : 1 }}
                >
                  {loading === plan.id ? '...' : isCurrent ? 'Plan actuel' : plan.id === 'free' ? 'Commencer' : plan.id === 'reseller' || plan.id === 'team' ? 'Contacter →' : `Choisir ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Compare toggle */}
        <div style={{ textAlign: 'center', marginBottom: showCompare ? 32 : 0 }}>
          <button onClick={() => setShowCompare(!showCompare)} className="btn btn-ghost btn-sm">
            {showCompare ? '▲ Masquer' : '▼ Comparer tous les plans'}
          </button>
        </div>

        {/* Comparison table */}
        {showCompare && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bsoft)', borderRadius: 'var(--rlg)', overflow: 'hidden', marginTop: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--bsoft)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: 'var(--text3)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fonctionnalité</th>
                  {PLANS.map((p) => (
                    <th key={p.id} style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, fontFamily: 'Syne,sans-serif', fontSize: 13, color: user?.plan === p.id ? 'var(--v)' : 'var(--text)' }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--bsoft)' : 'none' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text2)' }}>{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} style={{ padding: '12px 16px', textAlign: 'center', color: v === '✓' ? '#10A37F' : v === '✗' ? 'var(--text3)' : 'var(--text)', fontWeight: v === '✓' || v === '✗' ? 700 : 500, fontSize: v === '✓' || v === '✗' ? 16 : 13 }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FAQ */}
        <div style={{ marginTop: 80, maxWidth: 640, margin: '80px auto 0' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 32, textAlign: 'center' }}>Questions fréquentes</h2>
          {[
            { q: 'Les tokens se remettent à zéro quand ?', a: 'Chaque jour à minuit UTC. Les tokens non utilisés ne sont pas reportés au lendemain.' },
            { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui. L\'upgrade est immédiat. Le downgrade prend effet à la fin de la période en cours.' },
            { q: 'Qu\'est-ce que le plan Reseller ?', a: 'Vous payez 5$/mois et vos clients utilisent vos tokens via votre clé sk-syntax-res-xxx. Parfait pour intégrer Syntax AI dans votre SaaS.' },
            { q: 'Y a-t-il un engagement ?', a: 'Non. Tous les plans sont sans engagement, résiliables à tout moment depuis les paramètres.' },
          ].map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ marginBottom: 8, borderRadius: 'var(--r)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{q}</span>
        <span style={{ color: 'var(--v)', fontSize: 18, fontWeight: 700, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform var(--t) var(--ease)', flexShrink: 0 }}>+</span>
      </button>
      {open && <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{a}</div>}
    </div>
  )
}
