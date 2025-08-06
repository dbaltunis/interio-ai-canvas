import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AccessRequest } from "@/hooks/useAccountSettings";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface AccessRequestCardProps {
  request: AccessRequest;
  onApprove: (role: string) => void;
  onReject: () => void;
  isProcessing: boolean;
}

const roleOptions = [
  { value: "Staff", label: "Staff" },
  { value: "Manager", label: "Manager" },
  { value: "Admin", label: "Admin" },
];

export const AccessRequestCard = ({ 
  request, 
  onApprove, 
  onReject, 
  isProcessing 
}: AccessRequestCardProps) => {
  const [selectedRole, setSelectedRole] = useState(request.requested_role);

  const handleApprove = () => {
    onApprove(selectedRole);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">
                  {request.requester_name || request.requester_email}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {request.requested_role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </div>

              {request.message && (
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">{request.message}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Assign Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isProcessing}
              className="gap-1"
            >
              <XCircle className="h-3 w-3" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};