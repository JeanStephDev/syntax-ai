/**
 * Syntax AI — Utils partagés
 */

// ─── Format ───────────────────────────────────────────────────────────────────

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function formatDate(iso: string, locale = 'fr-FR'): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatTime(iso: string, locale = 'fr-FR'): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 6)  return formatDate(iso)
  if (d > 0)  return `il y a ${d}j`
  if (h > 0)  return `il y a ${h}h`
  if (m > 0)  return `il y a ${m}min`
  return 'à l\'instant'
}

// ─── Strings ──────────────────────────────────────────────────────────────────

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export const PLAN_COLORS: Record<string, string> = {
  free:     '#10A37F',
  starter:  '#3B82F6',
  pro:      '#6B4EFF',
  team:     '#FF6B35',
  reseller: '#F59E0B',
}

export const PLAN_LIMITS: Record<string, { tokens: number; rate: number; solo: boolean; keys: number }> = {
  free:     { tokens: 100_000,    rate: 10,   solo: false, keys: 1  },
  starter:  { tokens: 500_000,    rate: 30,   solo: true,  keys: 3  },
  pro:      { tokens: 2_000_000,  rate: 100,  solo: true,  keys: 10 },
  team:     { tokens: 10_000_000, rate: 500,  solo: true,  keys: -1 },
  reseller: { tokens: -1,         rate: 2000, solo: true,  keys: -1 },
}

export function canUseSolo(plan: string): boolean {
  return PLAN_LIMITS[plan]?.solo ?? false
}

export function tierIndex(plan: string): number {
  return ['free', 'starter', 'pro', 'team'].indexOf(plan)
}

// ─── API Key ──────────────────────────────────────────────────────────────────

export function maskApiKey(key: string): string {
  if (key.length < 12) return key
  return key.slice(0, 18) + '•'.repeat(8) + key.slice(-4)
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}
