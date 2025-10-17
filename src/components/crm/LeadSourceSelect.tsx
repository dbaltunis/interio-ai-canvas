import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadSources } from "@/hooks/useLeadSources";
import { LeadSourceDialog } from "./LeadSourceDialog";
import { useState } from "react";

interface LeadSourceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const LeadSourceSelect = ({ value, onValueChange, placeholder = "Select source" }: LeadSourceSelectProps) => {
  const { data: sources, isLoading } = useLeadSources();
  const [showManager, setShowManager] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="flex-1 bg-background">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              <>
                {sources?.map((source) => (
                  <SelectItem key={source.id} value={source.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      {source.name}
                    </div>
                  </SelectItem>
                ))}
                {!sources?.length && (
                  <SelectItem value="none" disabled>
                    No sources available
                  </SelectItem>
                )}
              </>
            )}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon" 
          type="button"
          className="flex-shrink-0"
          title="Manage lead sources"
          onClick={() => setShowManager(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <LeadSourceDialog 
          open={showManager} 
          onClose={() => setShowManager(false)} 
        />
      </div>
    </div>
  );
};