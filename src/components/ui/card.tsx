import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass-morphism rounded-xl border border-company-secondary/20 bg-card/50 text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md relative overflow-hidden group",
      className
    )}
    {...props}
  >
    {/* Floating orbs */}
    <div className="ai-orb absolute -top-4 -right-4 w-8 h-8 opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
    <div className="ai-orb-secondary absolute -bottom-2 -left-2 w-6 h-6 opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
    
    {/* Content wrapper */}
    <div className="relative z-10 h-full">
      {props.children}
    </div>
    
    {/* Hover shimmer effect */}
    <div className="absolute inset-0 ai-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight bg-gradient-to-r from-company-primary to-company-secondary bg-clip-text text-transparent", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative z-10", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }