import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image';
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Flame, HandCoins, Sparkles, ShoppingBag, Star, ArrowRight,
  MapPin, Calendar, ShieldCheck, Video, Play, BookOpen, User,
  Truck, Lock
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { MediaCarousel } from '@/components/ui/media-carousel'
import { HeroPujaSlider } from '@/components/hero-puja-slider'
import { FadeIn } from '@/components/ui/fade-in'

const upcomingPujasFallback = [
  { name: 'महा रुद्राभिषेक (Maha Rudrabhishek)', temple: 'काशी विश्वनाथ मंदिर, वाराणसी', date: 'श्रावण सोमवार Special', img: process.env.NEXT_PUBLIC_URL_4496 || '', price: 1100, vip: false },
  { name: 'गुरु पूर्णिमा महाआरती (Guru Purnima)', temple: 'सोमनाथ ज्योतिर्लिंग मंदिर', date: '21 July', img: process.env.NEXT_PUBLIC_URL_4497 || '', price: 2100, vip: false },
  { name: 'कालसर्प दोष निवारण पूजा (Kalsarp Dosh)', temple: 'महाकालेश्वर मंदिर, उज्जैन', date: 'Every Sunday', img: process.env.NEXT_PUBLIC_URL_4498 || '', price: 1251, vip: true },
  { name: 'महामृत्युंजय जाप (Maha Mrityunjay Jap)', temple: 'त्र्यंबकेश्वर ज्योतिर्लिंग', date: 'Instant Booking', img: process.env.NEXT_PUBLIC_URL_4525 || '', price: 1500, vip: true },
]



const fallbackTestimonials = [
  { name: 'रविंद्र दीक्षित (Ravindra Dixit)', location: 'लखनऊ', rating: 5, message: 'काशी विश्वनाथ मंदिर में की गई पूजा का अनुभव अत्यंत दिव्य था। प्रसाद भी 4 दिनों में घर मिल गया।' },
  { name: 'दीपक चौरसिया (Deepak Chaurasia)', location: 'भोपाल', rating: 5, message: 'लाइव स्ट्रीमिंग की क्वालिटी बहुत अच्छी थी। घर बैठे लग रहा था कि हम मंदिर के गर्भगृह में ही बैठे हैं।' },
  { name: 'अंजली मेनन (Anjali Menon)', location: 'बैंगलोर', rating: 5, message: 'पंडित जी ने मंत्रोच्चारण के साथ मेरा नाम और गोत्र स्पष्ट रूप से बोला। बहुत संतुष्ट हूँ।' },
]

export const revalidate = 30

export default async function HomePage() {
  let [products, dbPujas, dbTestimonials, heroSlides, pastPujas, customerReviews, festivalEvents] = await Promise.all([
    prisma.product.findMany({
      take: 4,
      include: { category: true }
    }).catch(() => []),
    prisma.puja.findMany({
      where: { 
        status: 'PUBLISHED',
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ]
      },
      take: 4,
      include: { category: true, temple: true },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.heroSlider.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    }),
    prisma.mediaLibrary.findMany({ where: { folder: 'Past Puja' }, orderBy: { createdAt: 'desc' }, take: 10 }).catch(() => []),
    prisma.mediaLibrary.findMany({ where: { folder: 'Customer Review' }, orderBy: { createdAt: 'desc' }, take: 12 }).catch(() => []),
    prisma.mediaLibrary.findMany({ where: { folder: 'Festival Event' }, orderBy: { createdAt: 'desc' }, take: 5 }).catch(() => []),
  ])

  let testimonials = dbTestimonials
  if (testimonials.length === 0) {
    testimonials = fallbackTestimonials as any
  }

  // Inject Media Library Festival Events into Hero Slider
  const mediaHeroSlides = festivalEvents.map((m: any, i: number) => ({
    id: m.id,
    image: m.url,
    title: m.filename || 'Special Event',
    subtitle: 'DivyaYagyam Special',
    link: '/pujas',
    buttonText: 'Participate Now',
    order: 100 + i,
    isActive: true
  }))
  const allHeroSlides = [...heroSlides, ...mediaHeroSlides].sort((a: any, b: any) => a.order - b.order)

  // JSON-LD Structured Data for Google Sitelinks and Brand Knowledge Graph
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://divyayagyam.com/#organization",
        "name": "DivyaYagyam",
        "url": "https://divyayagyam.com",
        "logo": "https://divyayagyam.com/logo.jpg",
        "sameAs": [
          "https://www.facebook.com/divyayagyam",
          "https://www.instagram.com/divyayagyam",
          "https://www.youtube.com/@divyayagyam"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://divyayagyam.com/#website",
        "url": "https://divyayagyam.com",
        "name": "DivyaYagyam",
        "publisher": {
          "@id": "https://divyayagyam.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://divyayagyam.com/pujas?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <div className="space-y-0">
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HERO SECTION - SRI MANDIR STYLE */}
      <section className="w-full bg-card py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-6">
            
            {/* Title Section */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary leading-tight tracking-wide">
                India's Most Trusted Temples. One Sacred Booking Away.
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-4 font-medium max-w-3xl">
                Verified pandits, video proof of your puja on WhatsApp, and sacred prasad delivered to your doorstep — trusted by thousands of devotee families across India.
              </p>
            </div>

            {/* Trust Bar (New) */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600/90" /> Verified Pandits
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                <Video className="h-4 w-4 text-emerald-600/90" /> Video Proof on WhatsApp
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                <Truck className="h-4 w-4 text-emerald-600/90" /> Prasad Delivered Home
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                <Lock className="h-4 w-4 text-emerald-600/90" /> 100% Secure Payments
              </div>
            </div>

            {/* Banner Slider */}
            <div className="w-full">
              <HeroPujaSlider slides={allHeroSlides} />
            </div>

            {/* Quick Action Links (Desktop mainly) */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-none font-semibold px-8" asChild>
                <Link href="/pujas">Book a Puja (पूजा बुक करें) <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border text-foreground/80 hover:bg-muted/50 font-semibold shadow-sm" asChild>
                <Link href="/tools"><Sparkles className="mr-2 h-4 w-4 text-secondary" /> Astro Tools</Link>
              </Button>
            </div>

            {/* Trust Badges - (Removed since we have Trust Bar now) */}
            
          </div>
        </div>
      </section>





      {/* UPCOMING PUJAS */}
      <section className="container py-16 md:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Upcoming Sacred Ceremonies</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Join auspicious pujas happening this week at India's most revered temples.</p>
          </div>
          <Button variant="outline" className="border-border text-foreground/80 font-semibold" asChild>
            <Link href="/pujas">View All <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
        <MediaCarousel>
          {dbPujas.length > 0 ? (
            dbPujas.map((p) => (
              <Link href={`/pujas/${p.slug}`} key={p.id} className="block h-full">
                <Card className="overflow-hidden group border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full bg-card">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                    {p.coverImage ? (
                      p.coverImage.endsWith('.mp4') || p.coverImage.endsWith('.webm') || p.coverImage.startsWith('data:video/') ? (
                        <video src={p.coverImage} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <Image src={p.coverImage} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 bg-muted/50">
                        <Sparkles className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                    {p.isVip && <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground font-bold border-none rounded-sm px-3 py-1 z-20 shadow-sm uppercase tracking-wider text-[10px]">VIP</Badge>}
                  </div>
                  <CardContent className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h3 className="font-heading font-semibold text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">{p.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4 text-primary shrink-0" /> {p.location || 'Any Holy Temple'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-border/60">
                      <span className="text-xl font-bold text-foreground">₹{p.price?.toString()}</span>
                      <div className="inline-flex h-10 items-center justify-center whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-6 transition-all duration-300 text-sm shadow-sm">
                        Participate
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            dbPujas.map((p: any, i) => (
              <Link href={`/pujas`} key={i} className="block h-full">
                <Card className="overflow-hidden group border border-gray-100/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full bg-[var(--card-bg)]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                    <Image src={p.img} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    {p.vip && <Badge className="absolute top-3 left-3 bg-gradient-to-r from-[var(--secondary-color)] to-yellow-600 text-white font-bold border-none rounded-md px-3 py-1 z-20 shadow-sm">⭐ VIP</Badge>}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow-sm px-2.5 py-1.5 rounded-md text-[10px] text-[var(--text-dark)] font-black flex items-center gap-1.5 z-20">
                      <Calendar className="h-3.5 w-3.5 text-[var(--primary-color)]" /> {new Date(p.date || p.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <CardContent className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base md:text-lg text-[var(--text-dark)] group-hover:text-[var(--primary-color)] transition-colors line-clamp-2 leading-tight">{p.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4 text-[var(--primary-color)] shrink-0" /> {p.location || 'Online'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
                      <span className="text-xl font-black text-[var(--text-dark)]">₹{p.price}</span>
                      <div className="inline-flex h-9 items-center justify-center whitespace-nowrap bg-gradient-to-r from-[var(--primary-color)] to-[#C1121F] hover:shadow-lg hover:shadow-[var(--primary-color)]/20 text-white font-bold rounded-xl px-5 transition-all duration-300 text-sm">
                        Participate
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </MediaCarousel>
      </section>

      {/* SACRED PRODUCTS */}
      {products.length > 0 && (
        <section className="container pb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Sacred Prasad & Puja Essentials</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Blessed offerings from the temple, packed with care and delivered to your home.</p>
            </div>
            <Button variant="outline" className="border-gray-200 text-gray-700 font-semibold" asChild>
              <Link href="/products">View All <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <MediaCarousel>
            {products.map((p: any) => (
              <Link href={`/products/${p.slug}`} key={p.id} className="block h-full">
                <Card className="overflow-hidden group border border-gray-100/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full bg-[var(--card-bg)]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-light)] p-6 flex items-center justify-center">
                    {p.coverImage || (p.images && p.images[0]) ? (
                      <Image src={p.coverImage || p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110 drop-shadow-md" />
                    ) : (
                      <div className="h-full w-full bg-transparent flex items-center justify-center text-gray-300"><Sparkles className="h-8 w-8 opacity-40"/></div>
                    )}
                    {p.category?.name && (
                      <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--text-dark)] shadow-sm border border-gray-100 rounded-md px-2.5 py-1 text-[10px] font-black z-20">
                        {p.category.name}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base md:text-lg text-[var(--text-dark)] group-hover:text-[var(--primary-color)] transition-colors line-clamp-1 leading-tight">{p.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">{p.shortDescription || 'प्रामाणिक एवं सिद्ध सनातन सामग्री।'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
                      <span className="text-xl font-black text-[var(--text-dark)]">₹{Number(p.salePrice || p.price)}</span>
                      <div className="inline-flex h-9 items-center justify-center whitespace-nowrap bg-gradient-to-r from-[var(--primary-color)] to-[#C1121F] hover:shadow-lg hover:shadow-[var(--primary-color)]/20 text-white font-bold rounded-xl px-5 transition-all duration-300 text-sm">
                        Buy Now
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </MediaCarousel>
        </section>
      )}



      {/* TESTIMONIALS */}
      <section className="container pb-16">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Blessings Shared by Our Devotees</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Hundreds of families have received the Lord's blessings through our services.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Card key={i} className="border border-gray-100 hover:shadow-md transition-shadow rounded-2xl bg-[var(--card-bg)] shadow-sm">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#F4B400] text-[#F4B400]" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">“{t.message}”</p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="relative h-10 w-10 rounded-full bg-[var(--secondary-color)]/10 flex items-center justify-center text-[var(--primary-color)] font-bold overflow-hidden border border-gray-100">
                    {t.avatar ? (
                      <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      t.name[0]
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-dark)] leading-tight">{t.name}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{t.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* LIVE DEVOTEE REVIEWS (FROM MEDIA LIBRARY) */}
      {customerReviews.length > 0 && (
        <section className="container pb-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Live Devotee Reviews (लाइव रिव्यु)</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Real experiences shared by devotees on WhatsApp & Social Media.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {customerReviews.map((media: any) => (
              <div key={media.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border shadow-sm group">
                <Image src={media.url} alt={media.filename || 'Review'} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PAST PUJAS GALLERY (FROM MEDIA LIBRARY) */}
      {pastPujas.length > 0 && (
        <section className="container pb-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Glimpses of Past Pujas (बीती हुई पूजा)</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Divine moments captured during our successfully completed rituals.</p>
          </div>
          <MediaCarousel>
            {pastPujas.map((media: any) => (
              <div key={media.id} className="relative aspect-video rounded-2xl overflow-hidden border shadow-sm group mx-2">
                <Image src={media.url} alt={media.filename || 'Past Puja'} fill sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 text-white font-bold text-sm">
                  {media.filename || 'Sacred Ritual'}
                </div>
              </div>
            ))}
          </MediaCarousel>
        </section>
      )}

      {/* WHY TRUST US */}
      <section className="bg-muted/30 py-16 md:py-24 border-y border-border/40 mt-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Why Thousands of Families Trust Divyayagyam</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Verified Temples & Pandits</h3>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Video className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Video Proof on WhatsApp</h3>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Truck className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">On-Time Prasad Delivery</h3>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Lock className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Secure & Transparent Payments</h3>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container py-20 md:py-32">
        <div className="bg-primary/5 rounded-3xl border border-primary/20 p-8 md:p-16 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">Your Prayers, Our Devotion</h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Book your first puja today and experience tradition, simplified.</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 mt-4" asChild>
            <Link href="/pujas">Book Your Puja <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  )
}




