import React from "react";
import type { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./WorkshopInformation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisualSnapshot } from "../VisualSnapshot";

interface CombinedWorkshopInfoProps {
  data: WorkshopData;
}

export const CombinedWorkshopInfo: React.FC<CombinedWorkshopInfoProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Keep the original workshop information exactly as-is */}
      <WorkshopInformation data={data} />

      {/* Visual previews section */}
      <section className="break-inside-avoid">
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Visual Previews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.rooms.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">{section.roomName}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <Card key={item.id} className="panel p-3">
                      <div className="text-sm font-medium mb-2">
                        {item.name || "Window"} {item.quantity && item.quantity > 1 ? `× ${item.quantity}` : ""}
                      </div>
                      <VisualSnapshot item={item} />
                      <div className="mt-2 text-xs text-muted-foreground">
                        {item.measurements?.width && item.measurements?.height ? (
                          <span>
                            {item.measurements.width} × {item.measurements.height}{" "}
                            {item.measurements.unit || ""}
                          </span>
                        ) : (
                          <span>No measurements</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
