import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShareCalendar, useCalendarShares, useRemoveCalendarShare } from "@/hooks/useCalendarSharing";
import { Trash2, Share } from "lucide-react";
import { toast } from "sonner";

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
  calendarName 
}: CalendarSharingDialogProps) => {
  const [userEmail, setUserEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<"view" | "edit">("view");

  const shareCalendar = useShareCalendar();
  const { data: shares = [] } = useCalendarShares();
  const removeShare = useRemoveCalendarShare();

  const currentShares = shares.filter(share => share.calendar_id === calendarId);

  const handleShare = async () => {
    if (!userEmail.trim()) {
      toast.error("Please enter a user email");
      return;
    }

    // TODO: In a real app, you'd look up the user ID by email
    // For now, we'll assume the email is the user ID (this would need proper user lookup)
    shareCalendar.mutate({
      calendarId,
      sharedWithUserId: userEmail, // This should be resolved to actual user ID
      permissionLevel,
    });

    setUserEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share "{calendarName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userEmail">Share with user (email)</Label>
            <Input
              id="userEmail"
              placeholder="user@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission">Permission Level</Label>
            <Select value={permissionLevel} onValueChange={(value: "view" | "edit") => setPermissionLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">Can Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleShare} 
            disabled={shareCalendar.isPending}
            className="w-full"
          >
            {shareCalendar.isPending ? "Sharing..." : "Share Calendar"}
          </Button>

          {currentShares.length > 0 && (
            <div className="space-y-2">
              <Label>Current Shares</Label>
              <div className="space-y-2">
                {currentShares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{share.shared_with_user_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {share.permission_level === "view" ? "View Only" : "Can Edit"}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};