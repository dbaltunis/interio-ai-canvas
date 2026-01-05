import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border text-foreground transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border-border/80 bg-background shadow-sm hover:border-foreground/30 disabled:opacity-100 disabled:bg-muted disabled:border-muted-foreground/40 disabled:text-foreground",
        ghost: "border-transparent bg-muted/50 hover:bg-muted focus-visible:bg-background focus-visible:border-input",
        underline: "border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary",
      },
      inputSize: {
        default: "h-10 px-3 py-2 text-sm",
        sm: "h-9 px-3 py-1.5 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }