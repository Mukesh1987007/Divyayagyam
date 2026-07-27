'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image';
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSlide {
  id: string
  title: string
  subtitle?: string | null
  image: string
  ctaText?: string | null
  ctaUrl?: string | null
}

export function HeroPujaSlider({ slides, children }: { slides?: HeroSlide[], children?: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!slides || slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides?.length])

  if (!slides || slides.length === 0) {
    if (!children) return null;
    return (
      <div className="relative min-h-[400px] w-full flex items-center bg-slate-100 overflow-hidden rounded-2xl">
        {children}
      </div>
    )
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative w-full grid grid-cols-1 grid-rows-1 overflow-hidden bg-gray-100 select-none rounded-2xl group">
      
      {/* Background Images Slider (Clickable) */}
      {slides.map((slide, idx) => {
        const imageUrl = slide.image || process.env.NEXT_PUBLIC_URL_4677 || ''
        const slideContent = (
          <>
            <img
              src={imageUrl}
              alt={slide.title || 'Slide Image'}
              className="w-full h-auto object-cover block"
            />
          </>
        )
        return (
          <div
            key={slide.id}
            className={`col-start-1 row-start-1 transition-opacity duration-1000 block w-full ${
              currentIndex === idx ? 'opacity-100 z-0' : 'opacity-0 z-[-1] pointer-events-none'
            }`}
          >
            {slide.ctaUrl ? (
              <Link href={slide.ctaUrl} className="block w-full cursor-pointer">
                {slideContent}
              </Link>
            ) : (
              slideContent
            )}
          </div>
        )
      })}

      {/* Content Overlay */}
      <div className="relative z-10 w-full pointer-events-none [&>*]:pointer-events-auto h-full flex items-center">
        {children}
      </div>

      {/* Left/Right navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[var(--card-bg)]/50 hover:bg-[var(--secondary-color)]/100/90 text-slate-800 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 lg:opacity-50 z-20 border border-slate-900/10 shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[var(--card-bg)]/50 hover:bg-[var(--secondary-color)]/100/90 text-slate-800 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 lg:opacity-50 z-20 border border-slate-900/10 shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Bottom pagination indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault()
                setCurrentIndex(idx)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-white shadow-sm' : 'w-4 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}




