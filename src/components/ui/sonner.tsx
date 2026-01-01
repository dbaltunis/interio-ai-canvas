import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group z-[9999]"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:z-[9999]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-green-500/30 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-950/30 group-[.toaster]:text-green-700 dark:group-[.toaster]:text-green-400",
          error: "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/30 group-[.toaster]:text-red-700 dark:group-[.toaster]:text-red-400",
          warning: "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/30 group-[.toaster]:text-amber-700 dark:group-[.toaster]:text-amber-400",
          info: "group-[.toaster]:border-blue-500/30 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950/30 group-[.toaster]:text-blue-700 dark:group-[.toaster]:text-blue-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
