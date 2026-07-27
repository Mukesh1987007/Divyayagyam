import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import imageCompression from 'browser-image-compression'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency = 'INR') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num)
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(d)
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, len = 100) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len).trimEnd() + '…' : str
}

export const DEFAULT_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=400'

export function convertGoogleDriveUrl(url: string) {
  if (!url) return url
  // Match standard share links e.g. process.env.NEXT_PUBLIC_URL_4730 || ''
  const match = url.match(/\/file\/d\/([^\/]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}&export=view`
  }
  return url
}

export async function compressImage(file: File, options?: any): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    const defaultOptions = {
      maxSizeMB: 0.3, // Compress to ~300KB
      maxWidthOrHeight: 1200,
      useWebWorker: false, // Disabled because it frequently fails in some environments
      fileType: 'image/webp', // Force WebP conversion
      ...options,
    }
    const compressedBlob = await imageCompression(file, defaultOptions)
    
    // Ensure the filename has a .webp extension
    const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
    
    return new File([compressedBlob], newName, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn('Image compression failed', error)
    if (file.size > 4 * 1024 * 1024) {
      throw new Error('Image is too large and compression failed. Please choose a smaller image (under 4MB).')
    }
    return file // Fallback to original
  }
}
