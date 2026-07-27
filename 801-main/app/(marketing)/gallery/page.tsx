import { getSetting } from '@/lib/settings'
import { prisma } from '@/lib/prisma'
import Image from 'next/image';
import { Badge } from '@/components/ui/badge'
import { Camera, Sparkles, Video, Lock } from 'lucide-react'

export const revalidate = 30

export default async function GalleryPublicPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { order: 'asc' }
  })



  return (
    <div className="container py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-3 bg-orange-100 text-orange-700 hover:bg-orange-200">🖼️ Sacred Gallery</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">
          Divine <span className="text-om-gradient">Darshan</span> & Media
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Explore beautiful glimpses of temples, pujas, and spiritual events.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl bg-slate-50">
          No media available yet. Check back soon for divine darshan!
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group relative bg-black">
              {item.type === 'VIDEO' ? (
                <video
                  src={item.url}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  controls
                  preload="metadata"
                />
              ) : (
                <Image src={item.url}
                  alt={item.caption || 'Gallery Image'}
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <p className="text-white font-medium text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
