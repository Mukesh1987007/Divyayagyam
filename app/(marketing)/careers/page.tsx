import { PublicPageShell } from '@/components/public-page-shell'
export const revalidate = 3600; // ISR: Revalidate every 3600s
export default function Page() { return <PublicPageShell title="Careers at Divyayagyam" subtitle="Join our mission to preserve Sanatan Dharma" /> }
