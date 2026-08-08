export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT:   { label: 'Belum Bayar', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PAYMENT_CONFIRMED: { label: 'Dibayar', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  PROCESSING:        { label: 'Diproses', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  PACKED:            { label: 'Dikemas', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  SHIPPED:           { label: 'Dikirim', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  DELIVERED:         { label: 'Terkirim', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  COMPLETED:         { label: 'Selesai', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED:         { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  RETURN_REQUESTED:  { label: 'Return Diminta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  RETURNED:          { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  REFUNDED:          { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
}

export const COURIER_TRACKING_LINKS: Record<string, string> = {
  JNE: 'https://www.jne.co.id/id/tracking/trace',
  'J&T': 'https://jet.co.id/track',
  SICEPAT: 'https://www.sicepat.com/checkAwb',
  ANTERAJA: 'https://anteraja.id/tracking',
  GOSEND: 'https://driver.gojek.com/go-send',
}
