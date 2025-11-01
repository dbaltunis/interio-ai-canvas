import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Users, Lock, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventVisibilitySelectorProps {
  value: 'private' | 'team' | 'organization';
  onChange: (value: 'private' | 'team' | 'organization') => void;
  hasTeamMembers?: boolean;
}

export const EventVisibilitySelector = ({ 
  value, 
  onChange,
  hasTeamMembers = false 
}: EventVisibilitySelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Event Visibility</Label>
      
      <RadioGroup value={value} onValueChange={onChange}>
        {/* Private */}
        <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="private" id="visibility-private" className="mt-1" />
          <div className="flex-1 space-y-1 cursor-pointer" onClick={() => onChange('private')}>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <Label htmlFor="visibility-private" className="font-medium cursor-pointer">
                Private
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Only you can see this event
            </p>
          </div>
        </div>

        {/* Team */}
        <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="team" id="visibility-team" className="mt-1" />
          <div className="flex-1 space-y-1 cursor-pointer" onClick={() => onChange('team')}>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              <Label htmlFor="visibility-team" className="font-medium cursor-pointer">
                Team
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Visible to selected team members
            </p>
          </div>
        </div>

        {/* Organization */}
        <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="organization" id="visibility-organization" className="mt-1" />
          <div className="flex-1 space-y-1 cursor-pointer" onClick={() => onChange('organization')}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <Label htmlFor="visibility-organization" className="font-medium cursor-pointer">
                Organization
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Visible to everyone in your organization
            </p>
          </div>
        </div>
      </RadioGroup>

      {value === 'team' && !hasTeamMembers && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Select team members below to share this event with specific people
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
