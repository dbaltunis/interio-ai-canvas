import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkshopRoomSection } from "@/hooks/useWorkshopData";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";

interface RoomSectionProps {
  section: WorkshopRoomSection;
}

export const RoomSection: React.FC<RoomSectionProps> = ({ section }) => {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle>{section.roomName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Left: Items list */}
          <div className="md:col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Measurements</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.measurements?.width && item.measurements?.height
                        ? `${item.measurements.width} × ${item.measurements.height} ${item.measurements.unit ?? ''}`
                        : "—"}
                    </TableCell>
                    <TableCell>{item.treatmentType ?? "—"}</TableCell>
                    <TableCell className="text-right">{item.quantity ?? 1}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Right: Compact worksheet visuals */}
          <aside className="space-y-3">
            {section.items.filter((it) => !!it.summary).map((item) => (
              <div key={`${item.id}-visual`} className="rounded-md border p-3 bg-muted/20">
                <div className="text-sm font-medium mb-2">{item.name}</div>
                <CalculationBreakdown
                  summary={item.summary}
                  surface={item.surface}
                  compact
                  costBreakdown={Array.isArray(item.summary?.cost_breakdown) ? item.summary.cost_breakdown : []}
                  currency={item.summary?.currency}
                  totalCost={item.summary?.total_cost}
                  embedded
                />
              </div>
            ))}
            {section.items.filter((it) => !!it.summary).length === 0 && (
              <div className="text-sm text-muted-foreground">No worksheet data saved yet for this room.</div>
            )}
          </aside>
        </div>
      </CardContent>
    </Card>
  );
};
