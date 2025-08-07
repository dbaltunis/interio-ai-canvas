import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group">
        {/* Floating orb for focus state */}
        <div className="ai-orb absolute -top-1 -right-1 w-4 h-4 opacity-0 group-focus-within:opacity-60 transition-opacity duration-500" />
        
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg glass-morphism border border-company-secondary/30 bg-transparent px-3 py-1 text-sm shadow-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-company-primary focus-visible:border-company-primary/50 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-md hover:border-company-secondary/50 focus-visible:shadow-lg focus-visible:glass-morphism-strong",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* AI shimmer effect on focus */}
        <div className="absolute inset-0 ai-shimmer opacity-0 group-focus-within:opacity-30 transition-opacity duration-500 rounded-lg pointer-events-none" />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }