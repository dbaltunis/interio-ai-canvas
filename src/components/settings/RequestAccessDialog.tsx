import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, RefreshCw, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";

interface RequestAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: string;
}

export const RequestAccessDialog = ({ open, onOpenChange, userRole }: RequestAccessDialogProps) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRetryPermissions = async () => {
    setRetrying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive"
        });
        return;
      }

      console.log('🔄 Manually retrying permission seeding...');
      
      const { data, error } = await supabase.rpc('fix_user_permissions_for_role', {
        target_user_id: user.id
      });

      if (error) {
        console.error('❌ Retry failed:', error);
        toast({
          title: "Retry Failed",
          description: "Still unable to load permissions. Please request manual assistance.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Permissions restored:', data);
        
        // Refresh all permission-related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] }),
          queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] }),
          queryClient.invalidateQueries({ queryKey: ['user-role'] })
        ]);

        toast({
          title: "Success!",
          description: `${data.permissions_added || 0} permissions restored. Refreshing...`
        });

        // Close dialog and reload page after short delay
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error('❌ Retry error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to retry",
        variant: "destructive"
      });
    } finally {
      setRetrying(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please describe the issue you're experiencing",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Get user profile to find account owner
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id, display_name, role')
        .eq('user_id', user.id)
        .single();

      const accountOwnerId = profile?.parent_account_id || user.id;

      // Create access request
      const { error: requestError } = await supabase
        .from('access_requests')
        .insert({
          requester_id: user.id,
          approver_id: accountOwnerId,
          record_type: 'permission_repair',
          record_id: user.id,
          request_reason: `Permission Issue: ${reason}. User role: ${profile?.role || 'Unknown'}`,
          status: 'pending'
        });

      if (requestError) throw requestError;

      // Send notification to account owner
      await supabase
        .from('notifications')
        .insert({
          user_id: accountOwnerId,
          title: 'Permission Access Request',
          message: `${profile?.display_name || user.email} is experiencing permission issues and needs assistance.`,
          type: 'permission_request',
          priority: 'high',
          metadata: {
            requester_id: user.id,
            requester_email: user.email,
            reason: reason
          }
        });

      toast({
        title: "Request Sent",
        description: "Your account administrator has been notified and will assist you shortly."
      });

      setReason("");
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Request access error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Access Issue Detected
          </DialogTitle>
          <DialogDescription>
            Your account permissions are not fully configured. This usually resolves automatically within a few seconds.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="default" className="my-4">
          <AlertTitle>Your Role: {userRole || 'Unknown'}</AlertTitle>
          <AlertDescription>
            Expected permissions for this role have not been applied yet.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleRetryPermissions} 
              disabled={retrying}
              variant="outline"
              className="flex-1"
            >
              {retrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Now
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or request manual help
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Describe the issue</Label>
            <Textarea
              id="reason"
              placeholder="e.g., I can't access the client list even though I'm an Admin..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequestAccess} disabled={loading || !reason.trim()}>
            {loading ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Request Manual Fix
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
