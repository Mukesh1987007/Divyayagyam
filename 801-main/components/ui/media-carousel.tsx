'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaCarouselProps {
  children: React.ReactNode[]
  autoSlide?: boolean
  autoSlideInterval?: number
}

export function MediaCarousel({
  children,
  autoSlide = false,
  autoSlideInterval = 5000,
}: MediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      // Check initial state
      checkScroll()
      // Resize check
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [children])

  // Optional auto-slide
  useEffect(() => {
    if (!autoSlide || !containerRef.current) return
    const interval = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          // Reset to start
          containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          containerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' })
        }
      }
    }, autoSlideInterval)
    return () => clearInterval(interval)
  }, [autoSlide, autoSlideInterval])

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current
      const offset = direction === 'left' ? -clientWidth : clientWidth
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group w-full">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children.map((child, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-[88vw] sm:w-[45vw] md:w-[30vw] lg:w-[23vw] snap-start"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Prev Button */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-[-15px] top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-slate-200 bg-white/90 backdrop-blur shadow-lg hover:bg-[var(--secondary-color)]/10 hover:text-[var(--primary-color)] transition-all z-10 hidden sm:flex items-center justify-center"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Next Button */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-[-15px] top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-slate-200 bg-white/90 backdrop-blur shadow-lg hover:bg-[var(--secondary-color)]/10 hover:text-[var(--primary-color)] transition-all z-10 hidden sm:flex items-center justify-center"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

