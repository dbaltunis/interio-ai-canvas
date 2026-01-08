import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Clock, Mail } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface AccountBlockedDialogProps {
  status: 'blocked' | 'trial_ended' | 'suspended';
  reason?: string | null;
  onClose?: () => void;
}

export function AccountBlockedDialog({ status, reason, onClose }: AccountBlockedDialogProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
    window.location.href = '/auth';
  };

  const getStatusContent = () => {
    switch (status) {
      case 'trial_ended':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: "Trial Period Ended",
          description: "Your free trial has expired. Please contact us to upgrade your account and continue using InterioApp.",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
      case 'suspended':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
          title: "Account Suspended",
          description: "Your account has been temporarily suspended. Please contact support for more information.",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-200 dark:border-orange-800",
        };
      case 'blocked':
      default:
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: "Account Blocked",
          description: "Your account has been blocked. Please contact support if you believe this is an error.",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
    }
  };

  const content = getStatusContent();

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className={`sm:max-w-md ${content.bgColor} ${content.borderColor} border-2`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center items-center space-y-4">
          <div className="mx-auto">
            {content.icon}
          </div>
          <DialogTitle className="text-xl font-bold">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {content.description}
          </DialogDescription>
          {reason && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Reason:</strong> {reason}
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => window.open('mailto:support@interioapp.com?subject=Account%20Access%20Request', '_blank')}
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          If you have any questions, please reach out to us at{" "}
          <a href="mailto:support@interioapp.com" className="underline hover:text-primary">
            support@interioapp.com
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
