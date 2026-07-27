import { PublicPageShell } from '@/components/public-page-shell'
export const revalidate = 3600; // ISR: Revalidate every 3600s
export default function Page() { return <PublicPageShell badge="🎧 Support" title="Support Center" subtitle="Raise a ticket, chat with us, browse FAQ" cta={{ label: 'Ask AI Pandit ✨', href: '/ask-a-pandit' }} /> }
