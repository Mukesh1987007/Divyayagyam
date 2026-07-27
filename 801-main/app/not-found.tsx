import Link from 'next/link'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Search, Home, Sparkles } from 'lucide-react'

export const metadata = {
  title: '404 - Page Not Found | Divyayagyam'
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={null} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <div className="text-orange-500 font-black text-9xl mb-4 opacity-20">404</div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">
            मार्ग नहीं मिला (Page Not Found)
          </h1>
          <p className="text-slate-600 mb-8">
            क्षमा करें, आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है या हटा दिया गया है। हो सकता है आपने गलत URL टाइप किया हो।
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild className="h-12 bg-orange-600 hover:bg-orange-700">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> होमपेज पर जाएँ
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 border-orange-200 hover:bg-orange-50 text-orange-700">
              <Link href="/ask-a-pandit">
                <Sparkles className="mr-2 h-4 w-4" /> पंडित जी से पूछें
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

