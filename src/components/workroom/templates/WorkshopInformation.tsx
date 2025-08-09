import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { MaterialsTable } from "../sections/MaterialsTable";
import { RoomSection } from "../sections/RoomSection";

interface WorkshopInformationProps {
  data: WorkshopData;
}

export const WorkshopInformation: React.FC<WorkshopInformationProps> = ({ data }) => {
  return (
    <section aria-label="Workshop Information" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workshop Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Project</div>
              <div className="text-muted-foreground">{data.header.projectName ?? "—"}</div>
            </div>
            <div>
              <div className="font-medium">Client</div>
              <div className="text-muted-foreground">{data.header.clientName ?? "—"}</div>
            </div>
            <div>
              <div className="font-medium">Order #</div>
              <div className="text-muted-foreground">{data.header.orderNumber ?? "—"}</div>
            </div>
            <div>
              <div className="font-medium">Created</div>
              <div className="text-muted-foreground">{data.header.createdDate ?? "—"}</div>
            </div>
            <div>
              <div className="font-medium">Due</div>
              <div className="text-muted-foreground">{data.header.dueDate ?? "—"}</div>
            </div>
            <div>
              <div className="font-medium">Assigned Maker</div>
              <div className="text-muted-foreground">{data.header.assignedMaker ?? "—"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="font-medium">Shipping Address</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{data.header.shippingAddress ?? "—"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MaterialsTable data={data} />

      <div className="space-y-4">
        {data.rooms.map((section) => (
          <RoomSection key={section.roomName} section={section} />)
        )}
      </div>
    </section>
  );
};
