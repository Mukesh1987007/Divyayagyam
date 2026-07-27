'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    if (!fullName.trim()) {
      toast.error('Name is required')
      return
    }
    if (!phone.trim()) {
      toast.error('WhatsApp number is required')
      return
    }
    
    // Strict email format regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address (e.g. devotee@example.com)')
      return
    }

    if (!acceptTerms) {
      toast.error('Please agree to the Privacy Policy and Terms of Service to proceed.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      if (data.user && !data.session) {
        // Try to sign in immediately in case confirmations are disabled but session wasn't attached
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInError && signInData.session) {
          toast.success('Welcome to Divyayagyam!')
          window.location.href = '/dashboard'
        } else {
          toast.success('Check your email to verify your account.')
        }
      } else {
        toast.success('Welcome to Divyayagyam!')
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">स्वागतम</CardTitle>
        <CardDescription>Create your Divyayagyam account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number</Label>
            <Input id="phone" type="tel" placeholder="e.g. +919587171984" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          
          <div className="flex items-start gap-2 pt-2 text-left">
            <Checkbox id="termsAccept" checked={acceptTerms} onCheckedChange={(val) => setAcceptTerms(!!val)} />
            <Label htmlFor="termsAccept" className="text-xs leading-tight text-slate-600 cursor-pointer select-none">
              I agree to the <Link href="/privacy" target="_blank" className="text-orange-600 hover:underline font-bold">Privacy Policy</Link> and <Link href="/terms" target="_blank" className="text-orange-600 hover:underline font-bold">Terms of Service</Link> of DivyaYagyam.com
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
