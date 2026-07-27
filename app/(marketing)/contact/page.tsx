import { PublicPageShell } from '@/components/public-page-shell'
export const revalidate = 3600; // ISR: Revalidate every 3600s
export default function Page() { return <PublicPageShell badge="📞 Contact" title="Get in Touch" subtitle="We're here to help" description="Email: seva@divyayagyam.com • Phone: +91-95871-71984, +91-95320-11984 • Website: Divyayagyam.com" cta={{ label: 'Send us a message', href: '/support' }} /> }
