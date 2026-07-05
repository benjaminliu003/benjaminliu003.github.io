import type { Metadata } from 'next'
import { Space_Mono, IBM_Plex_Mono } from 'next/font/google'
import { SITE } from '@/lib/seo'
import './globals.css'

const display = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
  },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-180.png',
  },
}

// Sets the theme before first paint so there is no flash of the wrong material.
const NO_FLASH = `(function(){try{var t=localStorage.getItem('site-theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE.name,
  jobTitle: 'Computer Engineering Student',
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Waterloo' },
  url: SITE.url,
  email: 'mailto:b328liu@uwaterloo.ca',
  sameAs: ['https://github.com/benjaminliu003', 'https://www.linkedin.com/in/bliu0326/'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
