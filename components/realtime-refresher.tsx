'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RealtimeRefresher({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter()
  
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, intervalMs)
    return () => clearInterval(interval)
  }, [router, intervalMs])
  
  return null
}
