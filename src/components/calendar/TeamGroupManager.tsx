import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCreateTeamGroup, useUpdateTeamGroup, useDeleteTeamGroup, type CalendarTeamGroup } from "@/hooks/useCalendarTeamGroups";
import { getInitials, getAvatarColor } from "@/lib/avatar-utils";
import { COLOR_DOTS } from "./calendarConstants";

interface TeamGroupManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGroup?: CalendarTeamGroup | null;
}

export const TeamGroupManager = ({ open, onOpenChange, editGroup }: TeamGroupManagerProps) => {
  const { user } = useAuth();
  const { data: allTeamMembers = [] } = useTeamMembers();
  const teamMembers = allTeamMembers.filter(m => m.id !== user?.id);

  const createGroup = useCreateTeamGroup();
  const updateGroup = useUpdateTeamGroup();
  const deleteGroup = useDeleteTeamGroup();

  const [name, setName] = useState(editGroup?.name || "");
  const [color, setColor] = useState(editGroup?.color || COLOR_DOTS[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>(editGroup?.member_ids || []);

  // Reset form when dialog opens with new data
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && editGroup) {
      setName(editGroup.name);
      setColor(editGroup.color);
      setSelectedIds(editGroup.member_ids || []);
    } else if (isOpen && !editGroup) {
      setName("");
      setColor(COLOR_DOTS[0]);
      setSelectedIds([]);
    }
    onOpenChange(isOpen);
  };

  const toggleMember = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editGroup) {
      await updateGroup.mutateAsync({
        id: editGroup.id,
        name: name.trim(),
        color,
        member_ids: selectedIds,
      });
    } else {
      await createGroup.mutateAsync({
        name: name.trim(),
        color,
        member_ids: selectedIds,
      });
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!editGroup) return;
    await deleteGroup.mutateAsync(editGroup.id);
    onOpenChange(false);
  };

  const isSaving = createGroup.isPending || updateGroup.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">
            {editGroup ? "Edit Team Group" : "New Team Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label className="text-xs">Group Name</Label>
            <Input
              placeholder="e.g. Sales Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm mt-1"
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 mt-1.5">
              {COLOR_DOTS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <Label className="text-xs">Members ({selectedIds.length})</Label>
            <ScrollArea className="max-h-[240px] mt-1.5 border rounded-lg">
              <div className="p-1">
                {teamMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No team members available
                  </p>
                ) : (
                  teamMembers.map(member => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/40 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedIds.includes(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback
                          className="text-[10px]"
                          style={{ backgroundColor: getAvatarColor(member.name || member.email) }}
                        >
                          {getInitials(member.name || member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{member.name}</span>
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {editGroup && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                onClick={handleDelete}
                disabled={deleteGroup.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!name.trim() || isSaving} className="h-8">
              {isSaving ? "Saving..." : editGroup ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
