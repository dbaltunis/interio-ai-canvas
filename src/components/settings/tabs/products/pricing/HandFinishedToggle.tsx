import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface HandFinishedToggleProps {
  value: boolean;
  onChange: (checked: boolean) => void;
}

export const HandFinishedToggle = ({ value, onChange }: HandFinishedToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="offers_hand_finished"
        checked={value}
        onCheckedChange={onChange}
      />
      <Label htmlFor="offers_hand_finished">
        Offer Hand-Finished Options
      </Label>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Enable this if your company offers both machine and hand-finished curtains</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};