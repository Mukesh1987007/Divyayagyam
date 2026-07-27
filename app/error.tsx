'use client' // Error components must be Client Components

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { RefreshCcw, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
// console.error("App Error Boundary Caught:", error) (removed for production)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-slate-50">
      
      {/* Developer Popup removed */}

      {/* User Facing UI */}
      <div className="max-w-md w-full relative z-10 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-orange-500 rounded-full animate-ping opacity-20"></div>
          <ShieldCheck className="h-10 w-10 text-orange-600 relative z-10" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-3">Auto-Healing in Progress</h1>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          हरि ओम्! एक तकनीकी बाधा आई है, लेकिन हमारे रोबोट्स इसे ठीक कर रहे हैं। कृपया पेज को रीफ्रेश करें या होमपेज पर वापस जाएँ।
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()} 
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-600/20"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
