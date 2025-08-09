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
              <React.Fragment key={item.id}>
                <TableRow>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.measurements?.width && item.measurements?.height
                      ? `${item.measurements.width} × ${item.measurements.height} ${item.measurements.unit ?? ''}`
                      : "—"}
                  </TableCell>
                  <TableCell>{item.treatmentType ?? "—"}</TableCell>
                  <TableCell className="text-right">{item.quantity ?? 1}</TableCell>
                </TableRow>
                {item.summary && (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-muted/20 p-3">
                      <CalculationBreakdown
                        summary={item.summary}
                        surface={item.surface}
                        compact
                        costBreakdown={Array.isArray(item.summary?.cost_breakdown) ? item.summary.cost_breakdown : []}
                        currency={item.summary?.currency}
                        totalCost={item.summary?.total_cost}
                        embedded
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
