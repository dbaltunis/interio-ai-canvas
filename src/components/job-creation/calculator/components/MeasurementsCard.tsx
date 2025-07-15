
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface MeasurementsCardProps {
  railWidth: string;
  curtainDrop: string;
  curtainPooling: string;
  onMeasurementChange: (field: string, value: string) => void;
  treatmentType?: string;
}

export const MeasurementsCard = ({
  railWidth,
  curtainDrop,
  curtainPooling,
  onMeasurementChange,
  treatmentType
}: MeasurementsCardProps) => {
  const { getLengthUnitLabel } = useMeasurementUnits();
  
  // Determine if this is a blind treatment
  const isBlind = treatmentType?.toLowerCase().includes('blind');
  
  // Use appropriate terminology
  const widthLabel = isBlind ? "Blind width" : "Rail width";
  const dropLabel = isBlind ? "Blind drop" : "Curtain drop";
  const poolingLabel = isBlind ? "Bottom clearance" : "Curtain pooling";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Treatment measurements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{widthLabel}</Label>
            <div className="flex">
              <Input
                type="number"
                value={railWidth}
                onChange={(e) => onMeasurementChange('railWidth', e.target.value)}
                className="rounded-r-none"
              />
              <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r text-sm text-gray-600">{getLengthUnitLabel()}</div>
            </div>
          </div>
          <div>
            <Label>{dropLabel}</Label>
            <div className="flex">
              <Input
                type="number"
                value={curtainDrop}
                onChange={(e) => onMeasurementChange('curtainDrop', e.target.value)}
                className="rounded-r-none"
              />
              <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r text-sm text-gray-600">{getLengthUnitLabel()}</div>
            </div>
          </div>
        </div>
        {!isBlind && (
          <div>
            <Label>{poolingLabel}</Label>
            <div className="flex">
              <Input
                type="number"
                value={curtainPooling}
                onChange={(e) => onMeasurementChange('curtainPooling', e.target.value)}
                className="rounded-r-none"
              />
              <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r text-sm text-gray-600">{getLengthUnitLabel()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
