'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell, ThemeToggle, useToast, Toast } from '@/components/layout'
import { useAuthStore } from '@/lib/store'
import { conversations as convsApi, type ConversationItem } from '@/lib/api'

const MODE_COLOR: Record<string,string> = { hybrid:'var(--v)', claude:'#FF6B35', openai:'#10A37F', gemini:'#4285F4' }
const MODE_LABEL: Record<string,string> = { hybrid:'⬡ Hybride', claude:'🔵 Claude Solo', openai:'🟢 GPT Solo', gemini:'🔴 Gemini Solo' }

export default function HistoryPage() {
  const { accessToken } = useAuthStore()
  const { toasts, show, remove } = useToast()
  const [convs, setConvs]   = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tout')
  const [page, setPage]     = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState<string|null>(null)

  const load = async (p = 1, s = search, f = filter) => {
    if (!accessToken) return
    setLoading(true)
    try {
      const mode = f==='Hybride'?'hybrid':f==='Claude Solo'?'claude':f==='GPT Solo'?'openai':f==='Gemini Solo'?'gemini':undefined
      const res = await convsApi.list(accessToken, { page:p, search:s||undefined, mode })
      setConvs(res.conversations)
      setTotalPages(res.pages)
      setPage(p)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [accessToken])

  const handleDelete = async (id: string) => {
    if (!accessToken) return
    setDeleting(id)
    try {
      await convsApi.delete(accessToken, id)
      setConvs(c => c.filter(x => x.id !== id))
      show('Conversation supprimée', 'success')
    } catch { show('Erreur suppression', 'error') }
    setDeleting(null)
  }

  const handleDeleteAll = async () => {
    if (!accessToken || !confirm('Supprimer toutes les conversations ?')) return
    try {
      await convsApi.deleteAll(accessToken)
      setConvs([])
      show('Toutes les conversations supprimées', 'success')
    } catch { show('Erreur', 'error') }
  }

  const filtered = convs
  const filters = ['Tout','Hybride','Claude Solo','GPT Solo','Gemini Solo']

  return (
    <AppShell>
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />)}

      <div className="topbar">
        <span style={{ fontSize:15, fontWeight:700 }}>Historique</span>
        <div style={{ display:'flex', gap:8 }}>
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={handleDeleteAll} style={{ color:'#ef4444' }}>Tout supprimer</button>
          <Link href="/chat" className="btn btn-primary btn-sm">+ Nouveau chat</Link>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        {/* Search */}
        <div style={{ position:'relative', marginBottom:14 }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'var(--text3)', pointerEvents:'none' }}>🔍</span>
          <input className="input" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); load(1, e.target.value, filter) }} style={{ paddingLeft:42 }} />
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          {filters.map(f => (
            <button key={f} onClick={() => { setFilter(f); load(1, search, f) }} style={{ padding:'5px 13px', borderRadius:'var(--rpill)', fontSize:12, fontWeight:600, background: filter===f ? 'var(--v)' : 'var(--bg2)', color: filter===f ? 'white' : 'var(--text2)', border:`1px solid ${filter===f?'var(--v)':'var(--border)'}`, cursor:'pointer', transition:'all var(--t) var(--ease)' }}>
              {f}
            </button>
          ))}
          <span style={{ fontSize:12, color:'var(--text3)', marginLeft:'auto' }}>{filtered.length} conversation{filtered.length!==1?'s':''}</span>
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:72, borderRadius:'var(--r)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text3)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>Aucune conversation</div>
            <Link href="/chat" style={{ color:'var(--v)', fontSize:14 }}>Démarrer une nouvelle conversation →</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {filtered.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:'var(--r)', background:'var(--bg2)', border:'1px solid var(--bsoft)', transition:'all var(--t) var(--ease)' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'var(--v-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {c.mode==='hybrid'?'⬡':c.mode==='claude'?'🔵':c.mode==='openai'?'🟢':'🔴'}
                </div>
                <Link href={`/chat?id=${c.id}`} style={{ flex:1, overflow:'hidden', textDecoration:'none' }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>{c.title}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.preview}</div>
                </Link>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:10, fontWeight:700, color: MODE_COLOR[c.mode]||'var(--v)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>{MODE_LABEL[c.mode]||c.mode}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{new Date(c.updated_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <button onClick={() => handleDelete(c.id)} disabled={deleting===c.id} style={{ padding:'6px 10px', borderRadius:'var(--rsm)', fontSize:12, color:'#ef4444', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', cursor:'pointer', flexShrink:0, opacity: deleting===c.id?0.5:1 }}>
                  {deleting===c.id ? '...' : '🗑'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:24 }}>
            <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={() => load(page-1)}>← Précédent</button>
            <span style={{ fontSize:13, color:'var(--text2)', alignSelf:'center' }}>{page} / {totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===totalPages} onClick={() => load(page+1)}>Suivant →</button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
