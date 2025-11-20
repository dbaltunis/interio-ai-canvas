import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { convertLength } from "@/hooks/useBusinessSettings";
import { FabricPoolItem } from "@/hooks/useClientFabricPool";

interface LeftoverFabricSelectorProps {
  availableLeftover: FabricPoolItem[];
  requiredLengthCm: number;
  fabricId: string;
  orientation: 'vertical' | 'horizontal';
  onSelectLeftover: (leftoverId: string) => void;
  onDeclineLeftover: () => void;
  selectedLeftoverId?: string | null;
}

export const LeftoverFabricSelector = ({
  availableLeftover,
  requiredLengthCm,
  fabricId,
  orientation,
  onSelectLeftover,
  onDeclineLeftover,
  selectedLeftoverId
}: LeftoverFabricSelectorProps) => {
  const { units, getLengthUnitLabel } = useMeasurementUnits();

  const formatLength = (lengthCm: number) => {
    const converted = convertLength(lengthCm, 'cm', units.length);
    return `${converted.toFixed(1)}${getLengthUnitLabel()}`;
  };

  // Filter matching leftover
  const matchingLeftover = availableLeftover.filter(
    item => item.fabric_id === fabricId &&
    item.orientation === orientation &&
    item.leftover_length_cm >= requiredLengthCm
  ).sort((a, b) => a.leftover_length_cm - b.leftover_length_cm); // Smallest suitable first

  if (matchingLeftover.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2">
          <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Leftover Fabric Available!
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              We found {matchingLeftover.length} leftover piece{matchingLeftover.length > 1 ? 's' : ''} 
              {' '}from previous treatments that can be used for this order.
            </p>
          </div>

          <Alert className="bg-amber-100/50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
            <Info className="h-4 w-4 text-amber-800 dark:text-amber-200" />
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
              Using leftover fabric: <strong>No fabric cost</strong> (already paid), 
              but <strong>labor charges still apply</strong> for cutting and sewing.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            {matchingLeftover.map((leftover) => {
              const isSelected = selectedLeftoverId === leftover.id;
              const unusedLength = leftover.leftover_length_cm - requiredLengthCm;
              
              return (
                <div 
                  key={leftover.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/40' 
                      : 'border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-amber-900 dark:text-amber-100">
                          From: {leftover.treatment_name || 'Previous Treatment'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatLength(leftover.leftover_length_cm)} available
                        </Badge>
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        Required: {formatLength(requiredLengthCm)} • 
                        Remaining after use: {formatLength(unusedLength)}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => isSelected ? onDeclineLeftover() : onSelectLeftover(leftover.id)}
                      className={isSelected ? "bg-amber-600 hover:bg-amber-700" : ""}
                    >
                      {isSelected ? 'Selected ✓' : 'Use This'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {!selectedLeftoverId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDeclineLeftover}
              className="w-full text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              No thanks, use new fabric
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};