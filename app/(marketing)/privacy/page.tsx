import Link from 'next/link'
import { Shield, Sparkles, Key, Heart, Mail, Phone, MapPin, EyeOff } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 30

export default async function PrivacyPage() {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key: 'cms.privacy' }
  })
  const customContent = setting?.value || ''

  return (
    <div className="bg-slate-50/50 min-h-screen py-12">
      <div className="container max-w-4xl mx-auto space-y-8 px-4">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">Privacy Policy</h1>
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
                  <Shield className="h-5 w-5 text-[var(--primary-color)]" /> Overview
                </h2>
                <p>
                  Welcome to <strong>DivyaYagyam</strong> (<Link href={process.env.NEXT_PUBLIC_URL_4529 || ''} className="text-[var(--primary-color)] hover:underline text-xs md:text-sm font-semibold">{process.env.NEXT_PUBLIC_URL_4530 || ''}</Link>). Protecting your privacy and the security of your personal information is our top priority. This Privacy Policy explains how we collect, use, and protect your information when you engage with our spiritual and Vedic ritual services.
                </p>
                <p>
                  By using our services, you consent to the data practices described in this policy. If you do not agree with these terms, please do not use our platform.
                </p>
              </section>

              <hr className="border-slate-100" />

              {/* 1. Information We Collect */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Key className="h-5 w-5 text-[var(--primary-color)]" /> 1. Information We Collect
                </h2>
                <p>To provide you with authentic Vedic services, we collect information that you provide to us voluntarily:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Personal Identification:</strong> Name, phone number, email address, and postal address (for dispatching prasad or spiritual items).</li>
                  <li><strong>Ritual Details:</strong> Date, time, and place of birth, Gotra, Nakshatra, and specific Sankalpa details required for performing pujas and yajnas.</li>
                  <li><strong>Communication Data:</strong> Records of your correspondence via WhatsApp, email, or calls regarding your bookings and support requests.</li>
                  <li><strong>Automatic Data:</strong> When you visit our website, we may collect technical information such as your IP address, browser type, and device information to improve your browsing experience.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 2. How We Use Your Information */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--primary-color)]" /> 2. How We Use Your Information
                </h2>
                <p>We use your information exclusively to provide and improve our spiritual services, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Service Delivery:</strong> Sharing necessary details (Name, Gotra, Nakshatra) with our priests to ensure rituals are performed accurately according to Vedic traditions.</li>
                  <li><strong>Communication:</strong> Sending booking confirmations, puja updates, and delivery notifications for prasad or recorded media.</li>
                  <li><strong>Customer Support:</strong> Responding to your queries, handling refunds, and resolving grievances.</li>
                  <li><strong>Operational Improvements:</strong> Analyzing platform usage to enhance the accessibility and quality of our services.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 3. Sharing of Information */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <EyeOff className="h-5 w-5 text-[var(--primary-color)]" /> 3. Sharing of Information
                </h2>
                <p>
                  DivyaYagyam respects your privacy and <strong>does not sell your personal data.</strong> We only share information with third parties where necessary to fulfill our services:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Pandits & Temples:</strong> To perform the requested rituals with your name-gotra.</li>
                  <li><strong>Payment Gateways:</strong> To process your secure transactions (we do not store your credit card or sensitive banking details).</li>
                  <li><strong>Logistics Partners:</strong> To deliver prasad or physical items to your provided address.</li>
                  <li><strong>Legal Compliance:</strong> If required by law or to protect the safety and rights of our platform and users.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 4. Data Security */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800">4. Data Security</h2>
                <p>We implement industry-standard security measures to protect your data, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encryption of sensitive information during transit.</li>
                  <li>Restricting access to your personal information to only those employees or partners who require it to perform their duties.</li>
                  <li>Regular reviews of our data protection practices.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 5. Your Rights */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800">5. Your Rights</h2>
                <p>You maintain control over your personal information:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Access & Correction:</strong> You may request to view or update the personal data we hold about you at any time.</li>
                  <li><strong>Withdrawal of Consent:</strong> You may withdraw your consent for us to process your data by contacting us at <strong>Seva@divyayagyam.com</strong>.</li>
                  <li><strong>Account Deletion:</strong> If you wish for your data to be removed from our records, please email us, and we will process your request in accordance with legal obligations.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* 6. Cookies */}
              <section className="space-y-2">
                <h2 className="text-base md:text-lg font-black text-slate-800">6. Cookies</h2>
                <p>
                  Our website may use cookies to personalize your experience, remember your preferences, and track usage patterns for better service delivery. You can choose to disable cookies in your browser settings, though this may impact some features of our website.
                </p>
              </section>

              <hr className="border-slate-100" />

              {/* 7. Contact Us */}
              <section className="space-y-4 pt-4 border-t">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[var(--primary-color)]" /> 7. Contact Us
                </h2>
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

