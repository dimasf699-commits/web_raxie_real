'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface SmoothImageProps extends Omit<ImageProps, 'onLoad'> {
  containerClassName?: string
}

export function SmoothImage({ containerClassName, className, alt, ...props }: SmoothImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn("overflow-hidden relative bg-muted", containerClassName)}>
      <Image
        alt={alt || "Image"}
        {...props}
        className={cn(
          "transition-all duration-700 ease-smooth object-cover",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          className
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}
