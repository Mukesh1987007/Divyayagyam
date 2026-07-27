
import Link from 'next/link'
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Video, Sparkles, AlertCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 30

// Helper to get embeddable YouTube link if applicable
function getEmbedUrl(url: string | null) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
}

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { startsAt: 'asc' }
  }).catch(() => [])

  return (
    <div className="container py-14 space-y-12">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-om-gradient">Spiritual Events & Festivals</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          भारत के प्रमुख मंदिरों से साक्षात उत्सव एवं पावन धार्मिक कार्यक्रमों से जुड़ें।
        </p>
      </div>

      {/* SCHEDULE & UPCOMING EVENTS */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-[var(--primary-color)] pl-3">
          आगामी उत्सव एवं शेड्यूल (Event Schedule)
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            कोई आगामी इवेंट अनुसूचित नहीं है। कृपया जल्द ही दोबारा जांचें।
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => {
              const startFormatted = new Date(e.startsAt).toLocaleDateString('hi-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })

              return (
                <Card key={e.id} className="overflow-hidden group hover:shadow-lg transition-all border border-slate-100 flex flex-col justify-between">
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {e.coverImage ? (
                      <Image src={e.coverImage} alt={e.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-primary bg-[var(--secondary-color)]/10">
                        <Sparkles className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs text-[var(--primary-color)] font-bold flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {startFormatted}
                      </div>
                      <h3 className="font-bold text-base text-slate-800 group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">{e.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        {e.location || 'Holy Place'}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {e.description || 'Watch the sacred rituals and darshan.'}
                      </p>
                    </div>
                    <div className="pt-3 border-t">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs" asChild>
                        <Link href="/pujas">अनुष्ठान बुक करें (Book Puja)</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

