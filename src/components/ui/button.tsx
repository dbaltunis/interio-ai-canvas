import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 caret-transparent select-none rounded-lg active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground border border-border shadow-sm hover:bg-secondary/80 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline: "bg-background border border-input text-foreground shadow-sm hover:bg-muted hover:border-primary/30",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
        brand: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        "brand-outline": "bg-background border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
        success: "bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-md",
        warning: "bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md",
        danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md",
        soft: "bg-primary/10 text-primary hover:bg-primary/20",
        "soft-secondary": "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 px-2 text-xs rounded-md",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-xs": "h-7 w-7 p-0 rounded-md",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }