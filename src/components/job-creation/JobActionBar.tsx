
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";

interface JobActionBarProps {
  copiedRoom: any;
  onPasteRoom: () => void;
}

export const JobActionBar = ({ copiedRoom, onPasteRoom }: JobActionBarProps) => {
  if (!copiedRoom) return null;

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <Button 
          onClick={onPasteRoom}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Clipboard className="h-4 w-4" />
          <span>Paste Room</span>
        </Button>
      </div>
    </div>
  );
};
