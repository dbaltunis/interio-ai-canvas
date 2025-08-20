import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { DetailedQuotationTable } from "./DetailedQuotationTable";
import { TreatmentLineItems } from "./TreatmentLineItems";

interface QuotationItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationData: any;
  currency?: string;
  treatments?: any[];
  rooms?: any[];
  surfaces?: any[];
  markupPercentage?: number;
}

export const QuotationItemsModal: React.FC<QuotationItemsModalProps> = ({
  isOpen,
  onClose,
  quotationData,
  currency = 'GBP',
  treatments = [],
  rooms = [],
  surfaces = [],
  markupPercentage = 25
}) => {
  const [showItemsEditor, setShowItemsEditor] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Quotation Items</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowItemsEditor(!showItemsEditor)}
            className="flex items-center space-x-2"
          >
            {showItemsEditor ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showItemsEditor ? 'Hide Items Editor' : 'Show Items Editor'}</span>
          </Button>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Items Editor (optional) */}
          {showItemsEditor && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Selected Treatments</CardTitle>
              </CardHeader>
              <CardContent>
                <TreatmentLineItems
                  treatments={treatments}
                  rooms={rooms}
                  surfaces={surfaces}
                  markupPercentage={markupPercentage}
                  onMarkupChange={() => {}} // Read-only in modal
                />
              </CardContent>
            </Card>
          )}

          {/* Detailed Quotation Table */}
          <DetailedQuotationTable 
            quotationData={quotationData}
            groupByRoom={true}
            showDetailedView={true}
            currency={currency}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};