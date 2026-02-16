import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShareAppointment, useAppointmentShares, useRemoveAppointmentShare } from "@/hooks/useCalendarSharing";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Trash2, Share, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppointmentSharingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  appointmentTitle: string;
}

export const AppointmentSharingDialog = ({
  open,
  onOpenChange,
  appointmentId,
  appointmentTitle,
}: AppointmentSharingDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<"view" | "edit" | "manage">("view");

  const shareAppointment = useShareAppointment();
  const { data: shares = [] } = useAppointmentShares(appointmentId);
  const removeShare = useRemoveAppointmentShare();
  const { data: teamMembers = [] } = useTeamMembers();

  // Filter out already-shared users
  const sharedUserIds = new Set(shares.map((s) => s.shared_with_user_id));
  const availableMembers = teamMembers.filter((m) => !sharedUserIds.has(m.id));

  const handleShare = async () => {
    if (!selectedUserId) return;

    shareAppointment.mutate({
      appointmentId,
      sharedWithUserId: selectedUserId,
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
            Share "{appointmentTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Share with team member</Label>
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
                      {member.name || member.email}
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
            onClick={handleShare}
            disabled={!selectedUserId || shareAppointment.isPending}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {shareAppointment.isPending ? "Sharing..." : "Share Appointment"}
          </Button>

          {shares.length > 0 && (
            <div className="space-y-2">
              <Label>Shared With</Label>
              <div className="space-y-2">
                {shares.map((share) => {
                  const member = teamMembers.find((m) => m.id === share.shared_with_user_id);
                  const displayName = member?.name || member?.email || share.shared_with_user_id.slice(0, 8);

                  return (
                    <div
                      key={share.id}
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
                            {getPermissionLabel(share.permission_level)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeShare.mutate(share.id)}
                        disabled={removeShare.isPending}
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
