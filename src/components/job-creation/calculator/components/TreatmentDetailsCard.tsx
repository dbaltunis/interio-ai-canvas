
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from '../calculationUtils';

interface TreatmentDetailsCardProps {
  treatmentName: string;
  quantity: number;
  calculation: any;
  onTreatmentNameChange: (name: string) => void;
  onQuantityChange: (quantity: number) => void;
}

export const TreatmentDetailsCard = ({
  treatmentName,
  quantity,
  calculation,
  onTreatmentNameChange,
  onQuantityChange
}: TreatmentDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Treatment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Treatment name</Label>
          <Input
            value={treatmentName}
            onChange={(e) => onTreatmentNameChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          />
        </div>
        <div>
          <Label>Price</Label>
          <div className="text-xl font-bold text-green-600">
            {calculation ? formatCurrency(calculation.total) : formatCurrency(0)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
