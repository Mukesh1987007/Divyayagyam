
import Link from 'next/link'
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Sparkles, ShieldCheck, Flame, Star, Award, HeartHandshake, Video, Lock } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 30

export default async function VipPujasPage() {
  const pujas = await prisma.puja.findMany({
    where: { 
      status: 'PUBLISHED', 
      isVip: true,
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } }
      ]
    },
    include: { category: true, temple: true },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])



  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50/40 via-background to-background py-16">
      <div className="container max-w-6xl space-y-12">
        
        {/* DEVOTIONAL HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-500/20 px-3 py-1 text-xs font-bold rounded-full gap-1.5 mx-auto">
            <Award className="h-3.5 w-3.5 text-amber-600" /> विशिष्ट सेवाएँ • Premium & Exclusive
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="text-om-gradient">VIP Puja Anusthan</span> <br />
            <span className="text-slate-900 text-3xl md:text-4xl font-bold">(विशिष्ट पूजा एवं महा-अनुष्ठान)</span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
          <p className="text-lg text-slate-600 leading-relaxed">
            शीर्ष विद्वान वैदिक आचार्यों एवं 21+ वर्ष अनुभवी पंडितों द्वारा आपके नाम, गोत्र व विशिष्ट मनोकामनाओं हेतु व्यक्तिगत महा-यज्ञ एवं अनुष्ठान।
          </p>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT CONTENT: Dynamic Pujas Grid */}
          <div className="lg:col-span-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {pujas.map((p) => (
                <Card key={p.id} className="overflow-hidden group hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 border border-slate-100 flex flex-col justify-between bg-white relative">
                  
                  {/* Image/Video section */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                    {p.coverImage ? (
                      p.coverImage.endsWith('.mp4') || p.coverImage.endsWith('.webm') || p.coverImage.startsWith('data:video/') ? (
                        <video src={p.coverImage} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <Image src={p.coverImage} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )
                    ) : (
                      // Beautiful sacred placeholder design instead of a gray box
                      <div className="h-full w-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-800 flex flex-col items-center justify-center text-white p-4 text-center space-y-2 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
                        <span className="text-4xl">🕉️</span>
                        <span className="text-xs tracking-widest font-black uppercase text-amber-200">SANATAN SEVA</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white font-black px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase border border-amber-400 shadow-md">
                      ⭐ EXCLUSIVE
                    </div>
                  </div>

                  {/* Details section */}
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-[10px] font-bold text-amber-700 border-amber-200 bg-amber-50/50">
                        {p.category?.name || 'Exclusive Ritual'}
                      </Badge>
                      <h3 className="font-extrabold text-xl text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                        {p.location || 'Holy Pilgrimage / Special Mandap'}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                        {p.shortDescription || 'Participate in this highly customized VIP ritual for health, prosperity, and lineage blessings.'}
                      </p>
                    </div>

                    {/* Pricing and booking */}
                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">VIP संकल्प मूल्य</span>
                        <span className="text-xl font-black text-amber-600">₹{(p.vipPrice || p.price)?.toString()}</span>
                      </div>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg px-4" asChild>
                        <Link href={`/bookings/new?pujaId=${p.id}`}>बुक करें (Book VIP)</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}


            </div>
          </div>

          {/* RIGHT COLUMN: VIP Features & Guarantee (Prevents empty whitespace) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-amber-200/60 bg-gradient-to-b from-amber-50/40 to-white rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-black text-lg text-slate-800 border-b pb-3 flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-600" /> VIP सेवा के मुख्य लाभ
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Star className="h-4 w-4 text-amber-700 fill-amber-700" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-black text-slate-800">व्यक्तिगत संकल्प (Personalized Sankalp)</h4>
                    <p className="text-slate-600 leading-relaxed">पंडित जी विशेष रूप से आपका नाम, गोत्र एवं परिवार के सदस्यों का नाम लेकर मंत्रोच्चारण करेंगे।</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-black text-slate-800">लाइव वन-टू-वन वीडियो (1-on-1 Stream)</h4>
                    <p className="text-slate-600 leading-relaxed">पूजा के समय आप घर बैठे वीडियो कॉल या लाइव स्ट्रीमिंग से सीधे जुड़कर दर्शन कर सकते हैं।</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <HeartHandshake className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-black text-slate-800">विशिष्ट महाप्रसाद (Exclusive Prasad)</h4>
                    <p className="text-slate-600 leading-relaxed">मंदिर में चढ़ाया गया विशेष भोग, रक्षासूत्र, यंत्र और भस्म कोरियर से सीधे आपके घर पहुंचाई जाएगी।</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-gray-100/50 px-3 py-2 rounded-xl">
                  <ShieldCheck className="h-4 w-4 text-amber-700" /> 100% प्रमाणित वैदिक ब्राह्मण
                </div>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}
