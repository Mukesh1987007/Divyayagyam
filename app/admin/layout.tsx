import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { getAdminUser } from '@/lib/admin-session'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Bell, Search, LogOut, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') || ''

  // Login page: render bare (no sidebar, no auth check)
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return <>{children}</>
  }

  const user = await getAdminUser()
  if (!user) {
    // If user is null but they passed middleware, the session token is orphaned or invalid.
    // Redirect to the logout endpoint to clear the cookie and break the infinite loop.
    redirect('/api/admin/logout')
  }

  return (
    <div translate="no" suppressHydrationWarning className="min-h-screen flex bg-muted/20">
      <AdminSidebar permissions={user.permissions} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 bg-background flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <AdminSidebar permissions={user.permissions} isMobile />
              </SheetContent>
            </Sheet>
          </div>
          <div className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search anything… (Ctrl+K)" className="pl-9 h-9 bg-muted/40" />
          </div>
          <div className="flex flex-1 md:flex-none items-center justify-end gap-2">
            <Button size="icon" variant="ghost" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
            <ThemeToggle />
            <div className="flex items-center gap-2 pl-2 border-l ml-1">
              <div className="h-8 w-8 rounded-full om-gradient flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0)}
              </div>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-xs font-medium">{user.fullName || user.email.split('@')[0]}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{user.role?.name || 'Sub Admin'}</span>
              </div>
              <form action="/api/admin/logout" method="post">
                <Button type="submit" size="icon" variant="ghost" aria-label="Logout" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
