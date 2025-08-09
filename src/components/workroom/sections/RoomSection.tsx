import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopRoomSection } from "@/hooks/useWorkshopData";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";

interface RoomSectionProps {
  section: WorkshopRoomSection;
}

const Visual: React.FC<{ width?: number; height?: number; unit?: string }> = ({ width, height, unit }) => {
  const hasDims = width !== undefined && height !== undefined;
  return (
    <div className="relative h-28 rounded-md border border-border bg-muted/30">
      <div className="absolute inset-3 border-2 border-dashed border-muted-foreground/40 rounded-sm" />
      <div className="absolute top-1 left-1 right-1 text-center text-[10px] text-muted-foreground">
        {hasDims ? `${width} × ${height} ${unit ?? ''}` : 'No dimensions'}
      </div>
      {height !== undefined && (
        <div className="absolute top-1/2 -translate-y-1/2 right-1 text-[10px] text-muted-foreground">
          {`${height} ${unit ?? ''}`}
        </div>
      )}
    </div>
  );
};

export const RoomSection: React.FC<RoomSectionProps> = ({ section }) => {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle>{section.roomName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {section.items.map((item) => (
            <div key={item.id} className="rounded-md border p-3 bg-background">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Left: Visual */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">{item.name}</div>
                  <Visual
                    width={item.measurements?.width}
                    height={item.measurements?.height}
                    unit={item.measurements?.unit}
                  />
                  <div className="text-xs text-muted-foreground">
                    {item.treatmentType ?? '—'} • Qty: {item.quantity ?? 1}
                  </div>
                </div>

                {/* Right: All measurements & breakdown */}
                <div className="md:col-span-2">
                  {item.summary ? (
                    <CalculationBreakdown
                      summary={item.summary}
                      surface={item.surface}
                      compact
                      costBreakdown={Array.isArray(item.summary?.cost_breakdown) ? item.summary.cost_breakdown : []}
                      currency={item.summary?.currency}
                      totalCost={item.summary?.total_cost}
                      embedded
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">No worksheet data saved yet.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
