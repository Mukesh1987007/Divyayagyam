export const siteConfig = {
  name: 'Divyayagyam',
  tagline: 'Sanatan Seva',
  description:
    'Experience divine blessings with DivyaYagyam. Book authentic online pujas, offer Bhakti Seva, order sacred prasad, and access expert astrology services on our trusted platform.',
  url: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL_4725 || 'http://localhost:3000',
  ogImage: '/og.jpg',
  keywords: [
    'Divyayagyam', 'Online Puja', 'VIP Puja', 'Temple Booking', 'Sanatan',
    'Prasad', 'Bhakti Seva', 'Astrology', 'Kundali',
  ],
  contact: {
    email: 'seva@divyayagyam.com',
    phone: '+91-95871-71984, +91-95320-11984',
    whatsapp: '+91-95871-71984, +91-95320-11984',
  },
  socials: {
    facebook: '#',
    instagram: '#',
    youtube: '#',
    twitter: '#',
  },
}

export type SiteConfig = typeof siteConfig
