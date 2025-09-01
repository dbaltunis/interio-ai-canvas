import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-10 px-4 bg-primary text-primary-foreground border-0 rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        secondary: "h-10 px-4 bg-secondary text-secondary-foreground border border-input rounded-md hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        destructive: "h-10 px-4 bg-destructive text-destructive-foreground border-0 rounded-md hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        outline: "h-10 px-4 bg-background border border-input text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost: "h-10 px-4 bg-transparent border-0 text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        link: "h-10 px-4 bg-transparent border-0 text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        brand: "h-10 px-4 bg-primary text-primary-foreground border-0 rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "brand-outline": "h-10 px-4 bg-background border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        success: "h-10 px-4 bg-green-600 text-white border-0 rounded-md hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        warning: "h-10 px-4 bg-yellow-600 text-white border-0 rounded-md hover:bg-yellow-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        danger: "h-10 px-4 bg-red-600 text-white border-0 rounded-md hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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