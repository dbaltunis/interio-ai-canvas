import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkshopRoomSection } from "@/hooks/useWorkshopData";

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
      </CardContent>
    </Card>
  );
};
