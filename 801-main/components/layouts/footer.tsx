'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/logo'
import { siteConfig } from '@/lib/site-config'
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, Globe } from 'lucide-react'

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Online Puja', href: '/pujas' },
      { label: 'VIP Puja', href: '/vip-pujas' },
      { label: 'BhaktiSeva', href: '/bhaktiseva' },
      { label: 'Astrology', href: '/astro' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Gallery', href: '/gallery' },
      { label: 'Events', href: '/events' },
      { label: 'Blog', href: '/blog' },
      { label: 'Products', href: '/products' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Support', href: '/support' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refunds' },
      { label: 'Shipping Policy', href: '/shipping' },
    ],
  },
]

interface FooterProps {
  mapUrl?: string
  siteData?: any
}

export function Footer({ mapUrl, siteData }: FooterProps) {
  return (
    <footer className="footer-spiritual">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {(siteData?.description || '')}
            </p>
            
            {/* Newsletter Subscription (Archived) */}

            <div className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {(siteData?.contact?.email || '')}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {(siteData?.contact?.phone || '')}</div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Divyayagyam.com</div>
            </div>
            
            {/* Social Links */}
            <div className="space-y-4 mt-5">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Follow Us</h4>
              <div className="flex gap-4">
                {siteData?.socials?.facebook && siteData.socials.facebook !== '#' && (
                  <a href={siteData.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>
                )}
                {siteData?.socials?.instagram && siteData.socials.instagram !== '#' && (
                  <a href={siteData.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>
                )}
                {siteData?.socials?.youtube && siteData.socials.youtube !== '#' && (
                  <a href={siteData.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Youtube className="h-5 w-5" /></a>
                )}
                {siteData?.socials?.twitter && siteData.socials.twitter !== '#' && (
                  <a href={siteData.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            {/* Dynamic Google Map Section */}
            {(() => {
              let finalMapUrl = mapUrl || '';
              // Automatically extract the src if the user accidentally pastes the entire iframe code
              if (finalMapUrl.includes('<iframe') && finalMapUrl.includes('src="')) {
                const match = finalMapUrl.match(/src="([^"]+)"/);
                if (match && match[1]) {
                  finalMapUrl = match[1];
                }
              }

              if (finalMapUrl && finalMapUrl.includes('embed')) {
                return (
                  <div className="rounded-3xl overflow-hidden border shadow-sm aspect-square w-full relative">
                    <iframe
                      src={finalMapUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                );
              }
              
              if (finalMapUrl && !finalMapUrl.includes('embed')) {
                return (
                  <div className="rounded-3xl overflow-hidden border border-red-200 bg-red-50 p-6 text-center text-red-800 text-sm">
                    <p><strong>Invalid Map URL:</strong> The provided Google Map URL is not an embed link.</p>
                    <p className="text-xs mt-1">Please go to Admin Settings and paste an &quot;Embed a map&quot; link (e.g. contains <code>/maps/embed?pb=</code>).</p>
                  </div>
                );
              }

              return null;
            })()}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DivyaYagyam. All rights reserved. • हरि ओम् 🙏
          </p>
          <p className="text-xs text-muted-foreground">Made with devotion in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
