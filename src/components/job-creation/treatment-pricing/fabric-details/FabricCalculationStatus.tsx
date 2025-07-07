import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface FabricCalculationStatusProps {
  fabricWidth: number;
  fabricType: string;
  rollDirection: string;
  isAutoSelected: boolean;
}

export const FabricCalculationStatus = ({ 
  fabricWidth, 
  fabricType, 
  rollDirection,
  isAutoSelected 
}: FabricCalculationStatusProps) => {
  const isNarrow = fabricWidth <= 200;
  const isPlain = fabricType?.toLowerCase().includes('plain') || 
                  fabricType?.toLowerCase().includes('solid') ||
                  fabricType?.toLowerCase().includes('textured');
  
  const getStatusColor = () => {
    if (isAutoSelected) return "bg-green-50 border-green-200";
    return "bg-blue-50 border-blue-200";
  };

  const getStatusIcon = () => {
    if (isAutoSelected) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Lightbulb className="h-4 w-4 text-blue-600" />;
  };

  return (
    <Card className={`${getStatusColor()} transition-colors`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium">
              {isAutoSelected ? "Auto-Optimized Fabric Calculation" : "Manual Fabric Selection"}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant={isNarrow ? "default" : "secondary"}>
                {isNarrow ? "Narrow" : "Wide"} Fabric ({fabricWidth}cm)
              </Badge>
              <Badge variant={isPlain ? "default" : "destructive"}>
                {isPlain ? "Plain" : "Patterned"}
              </Badge>
              <Badge variant="outline">
                {rollDirection} Roll
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {isAutoSelected ? (
                "✓ System automatically selected optimal orientation for fabric savings"
              ) : (
                `Manual selection: ${rollDirection} roll direction`
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};