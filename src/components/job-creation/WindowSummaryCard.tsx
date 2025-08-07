import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useWindowSummary } from "@/hooks/useWindowSummary";

interface WindowSummaryCardProps {
  surface: any;
  onEditSurface?: (surface: any) => void;
  onDeleteSurface?: (id: string) => void;
  onViewDetails?: (surface: any) => void;
}

function formatCurrency(amount: number, currency: string = 'GBP') {
  return `${currency === 'GBP' ? '£' : '$'}${amount.toFixed(2)}`;
}

function SummaryItem({ title, main, sub }: { title: string; main: string; sub?: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="font-semibold">{main}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function WindowSummaryCard({ surface, onEditSurface, onDeleteSurface, onViewDetails }: WindowSummaryCardProps) {
  // Use surface.id directly as the window_id - single source of truth
  const windowId = surface.id;
  const { data: summary, isLoading, error } = useWindowSummary(windowId);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{surface.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Type: {surface.type} | Room: {surface.room_name}
            </p>
            {surface.width && surface.height && (
              <p className="text-sm text-muted-foreground">
                Dimensions: {surface.width} × {surface.height} cm
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditSurface?.(surface)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteSurface?.(surface.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && <div>Loading summary...</div>}
        
        {error && (
          <div className="text-destructive text-sm">
            Error loading summary: {error.message}
          </div>
        )}

        {!summary && !isLoading && !error && (
          <div className="text-muted-foreground text-sm">
            No pricing data available. Open worksheet to calculate costs.
          </div>
        )}

        {summary && (
          <div className="rounded-lg border p-4">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(summary.total_cost, summary.currency)}
                </div>
                <div className="text-xs">
                  {summary.pricing_type} • waste {summary.waste_percent ?? 0}%
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails?.(surface)}
              >
                View details
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <SummaryItem
                title="Fabric"
                main={formatCurrency(summary.fabric_cost, summary.currency)}
                sub={`${Number(summary.linear_meters).toFixed(2)}m • ${summary.widths_required} width(s) • ${formatCurrency(summary.price_per_meter, summary.currency)}/m`}
              />
              
              {Number(summary.lining_cost) > 0 && (
                <SummaryItem
                  title="Lining"
                  main={formatCurrency(summary.lining_cost, summary.currency)}
                  sub={summary.lining_type}
                />
              )}
              
              <SummaryItem
                title="Manufacturing"
                main={formatCurrency(summary.manufacturing_cost, summary.currency)}
                sub={summary.manufacturing_type}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}