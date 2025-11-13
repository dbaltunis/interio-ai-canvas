import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { MaterialsTable } from "../sections/MaterialsTable";
import { RoomSection } from "../sections/RoomSection";
import { WorkshopInformationLandscape } from "./WorkshopInformationLandscape";

interface WorkshopInformationProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
}

export const WorkshopInformation: React.FC<WorkshopInformationProps> = ({ data, orientation = 'portrait' }) => {
  // Use landscape layout for landscape orientation
  if (orientation === 'landscape') {
    return <WorkshopInformationLandscape data={data} />;
  }

  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  
  const hasOverrides = Object.keys(overrides).length > 0;
  
  const getFieldValue = (field: keyof typeof data.header) => {
    return overrides[field] ?? data.header[field] ?? "";
  };
  
  const handleFieldChange = (field: keyof typeof data.header, value: string) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };
  
  const handleReset = () => {
    setOverrides({});
  };
  
  const EditableField: React.FC<{
    label: string;
    field: keyof typeof data.header;
    multiline?: boolean;
  }> = ({ label, field, multiline }) => {
    const value = getFieldValue(field);
    const isOverridden = field in overrides;
    
    return (
      <div className={multiline ? "md:col-span-2" : ""}>
        <div className="font-medium flex items-center gap-2">
          {label}
          {isOverridden && (
            <span className="h-2 w-2 rounded-full bg-primary" title="Modified from default" />
          )}
        </div>
        {editing ? (
          multiline ? (
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="mt-1 min-h-[80px]"
              placeholder={data.header[field] || "—"}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="mt-1"
              placeholder={data.header[field] || "—"}
            />
          )
        ) : (
          <div className="text-muted-foreground mt-1">{value || "—"}</div>
        )}
      </div>
    );
  };
  
  return (
    <section aria-label="Workshop Information" className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Workshop Information</CardTitle>
          <div className="flex items-center gap-2">
            {hasOverrides && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset to defaults
              </Button>
            )}
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              onClick={() => setEditing(!editing)}
              className="h-8"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              {editing ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Project</div>
              <div className="text-muted-foreground">{data.header.projectName ?? "—"}</div>
            </div>
            <EditableField label="Client" field="clientName" />
            <EditableField label="Order #" field="orderNumber" />
            <EditableField label="Created" field="createdDate" />
            <EditableField label="Due Date" field="dueDate" />
            <EditableField label="Assigned Maker" field="assignedMaker" />
            <EditableField label="Shipping Address" field="shippingAddress" multiline />
          </div>
        </CardContent>
      </Card>

      <MaterialsTable data={data} />

      {/* Enhanced Work Order Items */}
      <div className="space-y-4">
        {data.rooms.map((room, roomIdx) => (
          <div key={roomIdx} className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">{room.roomName}</h3>
            {room.items.map((item) => (
              <Card key={item.id} className="workshop-item-card border-2">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.location}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.treatmentType || 'No treatment specified'}
                      </div>
                    </div>
                    {item.visualDetails?.thumbnailUrl && (
                      <img 
                        src={item.visualDetails.thumbnailUrl}
                        alt="Fabric"
                        className="w-16 h-16 object-cover rounded border-2 ml-3"
                      />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-4">
                  {/* Fabric Details Section */}
                  {item.fabricDetails && (
                    <div>
                      <h4 className="text-sm font-bold text-blue-700 mb-2">FABRIC DETAILS</h4>
                      <div className="text-xs space-y-1">
                        <div className="font-medium">{item.fabricDetails.name}</div>
                        <div className="text-muted-foreground">
                          Fabric Width: {item.fabricDetails.fabricWidth}cm | 
                          Roll Direction: {item.fabricDetails.rollDirection}
                        </div>
                        {item.fabricDetails.patternRepeat && (
                          <div>Pattern Repeat: {item.fabricDetails.patternRepeat}cm</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Fabric Usage Section */}
                  {item.fabricUsage && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <h4 className="text-sm font-bold text-green-800 mb-2">FABRIC USAGE</h4>
                      <div className="text-xs space-y-1">
                        <div className="font-medium text-green-700">
                          Total: {item.fabricUsage.linearMeters.toFixed(2)}m ({item.fabricUsage.linearYards.toFixed(1)} yards)
                        </div>
                        <div>
                          Widths Required: {item.fabricUsage.widthsRequired} | 
                          Seams: {item.fabricUsage.seamsRequired}
                        </div>
                        {item.fabricUsage.leftover > 0 && (
                          <div className="text-muted-foreground">
                            Leftover: ~{item.fabricUsage.leftover.toFixed(1)}cm per width
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Measurements Section */}
                  {item.measurements && (
                    <div>
                      <h4 className="text-sm font-bold mb-2">MEASUREMENTS</h4>
                      <div className="text-xs font-mono space-y-1">
                        {item.measurements.width && (
                          <div>Rail Width: {item.measurements.width}{item.measurements.unit}</div>
                        )}
                        {item.measurements.drop && (
                          <div>Drop: {item.measurements.drop}{item.measurements.unit}</div>
                        )}
                        {item.measurements.pooling && item.measurements.pooling > 0 && (
                          <div>Pooling: {item.measurements.pooling}{item.measurements.unit}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Sewing Specifications */}
                  {(item.fullness || item.hems) && (
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <h4 className="text-sm font-bold text-purple-800 mb-2">SEWING SPECIFICATIONS</h4>
                      <div className="text-xs space-y-1">
                        {item.fullness && (
                          <div className="font-medium">
                            Fullness: {item.fullness.ratio}x ({item.fullness.headingType})
                          </div>
                        )}
                        {item.hems && (
                          <div className="space-y-0.5 mt-2">
                            <div>Header Hem: {item.hems.header}cm | Bottom Hem: {item.hems.bottom}cm</div>
                            <div>Side Hems: {item.hems.side}cm each</div>
                            {item.fabricUsage && item.fabricUsage.seamsRequired > 0 && (
                              <div className="text-orange-700 font-medium">
                                Seam Allowance: {item.hems.seam}cm per join (×{item.fabricUsage.seamsRequired} seams)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Options & Extras */}
                  {item.options && item.options.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold mb-2">OPTIONS & EXTRAS</h4>
                      <ul className="text-xs space-y-1">
                        {item.options.map((opt, idx) => (
                          <li key={idx}>• {opt.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Lining */}
                  {item.liningDetails && (
                    <div>
                      <h4 className="text-sm font-bold mb-2">LINING</h4>
                      <div className="text-xs">
                        Type: {item.liningDetails.name}
                      </div>
                    </div>
                  )}
                  
                  {/* Production Notes */}
                  <div className="border-t pt-3">
                    <h4 className="text-xs font-bold mb-1">PRODUCTION NOTES</h4>
                    <Textarea 
                      placeholder="Add any special instructions..."
                      className="text-xs min-h-[50px]"
                      defaultValue={item.notes}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
