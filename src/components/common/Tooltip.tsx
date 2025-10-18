import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  showIcon?: boolean;
}

export const Tooltip = ({ content, children, side = "top", showIcon = true }: TooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <TooltipPrimitive>
        <TooltipTrigger asChild>
          {children || (
            <button className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              {showIcon && <HelpCircle className="h-4 w-4" />}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
};
