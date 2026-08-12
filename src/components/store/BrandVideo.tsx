'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'

interface BrandVideoProps {
  videoUrl: string
  thumbnailUrl: string
}

export function BrandVideo({ videoUrl, thumbnailUrl }: BrandVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="w-full h-full relative bg-black">
        <video
          src={videoUrl}
          autoPlay
          controls
          className="w-full h-full object-cover"
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    )
  }

  return (
    <div 
      className="w-full h-full relative bg-neutral-900 group cursor-pointer overflow-hidden"
      onClick={() => setIsPlaying(true)}
    >
      <Image 
        src={thumbnailUrl}
        alt="Brand Story"
        fill
        className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500 group-hover:scale-105 transform-gpu grayscale"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-white/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors mb-4 shadow-xl">
          <Play className="w-6 h-6 text-white ml-1 fill-white" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase text-center drop-shadow-md">
          WATCH<br/>BRAND STORY
        </span>
      </div>
    </div>
  )
}
