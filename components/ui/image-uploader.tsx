'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  label?: string
  aspectRatio?: 'square' | 'video' | 'any'
}

export function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  aspectRatio = 'video',
}: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Compress large image client-side to save bandwidth and ensure fast uploads on mobile/desktop
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // If file is smaller than 1MB, don't compress
      if (file.size < 1024 * 1024) {
        resolve(file)
        return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Maximum dimension limit for high-quality compression
          const MAX_DIM = 1600
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width)
              width = MAX_DIM
            } else {
              width = Math.round((width * MAX_DIM) / height)
              height = MAX_DIM
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(file)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.82 // high quality ratio
          )
        }
        img.onerror = () => resolve(file)
      }
      reader.onerror = () => resolve(file)
    })
  }

  // File validator
  const validateAndUploadFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WEBP files are allowed.')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds the 10 MB limit.')
      return
    }

    try {
      setIsUploading(true)
      setProgress(5)
      
      // Set local temporary preview for responsive UI feel
      const previewUrl = URL.createObjectURL(file)
      setLocalPreview(previewUrl)

      // Compress large images automatically
      const compressedFile = await compressImage(file)
      setProgress(15)

      // Use XMLHttpRequest for real-time progress tracking
      const formData = new FormData()
      formData.append('file', compressedFile)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/storage/upload', true)

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 80) + 15
          setProgress(percentComplete)
        }
      })

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success && response.url) {
              setProgress(100)
              onChange(response.url)
              toast.success('Image uploaded successfully.')
            } else {
              throw new Error(response.error || 'Server rejected file upload')
            }
          } catch (err: any) {
            toast.error(err.message || 'Failed to parse upload response.')
            setLocalPreview(null)
          } finally {
            setIsUploading(false)
          }
        } else {
          toast.error(`Upload failed with status code ${xhr.status}`)
          setLocalPreview(null)
          setIsUploading(false)
        }
      }

      xhr.onerror = () => {
        toast.error('Network error during file upload.')
        setLocalPreview(null)
        setIsUploading(false)
      }

      xhr.send(formData)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during upload.')
      setLocalPreview(null)
      setIsUploading(false)
    }
  }

  // Handle file drop events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      await validateAndUploadFile(file)
    }
  }

  // Handle file picker selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      await validateAndUploadFile(file)
    }
  }

  // Trigger file selection input clicks
  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file deletion and server sync
  const handleDelete = async () => {
    if (!value) return
    const originalUrl = value
    
    // Clear in UI instantly
    onChange('')
    setLocalPreview(null)
    setProgress(0)

    try {
      const res = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: originalUrl }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Image deleted from storage.')
      } else {
// console.warn('File not deleted or already missing in storage.') (removed for production)
      }
    } catch (error) {
// console.error('Failed to contact delete API:', error) (removed for production)
    }
  }

  const activePreviewUrl = value || localPreview

  return (
    <div className="space-y-3 w-full">
      {activePreviewUrl ? (
        <div className="relative group rounded-md border overflow-hidden bg-muted flex items-center justify-center">
          <img
            src={activePreviewUrl}
            alt="Preview"
            className={`w-full object-cover transition-all ${
              aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video' : 'h-48'
            }`}
          />
          
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-xs font-semibold text-foreground mb-1">Uploading... {progress}%</p>
              <Progress value={progress} className="w-2/3 h-1.5" />
            </div>
          )}

          {!isUploading && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onButtonClick}
                className="text-xs"
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <div className="p-3 rounded-full bg-muted text-muted-foreground group-hover:text-primary transition-colors">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-foreground/70" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {isUploading ? `Uploading image...` : label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click to upload
            </p>
            <p className="text-[10px] text-muted-foreground/80 mt-1">
              Supports JPG, JPEG, PNG, WEBP (Max 10MB)
            </p>
          </div>

          {isUploading && (
            <div className="w-full max-w-xs mt-1">
              <Progress value={progress} className="h-1" />
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                Compressing & sending... {progress}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file selector input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />
    </div>
  )
}
