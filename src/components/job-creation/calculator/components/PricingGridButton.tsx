
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { PricingGridPreview } from './PricingGridPreview';

interface PricingGridButtonProps {
  gridId?: string;
  gridName?: string;
  currentWidth?: number;
  currentDrop?: number;
  disabled?: boolean;
}

export const PricingGridButton = ({ 
  gridId, 
  gridName, 
  currentWidth, 
  currentDrop, 
  disabled = false 
}: PricingGridButtonProps) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!gridId) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled={true}
        className="opacity-50 cursor-not-allowed"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        No Pricing Grid
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(true)}
        disabled={disabled}
        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        csv-pricing-grid
      </Button>

      <PricingGridPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        gridId={gridId}
        gridName={gridName}
        currentWidth={currentWidth}
        currentDrop={currentDrop}
      />
    </>
  );
};
