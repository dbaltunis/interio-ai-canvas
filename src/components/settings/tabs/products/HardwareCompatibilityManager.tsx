import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HardwareCompatibilityManagerProps {
  headingType: string;
  compatibleHardware: string[];
  onHardwareChange: (hardware: string[]) => void;
}

export const HardwareCompatibilityManager = ({ 
  headingType, 
  compatibleHardware, 
  onHardwareChange 
}: HardwareCompatibilityManagerProps) => {
  
  // Auto-match compatibility based on heading type
  const getAutoCompatibility = (heading: string) => {
    const lowerHeading = heading.toLowerCase();
    
    if (lowerHeading.includes("wave")) {
      return {
        recommended: ["Track Systems", "Silent Glider Tracks", "Corded Tracks"],
        description: "Wave headings require track systems with gliders"
      };
    }
    
    if (lowerHeading.includes("eyelet") || lowerHeading.includes("grommet")) {
      return {
        recommended: ["Curtain Poles", "Bay Poles", "Extension Poles"],
        description: "Eyelet headings work with poles that thread through the rings"
      };
    }
    
    if (lowerHeading.includes("pinch") || lowerHeading.includes("pleat")) {
      return {
        recommended: ["Curtain Poles", "Track Systems", "Decorative Poles"],
        description: "Pinch pleats are versatile and work with both poles and tracks"
      };
    }
    
    if (lowerHeading.includes("tab") || lowerHeading.includes("loop")) {
      return {
        recommended: ["Curtain Poles", "Slim Poles", "Decorative Rods"],
        description: "Tab tops and loops require poles to thread through"
      };
    }
    
    return {
      recommended: ["Universal Hardware"],
      description: "Compatible hardware will depend on the specific heading style"
    };
  };

  const compatibility = getAutoCompatibility(headingType);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Hardware Compatibility</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Hardware compatibility is automatically determined by heading type</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Auto-matched based on heading style - hardware selection from inventory during project creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-medium">Auto-Matched for "{headingType}"</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {compatibility.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {compatibility.recommended.map((hardware, index) => (
                <Badge key={index} variant="secondary">
                  {hardware}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">How Hardware Selection Works:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>During project creation, only compatible hardware from your inventory will be shown</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Hardware pricing comes directly from your inventory items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Installation and compatibility are automatically validated</span>
              </li>
            </ul>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
            <p className="text-sm">
              <strong>Note:</strong> To manage hardware items, use the main Inventory section. 
              This template will automatically filter compatible options during project creation.
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};