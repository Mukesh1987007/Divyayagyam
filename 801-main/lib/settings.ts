import prisma from '@/lib/prisma'

const cache: Record<string, { value: string; expiry: number }> = {}
const CACHE_TTL_MS = 60000 // 1 minute cache

export async function getSetting(key: string, envFallback?: string): Promise<string> {
  const now = Date.now()
  if (cache[key] && cache[key].expiry > now) {
    return cache[key].value
  }

  try {
    const setting = await prisma.websiteSetting.findUnique({
      where: { key }
    })
    if (setting && setting.value) {
      const val = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)
      const cleaned = val.replace(/^"|"$/g, '')
      cache[key] = { value: cleaned, expiry: now + CACHE_TTL_MS }
      return cleaned
    }
  } catch (e) {
    // DB unreachable or table doesn't exist
  }

  if (envFallback) {
    const val = (process.env[envFallback] || '').replace(/^"|"$/g, '')
    cache[key] = { value: val, expiry: now + CACHE_TTL_MS }
    return val
  }
  return ''
}


import { unstable_cache } from 'next/cache'
import { siteConfig as staticSiteConfig } from './site-config'

export const getDynamicSiteConfig = unstable_cache(
  async () => {
    const [
      name, tagline, logo, copyright, email, phone, whatsapp, address, googleMap, facebook, instagram, youtube, twitter
    ] = await Promise.all([
      getSetting('site.name'), getSetting('site.tagline'), getSetting('site.logo'),
      getSetting('site.copyright'), getSetting('contact.email'), getSetting('contact.phone'),
      getSetting('contact.whatsapp'), getSetting('contact.address'), getSetting('contact.google_map_url'),
      getSetting('socials.facebook'), getSetting('socials.instagram'), getSetting('socials.youtube'), getSetting('socials.twitter'),
    ])

    return {
      ...staticSiteConfig,
      name: name || staticSiteConfig.name,
      tagline: tagline || staticSiteConfig.tagline,
      logo: logo || staticSiteConfig.ogImage,
      copyright: copyright || '© 2026 DivyaYagyam. All rights reserved. • हरि ओम् 🙏',
      contact: {
        ...staticSiteConfig.contact,
        email: email || staticSiteConfig.contact.email,
        phone: phone || staticSiteConfig.contact.phone,
        whatsapp: whatsapp || staticSiteConfig.contact.whatsapp,
        address: address || '',
        googleMap: googleMap || ''
      },
      socials: {
        ...staticSiteConfig.socials,
        facebook: facebook || staticSiteConfig.socials.facebook || '',
        instagram: instagram || staticSiteConfig.socials.instagram || '',
        youtube: youtube || staticSiteConfig.socials.youtube || '',
        twitter: twitter || staticSiteConfig.socials.twitter || ''
      }
    }
  },
  ['dynamic-site-config'],
  { revalidate: 60, tags: ['settings'] }
)
