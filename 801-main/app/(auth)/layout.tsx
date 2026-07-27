import { getCurrentUser } from '@/lib/auth'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null)
  if (user) redirect('/dashboard')
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} />
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {children}
      </main>
      <Footer />
    </div>
  )
}
