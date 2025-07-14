
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Edit3 } from "lucide-react";

interface CurtainConfigurationCardProps {
  quantity: number;
  hemConfig: any;
  productCategory: string;
  onQuantityChange: (quantity: number) => void;
  onHemEditClick: () => void;
}

export const CurtainConfigurationCard = ({
  quantity,
  hemConfig,
  productCategory,
  onQuantityChange,
  onHemEditClick
}: CurtainConfigurationCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-end justify-center p-2">
            <div className="w-full h-32 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm relative">
              <div className="absolute top-0 w-full h-4 bg-gray-500 rounded-t-sm"></div>
              <div className="absolute bottom-0 w-full h-2 bg-gray-600"></div>
            </div>
          </div>
        </div>
        
        <RadioGroup 
          value={quantity === 1 ? "single" : "pair"} 
          onValueChange={(value) => onQuantityChange(value === "single" ? 1 : 2)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single">Single</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pair" id="pair" />
            <Label htmlFor="pair">Pair</Label>
          </div>
        </RadioGroup>

        {/* Current Hem Configuration Display - only for curtain types */}
        {productCategory === 'curtain' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Current Hems:</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>Header: {hemConfig.header_hem}cm</div>
              <div>Bottom: {hemConfig.bottom_hem}cm</div>
              <div>Side: {hemConfig.side_hem}cm</div>
              <div>Seam: {hemConfig.seam_hem}cm</div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {/* Show hem edit only for curtains */}
          {productCategory === 'curtain' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onHemEditClick}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit treatment hems
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add hardware
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
