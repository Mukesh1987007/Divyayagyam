'use client'

import { useEffect } from 'react'


export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
// console.error("Global Root Error Boundary Caught:", error) (removed for production)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px', textAlign: 'center' }}>
          


          <div style={{ maxWidth: '400px', backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>Critical System Auto-Heal</h1>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              हरि ओम्! एक बहुत ही गंभीर समस्या उत्पन्न हुई थी, लेकिन हमारे रोबोट्स ने साइट को क्रैश होने से बचा लिया है।
            </p>
            <button 
              onClick={() => reset()}
              style={{ width: '100%', padding: '12px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Try Again
            </button>
            <a 
              href="/"
              style={{ display: 'block', width: '100%', padding: '12px', marginTop: '12px', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
