'use client'
import Link from 'next/link'
import { LogoMark } from '@/components/layout'

export default function PrivacyPage() {
  return <LegalPage title="Politique de Confidentialité" updated="20 juin 2026">
    <S title="1. Responsable du traitement">
      <p><strong>Syntax Lab</strong>, Paris, France — contact@syntax-lab.site. Conforme au RGPD (UE 2016/679).</p>
    </S>
    <S title="2. Données collectées">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
        <li><strong>Compte :</strong> nom, email, mot de passe haché (ou ID OAuth)</li>
        <li><strong>Usage :</strong> conversations, tokens, modèles utilisés</li>
        <li><strong>Paiement :</strong> géré exclusivement par Stripe (aucun numéro de carte stocké)</li>
        <li><strong>Technique :</strong> IP, navigateur, logs d'accès 90 jours</li>
      </ul>
    </S>
    <S title="3. Finalités">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
        <li>Fourniture et amélioration du service</li>
        <li>Gestion des comptes et abonnements</li>
        <li>Prévention de la fraude et sécurité</li>
        <li>Communication transactionnelle uniquement</li>
      </ul>
    </S>
    <S title="4. Partage des données">
      <p>Vos données ne sont jamais vendues. Elles sont partagées avec : Anthropic, OpenAI, Google (prompts API), Stripe (paiements), AWS (hébergement), Sentry (erreurs anonymisées).</p>
    </S>
    <S title="5. Conservation">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
        <li>Conversations : 7j (Free), 30j (Starter), illimité (Pro/Team)</li>
        <li>Données de compte : durée d'abonnement + 1 an</li>
        <li>Facturation : 10 ans (obligation légale)</li>
      </ul>
    </S>
    <S title="6. Vos droits (RGPD)">
      <p>Accès, rectification, effacement, portabilité, opposition — via <a href="mailto:contact@syntax-lab.site" style={{ color:'var(--v)' }}>contact@syntax-lab.site</a>. Vous pouvez saisir la CNIL en cas de litige.</p>
    </S>
    <S title="7. Sécurité">
      <p>TLS 1.3, bcrypt pour les mots de passe, clés API hachées, accès restreint aux données de production, audits réguliers.</p>
    </S>
  </LegalPage>
}

function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ borderBottom:'1px solid var(--bsoft)', background:'var(--bg2)', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, letterSpacing:'-0.03em', color:'var(--text)', textDecoration:'none' }}>
          <LogoMark size={28} /> Syntax AI
        </Link>
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
      <div style={{ borderTop:'1px solid var(--bsoft)', padding:24, textAlign:'center', fontSize:12, color:'var(--text3)' }}>© 2026 Syntax Lab — ai.syntax-lab.site</div>
    </div>
  )
}

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom:'1px solid var(--bsoft)', paddingBottom:24, marginBottom:24 }}>
      <h2 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>{title}</h2>
      <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.8, display:'flex', flexDirection:'column', gap:8 }}>{children}</div>
    </div>
  )
}
