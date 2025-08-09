import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkshopData } from "@/hooks/useWorkshopData";

interface MaterialsTableProps {
  data: WorkshopData;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({ data }) => {
  // MVP summary: show count per room as placeholder for materials aggregation
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary by Room</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead className="text-right">Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rooms.map((room) => (
              <TableRow key={room.roomName}>
                <TableCell>{room.roomName}</TableCell>
                <TableCell className="text-right">{room.totals?.count ?? room.items.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
