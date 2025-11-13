import React from "react";
import type { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./WorkshopInformation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisualSnapshot } from "../VisualSnapshot";

interface CombinedWorkshopInfoProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
}

export const CombinedWorkshopInfo: React.FC<CombinedWorkshopInfoProps> = ({ data, orientation = 'portrait' }) => {
  return (
    <div className="space-y-6">
      {/* Keep the original workshop information exactly as-is */}
      <WorkshopInformation data={data} orientation={orientation} />

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
                    <Card key={item.id} className="panel overflow-hidden">
                      {/* Header with item name and treatment type */}
                      <div className="bg-muted/30 px-3 py-2 border-b">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold">
                              {item.name || "Window"} {item.quantity && item.quantity > 1 ? `× ${item.quantity}` : ""}
                            </div>
                            {item.treatmentType && (
                              <div className="text-xs font-medium text-primary mt-0.5">
                                {item.treatmentType}
                              </div>
                            )}
                          </div>
                          {item.fabricDetails?.imageUrl && (
                            <img 
                              src={item.fabricDetails.imageUrl}
                              alt={item.fabricDetails.name || "Fabric"}
                              className="w-10 h-10 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>

                      {/* Visual snapshot */}
                      <div className="p-3">
                        <VisualSnapshot item={item} />
                      </div>

                      {/* Details footer */}
                      <div className="px-3 pb-3 space-y-1">
                        {item.fabricDetails?.name && (
                          <div className="text-xs font-medium text-foreground">
                            {item.fabricDetails.name}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {item.measurements?.width && item.measurements?.height ? (
                            <span>
                              {item.measurements.width} × {item.measurements.height}{" "}
                              {item.measurements.unit || "cm"}
                            </span>
                          ) : (
                            <span>No measurements</span>
                          )}
                        </div>
                        {item.fabricUsage && (
                          <div className="text-xs text-muted-foreground">
                            Fabric: {item.fabricUsage.linearMeters}m ({item.fabricUsage.widthsRequired} width{item.fabricUsage.widthsRequired > 1 ? 's' : ''})
                          </div>
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
