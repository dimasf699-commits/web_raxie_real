'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images?: string[]
  alt: string
}

export function ImageGallery({ images = [], alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Safe fallback if images array is empty or undefined
  const displayImages = images.length > 0 ? images : ['https://i.imgur.com/1QtzAZ5.png']
  const safeIndex = currentIndex >= displayImages.length ? 0 : currentIndex
  const currentImage = displayImages[safeIndex] || 'https://i.imgur.com/1QtzAZ5.png'

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide w-full md:w-20 lg:w-24 shrink-0">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'relative aspect-square w-16 md:w-full rounded-lg overflow-hidden border-2 transition-all shrink-0',
                safeIndex === idx
                  ? 'border-tan-400 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square md:aspect-[4/5] flex-1 rounded-2xl overflow-hidden bg-ivory-200 dark:bg-charcoal-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage}
              alt={`${alt} preview`}
              fill
              priority={safeIndex === 0}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
