
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=open]:pointer-events-auto data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:pointer-events-none",
      className
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, onPointerDownOutside, onInteractOutside, onOpenAutoFocus, ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={style}
        onPointerDownOutside={(e) => {
          // Don't close dialog when clicking inside a popover
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
          onPointerDownOutside?.(e);
        }}
        onInteractOutside={(e) => {
          // Don't close dialog when interacting with a popover
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
          onInteractOutside?.(e);
        }}
        onOpenAutoFocus={(e) => {
          // Allow nested components to manage their own focus
          onOpenAutoFocus?.(e);
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "fixed left-[50%] top-[50%] z-[9999] flex flex-col w-[calc(100%-2rem)] max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl translate-x-[-50%] translate-y-[-50%] gap-4 md:gap-5 lg:gap-6 border bg-card text-card-foreground border-border p-5 md:p-6 lg:p-8 shadow-modal duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl will-change-transform max-h-[85vh] md:max-h-[90vh] overflow-y-auto pointer-events-auto",
          // Hide default close button when gap-0 is passed (custom close button)
          className?.includes('gap-0') ? '' : '',
          className
        )}
        {...props}
      >
        {children}
        {/* Only show default close button if not using custom (gap-0 indicates custom layout) */}
        {!className?.includes('gap-0') && (
          <DialogPrimitive.Close 
            className="absolute right-4 top-4 md:right-5 md:top-5 z-10 rounded-full p-2 bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={style}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
