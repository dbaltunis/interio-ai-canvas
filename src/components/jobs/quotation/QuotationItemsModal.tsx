import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DetailedQuotationTable } from "./DetailedQuotationTable";

interface QuotationItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationData: any;
  currency?: string;
}

export const QuotationItemsModal: React.FC<QuotationItemsModalProps> = ({
  isOpen,
  onClose,
  quotationData,
  currency = 'GBP'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation Items</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
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