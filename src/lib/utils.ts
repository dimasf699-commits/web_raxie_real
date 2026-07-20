import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format price to IDR */
export function formatPrice(
  price: number,
  options: {
    currency?: string
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
) {
  const { currency = 'IDR', notation = 'standard' } = options
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    notation,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/** Format relative time (e.g., "2 hari yang lalu") */
export function formatRelativeTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 30) return `${diffDays} hari yang lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Format date to Indonesian locale */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', options)
}

/** Generate order number */
export function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')
  return `RXE-${year}${month}${day}-${random}`
}

/** Slugify string */
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate text */
export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

/** Calculate discount percentage */
export function getDiscountPercent(original: number, sale: number) {
  if (!original || original <= sale) return 0
  return Math.round(((original - sale) / original) * 100)
}

/** Parse Cloudinary URL for optimization */
export function getCloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
) {
  if (!url.includes('cloudinary.com')) return url
  const { width, height, quality = 80 } = options
  const transforms = [
    'f_auto',
    'c_fill',
    quality && `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ]
    .filter(Boolean)
    .join(',')
  return url.replace('/upload/', `/upload/${transforms}/`)
}

/** Validate email */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Debounce */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/** Sleep */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
