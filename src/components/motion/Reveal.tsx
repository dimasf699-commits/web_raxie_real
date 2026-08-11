'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  width?: 'fit-content' | '100%'
  staggerChildren?: boolean
  staggerDelay?: number
}

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  width = '100%',
  staggerChildren = false,
  staggerDelay = 0.1
}: RevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: 20 }
      case 'down': return { y: -20 }
      case 'left': return { x: 20 }
      case 'right': return { x: -20 }
      case 'none': return { x: 0, y: 0 }
    }
  }

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      ...getDirectionOffset() 
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: [0.32, 0.72, 0, 1],
        ...(staggerChildren && {
          staggerChildren: staggerDelay
        })
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={{ width }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
