'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Mail, Phone, Calendar, Loader2, Save, Users, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [gotra, setGotra] = useState('')
  const [avatar, setAvatar] = useState('')
  const [memberSince, setMemberSince] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (data.ok && data.user) {
          setFullName(data.user.fullName || '')
          setPhone(data.user.phone || '')
          setEmail(data.user.email || '')
          setGotra(data.user.gotra || '')
          setAvatar(data.user.avatar || '')
          setMemberSince(data.user.createdAt || '')
        } else {
          toast.error('Failed to load profile details')
        }
      } catch {
        toast.error('Network error loading profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, gotra, avatar }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Network error updating profile')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setUpdatingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">मेरी प्रोफाइल (My Profile)</h1>
        <p className="text-muted-foreground text-sm">अपनी व्यक्तिगत जानकारी और गोत्र आदि यहाँ सुरक्षित रखें।</p>
      </div>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
          <CardTitle className="text-orange-900">Edit Profile</CardTitle>
          <CardDescription>Update your personal information to get accurate puja sankalps.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdate} className="space-y-5">
            
            {/* Avatar URL Field */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <div className="h-20 w-20 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-md shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8 text-orange-400" />
                )}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="avatar" className="flex items-center gap-1.5 text-slate-700">
                  <Camera className="h-4 w-4 text-orange-500" /> Profile Picture URL
                </Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-muted-foreground" /> पूरा नाम (Full Name)
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gotra" className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-orange-500" /> आपका गोत्र (Gotra)
                </Label>
                <Input
                  id="gotra"
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  placeholder="उदा. कश्यप, भारद्वाज..."
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" /> फोन नंबर (Phone)
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9587171984"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-4 w-4" /> ईमेल (Email - Read Only)
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            {memberSince && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-orange-50 border border-orange-100 text-xs text-orange-800 font-medium">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span>
                  Member since:{' '}
                  {new Date(memberSince).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-orange-600/20">
              {saving ? (
                <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save Profile Details
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-orange-100 shadow-sm mt-6">
        <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
          <CardTitle className="text-orange-900">Change Password</CardTitle>
          <CardDescription>Update your login password securely.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={updatingPassword} variant="outline" className="w-full sm:w-auto border-orange-200 text-orange-700 hover:bg-orange-50">
              {updatingPassword ? (
                <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…</span>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
