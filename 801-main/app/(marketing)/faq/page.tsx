import { PublicPageShell } from '@/components/public-page-shell'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 3600; // ISR: Revalidate every 3600s

export default async function Page() {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key: 'cms.faqs' }
  })
  const customContent = setting?.value || ''

  return (
    <PublicPageShell badge="❓ FAQ" title="Frequently Asked Questions" subtitle="How online puja works, prasad delivery, refunds & more">
      {customContent ? (
        <div className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm text-xs md:text-sm text-slate-700 leading-relaxed prose max-w-none prose-orange max-w-4xl mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} children={customContent as string} />
        </div>
      ) : (
        <div className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm text-center text-muted-foreground max-w-4xl mx-auto">
          FAQs will be updated soon.
        </div>
      )}
    </PublicPageShell>
  )
}
