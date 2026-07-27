'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image';
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, CheckCircle2, Video, Gift, Sparkles, ShieldCheck, Star, User, HandHeart, Clock, ThumbsUp, ArrowRight, ArrowDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function PujaClientView({ puja }: { puja: any }) {
  const router = useRouter()
  const { addToCart } = useCart()
  
  // Custom packages based on the V2 design constraints (951, 1501, 2501, 3501 logic)
  const basePrice = Number(puja?.price || 951)
  const mockPackages = [
    { id: '1', name: '1 Member', price: basePrice, desc: 'संकल्प में 1 नाम और गोत्र पुकारा जाएगा. व्हाट्सएप/ईमेल पर वीडियो मिलेगा. घर पर पवित्र प्रसाद डिलीवर होगा.' },
    { id: '2', name: '2 Members', price: basePrice + 550, desc: 'संकल्प में 2 नाम और गोत्र पुकारे जाएंगे. व्हाट्सएप/ईमेल पर वीडियो मिलेगा. घर पर पवित्र प्रसाद डिलीवर होगा.' },
    { id: '3', name: '4 Members', price: basePrice + 1550, desc: 'संकल्प में 4 नाम और गोत्र पुकारे जाएंगे. व्हाट्सएप/ईमेल पर वीडियो मिलेगा. घर पर पवित्र प्रसाद डिलीवर होगा.' },
    { id: '4', name: '6 Members', price: basePrice + 2550, desc: 'संकल्प में 6 नाम और गोत्र पुकारे जाएंगे. व्हाट्सएप/ईमेल पर वीडियो मिलेगा. घर पर पवित्र प्रसाद डिलीवर होगा.' }
  ]

  let packages = puja?.packages?.length ? [...puja.packages] : mockPackages

  const [selectedPackage, setSelectedPackage] = useState<string>(packages[0]?.id || '1')
  const [activeTab, setActiveTab] = useState('benefits')
  
  if (!puja) return <div className="py-20 text-center">Puja Not Found</div>

  const fallbackImage = process.env.NEXT_PUBLIC_URL_4684 || ''
  const activeImage = puja?.coverImage || fallbackImage

  const handleBookNow = (overridePkgId?: string) => {
    const pkgId = overridePkgId || selectedPackage
    const pkg = packages.find((p: any) => p.id === pkgId)
    if (pkg) {
      addToCart({
        id: `puja-${puja.id}-${pkg.id}`,
        name: `${puja.name} - ${pkg.name}`,
        price: Number(pkg.price),
        image: activeImage
      })
      setTimeout(() => router.push('/checkout'), 50)
    }
  }

  const handleScrollTo = (id: string) => {
    setActiveTab(id)
    const element = document.getElementById(id)
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100 // Adjust for sticky header
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Handle active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['benefits', 'packages', 'process', 'media', 'faqs']
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveTab(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative bg-[#FAFAFA] pb-32 font-sans">
      
      {/* 1. Hero Section (V2 Design - Maroon/Red & Gold Theme) */}
      <section className="relative w-full py-20 sm:py-28 lg:py-36 flex flex-col items-center justify-center px-4 overflow-hidden bg-rose-950">
        <div className="absolute inset-0 z-0">
          <img src={activeImage} alt={puja.name} className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-rose-950/90 via-rose-950/70 to-rose-950/95"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
          
          <div className="flex-1 space-y-6">
            <div className="inline-block border-2 border-yellow-500/80 bg-rose-950/50 backdrop-blur-sm px-4 py-1.5 rounded-sm shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <span className="text-yellow-500 font-black text-sm tracking-widest uppercase">
                {puja.category?.name || 'विशेष अनुष्ठान'}
              </span>
            </div>
            
            <h1 className="flex flex-col">
              <span className="text-white/90 text-2xl md:text-3xl font-medium tracking-wide mb-2">Peace for</span>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 pb-2">
                {puja.name}
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium text-sm sm:text-base border-l-4 border-yellow-500 pl-4">
              <div className="flex items-center gap-1.5"><MapPin className="h-5 w-5 text-yellow-500" /> {puja.location || 'Brahma Kapal, Badrinath'}</div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30"></div>
              <div className="flex items-center gap-1.5"><Calendar className="h-5 w-5 text-yellow-500" /> {puja.publishedAt ? new Date(puja.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Booking Open'}</div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-center md:items-end space-y-4">
            <Button 
              onClick={() => handleScrollTo('packages')}
              className="w-full md:w-auto px-8 h-16 text-xl bg-[#28a745] hover:bg-green-600 text-white font-black shadow-[0_10px_25px_rgba(40,167,69,0.3)] hover:shadow-[0_10px_30px_rgba(40,167,69,0.5)] transition-all rounded-sm uppercase tracking-wide border-b-4 border-green-800"
            >
              Select Puja Packages
            </Button>
            <p className="text-yellow-500/80 font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Verified Vedic Pandits
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sub-Header Anchor Menu (Sticky) */}
      <div className="sticky top-[60px] sm:top-[72px] z-40 w-full bg-white border-b border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto flex items-center gap-8 px-4 py-4 min-w-max">
          {[
            { id: 'packages', label: 'Packages' },
            { id: 'benefits', label: 'Why Perform?' },
            { id: 'process', label: 'How it Works' },
            { id: 'media', label: 'Videos' },
            { id: 'faqs', label: 'FAQs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleScrollTo(tab.id)}
              className={cn(
                "font-bold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 pb-1.5 px-1 uppercase tracking-wide",
                activeTab === tab.id 
                  ? "border-rose-900 text-rose-900" 
                  : "border-transparent text-gray-500 hover:text-rose-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 space-y-24">
        
        {/* 3. Packages Section (V2 Grid Layout with ॐ Bullet Points) */}
        <section id="packages" className="scroll-mt-36">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-rose-950 uppercase tracking-wide">Select Puja Package</h2>
            <div className="w-16 h-1.5 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg: any) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg.id)}
                className={cn(
                  "border rounded-sm p-6 sm:p-8 bg-white transition-all cursor-pointer flex flex-col justify-between group",
                  selectedPackage === pkg.id 
                    ? "border-green-600 shadow-xl ring-1 ring-green-600 bg-green-50/10" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                )}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-black text-slate-800">{pkg.name}</h3>
                    <div className="text-2xl font-black text-rose-900">₹ {pkg.price.toLocaleString()}</div>
                  </div>
                  
                  <ul className="space-y-4">
                    {pkg.desc ? pkg.desc.split('. ').map((feat: string, i: number) => feat.trim() && (
                      <li key={i} className="flex gap-3 items-start text-[15px] text-slate-600 font-medium leading-relaxed">
                        <div className="text-rose-800 font-black text-lg leading-none mt-0.5">ॐ</div>
                        <span>{feat}</span>
                      </li>
                    )) : (
                      <li className="flex gap-3 items-start text-[15px] text-slate-600 font-medium leading-relaxed">
                        <div className="text-rose-800 font-black text-lg leading-none mt-0.5">ॐ</div>
                        Standard complete rituals included
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-8">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage(pkg.id);
                      handleBookNow(pkg.id);
                    }}
                    className={cn(
                      "w-full font-bold h-14 text-lg rounded-sm shadow-sm transition-all uppercase tracking-wide border-b-4",
                      selectedPackage === pkg.id 
                        ? "bg-[#28a745] hover:bg-green-600 text-white border-green-800" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                    )}
                  >
                    Book Puja For {pkg.name.replace('Members', 'Member(s)')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Why Perform / Benefits Section */}
        <section id="benefits" className="scroll-mt-36">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-rose-950 uppercase tracking-wide">Why Perform this Puja?</h2>
            <div className="w-16 h-1.5 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
            <div 
              className="prose prose-slate mx-auto text-slate-600 leading-relaxed mt-6 whitespace-pre-wrap text-left md:text-justify max-w-4xl" 
              dangerouslySetInnerHTML={{ __html: puja.longDescription || puja.description || 'Participate in this sacred puja for peace, health, and spiritual growth. The ancient Vedic mantras performed by authentic pandits remove obstacles and attract prosperity.' }} 
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 mt-10">
            {[
              { icon: ShieldCheck, title: 'Karmic Cleansing', desc: 'Ancient mantras to clear hurdles in career, marriage, and life.' },
              { icon: HandHeart, title: 'Divine Blessings', desc: 'Invokes divine energy for longevity, peace, and financial stability.' },
              { icon: Sparkles, title: 'Spiritual Awakening', desc: 'Deepens your spiritual connection and brings inner calm.' },
              { icon: Clock, title: 'Ancestral Peace', desc: 'Ensures the salvation and peace of departed ancestors.' }
            ].map((b, i) => (
              <div key={i} className="flex gap-4 bg-white p-6 rounded-sm border border-gray-200 items-start shadow-sm">
                <div className="h-12 w-12 rounded-sm bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <b.icon className="h-6 w-6 text-rose-900" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{b.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Process Flow (6 Steps with Arrows) */}
        <section id="process" className="scroll-mt-36 bg-white rounded-sm p-8 sm:p-12 border border-gray-200 shadow-sm">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-rose-950 uppercase tracking-wide">Puja Process</h2>
            <div className="w-16 h-1.5 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
            <p className="text-lg text-slate-500 mt-4 font-medium">How this works - 6 Simple Steps</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-8 left-[5%] right-[5%] h-[2px] bg-gray-200 z-0"></div>
            
            {[
              { icon: User, title: 'Step 1', desc: 'Book Package' },
              { icon: ShieldCheck, title: 'Step 2', desc: 'Fill Details' },
              { icon: MapPin, title: 'Step 3', desc: 'Pandit Assigned' },
              { icon: Sparkles, title: 'Step 4', desc: 'Sankalp Done' },
              { icon: Video, title: 'Step 5', desc: 'Video Sent' },
              { icon: Gift, title: 'Step 6', desc: 'Prasad Delivery' }
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col md:flex-row items-center w-full md:w-auto">
                <div className="relative z-10 flex flex-col items-center text-center space-y-3 bg-white p-2">
                  <div className="w-16 h-16 rounded-full bg-white border-[3px] border-rose-900 flex items-center justify-center shadow-md">
                    <step.icon className="h-6 w-6 text-rose-900" />
                  </div>
                  <div className="w-24">
                    <h4 className="font-black text-xs text-yellow-600 uppercase tracking-widest">{step.title}</h4>
                    <p className="font-bold text-slate-800 mt-1 text-sm leading-tight">{step.desc}</p>
                  </div>
                </div>
                {/* Arrow Separator (Desktop Right, Mobile Down) */}
                {i < arr.length - 1 && (
                  <div className="z-10 bg-white md:bg-transparent py-2 md:py-0 md:-mt-8">
                    <ArrowRight className="hidden md:block h-5 w-5 text-gray-400" />
                    <ArrowDown className="block md:hidden h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. Videos / Media */}
        <section id="media" className="scroll-mt-36">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-rose-950 uppercase tracking-wide">Live Glimpses</h2>
            <div className="w-16 h-1.5 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mock YouTube embeds matching DevPunya style */}
            <div className="aspect-video w-full rounded-sm overflow-hidden shadow-lg border-4 border-rose-900/10 bg-slate-100">
               <iframe 
                  src="https://www.youtube.com/embed/IbDU-s95iBA" 
                  className="w-full h-full" 
                  title="DevPunya Puja Video 1"
                  allowFullScreen
                />
            </div>
            <div className="aspect-video w-full rounded-sm overflow-hidden shadow-lg border-4 border-rose-900/10 bg-slate-100">
               <iframe 
                  src="https://www.youtube.com/embed/IbDU-s95iBA" 
                  className="w-full h-full" 
                  title="DevPunya Puja Video 2"
                  allowFullScreen
                />
            </div>
          </div>
        </section>

        {/* 7. FAQs */}
        <section id="faqs" className="scroll-mt-36 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-rose-950 uppercase tracking-wide">Frequently Asked Questions</h2>
            <div className="w-16 h-1.5 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: 'How will I receive the video of the Puja?', a: 'Once the puja is completed, a personalized video snippet showing your sankalp (name & gotra chanting) will be shared via WhatsApp and Email within 24-48 hours.' },
              { q: 'When will I receive the Prasad?', a: 'Prasad is dispatched via fast courier services immediately after the puja. It usually takes 4-7 working days to reach anywhere in India.' },
              { q: 'Can I join the puja live?', a: 'Yes, if you select a premium package that includes live Zoom joining, our team will coordinate the link with you.' },
              { q: 'Is the payment secure?', a: 'Absolutely. We use industry-standard encryption and highly secure payment gateways. Your details are 100% safe.' }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-gray-200 bg-white rounded-sm px-6 shadow-sm overflow-hidden">
                <AccordionTrigger className="text-left font-bold text-slate-800 text-base hover:no-underline py-5">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-sm pb-5 font-medium">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>

      {/* 8. Sticky Bottom CTA (Mobile/Desktop) - Bright Green */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-lg font-black text-slate-900 truncate max-w-sm xl:max-w-xl">{puja.name}</p>
            <p className="text-sm font-bold text-rose-900">
              {selectedPackage ? `₹${packages.find((p:any) => p.id === selectedPackage)?.price} - Package Selected` : `Select a package above`}
            </p>
          </div>
          <Button 
            onClick={() => handleScrollTo('packages')}
            className="w-full sm:w-auto sm:min-w-[300px] bg-[#28a745] hover:bg-green-600 text-white font-black h-14 text-lg rounded-sm shadow-lg transition-transform active:scale-95 uppercase tracking-wide border-b-4 border-green-800"
          >
            Select Puja Packages
          </Button>
        </div>
      </div>
    </div>
  )
}
