import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Video, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 30

export default async function TempleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const temple = await prisma.temple.findUnique({
    where: { slug: slug },
    include: {
      videos: true,
      events: true,
    }
  })

  if (!temple || !temple.isActive) {
    notFound()
  }

  return (
    <div className="container py-14 space-y-10">
      <Link href="/temples" className="inline-flex items-center text-sm font-medium text-orange-600 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Temples
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">{temple.name}</h1>
        <p className="text-lg text-muted-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-600" />
          {temple.address ? `${temple.address}, ` : ''}{temple.city}, {temple.state}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">About Temple</h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {temple.description || 'No description available for this temple.'}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Upcoming Events</h2>
          {temple.events.length === 0 ? (
            <p className="text-slate-500 italic">No events scheduled currently.</p>
          ) : (
            <div className="space-y-4">
              {temple.events.map(event => (
                <Card key={event.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4 flex gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[70px]">
                      <Calendar className="h-6 w-6 text-orange-600 mb-1" />
                      <span className="text-xs font-bold text-orange-800">{new Date(event.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{event.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">{event.description}</p>
                      {event.isLive && <Badge variant="destructive" className="mt-2 text-[10px]">🔴 LIVE</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {temple.isVideoEnabled && temple.videos.length > 0 && (
        <div className="space-y-6 pt-10">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Video className="h-6 w-6 text-orange-600" /> Live Streams & Videos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temple.videos.map(video => {
              // Robust YouTube ID extraction
              let embedUrl = video.url;
              const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
              const match = video.url.match(ytRegex);
              if (match && match[1]) {
                embedUrl = `https://www.youtube.com/embed/${match[1]}`
              }

              return (
                <div key={video.id} className="space-y-2">
                  <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-md">
                    <iframe 
                      src={embedUrl} 
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1 px-1">{video.title}</h4>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
