import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 caret-transparent select-none rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-0 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        secondary: "bg-secondary text-secondary-foreground border border-input hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        destructive: "bg-destructive text-destructive-foreground border-0 hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        outline: "bg-background border border-input text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost: "bg-transparent border-0 text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        link: "bg-transparent border-0 text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        brand: "bg-primary text-primary-foreground border-0 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "brand-outline": "bg-background border border-primary text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        success: "bg-green-600 text-white border-0 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        warning: "bg-yellow-600 text-white border-0 hover:bg-yellow-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        danger: "bg-red-600 text-white border-0 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 px-0",
        "icon-sm": "h-8 w-8 px-0",
        "icon-lg": "h-12 w-12 px-0"
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