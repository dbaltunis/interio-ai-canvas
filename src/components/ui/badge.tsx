import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/90 text-destructive-foreground",
        outline: 
          "border-border text-foreground bg-transparent",
        success:
          "border-transparent bg-green-500/15 text-green-700 dark:text-green-400",
        "success-solid":
          "border-transparent bg-green-600 text-white",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
        "warning-solid":
          "border-transparent bg-amber-500 text-white",
        info:
          "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400",
        "info-solid":
          "border-transparent bg-blue-600 text-white",
        muted:
          "border-transparent bg-muted text-muted-foreground",
        "primary-soft":
          "border-transparent bg-primary/10 text-primary",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[11px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
