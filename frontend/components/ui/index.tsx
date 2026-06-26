'use client'

import { useState, useRef, useEffect } from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...props }: BtnProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : variant === 'outline' ? 'btn-outline' : ''
  const dangerStyle = variant === 'danger' ? { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--rpill)' } : {}

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      style={{ opacity: (disabled || loading) ? 0.6 : 1, ...dangerStyle }}
      {...props}
    >
      {loading
        ? <Spinner size={14} />
        : icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      }
      {children}
    </button>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--v)' }: { size?: number; color?: string }) {
  return (
    <>
      <div style={{ width: size, height: size, border: `2px solid var(--border)`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  desc?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export function Input({ label, desc, error, prefix, suffix, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{label}</label>}
      {desc && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: -2 }}>{desc}</p>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: 12, color: 'var(--text3)', fontSize: 14, pointerEvents: 'none' }}>{prefix}</span>}
        <input
          className="input"
          style={{ paddingLeft: prefix ? 36 : undefined, paddingRight: suffix ? 36 : undefined, borderColor: error ? '#ef4444' : undefined, ...style }}
          {...props}
        />
        {suffix && <span style={{ position: 'absolute', right: 12, color: 'var(--text3)', fontSize: 14 }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>⚠️ {error}</span>}
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, ...props }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{label}</label>}
      <textarea
        style={{ width: '100%', padding: '11px 16px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: 100 }}
        {...props}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{label}</label>}
      <select
        style={{ padding: '10px 14px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 14, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label?: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      {(label || desc) && (
        <div>
          {label && <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>}
          {desc  && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{desc}</div>}
        </div>
      )}
      <div
        className={`toggle ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
        style={{ cursor: 'pointer', flexShrink: 0 }}
      >
        <div className="toggle-track" />
        <div className="toggle-thumb" />
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'violet' | 'green' | 'blue' | 'orange' | 'red' | 'gray'
const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  violet: { background: 'var(--v-mist)', color: 'var(--v)' },
  green:  { background: 'rgba(16,163,127,0.1)', color: '#0d8f6f' },
  blue:   { background: 'rgba(59,130,246,0.1)', color: '#2563eb' },
  orange: { background: 'rgba(255,107,53,0.1)', color: '#c2410c' },
  red:    { background: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  gray:   { background: 'var(--bg3)', color: 'var(--text3)' },
}

export function Badge({ children, variant = 'violet' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 'var(--rpill)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', ...BADGE_STYLES[variant] }}>
      {children}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, footer, width = 480 }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return ()  => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: width, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--rlg)', boxShadow: 'var(--sh-lg)', animation: 'scaleIn 0.2s var(--spring) both', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--bsoft)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 'var(--rsm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text3)', cursor: 'pointer', background: 'none', border: 'none', transition: 'all var(--t) var(--ease)' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px' }}>{children}</div>
        {/* Footer */}
        {footer && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--bsoft)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
        )}
      </div>
    </div>
  )
}

// ─── Code Block ───────────────────────────────────────────────────────────────
export function CodeBlock({ code, lang = '', filename }: { code: string; lang?: string; filename?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-wrap">
      <div className="code-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {filename && <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{filename}</span>}
          {lang && <span className="code-lang">{lang}</span>}
        </div>
        <button onClick={copy} style={{ fontSize: 11, color: copied ? '#10A37F' : 'var(--text3)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', transition: 'color var(--t) var(--ease)' }}>
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
      <div className="code-body">{code}</div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: string }[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div style={{ display: 'flex', gap: 2, background: 'var(--bg3)', borderRadius: 'var(--rpill)', padding: 3 }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '7px 16px', borderRadius: 'var(--rpill)', fontSize: 13, fontWeight: 600,
          background: active === t.id ? 'var(--bg2)' : 'transparent',
          color:      active === t.id ? 'var(--text)' : 'var(--text3)',
          border: 'none', cursor: 'pointer', transition: 'all var(--t) var(--ease)',
          boxShadow: active === t.id ? 'var(--sh)' : 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {t.icon && <span>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--v-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 320, lineHeight: 1.65 }}>{desc}</p>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', danger = false }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; message: string; confirmLabel?: string; danger?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Annuler</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={() => { onConfirm(); onClose() }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65 }}>{message}</p>
    </Modal>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, bar, pct, color }: {
  label: string; value: string; sub?: string; bar?: boolean; pct?: number; color?: string
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 5, color: color || 'var(--v)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</div>}
      {bar && pct !== undefined && (
        <div style={{ marginTop: 10, height: 3, background: 'var(--bsoft)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 80 ? '#ef4444' : 'linear-gradient(90deg,var(--v),var(--blue))', borderRadius: 2, transition: 'width 1s var(--ease)' }} />
        </div>
      )}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: sub ? 4 : 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: 'var(--text2)' }}>{sub}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
