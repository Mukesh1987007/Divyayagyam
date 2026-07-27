import Link from 'next/link'
import { ShieldCheck, UserCheck, Sparkles, BookOpen, AlertCircle, Eye, ShieldAlert, Heart, Phone, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 30

export default async function TermsPage() {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key: 'cms.terms' }
  })
  const customContent = setting?.value || ''

  return (
    <div className="bg-slate-50/50 min-h-screen py-12">
      <div className="container max-w-4xl mx-auto space-y-8 px-4">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">Terms and Conditions (End User License Agreement)</h1>
          <p className="text-xs text-slate-500">Last updated: July 17, 2026</p>
        </div>

        {/* Terms Body */}
        <div className="bg-white p-6 md:p-10 border rounded-3xl shadow-sm space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed prose max-w-none prose-orange">
          
          {customContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} children={customContent as string} />
          ) : (
            <>
              {/* 1. Introduction */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary-color)]" /> 1. Introduction
                </h2>
                <p>
                  Welcome to <strong>DivyaYagyam</strong> (<Link href="https://divyayagyam.com" className="text-[var(--primary-color)] hover:underline">Divyayagyam.com</Link>), a spiritual platform owned and operated by Pandit Mukesh Bohra. This document serves as a legally binding contract (EULA) between you and DivyaYagyam. By accessing or using our platform to book Vedic rituals, pujas, or spiritual services, you agree to these terms. If you do not agree, please do not use our services.
                </p>
              </section>

              <hr className="border-slate-100" />

              {/* 2. Eligibility */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[var(--primary-color)]" /> 2. Eligibility
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You must be at least 18 years of age to book services independently.</li>
                  <li>Minors may use our platform only under the direct supervision and with the consent of a parent or legal guardian.</li>
                  <li>You agree to provide accurate and truthful information, including your name, Gotra, and Nakshatra, as these are essential for the performance of sacred rituals.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 3. Puja & Spiritual Services */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--primary-color)]" /> 3. Puja & Spiritual Services
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Nature of Services:</strong> DivyaYagyam facilitates authentic Vedic rituals performed by qualified priests. By booking a puja, you acknowledge that spirituality is a matter of faith, and we do not guarantee specific material or spiritual outcomes.</li>
                  <li><strong>Platform Role:</strong> DivyaYagyam acts as a bridge between devotees and sacred traditions. While we ensure the highest standards of authenticity and transparency, the actual ritual is performed by our team of experienced priests.</li>
                  <li><strong>Recordings:</strong> You grant us permission to record your puja for internal audit and quality assurance. We strive to provide you with the recording of your ritual; however, in rare instances of technical failure or temple restrictions on photography, we will notify you and offer appropriate rescheduling or refund options.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 4. Payments & Booking */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[var(--primary-color)]" /> 4. Payments & Booking
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All payments are processed securely. We do not store sensitive credit/debit card information.</li>
                  <li>Bookings are confirmed only upon receipt of payment.</li>
                  <li>All prices are in Indian Rupees (INR).</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 5. Refund, Cancellation, and Rescheduling */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[var(--primary-color)]" /> 5. Refund, Cancellation, and Rescheduling
                </h2>
                <p>Please refer to our <Link href="/refunds" className="text-[var(--primary-color)] hover:underline font-bold">Refund and Cancellation Policy</Link> for detailed terms. In summary:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Cancellations:</strong> You may cancel before the puja commences for a full refund. Once the ritual has begun, cancellation is not possible.</li>
                  <li><strong>Satisfaction Guarantee:</strong> We stand behind our services. If you are dissatisfied for any reason, you may contact us within 7 days of receiving your puja video, and we will work to provide a complimentary rescheduling or a full refund.</li>
                  <li><strong>Force Majeure:</strong> In the event of unforeseen temple closures or emergencies, we will coordinate with you to reschedule your puja or process a refund.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 6. User Responsibilities */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[var(--primary-color)]" /> 6. User Responsibilities
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Accuracy:</strong> You are solely responsible for the accuracy of the details provided (Name, Gotra, Sankalpa).</li>
                  <li><strong>Conduct:</strong> You agree to use our platform and communicate with our team with respect. Harassing or inappropriate behavior toward our staff or priests will result in the immediate termination of services.</li>
                  <li><strong>Personal Use:</strong> The services provided are for your personal spiritual use and may not be resold or used for commercial purposes.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 7. Intellectual Property */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[var(--primary-color)]" /> 7. Intellectual Property
                </h2>
                <p>All content on the DivyaYagyam website—including text, graphics, and logos—is the property of DivyaYagyam. You may access this content for personal, non-commercial use only.</p>
              </section>

              <hr className="border-slate-100" />

              {/* 8. Limitation of Liability */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[var(--primary-color)]" /> 8. Limitation of Liability
                </h2>
                <p>To the maximum extent permitted by law, DivyaYagyam shall not be liable for any indirect or consequential damages. Our total liability shall not exceed the amount paid for the specific service in question. We do not provide medical or financial advice; our services are strictly for spiritual and religious purposes.</p>
              </section>

              <hr className="border-slate-100" />

              {/* 9. Privacy */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800">9. Privacy</h2>
                <p>Your privacy is governed by our <Link href="/privacy" className="text-[var(--primary-color)] hover:underline font-bold">Privacy Policy</Link>, which explains how we collect and protect your data. By using our site, you consent to our data practices.</p>
              </section>

              <hr className="border-slate-100" />

              {/* 10. Contact Us */}
              <section className="space-y-4 pt-4 border-t">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[var(--primary-color)]" /> 10. Contact Us
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 text-xs md:text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--primary-color)]" /> Location: Jodhpur, Rajasthan, India</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--primary-color)]" /> WhatsApp / Phone: +91-95871-71984, +91-95320-11984</p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--primary-color)]" /> Pandit: Pandit Mukesh Bohra</p>
                    <p className="flex items-center gap-2"><Eye className="h-4 w-4 text-[var(--primary-color)]" /> Website: <a href="https://divyayagyam.com" className="hover:underline text-[var(--primary-color)]">Divyayagyam.com</a></p>
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


