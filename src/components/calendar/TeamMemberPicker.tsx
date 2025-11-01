import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, X } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { getInitials, getAvatarColor } from "@/lib/avatar-utils";

interface TeamMemberPickerProps {
  selectedMembers: string[];
  onChange: (members: string[]) => void;
}

export const TeamMemberPicker = ({ selectedMembers, onChange }: TeamMemberPickerProps) => {
  const { data: teamMembers = [] } = useTeamMembers();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onChange([...selectedMembers, memberId]);
    }
  };

  const handleRemove = (memberId: string) => {
    onChange(selectedMembers.filter(id => id !== memberId));
  };

  const selectedMemberObjects = teamMembers.filter(member => 
    selectedMembers.includes(member.id)
  );

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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" />
            {selectedMembers.length === 0 
              ? "Select team members..." 
              : `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Select Team Members</h4>
              <p className="text-xs text-muted-foreground">
                Choose who can see this event
              </p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
