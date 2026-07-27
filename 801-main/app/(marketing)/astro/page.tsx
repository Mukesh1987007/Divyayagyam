import { PublicPageShell } from '@/components/public-page-shell'
export const revalidate = 3600; // ISR: Revalidate every 3600s
export default function Page() { return <PublicPageShell badge="🔮 Astrology" title="Astro Reports" subtitle="Kundali • Milan • Numerology • Panchang" cta={{ label: 'Explore Tools', href: '/tools' }} /> }
