'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { useState } from 'react'
import { CartProvider } from '@/lib/cart-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { 
            staleTime: 60_000, 
            refetchOnWindowFocus: false,
            retry: 1 // Auto-retry failed queries once
          },
        },
        queryCache: new (require('@tanstack/react-query').QueryCache)({
          onError: (error: any) => {
// console.error('[Query Error]', error); (removed for production)
            // Optionally, we could show a toast here, but we don't want to spam for background queries.
            // If it's a 401, we could force a redirect.
            if (error?.message?.includes('401')) {
              window.location.href = '/login';
            }
          }
        }),
        mutationCache: new (require('@tanstack/react-query').MutationCache)({
          onError: (error: any) => {
// console.error('[Mutation Error]', error); (removed for production)
            const msg = error?.response?.data?.error || error?.message || 'An error occurred';
            require('sonner').toast.error(msg);
          }
        })
      })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {children}
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
