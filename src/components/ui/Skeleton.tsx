import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text'
  lines?: number
}

export function Skeleton({
  className,
  variant = 'rect',
  lines = 1,
  ...props
}: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'skeleton rounded h-4',
              i === lines - 1 && 'w-3/4'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circle' ? 'rounded-full' : 'rounded-lg',
        variant === 'text' && 'h-4',
        className
      )}
      {...props}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-product w-full" />
      <div className="space-y-2 p-2">
        <Skeleton variant="text" className="h-3 w-2/3" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
