import Link from 'next/link'
import { Map, ArrowRight, Sparkles, Building2, BookOpen, Scale, HelpCircle } from 'lucide-react'
export const revalidate = 3600; // ISR: Revalidate every 3600s

export default function SitemapPage() {
  const sections = [
    {
      title: 'Devotional Services',
      icon: Sparkles,
      links: [
        { label: 'Online Puja (पूजा सेवा)', href: '/pujas' },
        { label: 'VIP Pujas (विशेष अनुष्ठान)', href: '/vip-pujas' },
        { label: 'BhaktiSeva Offerings (चढ़ावा)', href: '/bhaktiseva' },
        { label: 'Astrology Services (ज्योतिष सेवा)', href: '/astro' },
      ],
    },
    {
      title: 'Explore Pilgrimage',
      icon: Building2,
      links: [
        { label: 'Sacred Temples (मंदिर दर्शन)', href: '/temples' },
        { label: 'Photo Gallery (गैलरी)', href: '/gallery' },
        { label: 'Events & Festivals (उत्सव)', href: '/events' },
        { label: 'Blog & Articles (ब्लॉग)', href: '/blog' },
      ],
    },
    {
      title: 'Shopping & Products',
      icon: BookOpen,
      links: [
        { label: 'Abhimantrit Products (उत्पाद)', href: '/products' },
        { label: 'Astrology Chart Reports', href: '/tools' },
      ],
    },
    {
      title: 'Legal & Policies',
      icon: Scale,
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Refund Policy', href: '/refunds' },
        { label: 'Shipping Policy', href: '/shipping' },
      ],
    },
    {
      title: 'Company & Support',
      icon: HelpCircle,
      links: [
        { label: 'About Us (हमारे बारे में)', href: '/about' },
        { label: 'Contact Us (संपर्क करें)', href: '/contact' },
        { label: 'Support & Help Desk', href: '/support' },
        { label: 'FAQ (पूछे जाने वाले प्रश्न)', href: '/faq' },
        { label: 'Careers (करियर)', href: '/careers' },
      ],
    },
  ]

  return (
    <div className="bg-slate-50/50 min-h-screen py-16">
      <div className="container max-w-4xl mx-auto space-y-12 px-4">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[var(--primary-color)] mb-2">
            <Map className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">Sitemap</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Find and explore all sections of DivyaYagyam.com easily.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((sect) => {
            const Icon = sect.icon
            return (
              <div key={sect.title} className="bg-white p-6 border rounded-3xl shadow-sm space-y-4">
                <h2 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Icon className="h-4.5 w-4.5 text-[var(--primary-color)]" /> {sect.title}
                </h2>
                <ul className="space-y-2.5 text-xs">
                  {sect.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-slate-600 hover:text-[var(--primary-color)] flex items-center justify-between group">
                        <span className="font-medium">{link.label}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[var(--primary-color)] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

