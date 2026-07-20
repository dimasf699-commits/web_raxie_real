'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X, CircleCheck, CircleAlert, TriangleAlert, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Toast Provider ──────────────────────────────────────────────────────────

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[380px] flex-col gap-2 p-4 sm:bottom-6 sm:right-6',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

const toastVariants: Record<ToastVariant, string> = {
  default: 'bg-card border border-border text-card-foreground',
  success: 'bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100',
  error: 'bg-red-50 border border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
  warning: 'bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100',
  info: 'bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
}

const toastIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CircleCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
  error: <CircleAlert className="h-5 w-5 text-red-500 flex-shrink-0" />,
  warning: <TriangleAlert className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
}

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?: ToastVariant
  title?: string
  description?: string
  action?: React.ReactNode
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = 'default', title, description, action, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group relative flex w-full items-start gap-3 overflow-hidden rounded-xl p-4 shadow-lg',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
        'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        toastVariants[variant],
        className
      )}
      {...props}
    >
      {toastIcons[variant]}
      <div className="flex-1 min-w-0">
        {title && (
          <ToastPrimitives.Title className="text-sm font-semibold leading-tight">
            {title}
          </ToastPrimitives.Title>
        )}
        {description && (
          <ToastPrimitives.Description className="mt-0.5 text-xs opacity-80 leading-relaxed">
            {description}
          </ToastPrimitives.Description>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
      <ToastPrimitives.Close className="ml-1 flex-shrink-0 rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

// ─── Toaster (global) ─────────────────────────────────────────────────────────

interface ToastItem {
  id: string
  variant?: ToastVariant
  title?: string
  description?: string
  duration?: number
  action?: React.ReactNode
}

// Simple global toast state (lightweight, no extra deps)
type ToastListener = (toasts: ToastItem[]) => void
let toasts: ToastItem[] = []
const listeners = new Set<ToastListener>()

function notify() {
  listeners.forEach((l) => l([...toasts]))
}

export const toast = {
  show: (item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { ...item, id }]
    notify()
    return id
  },
  success: (title: string, description?: string) =>
    toast.show({ variant: 'success', title, description }),
  error: (title: string, description?: string) =>
    toast.show({ variant: 'error', title, description }),
  warning: (title: string, description?: string) =>
    toast.show({ variant: 'warning', title, description }),
  info: (title: string, description?: string) =>
    toast.show({ variant: 'info', title, description }),
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  },
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return (
    <ToastProvider>
      {items.map((item) => (
        <Toast
          key={item.id}
          variant={item.variant}
          title={item.title}
          description={item.description}
          action={item.action}
          duration={item.duration ?? 4000}
          onOpenChange={(open) => {
            if (!open) toast.dismiss(item.id)
          }}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
