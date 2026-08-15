import crypto from 'crypto'

/**
 * Server-only utility functions
 * DO NOT import this file into Client Components ('use client')
 */

/** Generate a unique cryptographic order number (e.g., RXE-20260815-A1B2C3) */
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `RXE-${year}${month}${day}-${randomHex}`
}

/** Generate a secure random token */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}
