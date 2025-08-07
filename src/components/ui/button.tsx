import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "company-gradient text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "glass-morphism border-company-secondary/30 bg-background/50 hover:bg-accent hover:text-accent-foreground backdrop-blur-md",
        secondary: "glass-morphism-strong text-secondary-foreground shadow-sm hover:bg-secondary/80 transform hover:scale-102",
        ghost: "hover:bg-accent hover:text-accent-foreground backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        ai: "glass-morphism company-gradient-soft text-white shadow-xl hover:shadow-2xl transform hover:scale-105 border-0 relative overflow-hidden",
        floating: "glass-morphism-strong company-gradient text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 border-0 rounded-full relative overflow-hidden"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
        floating: "h-16 w-16 rounded-full"
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
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* AI shimmer effect for ai and floating variants */}
        {(variant === 'ai' || variant === 'floating') && (
          <div className="absolute inset-0 ai-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Floating orb for floating variant */}
        {variant === 'floating' && (
          <div className="ai-orb absolute -top-2 -right-2 w-6 h-6 opacity-60" />
        )}
        
        <span className="relative z-10">{children}</span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }