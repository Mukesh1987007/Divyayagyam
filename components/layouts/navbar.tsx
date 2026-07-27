'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingBag, User, Search, ChevronDown, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'

const languages = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
]

const navItems = [
  { title: 'Home', href: '/' },
  { title: 'Pujas', href: '/pujas' },
  { title: 'VIP Pujas', href: '/vip-pujas' },
  { title: 'Products', href: '/products' },
  { title: 'BhaktiSeva', href: '/bhaktiseva' },
  { title: 'Blog', href: '/blog' },
]

const toolsMenu = [
  { title: 'Kundali', href: '/tools#kundali', desc: 'Birth chart & analysis' },
  { title: 'Kundali Milan', href: '/tools#milan', desc: 'Marriage compatibility' },
  { title: 'Panchang', href: '/tools#panchang', desc: 'Daily Hindu calendar' },
  { title: 'Muhurat', href: '/tools#muhurat', desc: 'Auspicious timings' },
  { title: 'Numerology', href: '/tools#numerology', desc: 'Number-based insights' },
  { title: 'Ratna', href: '/tools#ratna', desc: 'Gemstone suggestion' },
  { title: 'Mala Counter', href: '/tools#mala', desc: 'Digital jaap tracker' },
]

export function Navbar({ user: initialUser, siteData }: { user?: any, siteData?: any } = {}) {
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(initialUser || null)
  const [userLoaded, setUserLoaded] = useState(false)
  const { items } = useCart()
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.user) {
          setUser(data.user)
        }
        setUserLoaded(true)
      })
      .catch(() => setUserLoaded(true))
  }, [])

  useState(() => {
    if (typeof window !== 'undefined') {
      setCurrentLang(localStorage.getItem('lang') || 'en')
    }
  })

  const changeLang = (code: string) => {
    localStorage.setItem('lang', code)
    setCurrentLang(code)
    setLangOpen(false)
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm transition-all">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        {/* SriMandir-inspired center navigation links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
          ))}
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <Link 
              href="/tools"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Tools <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Link>
            {toolsOpen && (
              <div className="absolute top-full right-0 pt-2 w-72 z-50">
                <div className="bg-popover border border-gray-100 rounded-lg shadow-lg p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  {toolsMenu.map((t) => (
                    <Link key={t.href} href={t.href} className="block px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="text-sm font-semibold text-foreground">{t.title}</div>
                      <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" aria-label="Search" className="hidden sm:inline-flex rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5"><Search className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative hidden sm:inline-flex rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
          <ThemeToggle />
          
          {/* SriMandir Language Selector Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 px-3 h-9 text-foreground/80 hover:text-primary transition-all rounded-lg border-border"
              onClick={() => setLangOpen(!langOpen)}
            >
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider">{currentLang}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-[var(--card-bg)] border border-gray-100 rounded-lg shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLang(l.code)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors",
                      currentLang === l.code ? "text-primary font-semibold" : "text-foreground/80"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Premium Pill-shaped Account CTA */}
          {userLoaded ? (
            user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="rounded-lg border-border text-foreground/80 hover:bg-muted/50 shadow-sm font-semibold">
                  <Link href="/dashboard"><User className="h-4 w-4 mr-1 text-muted-foreground" /> {user.fullName?.split(' ')[0] || 'Account'}</Link>
                </Button>
                <form action="/auth/signout" method="post">
                  <Button type="submit" size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive rounded-lg font-semibold px-3">
                    Logout
                  </Button>
                </form>
              </div>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-5 py-4 shadow-sm transition-all border-none"><Link href="/login">Login / Create Account</Link></Button>
            )
          ) : (
            <div className="hidden sm:flex h-9 w-32 bg-slate-100 rounded-lg animate-pulse" />
          )}

          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="lg:hidden rounded-lg text-gray-700" aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div className={cn('lg:hidden absolute top-full left-0 right-0 bg-card shadow-2xl overflow-hidden transition-all duration-300 border-b border-border', open ? 'max-h-[calc(100vh-4rem)] overflow-y-auto opacity-100' : 'max-h-0 opacity-0')}>
        <nav className="container py-4 flex flex-col gap-1.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">
              {item.title}
            </Link>
          ))}
          <Link href="/tools" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">Tools</Link>
          <div className="border-t border-border my-2 mx-4" />
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground bg-muted flex items-center gap-2">
                <User className="h-4 w-4" /> My Dashboard
              </Link>
              <form action="/auth/signout" method="post" className="w-full">
                <button type="submit" onClick={() => setOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-4 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-center">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 text-center">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}




