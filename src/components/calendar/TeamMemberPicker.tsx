import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, X, UserCheck } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { getInitials, getAvatarColor } from "@/lib/avatar-utils";

interface TeamMemberPickerProps {
  selectedMembers: string[];
  onChange: (members: string[]) => void;
}

type SelectionMode = "all" | "individual";

export const TeamMemberPicker = ({ selectedMembers, onChange }: TeamMemberPickerProps) => {
  const { data: teamMembers = [] } = useTeamMembers();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SelectionMode>("individual");

  const handleModeChange = (newMode: SelectionMode) => {
    setMode(newMode);
    if (newMode === "all") {
      onChange(teamMembers.map(m => m.id));
      setIsOpen(false);
    }
  };

  const handleToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onChange([...selectedMembers, memberId]);
    }
  };

  const handleRemove = (memberId: string) => {
    onChange(selectedMembers.filter(id => id !== memberId));
    if (selectedMembers.length === 1) {
      setMode("individual");
    }
  };

  const selectedMemberObjects = teamMembers.filter(member => 
    selectedMembers.includes(member.id)
  );

  const isAllSelected = teamMembers.length > 0 && selectedMembers.length === teamMembers.length;

  return (
    <div className="space-y-3">
      <Label>Share with Team Members</Label>
      
      {/* Selected Members Display */}
      {selectedMemberObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMemberObjects.map(member => (
            <Badge 
              key={member.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-2"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback 
                  className="text-xs"
                  style={{ backgroundColor: getAvatarColor(member.name || member.email) }}
                >
                  {getInitials(member.name || member.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name || member.email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(member.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Team Member Picker Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" />
            {isAllSelected ? "All members" : `Individual (${selectedMembers.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Share with Team</h4>
              <p className="text-xs text-muted-foreground">
                Choose who can see this event
              </p>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <Button
                variant={mode === "all" ? "default" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => handleModeChange("all")}
              >
                <UserCheck className="h-4 w-4" />
                All members
              </Button>
              <Button
                variant={mode === "individual" ? "default" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => handleModeChange("individual")}
              >
                <Users className="h-4 w-4" />
                Individual selection
              </Button>
            </div>

            {/* Individual Selection List */}
            {mode === "individual" && (
              <>
                <div className="space-y-2 max-h-[300px] overflow-y-auto border-t pt-4">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No team members available
                    </p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleToggle(member.id)}
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => handleToggle(member.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback 
                            style={{ backgroundColor: getAvatarColor(member.name || member.email) }}
                          >
                            {getInitials(member.name || member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => onChange([])}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => onChange(teamMembers.map(m => m.id))}
                  >
                    Select All
                  </Button>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
