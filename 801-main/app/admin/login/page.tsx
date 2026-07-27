'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react'

import { Suspense } from 'react'

function AdminLoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('Diksha@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Login failed')
      toast.success('🌼 स्वागतम! Welcome Admin')
      router.push(params.get('redirect') || '/admin')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-2xl om-gradient flex items-center justify-center mb-3 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Divyayagyam Admin</CardTitle>
          <CardDescription>Sanatan Seva Control Center</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@divyayagyam.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-xs font-semibold text-primary hover:underline" aria-label="Button">Forgot?</button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-orange-500" /> Admin Password Reset</DialogTitle>
                      <DialogDescription>
                        For extreme security reasons, the Super Admin password cannot be reset via email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-sm">
                      <p>To reset your Admin Password, you must update the server configuration directly.</p>
                      <div className="bg-muted p-4 rounded-lg font-mono text-xs border">
                        <p className="text-muted-foreground mb-2">Update this variable in your <span className="font-bold text-foreground">.env</span> file:</p>
                        <p>ADMIN_PASSWORD = process.env.NEXT_PUBLIC_PASSWORD_0423 || ''</p>
                      </div>
                      <p>After updating the <code>.env</code> file, Vercel will automatically redeploy with your new password!</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</span>
              ) : (
                <span>🔐 Sign in to Admin Panel</span>
              )}
            </Button>
          </form>


        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AdminLoginContent />
    </Suspense>
  )
}
