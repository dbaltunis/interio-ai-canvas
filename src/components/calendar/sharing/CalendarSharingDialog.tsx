import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDelegateCalendar, useCalendarDelegations, useRemoveCalendarDelegation } from "@/hooks/useCalendarSharing";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Trash2, Share, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CalendarSharingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarId: string;
  calendarName: string;
}

export const CalendarSharingDialog = ({
  open,
  onOpenChange,
  calendarId,
  calendarName,
}: CalendarSharingDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<"view" | "edit" | "manage">("view");

  const delegateCalendar = useDelegateCalendar();
  const { data: delegations = [] } = useCalendarDelegations();
  const removeDelegation = useRemoveCalendarDelegation();
  const { data: teamMembers = [] } = useTeamMembers();

  // Filter out already-delegated users
  const delegatedUserIds = new Set(delegations.map((d) => d.delegate_id));
  const availableMembers = teamMembers.filter((m) => !delegatedUserIds.has(m.id));

  const handleDelegate = async () => {
    if (!selectedUserId) return;

    delegateCalendar.mutate({
      delegateUserId: selectedUserId,
      permissionLevel,
    });

    setSelectedUserId("");
    setPermissionLevel("view");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPermissionLabel = (level: string) => {
    switch (level) {
      case "view": return "View Only";
      case "edit": return "Can Edit";
      case "manage": return "Full Access";
      default: return level;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Add team member</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.length === 0 ? (
                  <SelectItem value="_none" disabled>No available team members</SelectItem>
                ) : (
                  availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.display_name || member.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Permission Level</Label>
            <Select
              value={permissionLevel}
              onValueChange={(value: "view" | "edit" | "manage") => setPermissionLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">Can Edit</SelectItem>
                <SelectItem value="manage">Full Access (manage)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleDelegate}
            disabled={!selectedUserId || delegateCalendar.isPending}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {delegateCalendar.isPending ? "Granting access..." : "Grant Calendar Access"}
          </Button>

          {delegations.length > 0 && (
            <div className="space-y-2">
              <Label>Current Delegations</Label>
              <div className="space-y-2">
                {delegations.map((delegation) => {
                  const member = teamMembers.find((m) => m.id === delegation.delegate_id);
                  const displayName = member?.display_name || member?.email || delegation.delegate_id.slice(0, 8);

                  return (
                    <div
                      key={delegation.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {getPermissionLabel(delegation.permission_level)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDelegation.mutate(delegation.id)}
                        disabled={removeDelegation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
