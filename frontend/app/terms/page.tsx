'use client'
import Link from 'next/link'
import { LogoMark } from '@/components/layout'

export default function TermsPage() {
  return <LegalPage title="Conditions Générales d'Utilisation" updated="20 juin 2026">
    <S title="1. Acceptation">
      <p>En accédant à Syntax AI (<strong>ai.syntax-lab.site</strong>), vous acceptez les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
    </S>
    <S title="2. Description du service">
      <p>Syntax AI est une plateforme qui orchestre Claude (Anthropic), GPT-4o (OpenAI) et Gemini (Google) pour assister les développeurs. Le service est fourni par <strong>Syntax Lab</strong>, Paris, France.</p>
    </S>
    <S title="3. Compte utilisateur">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
        <li>Vous devez avoir au moins 16 ans pour créer un compte.</li>
        <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
        <li>Chaque personne ne peut posséder qu'un seul compte gratuit.</li>
        <li>Vous devez notifier immédiatement tout accès non autorisé.</li>
      </ul>
    </S>
    <S title="4. Utilisation acceptable">
      <p>Vous vous engagez à ne pas utiliser Syntax AI pour générer du contenu illégal, contourner des systèmes de sécurité, créer des logiciels malveillants ou revendre l'accès sans souscrire au plan Reseller.</p>
    </S>
    <S title="5. Limites de tokens">
      <p>Chaque plan bénéficie d'un quota journalier. Les tokens non utilisés ne sont pas reportés. En cas de dépassement, les requêtes sont suspendues jusqu'à minuit UTC.</p>
    </S>
    <S title="6. Propriété intellectuelle">
      <p>Le code généré par Syntax AI appartient à l'utilisateur, sous réserve des conditions des fournisseurs d'IA tiers. La plateforme Syntax AI, son design et son code restent la propriété de Syntax Lab.</p>
    </S>
    <S title="7. Facturation">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
        <li>Les abonnements sont facturés mensuellement via Stripe.</li>
        <li>La résiliation prend effet à la fin de la période en cours.</li>
        <li>Aucun remboursement partiel n'est accordé sauf obligation légale.</li>
      </ul>
    </S>
    <S title="8. Limitation de responsabilité">
      <p>Syntax AI est fourni « en l'état ». Nous ne garantissons pas l'exactitude des réponses générées. L'utilisateur est seul responsable de l'utilisation du code en production.</p>
    </S>
    <S title="9. Droit applicable">
      <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la juridiction compétente de Paris.</p>
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
