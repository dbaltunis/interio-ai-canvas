
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";
import { formatCurrency } from "@/utils/unitConversion";

interface WorkshopSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: any;
  surface: any;
  breakdown?: any[];
  currency?: string;
}

export const WorkshopSendDialog: React.FC<WorkshopSendDialogProps> = ({
  open,
  onOpenChange,
  summary,
  surface,
  breakdown = [],
  currency
}) => {
  if (!summary) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalCost = typeof summary.total_cost === "number" ? summary.total_cost : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl print:max-w-none print:w-full">
        <DialogHeader>
          <DialogTitle>Workshop Sheet</DialogTitle>
          <DialogDescription>
            This document contains the exact, dynamic measurements and calculations for manufacturing.
          </DialogDescription>
        </DialogHeader>

        {/* Header summary for quick identification */}
        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Window / Treatment</div>
              <div className="text-lg font-semibold">{surface?.name || "Treatment"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Type: {surface?.type || "—"} {surface?.room_name ? `• Room: ${surface.room_name}` : ""}
              </div>
              {(surface?.width && surface?.height) && (
                <div className="text-xs text-muted-foreground">
                  Dimensions: {surface.width} × {surface.height} cm
                </div>
              )}
            </div>
            <div className="text-right min-w-[200px]">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(summary.total_cost, summary.currency || currency)}
              </div>
              <div className="flex flex-wrap justify-end gap-2 mt-2">
                {summary?.manufacturing_type && (
                  <Badge variant="outline" className="text-xs">
                    {summary.manufacturing_type}
                  </Badge>
                )}
                {typeof summary?.widths_required === "number" && (
                  <Badge variant="secondary" className="text-xs">
                    Widths: {summary.widths_required}
                  </Badge>
                )}
                {typeof summary?.linear_meters === "number" && summary.linear_meters > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Linear: {Number(summary.linear_meters).toFixed(2)}m
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed calculation and cost breakdown (includes leftovers display) */}
        <CalculationBreakdown
          summary={summary}
          surface={surface}
          compact
          costBreakdown={breakdown}
          currency={summary.currency || currency}
          totalCost={totalCost}
          embedded
        />

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="text-xs text-muted-foreground">
            Generated from the latest saved worksheet values. Please review leftovers and seams before cutting.
          </div>
          <div className="no-print flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={handlePrint}>Print</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkshopSendDialog;
