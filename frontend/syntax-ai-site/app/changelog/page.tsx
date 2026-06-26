'use client'

import Link from 'next/link'
import { LogoMark, ThemeToggle } from '@/components/layout'

const CHANGELOG = [
  {
    version: '2.0.0',
    date: '20 juin 2026',
    tag: 'Majeur',
    tagColor: '#6B4EFF',
    title: 'Mode Solo + Google Translate',
    items: [
      { type: 'new', text: 'Mode Solo : accès direct à Claude, GPT-4o ou Gemini individuellement (Starter+)' },
      { type: 'new', text: 'Google Translate intégré — l\'IA répond dans votre langue, le code est préservé' },
      { type: 'new', text: 'Export ZIP des conversations : /backend, /frontend, /docs organisés (Pro+)' },
      { type: 'new', text: 'OAuth2 Google et GitHub — connexion en un clic' },
      { type: 'new', text: 'API Reseller : validation de domaines, webhooks d\'usage, tokens pass-through' },
      { type: 'improved', text: 'Orchestrateur v2 : contrat de synchronisation amélioré entre les 3 IA' },
      { type: 'improved', text: 'Rate limiting Redis sliding window par plan' },
      { type: 'improved', text: 'Dashboard avec usage temps réel, barre de tokens dans la sidebar' },
    ],
  },
  {
    version: '1.2.0',
    date: '1 juin 2026',
    tag: 'Fonctionnalité',
    tagColor: '#10A37F',
    title: 'Historique & Conversations CRUD',
    items: [
      { type: 'new', text: 'Historique complet avec recherche et filtres par mode' },
      { type: 'new', text: 'Renommer, archiver et supprimer les conversations' },
      { type: 'new', text: 'Pagination serveur pour les longues listes' },
      { type: 'improved', text: 'Streaming SSE amélioré — identification par panneau en temps réel' },
      { type: 'fixed', text: 'Correction du rechargement de conversation depuis l\'URL' },
    ],
  },
  {
    version: '1.1.0',
    date: '15 mai 2026',
    tag: 'Fonctionnalité',
    tagColor: '#10A37F',
    title: 'Clés API & Billing Stripe',
    items: [
      { type: 'new', text: 'Gestion des clés API : create, revoke, types free/pay/reseller' },
      { type: 'new', text: 'Intégration Stripe : checkout, portail client, webhooks' },
      { type: 'new', text: 'Plans Starter (4,99€), Pro (14,99€), Team (49,99€)' },
      { type: 'new', text: 'Tracking des tokens journaliers par utilisateur dans Redis' },
      { type: 'improved', text: 'Middleware de protection des routes' },
    ],
  },
  {
    version: '1.0.0',
    date: '1 mai 2026',
    tag: 'Lancement',
    tagColor: '#FF6B35',
    title: 'Lancement de Syntax AI',
    items: [
      { type: 'new', text: 'Mode Hybride : Claude (backend) + GPT-4o (frontend) + Gemini (docs) en parallèle' },
      { type: 'new', text: 'Orchestrateur avec contrat de synchronisation automatique' },
      { type: 'new', text: 'Authentification email/password avec JWT' },
      { type: 'new', text: 'Streaming SSE — réponses en temps réel panneau par panneau' },
      { type: 'new', text: '4 modèles hybrides : Free, Starter, Pro, Team' },
    ],
  },
]

const TYPE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  new:      { label: 'Nouveau',    color: '#10A37F', bg: 'rgba(16,163,127,0.1)' },
  improved: { label: 'Amélioration', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  fixed:    { label: 'Correction', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  removed:  { label: 'Supprimé',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

export default function ChangelogPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--bsoft)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--text)', textDecoration: 'none' }}>
          <LogoMark size={30} /> Syntax AI
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <ThemeToggle />
          <Link href="/" className="btn btn-ghost btn-sm">← Accueil</Link>
        </div>
      </nav>

      <div className="container" style={{ padding: '80px 24px 100px', maxWidth: 760 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v)', marginBottom: 14 }}>Changelog</div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>Nouveautés</h1>
        <p style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 64, lineHeight: 1.7 }}>
          Toutes les mises à jour de Syntax AI, du plus récent au plus ancien.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CHANGELOG.map((release, i) => (
            <div key={release.version} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 32, paddingBottom: 56, borderBottom: i < CHANGELOG.length - 1 ? '1px solid var(--bsoft)' : 'none', marginBottom: i < CHANGELOG.length - 1 ? 56 : 0 }}>
              {/* Left */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>v{release.version}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>{release.date}</div>
                <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 'var(--rpill)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: `${release.tagColor}14`, color: release.tagColor }}>
                  {release.tag}
                </span>
              </div>

              {/* Right */}
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>{release.title}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {release.items.map((item, j) => {
                    const style = TYPE_STYLE[item.type] || TYPE_STYLE.new
                    return (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 'var(--rpill)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: style.bg, color: style.color, marginTop: 2, whiteSpace: 'nowrap' }}>
                          {style.label}
                        </span>
                        <span style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{item.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
