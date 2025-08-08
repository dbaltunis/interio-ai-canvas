
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, PlusCircle } from "lucide-react";

interface TreatmentListPanelProps {
  treatments: any[];
  currency?: string;
  onAdd: () => void;
  onEdit: (treatment: any) => void;
}

const formatCurrency = (amount: number, currency?: string) => {
  if (isNaN(amount)) return "-";
  const symbols: Record<string, string> = {
    NZD: "NZ$",
    AUD: "A$",
    USD: "$",
    GBP: "£",
    EUR: "€",
    ZAR: "R",
  };
  return `${symbols[currency || ""] || ""}${amount.toFixed(2)}`;
};

export const TreatmentListPanel = ({
  treatments = [],
  currency,
  onAdd,
  onEdit,
}: TreatmentListPanelProps) => {
  return (
    <Card className="w-full rounded-2xl border border-brand-secondary/30">
      <CardHeader className="flex items-center justify-between space-y-0">
        <div className="w-full flex items-center justify-between">
          <CardTitle className="text-lg">Treatments for this window</CardTitle>
          <Button size="sm" onClick={onAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Treatment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {treatments.length === 0 && (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No treatments yet. Click “Add Treatment” to create one.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {treatments.map((treatment, idx) => {
            const name = treatment.product_name || treatment.treatment_type || `Treatment ${idx + 1}`;
            const qty = treatment.quantity || 1;
            const unitPrice = treatment.unit_price || (treatment.total_price && qty ? treatment.total_price / qty : 0);
            const total = treatment.total_price || 0;
            const meta = [
              treatment.window_covering?.name,
              (treatment.measurements?.rail_width && treatment.measurements?.drop) ? `${treatment.measurements.rail_width} × ${treatment.measurements.drop}` : null,
              qty ? `Qty ${qty}` : null
            ].filter(Boolean).join(" • ");

            return (
              <div
                key={treatment.id || `${name}-${idx}`}
                className="rounded-xl border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{name}</div>
                    {meta && <div className="text-xs text-muted-foreground mt-0.5">{meta}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{formatCurrency(unitPrice, currency)} ea</Badge>
                    <Badge>{formatCurrency(total, currency)} total</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-3">
                  <Button variant="outline" size="sm" onClick={() => onEdit(treatment)} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
