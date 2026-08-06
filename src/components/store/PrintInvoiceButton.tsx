'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function PrintInvoiceButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-border hover:bg-muted text-xs font-semibold"
      onClick={() => window.print()}
    >
      <Printer className="w-3.5 h-3.5" />
      Cetak Invoice
    </Button>
  )
}
