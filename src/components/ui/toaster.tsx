
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Wifi, Lock, AlertCircle, KeyRound, Settings, Ruler, Info } from "lucide-react"

type IconType = 'network' | 'permission' | 'validation' | 'session' | 'config' | 'calculator' | 'general';

const iconComponents: Record<IconType, React.ReactNode> = {
  network: <Wifi className="h-5 w-5 flex-shrink-0" />,
  permission: <Lock className="h-5 w-5 flex-shrink-0" />,
  validation: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
  session: <KeyRound className="h-5 w-5 flex-shrink-0" />,
  config: <Settings className="h-5 w-5 flex-shrink-0" />,
  calculator: <Ruler className="h-5 w-5 flex-shrink-0" />,
  general: <Info className="h-5 w-5 flex-shrink-0" />,
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, showLoginButton, onLoginClick, ...props }) {
        const IconComponent = icon ? iconComponents[icon as IconType] : null;
        
        return (
          <Toast key={id} {...props} className="w-auto min-w-[320px] max-w-lg mx-auto">
            <div className="flex items-start gap-3 w-full">
              {IconComponent && (
                <div className="mt-0.5 opacity-80">
                  {IconComponent}
                </div>
              )}
              <div className="flex-1 min-w-0 grid gap-1.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {showLoginButton && onLoginClick && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onLoginClick}
                    className="mt-2 w-fit bg-white/20 hover:bg-white/30 text-current border-0"
                  >
                    Log In Again
                  </Button>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[10000] flex flex-col-reverse p-4 gap-3 w-auto max-w-md pointer-events-none" />
    </ToastProvider>
  )
}
