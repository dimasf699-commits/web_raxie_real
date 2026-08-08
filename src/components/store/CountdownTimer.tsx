'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endsAt: Date
}

export function CountdownTimer({ endsAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = endsAt.getTime() - Date.now()
    if (diff <= 0) return { h: 168, m: 0, s: 0 }
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  })

  useEffect(() => {
    function calc() {
      const diff = endsAt.getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ h: 0, m: 0, s: 0 })
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'JAM', value: timeLeft.h },
        { label: 'MENIT', value: timeLeft.m },
        { label: 'DETIK', value: timeLeft.s },
      ].map((unit) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="bg-charcoal-900 text-ivory-100 font-mono font-bold text-xl md:text-2xl w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border border-charcoal-700">
              <span suppressHydrationWarning>{pad(unit.value)}</span>
            </div>
            <span className="text-[9px] font-semibold text-muted-foreground mt-1 tracking-widest">
              {unit.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
