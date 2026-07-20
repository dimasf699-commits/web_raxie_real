'use client'

import { useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void
  onUploadError?: (error: string) => void
  currentImage?: string
}

export function ImageUploader({ onUploadSuccess, onUploadError, currentImage }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Quick preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to upload image')

      setPreview(data.url)
      onUploadSuccess(data.url)
    } catch (error: any) {
      console.error('Upload Error:', error)
      if (onUploadError) onUploadError(error.message)
      setPreview(currentImage || null) // Revert
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        {preview ? (
          <div className="relative aspect-square w-32 rounded-xl overflow-hidden border border-border group bg-muted">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <label className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur transition-colors text-white">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                </label>
              )}
            </div>
          </div>
        ) : (
          <label className={`aspect-square w-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mb-2" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
            )}
            <span className="text-xs text-muted-foreground font-medium">{isUploading ? 'Mengunggah...' : 'Pilih Gambar'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">Mendukung JPG, PNG, WEBP (Maks 5MB)</p>
    </div>
  )
}
