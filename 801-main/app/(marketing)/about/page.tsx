import { Sparkles, BadgeCheck, Heart, Mail, Phone, MapPin, Globe } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
export const revalidate = 3600; // ISR: Revalidate every 3600s

export default async function AboutPage() {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key: 'cms.about' }
  })
  const customContent = setting?.value || ''

  return (
    <div className="bg-slate-50/50 min-h-screen py-16">
      <div className="container max-w-4xl mx-auto space-y-12 px-4">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-om-gradient">About DivyaYagyam</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Preserving and promoting the sacred traditions of Sanatan Dharma with complete authenticity and devotion.
          </p>
        </div>

        {customContent ? (
          <div className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed prose max-w-none prose-orange">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={customContent as string} />
          </div>
        ) : (
          <>
            {/* Introduction Section */}
        <section className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--primary-color)]" /> Welcome to DivyaYagyam
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            DivyaYagyam is a trusted spiritual platform dedicated to preserving and promoting the sacred traditions of Sanatan Dharma through authentic Vedic rituals, pujas, yajnas, astrology, and spiritual guidance. Our mission is to make divine services easily accessible to devotees across India and around the world with complete transparency, authenticity, and devotion.
          </p>
        </section>

        {/* Pandit Mukesh Bohra Profile */}
        <section className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-[var(--primary-color)] tracking-wider">Meet Our Spiritual Guide</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">Pandit Mukesh Bohra</h2>
            <p className="text-sm text-muted-foreground font-semibold">Vedic Priest & Astrologer • 35+ Years of Experience</p>
          </div>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            <strong>Pandit Mukesh Bohra</strong> is a highly respected Vedic priest and spiritual guide with <strong>over 35 years of experience</strong> in performing Sanatan Vedic rituals and religious ceremonies. 
          </p>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            For more than three decades, he has devoted his life to serving devotees through authentic Vedic traditions, sacred yajnas, temple rituals, spiritual consultations, and personalized puja ceremonies. His deep understanding of Vedic scriptures, Sanskrit mantras, astrology, and traditional Hindu rituals has helped thousands of families perform important religious ceremonies with faith and confidence.
          </p>

          <div className="border-t pt-6 space-y-3">
            <h3 className="font-bold text-slate-800 text-base">Key Religious Services Conducted:</h3>
            <div className="grid gap-2 sm:grid-cols-2 text-xs md:text-sm text-slate-600">
              {[
                'Vedic Yajna & Havan', 'Grah Shanti Puja', 'Mahamrityunjaya Jaap', 'Rudrabhishek',
                'Satyanarayan Katha', 'Navgraha Shanti', 'Pitru Dosh Nivaran', 'Kaal Sarp Dosh Puja',
                'Vivah Sanskar', 'Griha Pravesh', 'Bhoomi Pujan', 'Mundan Sanskar',
                'Naamkaran Sanskar', 'Rudraksha & Spiritual Guidance', 'Temple Rituals'
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[var(--primary-color)] shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us & Values Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Why Choose DivyaYagyam */}
          <section className="bg-white p-6 border rounded-3xl shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Why Choose DivyaYagyam?</h2>
            <ul className="text-xs md:text-sm text-slate-600 space-y-2">
              <li className="flex items-center gap-2">✔ 35+ Years of Spiritual Experience</li>
              <li className="flex items-center gap-2">✔ Authentic Vedic Rituals & Mantras</li>
              <li className="flex items-center gap-2">✔ Experienced and Qualified Priests</li>
              <li className="flex items-center gap-2">✔ Personalized Sankalp & WhatsApp Updates</li>
              <li className="flex items-center gap-2">✔ Secure Online Payments & Booking</li>
            </ul>
          </section>

          {/* Our Values */}
          <section className="bg-white p-6 border rounded-3xl shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
              <Heart className="h-5 w-5 text-[var(--primary-color)] fill-orange-600" /> Our Values
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              At DivyaYagyam, we believe that spirituality is built on faith, sincerity, and selfless service. Every puja, yajna, and religious ceremony is performed with utmost devotion, respect, and strict adherence to Vedic traditions. We are committed to maintaining honesty and transparency.
            </p>
          </section>
        </div>

        {/* Contact Profile Section */}
        <section className="bg-white p-6 md:p-8 border rounded-3xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Contact Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs md:text-sm text-slate-600">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--primary-color)] shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Address</p>
                  <p>Jodhpur, Rajasthan, India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[var(--primary-color)] shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Email</p>
                  <a href="mailto:Seva@divyayagyam.com" className="hover:underline">Seva@divyayagyam.com</a>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[var(--primary-color)] shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">WhatsApp / Phone</p>
                  <p>+91-95871-71984, +91-95320-11984</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[var(--primary-color)] shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Website</p>
                  <a href={process.env.NEXT_PUBLIC_URL_4480 || ''} className="hover:underline">{process.env.NEXT_PUBLIC_URL_4481 || ''}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
          </>
        )}

      </div>
    </div>
  )
}

