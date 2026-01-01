import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Reply, RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";

interface EmailRowActionsProps {
  email: any;
  onView: () => void;
  onFollowUp: () => void;
  onResend: () => void;
  isResending: boolean;
}

export const EmailRowActions = ({ 
  email, 
  onView, 
  onFollowUp, 
  onResend, 
  isResending 
}: EmailRowActionsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userRoleData, isLoading: userRoleLoading } = useUserRole();
  const { data: explicitPermissions, isLoading: permissionsLoading } = useUserPermissions();

  // Check view_email_kpis permission
  const { data: hasViewEmailKPIsPermission } = useQuery({
    queryKey: ['has-permission', user?.id, 'view_email_kpis', explicitPermissions, userRoleData],
    queryFn: async () => {
      if (!user || userRoleLoading || permissionsLoading) return undefined;
      
      const role = userRoleData?.role;
      if (role === 'System Owner') return true;
      
      // Check explicit permission
      const hasExplicit = explicitPermissions?.includes('view_email_kpis');
      if (hasExplicit !== undefined) return hasExplicit;
      
      // Role-based defaults
      if (['Owner', 'Admin'].includes(role || '')) {
        return hasExplicit ?? true; // Default true if no explicit permission set
      }
      
      return hasExplicit ?? false;
    },
    enabled: !!user && !userRoleLoading && !permissionsLoading,
  });

  const canViewEmailKPIs = hasViewEmailKPIsPermission ?? undefined;
  const isPermissionLoaded = canViewEmailKPIs !== undefined;
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email.recipient_email);
    toast({
      title: "Email Copied",
      description: "Recipient email address copied to clipboard"
    });
  };

  const handleViewClick = () => {
    if (!isPermissionLoaded || !canViewEmailKPIs) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to view email performance metrics.",
        variant: "destructive",
      });
      return;
    }
    onView();
  };

  const canResend = ['bounced', 'failed'].includes(email.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border shadow-lg z-50">
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick();
          }}
          disabled={!isPermissionLoaded || !canViewEmailKPIs}
          className={!isPermissionLoaded || !canViewEmailKPIs ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onFollowUp();
          }}
        >
          <Reply className="h-4 w-4 mr-2" />
          Send Follow-up
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleCopyEmail();
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Email
        </DropdownMenuItem>
        {canResend && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onResend();
            }}
            disabled={isResending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Resending...' : 'Resend Email'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};