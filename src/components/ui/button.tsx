import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-small font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-10 px-4 bg-primary text-white border-0 rounded-md hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        secondary: "h-10 px-4 bg-transparent border border-default text-default rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        destructive: "h-10 px-4 bg-error text-white border-0 rounded-md hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        outline: "h-10 px-4 bg-transparent border border-default text-default rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        ghost: "h-10 px-4 bg-transparent border-0 text-default rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        link: "h-10 px-4 bg-transparent border-0 text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        brand: "h-10 px-4 bg-primary text-white border-0 rounded-md hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        "brand-outline": "h-10 px-4 bg-transparent border border-primary text-primary rounded-md hover:bg-primary hover:text-white focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        success: "h-10 px-4 bg-success text-white border-0 rounded-md hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        warning: "h-10 px-4 bg-warning text-white border-0 rounded-md hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        danger: "h-10 px-4 bg-error text-white border-0 rounded-md hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-caption",
        lg: "h-12 px-6 text-body",
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