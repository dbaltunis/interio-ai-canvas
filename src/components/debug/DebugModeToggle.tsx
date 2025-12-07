import { useDebugMode } from "@/contexts/DebugModeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bug } from "lucide-react";

export const DebugModeToggle = () => {
  const { isDebugMode, toggleDebugMode } = useDebugMode();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Bug className="h-5 w-5 text-yellow-600" />
        <div>
          <Label htmlFor="debug-mode" className="text-sm font-medium">
            Debug Mode
          </Label>
          <p className="text-xs text-muted-foreground">
            Show calculation logs, data verification, and cache controls
          </p>
        </div>
      </div>
      <Switch
        id="debug-mode"
        checked={isDebugMode}
        onCheckedChange={toggleDebugMode}
      />
    </div>
  );
};
