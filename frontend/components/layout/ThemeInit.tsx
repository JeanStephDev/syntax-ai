'use client'

export default function ThemeInit() {
  const script = `
    try {
      const t = localStorage.getItem('syntax-theme')
      const d = t ? JSON.parse(t).state?.dark : false
      if (d) document.documentElement.setAttribute('data-theme','dark')
    } catch {}
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
