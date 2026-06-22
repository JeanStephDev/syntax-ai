/* ═══════════════════════════════════════════════════════════
   LEGAL PAGES — CGU, Confidentialité, Mentions légales
   File: app/(legal)/terms/page.tsx  (duplicate pattern for others)
═══════════════════════════════════════════════════════════ */

// ── terms/page.tsx ──────────────────────────────────────────
export function TermsPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updated="20 juin 2026">
      <Section title="1. Acceptation des conditions">
        <p>En accédant à Syntax AI (<strong>ai.syntax-lab.site</strong>), vous acceptez les présentes Conditions Générales d'Utilisation (« CGU »). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
      </Section>

      <Section title="2. Description du service">
        <p>Syntax AI est une plateforme d'intelligence artificielle collaborative qui agrège et orchestre plusieurs modèles d'IA (Claude d'Anthropic, GPT d'OpenAI, Gemini de Google) pour assister les développeurs dans leurs tâches de programmation.</p>
        <p>Le service est fourni par <strong>Syntax Lab</strong>, société dont le siège social est à Paris, France.</p>
      </Section>

      <Section title="3. Compte utilisateur">
        <ul>
          <li>Vous devez avoir au moins 16 ans pour créer un compte.</li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
          <li>Vous devez notifier immédiatement tout accès non autorisé à votre compte.</li>
          <li>Chaque personne ne peut posséder qu'un seul compte gratuit.</li>
        </ul>
      </Section>

      <Section title="4. Utilisation acceptable">
        <p>Vous vous engagez à ne pas utiliser Syntax AI pour :</p>
        <ul>
          <li>Générer du contenu illégal, malveillant ou violant des droits tiers</li>
          <li>Contourner les mesures de sécurité des systèmes informatiques</li>
          <li>Créer des logiciels malveillants, virus ou contenus nuisibles</li>
          <li>Collecter des données d'autres utilisateurs sans consentement</li>
          <li>Revendre l'accès au service sans souscrire au plan Reseller</li>
        </ul>
      </Section>

      <Section title="5. Limites d'utilisation et tokens">
        <p>Chaque plan bénéficie d'un quota de tokens journaliers. Les tokens non utilisés ne sont pas reportés. En cas de dépassement :</p>
        <ul>
          <li>Les requêtes sont suspendues jusqu'à minuit UTC</li>
          <li>Aucun remboursement n'est accordé pour les tokens non utilisés</li>
          <li>Le service peut être interrompu en cas d'abus détecté</li>
        </ul>
      </Section>

      <Section title="6. Propriété intellectuelle">
        <p>Le code, le texte et les autres contenus générés par Syntax AI via les API des tiers appartiennent à l'utilisateur, sous réserve des conditions d'utilisation d'Anthropic, OpenAI et Google. Syntax AI ne revendique aucun droit sur les outputs générés.</p>
        <p>La plateforme Syntax AI, son design, son code et sa marque restent la propriété exclusive de Syntax Lab.</p>
      </Section>

      <Section title="7. Facturation et remboursements">
        <ul>
          <li>Les abonnements sont facturés mensuellement via Stripe</li>
          <li>La résiliation prend effet à la fin de la période en cours</li>
          <li>Aucun remboursement partiel n'est accordé sauf obligation légale</li>
          <li>Les prix peuvent être modifiés avec un préavis de 30 jours</li>
        </ul>
      </Section>

      <Section title="8. Limitation de responsabilité">
        <p>Syntax AI est fourni « en l'état ». Nous ne garantissons pas l'exactitude, la complétude ou l'adéquation des réponses générées par les IA. L'utilisateur est seul responsable de l'utilisation du code produit en production.</p>
      </Section>

      <Section title="9. Résiliation">
        <p>Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis et sans remboursement.</p>
      </Section>

      <Section title="10. Droit applicable">
        <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la juridiction compétente de Paris.</p>
      </Section>
    </LegalLayout>
  )
}

// ── privacy/page.tsx ─────────────────────────────────────────
export function PrivacyPage() {
  return (
    <LegalLayout title="Politique de Confidentialité" updated="20 juin 2026">
      <Section title="1. Responsable du traitement">
        <p><strong>Syntax Lab</strong>, Paris, France — contact@syntax-lab.site</p>
        <p>Syntax AI est conforme au Règlement Général sur la Protection des Données (RGPD — UE 2016/679).</p>
      </Section>

      <Section title="2. Données collectées">
        <p>Nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Données de compte :</strong> nom, adresse email, mot de passe haché</li>
          <li><strong>Données d'utilisation :</strong> conversations, tokens consommés, modèles utilisés</li>
          <li><strong>Données de paiement :</strong> gérées exclusivement par Stripe (nous ne stockons pas les numéros de carte)</li>
          <li><strong>Données techniques :</strong> adresse IP, navigateur, système d'exploitation, logs d'accès</li>
          <li><strong>Cookies :</strong> session, préférences, analytics anonymisés</li>
        </ul>
      </Section>

      <Section title="3. Finalités du traitement">
        <ul>
          <li>Fourniture et amélioration du service</li>
          <li>Gestion des comptes et des abonnements</li>
          <li>Prévention de la fraude et sécurité</li>
          <li>Communication transactionnelle (emails de service)</li>
          <li>Analytics agrégés et anonymisés</li>
        </ul>
      </Section>

      <Section title="4. Base légale">
        <ul>
          <li><strong>Exécution du contrat</strong> : pour fournir le service</li>
          <li><strong>Intérêt légitime</strong> : sécurité, prévention des abus</li>
          <li><strong>Consentement</strong> : communications marketing (opt-in)</li>
          <li><strong>Obligation légale</strong> : conservation des données de facturation</li>
        </ul>
      </Section>

      <Section title="5. Partage des données">
        <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
        <ul>
          <li><strong>Anthropic, OpenAI, Google</strong> : les prompts envoyés via leurs APIs (soumis à leurs politiques)</li>
          <li><strong>Stripe</strong> : traitement des paiements</li>
          <li><strong>AWS / Supabase</strong> : hébergement des données</li>
          <li><strong>Sentry</strong> : monitoring des erreurs (anonymisé)</li>
        </ul>
      </Section>

      <Section title="6. Conservation des données">
        <ul>
          <li>Conversations : selon votre plan (7j Free, 30j Starter, illimité Pro/Team)</li>
          <li>Données de compte : durée de l'abonnement + 1 an</li>
          <li>Données de facturation : 10 ans (obligation légale)</li>
          <li>Logs techniques : 90 jours</li>
        </ul>
      </Section>

      <Section title="7. Vos droits (RGPD)">
        <p>Vous disposez des droits suivants, exercer via contact@syntax-lab.site :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (« droit à l'oubli »)</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition au traitement</li>
          <li>Droit de saisir la CNIL en cas de litige</li>
        </ul>
      </Section>

      <Section title="8. Sécurité">
        <p>Nous utilisons : chiffrement TLS 1.3, hachage bcrypt des mots de passe, clés API hashées en base, accès restreint aux données de production, audits de sécurité réguliers.</p>
      </Section>
    </LegalLayout>
  )
}

// ── legal/page.tsx ───────────────────────────────────────────
export function LegalNoticePage() {
  return (
    <LegalLayout title="Mentions Légales" updated="20 juin 2026">
      <Section title="Éditeur du site">
        <table style={{ fontSize: 14, borderCollapse: 'collapse', width: '100%' }}>
          {[
            ['Société', 'Syntax Lab SAS'],
            ['Siège social', 'Paris, France'],
            ['Email', 'contact@syntax-lab.site'],
            ['Directeur de publication', 'Gérant de Syntax Lab'],
          ].map(([k, v]) => (
            <tr key={k} style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-2)', width: 200 }}>{k}</td>
              <td style={{ padding: '10px 0', color: 'var(--text)' }}>{v}</td>
            </tr>
          ))}
        </table>
      </Section>

      <Section title="Hébergement">
        <table style={{ fontSize: 14, borderCollapse: 'collapse', width: '100%' }}>
          {[
            ['Hébergeur', 'Amazon Web Services (AWS)'],
            ['Région', 'eu-west-3 (Paris)'],
            ['CDN', 'Cloudflare'],
            ['Base de données', 'Supabase (PostgreSQL)'],
          ].map(([k, v]) => (
            <tr key={k} style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-2)', width: 200 }}>{k}</td>
              <td style={{ padding: '10px 0', color: 'var(--text)' }}>{v}</td>
            </tr>
          ))}
        </table>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>L'ensemble du contenu de ce site (textes, images, design, logo, code) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable de Syntax Lab.</p>
      </Section>

      <Section title="Cookies">
        <p>Ce site utilise des cookies strictement nécessaires au fonctionnement (session, préférences) et des cookies analytics anonymisés (Plausible Analytics, sans collecte de données personnelles).</p>
        <p>Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
      </Section>

      <Section title="Liens externes">
        <p>Syntax AI peut contenir des liens vers des sites tiers. Nous déclinons toute responsabilité quant au contenu de ces sites.</p>
      </Section>

      <Section title="Contact">
        <p>Pour toute question : <a href="mailto:contact@syntax-lab.site" style={{ color: 'var(--v-500)' }}>contact@syntax-lab.site</a></p>
      </Section>
    </LegalLayout>
  )
}

/* ── Shared Layout ── */
import Link from 'next/link'

function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-2)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: 'var(--text)', textDecoration: 'none' }}>
          <LogoMark /> Syntax AI
        </Link>
        <Link href="/" className="btn btn-ghost btn-sm">← Retour</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--v-500)', marginBottom: 12 }}>Légal</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>{title}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Dernière mise à jour : {updated}</p>
        </div>

        {/* Legal nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 48, flexWrap: 'wrap' }}>
          {[['CGU', '/terms'], ['Confidentialité', '/privacy'], ['Mentions légales', '/legal'], ['Cookies', '/cookies'], ['RGPD', '/gdpr']].map(([l, h]) => (
            <Link key={l} href={h} style={{ padding: '6px 14px', borderRadius: 'var(--r-pill)', fontSize: 13, fontWeight: 600, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)', textDecoration: 'none', transition: 'all var(--t) var(--ease)' }}>
              {l}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{children}</div>
      </div>

      {/* Footer mini */}
      <div style={{ borderTop: '1px solid var(--border-soft)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
        © 2026 Syntax Lab — ai.syntax-lab.site
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 28, marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 14, color: 'var(--text)' }}>{title}</h2>
      <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,var(--v-500),var(--b-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.5 3.75v7.5L12 19.4l-7.5-3.75v-7.5L12 4.4z" />
      </svg>
    </div>
  )
}

// Default export (terms)
export default TermsPage
