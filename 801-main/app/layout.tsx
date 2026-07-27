import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { siteConfig } from '@/lib/site-config'
import { Toaster } from 'sonner'
import { CustomInjector } from '@/components/custom-injector'
import { TranslationProvider } from '@/components/translation-provider'


const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })

import { getDynamicSiteConfig, getSetting } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const dynamicConfig = await getDynamicSiteConfig()
  return {
    title: { default: `${dynamicConfig.name} — ${dynamicConfig.tagline}`, template: `%s | ${dynamicConfig.name}` },
    description: dynamicConfig.description,
    keywords: dynamicConfig.keywords,
    metadataBase: new URL(dynamicConfig.url),
    openGraph: { title: dynamicConfig.name, description: dynamicConfig.description, url: dynamicConfig.url, siteName: dynamicConfig.name, type: 'website', images: [dynamicConfig.logo || dynamicConfig.ogImage] },
    twitter: { card: 'summary_large_image', title: dynamicConfig.name, description: dynamicConfig.description, images: [dynamicConfig.logo || dynamicConfig.ogImage] },
    manifest: '/manifest.json',
    icons: {
      icon: '/logo.jpg',
      apple: '/apple-touch-icon.png'
    },
    appleWebApp: { capable: true, statusBarStyle: 'default', title: dynamicConfig.name },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF8C21' },
    { media: '(prefers-color-scheme: dark)', color: '#1a0f08' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} font-sans bg-watermark overflow-x-hidden`} suppressHydrationWarning>
        <Providers>
          {children}
          <div id="__dvj_slot" />
          <Toaster position="top-right" richColors closeButton />
          <CustomInjector />
          <TranslationProvider />
        </Providers>
      </body>
    </html>
  )
}
