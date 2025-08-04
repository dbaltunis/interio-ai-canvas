import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, X, RefreshCw } from "lucide-react";
import { UserInvitation, useDeleteInvitation } from "@/hooks/useUserInvitations";
import { formatDistanceToNow } from "date-fns";

interface PendingInvitationsProps {
  invitations: UserInvitation[];
}

export const PendingInvitations = ({ invitations }: PendingInvitationsProps) => {
  const deleteInvitation = useDeleteInvitation();
  
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations
          </div>
          <Badge variant="secondary">
            {pendingInvitations.length} pending
          </Badge>
        </CardTitle>
        <CardDescription>
          Invitations sent but not yet accepted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingInvitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">
                    {invitation.invited_name || invitation.invited_email}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {invitation.invited_email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sent {formatDistanceToNow(new Date(invitation.created_at))} ago
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {invitation.role}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteInvitation.mutate(invitation.id)}
                  disabled={deleteInvitation.isPending}
                >
                  {deleteInvitation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};