import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular' | 'card';
  animation?: 'pulse' | 'wave' | 'shimmer';
}

function Skeleton({
  className,
  variant = 'default',
  animation = 'shimmer',
  ...props
}: SkeletonProps) {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_2s_ease-in-out_infinite]',
    shimmer: 'animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]'
  };

  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded-sm h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-lg min-h-[120px]'
  };

  return (
    <div
      className={cn(
        "bg-muted",
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
