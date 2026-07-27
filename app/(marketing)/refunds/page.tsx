import Link from 'next/link'
import { Sparkles, Calendar, Heart, ShieldCheck, Mail, Phone, MapPin, AlertCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
export const revalidate = 3600; // ISR: Revalidate every 3600s

export default async function RefundsPage() {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key: 'cms.refund' }
  })
  const customContent = setting?.value || ''

  return (
    <div className="bg-slate-50/50 min-h-screen py-12">
      <div className="container max-w-4xl mx-auto space-y-8 px-4">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">Refund and Cancellation Policy</h1>
          <p className="text-xs text-slate-500">Last updated: July 17, 2026</p>
        </div>

        {/* Policy Body */}
        <div className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed prose max-w-none prose-orange">
          
          {customContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} children={customContent as string} />
          ) : (
            <>
              <section className="space-y-2">
            <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--primary-color)]" /> Overview
            </h2>
            <p>
              Welcome to <strong>DivyaYagyam</strong>. We are dedicated to providing authentic Vedic spiritual services with transparency and devotion. This policy outlines the terms regarding cancellations, refunds, and rescheduling for all services booked through our platform (<Link href={process.env.NEXT_PUBLIC_URL_4536 || ''} className="text-[var(--primary-color)] hover:underline">{process.env.NEXT_PUBLIC_URL_4537 || ''}</Link>). By booking a service, you agree to these terms.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 1. Cancellation Policy */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-black text-slate-800">1. Cancellation Policy</h2>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs md:text-sm">1.1 Before Puja Performance</h3>
              <p>You may cancel your booking at any time <strong>BEFORE</strong> the scheduled start time of the puja.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>How to cancel:</strong> Contact us via WhatsApp at <strong>+91-95871-71984, +91-95320-11984</strong> or email <strong>Seva@divyayagyam.com</strong>.</li>
                <li><strong>Verification:</strong> Please provide your Booking ID and registered mobile number.</li>
                <li><strong>Confirmation:</strong> Cancellation is effective only upon receipt of a confirmation message from DivyaYagyam.</li>
                <li><em>Note: Requests made less than 2 hours before the scheduled time may not be processed in time.</em></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs md:text-sm">1.2 Refund Timelines</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Full Refund (100%):</strong> Provided for all cancellations made before the puja commences.</li>
                <li><strong>Processing Time:</strong> Refunds will be initiated to your original payment method within <strong>5-7 business days</strong>. Please allow an additional 2-5 business days for your bank to reflect the credit.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs md:text-sm flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" /> 1.3 After Puja Performance
              </h3>
              <p className="italic">
                Once the puja, yajna, or ritual has been performed by our priests, it <strong>CANNOT</strong> be cancelled or refunded, as the sacred materials and priest services have already been utilized.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 2. Satisfaction Guarantee */}
          <section className="space-y-2">
            <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
              <Heart className="h-5 w-5 text-[var(--primary-color)] fill-orange-600" /> 2. Satisfaction Guarantee
            </h2>
            <p>
              At DivyaYagyam, we strive for excellence in every ritual. If you are not satisfied with the service provided, please contact us within <strong>7 days</strong> of receiving your puja documentation (photos/videos). We will review your concerns and may offer:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Complimentary Rescheduling:</strong> Arranging the puja again at an auspicious time.</li>
              <li><strong>Resolution:</strong> Our team will work with you to ensure your spiritual needs are met with the utmost respect and adherence to Vedic traditions.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 3. Rescheduling */}
          <section className="space-y-2">
            <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--primary-color)]" /> 3. Rescheduling
            </h2>
            <p>We understand that circumstances may change.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Modification Request:</strong> You may request to reschedule your booking (change of date or time) by contacting us at least <strong>24 hours</strong> in advance.</li>
              <li><strong>Availability:</strong> Rescheduling is subject to the availability of the Pandit and the temple schedule.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 4. Force Majeure */}
          <section className="space-y-2">
            <h2 className="text-base md:text-lg font-black text-slate-800">4. Force Majeure & External Factors</h2>
            <p>
              DivyaYagyam acts as a platform to connect devotees with authentic Vedic services. In the event of unforeseen temple closures, Pandit emergencies, or other circumstances beyond our control (natural disasters, government orders, etc.), we will proactively contact you to offer a full refund or an alternative date for your ceremony.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 5. Customer Responsibilities */}
          <section className="space-y-2">
            <h2 className="text-base md:text-lg font-black text-slate-800">5. Customer Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Accurate Information:</strong> Provide the correct Name, Gotra, Nakshatra, and purpose of the Sankalp at the time of booking.</li>
              <li><strong>Communication:</strong> Provide accurate contact details (WhatsApp/Email) so we can send you updates and puja confirmation.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 6. Contact Information */}
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-base md:text-lg font-black text-slate-800">6. Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs md:text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--primary-color)]" /> Location: Jodhpur, Rajasthan, India</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-[var(--primary-color)]" /> Email: <a href="mailto:Seva@divyayagyam.com" className="hover:underline text-[var(--primary-color)]">Seva@divyayagyam.com</a></p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--primary-color)]" /> WhatsApp / Phone: +91-95871-71984, +91-95320-11984</p>
                <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--primary-color)]" /> Pandit: Pandit Mukesh Bohra</p>
              </div>
            </div>
          </section>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

