import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info, FileText } from "lucide-react";
import { formatCurrency } from '../calculationUtils';
import { PricingGridPreview } from './PricingGridPreview';

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
  const [showPricingGrid, setShowPricingGrid] = useState(false);

  if (!calculationBreakdown) return null;

  const isPricingGrid = matchingTemplate?.calculation_method === 'pricing_grid';

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
        return `Total fabric width needed: rail width (${formData.railWidth}cm) × fullness (${formData.headingFullness || 1}) + hems = ${calculationBreakdown.fabricWidthRequirements}.`;
      case "Lining price":
        return `Lining cost: ${liningOptions.find(l => l.label === formData.lining)?.price || 0}/m × fabric amount in meters.`;
      case "Manufacturing price":
        if (isPricingGrid) {
          return `Making cost from pricing grid: ${matchingTemplate.name}. Values pulled from CSV pricing grid based on rail width (${formData.railWidth}cm) and curtain drop (${formData.curtainDrop}cm) measurements.`;
        } else if (matchingTemplate?.calculation_rules?.baseMakingCost) {
          return `Making cost from template: ${matchingTemplate.name}. Base cost: $${matchingTemplate.calculation_rules.baseMakingCost}${matchingTemplate.pricing_unit === 'per-linear-meter' ? '/running linear meter' : '/unit'}. Running linear meters: ${calculationBreakdown.fabricWidthRequirements} ÷ 100 = ${(parseFloat(calculationBreakdown.fabricWidthRequirements) / 100).toFixed(2)}m.`;
        } else {
          return `Labor cost: running linear meters (${calculationBreakdown.fabricWidthRequirements} ÷ 100 = ${(parseFloat(calculationBreakdown.fabricWidthRequirements) / 100).toFixed(2)}m) × labor rate ($${businessSettings?.labor_rate || 45}/running linear meter).`;
        }
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
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Calculation results ({matchingTemplate.name})
            </CardTitle>
            {isPricingGrid && matchingTemplate?.pricing_grid_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingGrid(true)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                View Grid
              </Button>
            )}
          </div>
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

      {/* Pricing Grid Preview Dialog */}
      <PricingGridPreview
        isOpen={showPricingGrid}
        onClose={() => setShowPricingGrid(false)}
        gridId={matchingTemplate?.pricing_grid_id || ''}
        gridName={matchingTemplate?.name}
      />
    </>
  );
};
