'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({ phoneNumber, message }: { phoneNumber: string, message?: string }) {
  const defaultMessage = message || "Halo Admin Raxie, saya mau bertanya..."
  // Remove non-numeric characters for the link
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  // If the number starts with 0, change it to 62 (Indonesia country code)
  const waNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber
  
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(defaultMessage)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      aria-label="Chat via WhatsApp"
      title="Hubungi Kami"
    >
      <MessageCircle className="w-7 h-7" />
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-75"></span>
    </a>
  )
}
