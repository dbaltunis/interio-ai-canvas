
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCurrency } from '../calculationUtils';

interface CalculationResultsCardProps {
  calculationBreakdown: any;
  matchingTemplate: any;
  dontUpdateTotalPrice: boolean;
  onDontUpdatePriceChange: (checked: boolean) => void;
  hemConfig: any;
  formData: any;
  businessSettings: any;
  liningOptions: any[];
}

export const CalculationResultsCard = ({
  calculationBreakdown,
  matchingTemplate,
  dontUpdateTotalPrice,
  onDontUpdatePriceChange,
  hemConfig,
  formData,
  businessSettings,
  liningOptions
}: CalculationResultsCardProps) => {
  if (!calculationBreakdown) return null;

  const calculationItems = [
    { label: "Fabric amount", value: calculationBreakdown.fabricAmount },
    { label: "Curtain width total", value: calculationBreakdown.curtainWidthTotal },
    { label: "Fabric drop requirements", value: calculationBreakdown.fabricDropRequirements },
    { label: "Fabric width requirements", value: calculationBreakdown.fabricWidthRequirements },
    { label: "Lining price", value: formatCurrency(calculationBreakdown.liningPrice) },
    { label: "Manufacturing price", value: formatCurrency(calculationBreakdown.manufacturingPrice) },
    { label: "Fabric price", value: formatCurrency(calculationBreakdown.fabricPrice) },
    { label: "Leftovers-Vertical", value: calculationBreakdown.leftoversVertical },
    { label: "Leftovers-Horizontal", value: calculationBreakdown.leftoversHorizontal }
  ];

  const getTooltipContent = (label: string) => {
    switch (label) {
      case "Fabric amount":
        return `Total fabric needed: ${calculationBreakdown.fabricAmount}. Calculated as fabric lengths needed × total drop required (including hems).`;
      case "Curtain width total":
        return "Number of drops that fit across fabric width. Each drop is the finished curtain width × fullness ratio.";
      case "Fabric drop requirements":
        return `Total drop needed: curtain drop + pooling + header hem (${hemConfig.header_hem}cm) + bottom hem (${hemConfig.bottom_hem}cm).`;
      case "Fabric width requirements":
        return `Total fabric width needed: finished width × fullness (${formData.headingFullness}) × quantity (${formData.quantity}).`;
      case "Lining price":
        return `Lining cost: ${liningOptions.find(l => l.label === formData.lining)?.price || 0}/m × fabric amount in meters.`;
      case "Manufacturing price":
        return matchingTemplate?.calculation_rules?.baseMakingCost 
          ? `Making cost from template: ${matchingTemplate.name}. Base cost: $${matchingTemplate.calculation_rules.baseMakingCost}${matchingTemplate.pricing_unit === 'per-linear-meter' ? '/linear meter' : '/unit'}.`
          : `Labor cost: rail width (${formData.railWidth}cm) ÷ 100 × labor rate ($${businessSettings?.labor_rate || 45}/linear meter).`;
      case "Fabric price":
        return `Fabric cost: total fabric amount × price per cm ($${formData.fabricPricePerYard}/yard ÷ 91.44cm).`;
      case "Leftovers-Vertical":
        return "Vertical waste: total drop required - actual curtain drop. Includes hem allowances.";
      case "Leftovers-Horizontal":
        return "Horizontal waste: fabric width - used width per drop.";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Calculation results ({matchingTemplate.name})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {calculationItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.value}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{getTooltipContent(item.label)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="dont-update-price" 
            checked={dontUpdateTotalPrice}
            onCheckedChange={(checked) => onDontUpdatePriceChange(checked === true)}
          />
          <Label htmlFor="dont-update-price" className="text-sm">
            Don't update the total price
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
