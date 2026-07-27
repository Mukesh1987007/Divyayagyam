'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, Sparkles, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  const [temples, setTemples] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/temples')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          // Show only active temples on public page
          setTemples((j.data || []).filter((t: any) => t.isActive))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container py-14 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-3">🗺️ Pilgrimage</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-om-gradient">Sacred Temples</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Offer puja, sankalp, and chadhawa at India's most powerful, heritage temples.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : temples.length === 0 ? (
        <Card className="border-dashed max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <Building2 className="h-12 w-12 text-muted-foreground/60 mx-auto" />
            <h3 className="text-lg font-semibold">No Temples Registered Yet</h3>
            <p className="text-sm text-muted-foreground">Check back soon or ask our AI pandit for assistance.</p>
            <Button asChild size="sm">
              <Link href="/ask-a-pandit">Ask AI Pandit ✨</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {temples.map((temple) => (
            <Card key={temple.id} className="overflow-hidden group hover:shadow-lg transition-all border border-primary/10">
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                {temple.coverImage ? (
                  <img loading="lazy" src={temple.coverImage}
                    alt={temple.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary bg-orange-50/50">
                    <Building2 className="h-12 w-12 opacity-40" />
                  </div>
                )}
                {temple.isFeatured && (
                  <Badge className="absolute top-3 left-3 bg-primary text-white flex items-center gap-1">
                    <Sparkles className="h-3 w-3 fill-white" /> Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-5 space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2 text-xs">
                    {temple.deity || 'Lord Shiva'}
                  </Badge>
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{temple.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {temple.address ? `${temple.address}, ` : ''}{temple.city}, {temple.state}
                  </p>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {temple.description || 'No description available for this sacred destination yet.'}
                </p>
                <div className="pt-4 mt-2 border-t flex items-center justify-between gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/temples/${temple.slug}`}>View Details & Videos</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link href={`/pujas`}>Book Puja</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
