'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function FadeIn({ children, delay = 0, className = '', direction = 'up' }: { children: ReactNode, delay?: number, className?: string, direction?: 'up' | 'down' | 'left' | 'right' | 'none' }) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {}
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
