import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import ThemeInit from '@/components/layout/ThemeInit'

export const metadata: Metadata = {
  title: { default: 'Syntax AI', template: '%s — Syntax AI' },
  description: 'Claude, GPT-4o et Gemini travaillent ensemble. Backend, frontend et docs en une requête.',
  metadataBase: new URL('https://ai.syntax-lab.site'),
  openGraph: {
    title: 'Syntax AI — L\'IA collaborative pour développeurs',
    description: 'Trois IA spécialisées, une interface. Claude × GPT × Gemini.',
    url: 'https://ai.syntax-lab.site',
    siteName: 'Syntax AI',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syntax AI',
    description: 'L\'IA collaborative pour développeurs.',
    creator: '@syntaxai_dev',
  },
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7FF' },
    { media: '(prefers-color-scheme: dark)',  color: '#09091A' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  )
}
