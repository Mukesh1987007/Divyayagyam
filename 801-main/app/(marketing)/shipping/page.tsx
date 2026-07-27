import { PublicPageShell } from '@/components/public-page-shell'
export const revalidate = 3600; // ISR: Revalidate every 3600s
export default function Page() { return <PublicPageShell title="Shipping Policy" description="Abhimantrit prasad delivered within 3–7 business days across India. International shipping available for select products." /> }
