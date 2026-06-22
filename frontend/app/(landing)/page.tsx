'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

/* ── Access matrix: which models per plan ── */
const ACCESS_MATRIX = {
  free:    { hybrid: ['syntax-free-1'], solo: [] },
  starter: { hybrid: ['syntax-free-1','syntax-starter-1'], solo: ['claude-haiku','gpt-4o-mini','gemini-flash'] },
  pro:     { hybrid: ['syntax-free-1','syntax-starter-1','syntax-pro-1'], solo: ['claude-sonnet','gpt-4o','gemini-pro'] },
  team:    { hybrid: ['syntax-free-1','syntax-starter-1','syntax-pro-1','syntax-team-1'], solo: ['claude-opus','gpt-4o','gemini-ultra'] },
}

const PLANS = [
  {
    id: 'free', name: 'Free', price: '0', per: 'pour toujours', currency: '€',
    highlight: false, popular: false,
    tokens: '100K tokens/jour', rate: '10 req/min',
    features: ['Modèle Syntax Free (hybride)','1 clé API gratuite','Historique 7 jours','Support communauté'],
    locked: ['Mode Solo (Claude/GPT/Gemini)','Modèles avancés','Export de code'],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'starter', name: 'Starter', price: '4,99', per: 'par mois', currency: '€',
    highlight: false, popular: true,
    tokens: '500K tokens/jour', rate: '30 req/min',
    features: ['Modèles Free + Starter','Mode Solo débloqué ✦','3 clés API','Historique 30 jours','Support email'],
    locked: ['Modèles Pro & Team'],
    cta: 'Choisir Starter',
  },
  {
    id: 'pro', name: 'Pro', price: '14,99', per: 'par mois', currency: '€',
    highlight: true, popular: false,
    tokens: '2M tokens/jour', rate: '100 req/min',
    features: ['Modèles Free → Pro','Mode Solo complet','10 clés API','Historique illimité','Support prioritaire','Export ZIP de code'],
    locked: [],
    cta: 'Choisir Pro',
  },
  {
    id: 'team', name: 'Team', price: '49,99', per: 'par mois', currency: '€',
    highlight: false, popular: false,
    tokens: '10M tokens/jour', rate: '500 req/min',
    features: ['Tous les modèles','Mode Solo maximal','Clés API illimitées','Workspace équipe','Support dédié 24/7','SLA garanti 99.9%'],
    locked: [],
    cta: 'Contacter',
  },
  {
    id: 'reseller', name: 'API Reseller', price: '5', per: 'par mois + usage', currency: '$',
    highlight: false, popular: false,
    tokens: 'Illimité*', rate: '2 000 req/min',
    features: ['Pass-through tokens','White-label ready','Domaines autorisés','Dashboard analytics clients','SLA 99.9%'],
    locked: [],
    cta: 'Nous contacter',
  },
]

const MODELS_HYBRID = [
  { id: 'syntax-free-1',    name: 'Syntax Free',    plan: 'free',    claude: 'Haiku',   gpt: 'GPT-4o mini', gemini: 'Flash' },
  { id: 'syntax-starter-1', name: 'Syntax Starter', plan: 'starter', claude: 'Sonnet',  gpt: 'GPT-4o',      gemini: 'Pro' },
  { id: 'syntax-pro-1',     name: 'Syntax Pro',     plan: 'pro',     claude: 'Opus 4.6',gpt: 'GPT-4o',      gemini: 'Pro' },
  { id: 'syntax-team-1',    name: 'Syntax Team',    plan: 'team',    claude: 'Opus 4.8',gpt: 'GPT-4o',      gemini: '2.0' },
]

const SOLO_AIS = [
  { id: 'claude', name: 'Claude', company: 'Anthropic', color: '#FF6B35', desc: 'Logique, architecture, sécurité. Le meilleur pour le code backend complexe.', from: 'Starter', icon: '🔵' },
  { id: 'gpt',    name: 'GPT',    company: 'OpenAI',    color: '#10A37F', desc: 'UI/UX, composants, accessibilité. Imbattable sur le frontend React.', from: 'Starter', icon: '🟢' },
  { id: 'gemini', name: 'Gemini', company: 'Google',    color: '#4285F4', desc: 'Design system, documentation, configuration. Le cerveau des assets.', from: 'Starter', icon: '🔴' },
]

const FAQS = [
  { q: 'Comment les 3 IA travaillent-elles ensemble ?', a: 'Un orchestrateur analyse votre demande, la décompose en 3 tâches (backend, frontend, assets) et les distribue en parallèle. Un contrat de synchronisation garantit la cohérence des types, des endpoints et des variables.' },
  { q: 'Qu\'est-ce que le mode Solo ?', a: 'En mode Solo, vous choisissez une IA spécifique — Claude, GPT ou Gemini — pour répondre seule. Utile quand vous voulez le meilleur spécialiste sur une tâche précise. Disponible à partir du plan Starter.' },
  { q: 'Comment fonctionne l\'API Reseller ?', a: 'Vous abonnez votre application une fois (5$/mois) et vos clients utilisent vos tokens via votre clé reseller. Ils ne voient jamais l\'API Syntax AI — c\'est votre propre service. Les tokens sont facturés à l\'usage.' },
  { q: 'Les tokens se remettent à zéro quand ?', a: 'Les limites sont journalières et se remettent à zéro à minuit UTC. Les tokens non utilisés ne sont pas reportés au lendemain.' },
  { q: 'Puis-je utiliser Syntax AI en français ?', a: 'Oui. Toutes les réponses sont traduites via l\'API Google Translate dans la langue de votre choix. Le code n\'est jamais traduit — seulement les explications.' },
  { q: 'Qu\'arrive-t-il si je dépasse ma limite ?', a: 'Vos requêtes sont bloquées jusqu\'au lendemain minuit UTC avec un message clair. Vous pouvez upgrader à tout moment pour obtenir plus de tokens immédiatement.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number|null>(null)
  const [activePlan, setActivePlan] = useState('pro')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:16, left:'50%', transform:'translateX(-50%)',
        width:'calc(100% - 32px)', maxWidth:1100,
        height:60, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', zIndex:100, borderRadius:'var(--r-pill)',
        transition:'all 0.3s var(--ease)',
        ...(scrolled ? {
          background:'var(--surface)', backdropFilter:'blur(24px)',
          border:'1px solid var(--border)', boxShadow:'var(--shadow)',
        } : {
          background:'transparent', border:'1px solid transparent',
        })
      }}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10,fontFamily:'Syne',fontWeight:800,fontSize:19,letterSpacing:'-0.03em'}}>
          <LogoMark size={32} />
          Syntax AI
        </Link>
        <ul style={{display:'flex',alignItems:'center',gap:4,listStyle:'none',margin:0}}>
          {['Fonctionnalités','Modèles','Tarifs','API','FAQ'].map(l => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} style={{padding:'6px 13px',borderRadius:'var(--r-pill)',fontSize:13,fontWeight:500,color:'var(--text-2)',display:'block',transition:'all var(--t) var(--ease)'}}>
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <Link href="/login" className="btn btn-ghost btn-sm">Se connecter</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Commencer →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'100px 24px 80px',position:'relative',overflow:'hidden'}}>
        {/* Orbs */}
        <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(107,78,255,0.18),transparent 65%)',top:'5%',left:'50%',transform:'translateX(-50%)',filter:'blur(60px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.14),transparent 65%)',bottom:'15%',left:'5%',filter:'blur(80px)',pointerEvents:'none',animation:'float 9s ease-in-out infinite'}} />
        <div style={{position:'absolute',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,107,53,0.1),transparent 65%)',top:'25%',right:'5%',filter:'blur(80px)',pointerEvents:'none',animation:'float 11s ease-in-out infinite reverse'}} />

        <div className="animate-fade-up" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px 6px 10px',borderRadius:'var(--r-pill)',background:'var(--surface)',border:'1px solid var(--border)',backdropFilter:'blur(12px)',fontSize:12,fontWeight:600,color:'var(--v-500)',marginBottom:32}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'var(--v-500)',display:'inline-block',animation:'pulse-ring 1.8s ease-out infinite'}} />
          Claude · GPT-4o · Gemini — Disponible maintenant
        </div>

        <h1 className="display display-xl animate-fade-up anim-delay-1" style={{maxWidth:860,marginBottom:24}}>
          Codez avec<br />
          <span style={{background:'linear-gradient(135deg, var(--v-500), var(--b-500))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>l'intelligence</span><br />
          collective
        </h1>

        <p className="animate-fade-up anim-delay-2" style={{fontSize:18,color:'var(--text-2)',maxWidth:520,lineHeight:1.75,marginBottom:44}}>
          Trois IA spécialisées, une seule interface. Claude architecture votre backend,
          GPT compose votre frontend, Gemini documente tout. Du code propre et cohérent.
        </p>

        <div className="animate-fade-up anim-delay-3" style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginBottom:56}}>
          <Link href="/login" className="btn btn-primary btn-xl">
            Commencer gratuitement →
          </Link>
          <Link href="#modèles" className="btn btn-ghost btn-xl">
            Voir les modèles
          </Link>
        </div>

        {/* AI pills */}
        <div className="animate-fade-up anim-delay-4" style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',alignItems:'center'}}>
          {[
            {label:'Claude — Backend',  dot:'#FF6B35'},
            {label:'GPT — Frontend',    dot:'#10A37F'},
            {label:'Gemini — Docs',     dot:'#4285F4'},
          ].map(p => (
            <div key={p.label} className="glass-pill" style={{display:'flex',alignItems:'center',gap:7,padding:'7px 14px',fontSize:13,fontWeight:500,color:'var(--text-2)'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:p.dot,flexShrink:0}} />
              {p.label}
            </div>
          ))}
        </div>

        {/* Hero code preview */}
        <div className="animate-fade-up" style={{marginTop:64,width:'100%',maxWidth:780,background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',padding:24,textAlign:'left',boxShadow:'var(--shadow-xl)',animationDelay:'0.5s'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
            {['#FF5F57','#FFBD2E','#28C840'].map(c => <span key={c} style={{width:12,height:12,borderRadius:'50%',background:c}} />)}
            <span style={{flex:1,textAlign:'center',fontSize:12,color:'var(--text-3)',fontWeight:500}}>Syntax AI — Génération en cours</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[
              {label:'🔵 Claude — Backend', color:'#FF6B35', code:`@app.post("/auth/token")
async def login(data: Form):
    user = await auth(data)
    return {"jwt": sign(user)}`},
              {label:'🟢 GPT — Frontend', color:'#10A37F', code:`export function LoginForm() {
  const { login } = useAuth()
  return (
    <form onSubmit={login}>
      <Button>Connexion</Button>
    </form>
  )}`},
              {label:'🔴 Gemini — Docs', color:'#4285F4', code:`# Auth API
POST /auth/token → JWT

## Stack
- FastAPI + PostgreSQL
- React + TypeScript
- Docker Compose`},
            ].map(panel => (
              <div key={panel.label} style={{background:'var(--bg-3)',borderRadius:'var(--r)',padding:14}}>
                <div style={{fontSize:11,fontWeight:700,color:panel.color,marginBottom:10,letterSpacing:'0.04em'}}>{panel.label}</div>
                <pre style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,lineHeight:1.7,color:'var(--text-2)',margin:0,whiteSpace:'pre-wrap'}}>{panel.code}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{borderTop:'1px solid var(--border-soft)',borderBottom:'1px solid var(--border-soft)',padding:'28px 24px',background:'var(--bg-2)'}}>
        <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:48,flexWrap:'wrap'}}>
          {[
            {n:'3', label:'IA collaborent ensemble'},
            {n:'4', label:'modèles hybrides'},
            {n:'5', label:'plans tarifaires'},
            {n:'100K', label:'tokens offerts/jour'},
          ].map(s => (
            <div key={s.n} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne',fontSize:32,fontWeight:800,letterSpacing:'-0.04em',color:'var(--v-500)'}}>{s.n}</div>
              <div style={{fontSize:13,color:'var(--text-3)',fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" style={{padding:'100px 24px'}}>
        <div className="container">
          <div className="section-eyebrow">Fonctionnalités</div>
          <h2 className="display display-lg" style={{maxWidth:520,marginBottom:56}}>Tout ce dont vous avez besoin pour coder</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {[
              {icon:'⚡',title:'3 IA en parallèle',desc:'Claude, GPT et Gemini travaillent simultanément sur votre projet. Résultat en quelques secondes, jamais en quelques minutes.'},
              {icon:'🔗',title:'Code cohérent',desc:'Un contrat de synchronisation garantit que le backend parle au frontend. Types partagés, endpoints alignés, variables cohérentes.'},
              {icon:'🎛',title:'Mode Solo & Hybride',desc:'Hybride pour les projets complets, Solo pour cibler le meilleur spécialiste sur une tâche précise. À partir du plan Starter.'},
              {icon:'🌍',title:'Multilingue',desc:'L\'IA répond dans votre langue via Google Translate. Français, japonais, arabe — le code reste intact.'},
              {icon:'🔑',title:'API Reseller',desc:'Intégrez Syntax AI dans votre SaaS. Mode reseller pour servir vos clients avec vos propres tokens. 5$/mois flat.'},
              {icon:'📊',title:'Token tracking',desc:'Limites journalières claires, dashboard en temps réel, alertes à 80%. Vous maîtrisez votre consommation.'},
              {icon:'🚀',title:'Streaming SSE',desc:'Réponses en temps réel. Regardez les 3 IA coder en direct, panneau par panneau, identifiées.'},
              {icon:'🔐',title:'Auth complète',desc:'Google, GitHub et email/password. NextAuth côté client, JWT côté API. Sécurisé par défaut.'},
              {icon:'📦',title:'Export de code',desc:'Exportez votre projet en ZIP organisé : /backend, /frontend, /docs. Prêt à déployer. Plan Pro+.'},
            ].map(f => (
              <div key={f.title} style={{padding:28,background:'var(--bg-2)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-lg)',transition:'all var(--t) var(--ease)',cursor:'default'}}>
                <div style={{width:44,height:44,borderRadius:12,background:'var(--v-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:18}}>
                  {f.icon}
                </div>
                <h3 style={{fontSize:15,fontWeight:700,letterSpacing:'-0.015em',marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ROLES (Hybride) ── */}
      <section id="modèles" style={{padding:'100px 24px',background:'var(--bg-3)'}}>
        <div className="container">
          <div className="section-eyebrow">Mode Hybride</div>
          <h2 className="display display-lg" style={{marginBottom:16}}>Trois IA, une seule réponse</h2>
          <p style={{fontSize:16,color:'var(--text-2)',marginBottom:56,maxWidth:500,lineHeight:1.7}}>En mode Hybride, Syntax AI orchestre les 3 IA pour vous livrer backend, frontend et docs en parallèle.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:48}}>
            {SOLO_AIS.map(ai => (
              <div key={ai.id} style={{padding:32,borderRadius:'var(--r-lg)',border:'1px solid var(--border)',background:'var(--surface)',backdropFilter:'blur(16px)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:ai.color,borderRadius:'3px 3px 0 0'}} />
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:'var(--r-pill)',background:`${ai.color}18`,fontSize:11,fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:ai.color,marginBottom:16}}>
                  {ai.name} — {ai.company}
                </div>
                <h3 className="display display-sm" style={{marginBottom:12}}>{ai.id === 'claude' ? 'L\'Architecte' : ai.id === 'gpt' ? 'Le Designer' : 'Le Documentaliste'}</h3>
                <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.7,marginBottom:20}}>{ai.desc}</p>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {(ai.id === 'claude'
                    ? ['APIs REST & GraphQL','Logique métier & sécurité','Base de données & migrations','Tests backend']
                    : ai.id === 'gpt'
                    ? ['Composants React / Vue','CSS, Tailwind, animations','Appels API & state','Tests composants']
                    : ['Design system & tokens','README & architecture','Docker, CI/CD, .env','Schémas Mermaid']
                  ).map(t => (
                    <div key={t} style={{fontSize:13,color:'var(--text-2)',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{color:ai.color,fontWeight:700}}>→</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Hybrid models table */}
          <h3 className="display display-sm" style={{marginBottom:20}}>Modèles Hybrides disponibles</h3>
          <div style={{background:'var(--bg-2)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-lg)',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border-soft)'}}>
                  {['Modèle','Plan minimum','Claude','GPT','Gemini','Accès'].map(h => (
                    <th key={h} style={{padding:'14px 20px',textAlign:'left',fontWeight:700,fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-3)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODELS_HYBRID.map((m, i) => (
                  <tr key={m.id} style={{borderBottom:i<MODELS_HYBRID.length-1?'1px solid var(--border-soft)':'none',transition:'background var(--t)'}}>
                    <td style={{padding:'16px 20px',fontWeight:700}}>{m.name}</td>
                    <td style={{padding:'16px 20px'}}><span className={`badge badge-${m.plan==='free'?'green':m.plan==='starter'?'blue':'violet'}`} style={{textTransform:'capitalize'}}>{m.plan}</span></td>
                    <td style={{padding:'16px 20px',color:'var(--text-2)'}}>{m.claude}</td>
                    <td style={{padding:'16px 20px',color:'var(--text-2)'}}>{m.gpt}</td>
                    <td style={{padding:'16px 20px',color:'var(--text-2)'}}>{m.gemini}</td>
                    <td style={{padding:'16px 20px'}}>{m.plan === 'free' ? <span style={{color:'#10A37F',fontWeight:600}}>✓ Gratuit</span> : <span style={{color:'var(--v-500)',fontWeight:600}}>⚡ {m.plan}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── MODE SOLO ── */}
      <section id="api" style={{padding:'100px 24px'}}>
        <div className="container">
          <div className="section-eyebrow">Mode Solo</div>
          <h2 className="display display-lg" style={{marginBottom:16}}>Choisissez votre IA</h2>
          <p style={{fontSize:16,color:'var(--text-2)',marginBottom:48,maxWidth:520,lineHeight:1.7}}>
            Parfois vous avez besoin du meilleur spécialiste, pas d'une équipe. Le mode Solo donne accès direct à chaque IA — disponible à partir du plan <strong>Starter</strong>.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {SOLO_AIS.map(ai => (
              <div key={ai.id} style={{padding:28,background:'var(--bg-2)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-lg)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,inset:'0 0 auto 0',height:'60%',background:`radial-gradient(ellipse at top,${ai.color}10,transparent)`,pointerEvents:'none'}} />
                <div style={{fontSize:40,marginBottom:16}}>{ai.icon}</div>
                <h3 style={{fontSize:20,fontWeight:800,fontFamily:'Syne',letterSpacing:'-0.02em',marginBottom:4}}>{ai.name}</h3>
                <div style={{fontSize:12,color:'var(--text-3)',fontWeight:500,marginBottom:12}}>{ai.company}</div>
                <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.65,marginBottom:20}}>{ai.desc}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span className="badge badge-violet">Dès Starter</span>
                  <span style={{fontSize:12,color:'var(--text-3)'}}>Plan Starter+</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:24,padding:20,background:'var(--v-50)',border:'1px solid var(--v-200)',borderRadius:'var(--r)',display:'flex',alignItems:'center',gap:14}}>
            <span style={{fontSize:22}}>ℹ️</span>
            <p style={{fontSize:13,color:'var(--v-700)',lineHeight:1.6,margin:0}}>
              <strong>Plan Free :</strong> Le mode Solo n'est pas disponible. Seul le mode Hybride (Syntax Free) est accessible gratuitement. Passez au plan Starter pour débloquer l'accès direct à Claude, GPT et Gemini.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" style={{padding:'100px 24px',background:'var(--bg-3)'}}>
        <div className="container">
          <div className="section-eyebrow">Tarifs</div>
          <h2 className="display display-lg" style={{marginBottom:12}}>Simple. Transparent.</h2>
          <p style={{fontSize:16,color:'var(--text-2)',marginBottom:56,maxWidth:440,lineHeight:1.7}}>
            Commencez gratuitement. Passez à un plan supérieur quand vous en avez besoin.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,alignItems:'start'}}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{
                padding:24, borderRadius:'var(--r-lg)',
                border:`1.5px solid ${plan.highlight ? 'var(--v-500)' : 'var(--border-soft)'}`,
                background: plan.highlight ? 'linear-gradient(160deg,rgba(107,78,255,0.07),var(--bg-2))' : 'var(--bg-2)',
                position:'relative',
                boxShadow: plan.highlight ? 'var(--glow)' : 'none',
              }}>
                {plan.popular && (
                  <div style={{position:'absolute',top:-1,right:16,background:'var(--v-500)',color:'white',fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',padding:'4px 10px',borderRadius:'0 0 8px 8px'}}>
                    Populaire
                  </div>
                )}
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:10}}>{plan.name}</div>
                <div style={{fontFamily:'Syne',fontSize:34,fontWeight:800,letterSpacing:'-0.04em',lineHeight:1,marginBottom:4}}>
                  {plan.currency}{plan.price}
                </div>
                <div style={{fontSize:12,color:'var(--text-3)',marginBottom:6}}>{plan.per}</div>
                <div style={{fontSize:11,color:'var(--v-500)',fontWeight:600,marginBottom:20}}>{plan.tokens} · {plan.rate}</div>
                <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                  {plan.features.map(f => (
                    <li key={f} style={{fontSize:12,color:'var(--text-2)',display:'flex',gap:7,alignItems:'flex-start'}}>
                      <span style={{color:'var(--v-500)',fontWeight:700,flexShrink:0}}>✓</span>{f}
                    </li>
                  ))}
                  {plan.locked.map(f => (
                    <li key={f} style={{fontSize:12,color:'var(--text-3)',display:'flex',gap:7,alignItems:'flex-start'}}>
                      <span style={{flexShrink:0}}>✗</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{width:'100%'}}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{padding:'100px 24px'}}>
        <div className="container" style={{maxWidth:720}}>
          <div className="section-eyebrow">FAQ</div>
          <h2 className="display display-lg" style={{marginBottom:48}}>Questions fréquentes</h2>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{background:'var(--bg-2)',border:'1px solid var(--border-soft)',borderRadius:'var(--r)',overflow:'hidden',transition:'all var(--t) var(--ease)'}}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 20px',textAlign:'left',gap:16,cursor:'pointer'}}
                >
                  <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{faq.q}</span>
                  <span style={{color:'var(--v-500)',fontSize:18,fontWeight:700,flexShrink:0,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform var(--t) var(--ease)'}}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{padding:'0 20px 18px',fontSize:14,color:'var(--text-2)',lineHeight:1.7}}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section style={{padding:'80px 24px'}}>
        <div className="container">
          <div style={{background:'linear-gradient(135deg,var(--v-600),var(--v-500),var(--b-500))',borderRadius:'var(--r-xl)',padding:'64px 48px',textAlign:'center',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(255,255,255,0.08),transparent 65%)',pointerEvents:'none'}} />
            <h2 className="display display-lg" style={{color:'white',marginBottom:16,position:'relative'}}>Prêt à coder plus vite ?</h2>
            <p style={{fontSize:17,color:'rgba(255,255,255,0.75)',marginBottom:36,maxWidth:460,margin:'0 auto 36px',lineHeight:1.7,position:'relative'}}>
              Rejoignez les développeurs qui utilisent l'intelligence collective pour livrer du code propre en quelques secondes.
            </p>
            <div style={{display:'flex',gap:12,justifyContent:'center',position:'relative'}}>
              <Link href="/login" style={{background:'white',color:'var(--v-600)',padding:'14px 28px',borderRadius:'var(--r-pill)',fontWeight:700,fontSize:15,display:'inline-flex',alignItems:'center',gap:8,transition:'all var(--t) var(--ease)'}}>
                Commencer gratuitement →
              </Link>
              <Link href="/docs" style={{background:'rgba(255,255,255,0.12)',color:'white',border:'1.5px solid rgba(255,255,255,0.3)',padding:'14px 28px',borderRadius:'var(--r-pill)',fontWeight:600,fontSize:15,display:'inline-flex',alignItems:'center',gap:8,backdropFilter:'blur(8px)',transition:'all var(--t) var(--ease)'}}>
                Voir la doc API
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  )
}

/* ── FOOTER COMPONENT ── */
function Footer() {
  return (
    <footer style={{borderTop:'1px solid var(--border-soft)',background:'var(--bg-2)'}}>
      <div className="container" style={{padding:'56px 24px 32px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:48}}>
          {/* Brand */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:'Syne',fontWeight:800,fontSize:18,marginBottom:14}}>
              <LogoMark size={30} />Syntax AI
            </div>
            <p style={{fontSize:13,color:'var(--text-3)',lineHeight:1.7,maxWidth:280,marginBottom:20}}>
              L'IA collaborative pour développeurs. Claude, GPT et Gemini travaillent ensemble pour vous livrer du code propre et cohérent.
            </p>
            {/* Social */}
            <div style={{display:'flex',gap:10}}>
              {[
                {name:'X / Twitter', href:'https://twitter.com/syntaxai', icon:'𝕏'},
                {name:'GitHub',      href:'https://github.com/syntax-lab', icon:'⌥'},
                {name:'Discord',     href:'https://discord.gg/syntaxai', icon:'◈'},
                {name:'LinkedIn',    href:'https://linkedin.com/company/syntax-ai', icon:'in'},
              ].map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.name}
                  style={{width:34,height:34,borderRadius:'var(--r-sm)',background:'var(--bg-3)',border:'1px solid var(--border-soft)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'var(--text-3)',transition:'all var(--t) var(--ease)'}}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Links */}
          {[
            { title:'Produit', links:[['Fonctionnalités','#fonctionnalités'],['Modèles','#modèles'],['Tarifs','#tarifs'],['API Reseller','#api'],['Changelog','/changelog']] },
            { title:'Ressources', links:[['Documentation','/docs'],['API Reference','/docs/api'],['Statut','/status'],['Blog','/blog']] },
            { title:'Légal', links:[['CGU','/terms'],['Politique de confidentialité','/privacy'],['Mentions légales','/legal'],['Cookies','/cookies'],['RGPD','/gdpr']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:16}}>{col.title}</div>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9}}>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{fontSize:13,color:'var(--text-2)',transition:'color var(--t) var(--ease)'}}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid var(--border-soft)',paddingTop:24,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <p style={{fontSize:12,color:'var(--text-3)'}}>© 2026 Syntax AI — ai.syntax-lab.site — Tous droits réservés</p>
          <div style={{display:'flex',gap:16}}>
            {[['CGU','/terms'],['Confidentialité','/privacy'],['Mentions','/legal']].map(([l,h]) => (
              <Link key={l} href={h} style={{fontSize:12,color:'var(--text-3)',transition:'color var(--t) var(--ease)'}}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function LogoMark({size=32}: {size?: number}) {
  return (
    <div style={{width:size,height:size,borderRadius:size*0.28,background:'linear-gradient(135deg,var(--v-500),var(--b-500))',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(107,78,255,0.4)',flexShrink:0}}>
      <svg width={size*0.52} height={size*0.52} viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.5 3.75v7.5L12 19.4l-7.5-3.75v-7.5L12 4.4z"/>
      </svg>
    </div>
  )
}
