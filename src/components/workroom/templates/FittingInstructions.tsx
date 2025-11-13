import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, CheckCircle2 } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { BeforeAfterPhotoUpload } from "../components/BeforeAfterPhotoUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface FittingInstructionsProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
}

export const FittingInstructions: React.FC<FittingInstructionsProps> = ({ 
  data, 
  orientation = 'portrait' 
}) => {
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [fittingDate, setFittingDate] = useState("");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  
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
  
  const toggleItemComplete = (itemId: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  return (
    <section aria-label="Fitting Instructions" className="space-y-6 p-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fitting Instructions</CardTitle>
          <div className="flex items-center gap-2 no-print">
            {hasOverrides && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
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
              <div className="font-medium">Order #</div>
              <div className="text-muted-foreground">{data.header.orderNumber ?? "—"}</div>
            </div>
            
            <div>
              <div className="font-medium">Client</div>
              <div className="text-muted-foreground">{data.header.clientName ?? "—"}</div>
            </div>
            
            <div>
              <div className="font-medium">Project</div>
              <div className="text-muted-foreground">{data.header.projectName ?? "—"}</div>
            </div>
            
            <div>
              <div className="font-medium">Due Date</div>
              <div className="text-muted-foreground">{data.header.dueDate ?? "—"}</div>
            </div>
            
            <div>
              <div className="font-medium">Fitting Date</div>
              {editing ? (
                <Input
                  type="date"
                  value={fittingDate}
                  onChange={(e) => setFittingDate(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="text-muted-foreground">{fittingDate || "—"}</div>
              )}
            </div>
            
            <div>
              <div className="font-medium">Assigned Fitter</div>
              {editing ? (
                <Input
                  value={getFieldValue('assignedMaker')}
                  onChange={(e) => handleFieldChange('assignedMaker', e.target.value)}
                  className="mt-1"
                  placeholder="Fitter name"
                />
              ) : (
                <div className="text-muted-foreground">{getFieldValue('assignedMaker') || "—"}</div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <div className="font-medium">Site Address</div>
              {editing ? (
                <Input
                  value={getFieldValue('shippingAddress')}
                  onChange={(e) => handleFieldChange('shippingAddress', e.target.value)}
                  className="mt-1"
                  placeholder="Fitting address"
                />
              ) : (
                <div className="text-muted-foreground">{getFieldValue('shippingAddress') || "—"}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Fitting Items by Room */}
      {data.rooms.map((room, roomIndex) => (
        <div key={roomIndex} className="space-y-4 break-after-page">
          <h2 className="text-xl font-bold">{room.roomName}</h2>
          
          {room.items.map((item, itemIndex) => {
            const isComplete = completedItems.has(item.id);
            const hardware = (item.fullness as any)?.hardware;
            
            return (
              <Card key={itemIndex} className={isComplete ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Checkbox
                        checked={isComplete}
                        onCheckedChange={() => toggleItemComplete(item.id)}
                        className="no-print"
                      />
                      {item.name} - {item.treatmentType}
                      {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Finished Measurements */}
                  <div>
                    <h4 className="font-semibold mb-2">Finished Measurements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Rail Width:</span><br />
                        {item.measurements?.width ?? "—"} {item.measurements?.unit}
                      </div>
                      <div>
                        <span className="font-medium">Drop:</span><br />
                        {item.measurements?.drop ?? "—"} {item.measurements?.unit}
                      </div>
                      <div>
                        <span className="font-medium">Pooling:</span><br />
                        {item.measurements?.pooling ?? 0} {item.measurements?.unit}
                      </div>
                      <div>
                        <span className="font-medium">Total Drop:</span><br />
                        {((item.measurements?.drop ?? 0) + (item.measurements?.pooling ?? 0)).toFixed(1)} {item.measurements?.unit}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hem Allowances */}
                  {item.hems && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Hem Allowances</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Header:</span> {item.hems.header} cm
                        </div>
                        <div>
                          <span className="font-medium">Bottom:</span> {item.hems.bottom} cm
                        </div>
                        <div>
                          <span className="font-medium">Side:</span> {item.hems.side} cm
                        </div>
                        {item.hems.seam && (
                          <div>
                            <span className="font-medium">Seam:</span> {item.hems.seam} cm
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Heading & Fullness */}
                  {item.fullness && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Heading & Fullness</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="secondary">
                          {item.fullness.headingType}
                        </Badge>
                        <Badge variant="outline">
                          Fullness: {item.fullness.ratio}x
                        </Badge>
                        {hardware && (
                          <Badge variant="outline">
                            Hardware: {hardware.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Fabric Details */}
                  {item.fabricDetails && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Fabric Details</h4>
                      <div className="flex gap-4 items-start">
                        {item.fabricDetails.imageUrl && (
                          <img 
                            src={item.fabricDetails.imageUrl} 
                            alt={item.fabricDetails.name}
                            className="w-20 h-20 object-cover rounded border print-image"
                          />
                        )}
                        <div className="text-sm space-y-1 flex-1">
                          <div><span className="font-medium">Fabric:</span> {item.fabricDetails.name}</div>
                          <div><span className="font-medium">Width:</span> {item.fabricDetails.fabricWidth} cm</div>
                          {item.fabricDetails.rollDirection && (
                            <div><span className="font-medium">Roll Direction:</span> {item.fabricDetails.rollDirection}</div>
                          )}
                          {item.fabricDetails.patternRepeat && (
                            <div><span className="font-medium">Pattern Repeat:</span> {item.fabricDetails.patternRepeat} cm</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Lining Details */}
                  {item.liningDetails && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Lining</h4>
                      <div className="text-sm">
                        <Badge>{item.liningDetails.type}</Badge>
                        {item.liningDetails.name && item.liningDetails.name !== item.liningDetails.type && (
                          <span className="ml-2">{item.liningDetails.name}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Fabric Usage */}
                  {item.fabricUsage && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Fabric Usage</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Linear Meters:</span><br />
                          {item.fabricUsage.linearMeters.toFixed(2)} m
                        </div>
                        <div>
                          <span className="font-medium">Widths Required:</span><br />
                          {item.fabricUsage.widthsRequired}
                        </div>
                        <div>
                          <span className="font-medium">Seams:</span><br />
                          {item.fabricUsage.seamsRequired}
                        </div>
                        {item.fabricUsage.leftover && item.fabricUsage.leftover > 0 && (
                          <div>
                            <span className="font-medium">Leftover:</span><br />
                            {item.fabricUsage.leftover.toFixed(1)} cm
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Fitting Notes */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Fitting Checklist</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>Steam curtains to remove creases</li>
                      <li>Verify hardware is secure and level</li>
                      <li>Check pooling measurement on floor</li>
                      <li>Ensure seams are aligned and hidden</li>
                      <li>Verify lining hangs evenly</li>
                      <li>Test opening and closing mechanism</li>
                    </ul>
                  </div>
                  
                  {item.notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Special Instructions</h4>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                  
                  {/* Photo Upload Sections */}
                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BeforeAfterPhotoUpload
                      itemId={`fitting-${item.id}`}
                      stage="before"
                      label="Before Fitting (Laid Out)"
                    />
                    <BeforeAfterPhotoUpload
                      itemId={`fitting-${item.id}`}
                      stage="after"
                      label="After Fitting (Installed)"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
      
      {/* Footer */}
      <Card className="mt-6 no-print">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground text-center">
            Fitting progress: {completedItems.size} / {data.rooms.reduce((acc, room) => acc + room.items.length, 0)} items completed
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
