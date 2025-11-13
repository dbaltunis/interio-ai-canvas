import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, CheckCircle2 } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { BeforeAfterPhotoUpload } from "../components/BeforeAfterPhotoUpload";
import { Checkbox } from "@/components/ui/checkbox";

interface InstallationInstructionsProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
}

export const InstallationInstructions: React.FC<InstallationInstructionsProps> = ({ 
  data, 
  orientation = 'portrait' 
}) => {
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [installationDate, setInstallationDate] = useState("");
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
    <section aria-label="Installation Instructions" className="space-y-6 p-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Installation Instructions</CardTitle>
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
              <div className="font-medium">Installation Date</div>
              {editing ? (
                <Input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="text-muted-foreground">{installationDate || "—"}</div>
              )}
            </div>
            
            <div>
              <div className="font-medium">Assigned Installer</div>
              {editing ? (
                <Input
                  value={getFieldValue('assignedMaker')}
                  onChange={(e) => handleFieldChange('assignedMaker', e.target.value)}
                  className="mt-1"
                  placeholder="Installer name"
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
                  placeholder="Installation address"
                />
              ) : (
                <div className="text-muted-foreground">{getFieldValue('shippingAddress') || "—"}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Installation Items by Room */}
      {data.rooms.map((room, roomIndex) => (
        <div key={roomIndex} className="space-y-4 break-after-page">
          <h2 className="text-xl font-bold">{room.roomName}</h2>
          
          {room.items.map((item, itemIndex) => {
            const isComplete = completedItems.has(item.id);
            const hardware = (item.fullness as any)?.hardware;
            const accessories = item.options?.filter(opt => 
              opt.optionKey.includes('tieback') || 
              opt.optionKey.includes('bracket') || 
              opt.optionKey.includes('hook')
            ) || [];
            
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
                  {/* Measurements */}
                  <div>
                    <h4 className="font-semibold mb-2">Measurements</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Width: {item.measurements?.width ?? "—"} {item.measurements?.unit}</div>
                      <div>Height/Drop: {item.measurements?.drop ?? item.measurements?.height ?? "—"} {item.measurements?.unit}</div>
                    </div>
                  </div>
                  
                  {/* Hardware Installation */}
                  {hardware && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Hardware Installation</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {hardware.type || "—"}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {hardware.quantity || "—"}
                        </div>
                        <div>
                          <span className="font-medium">Spacing:</span> {hardware.spacing || "—"} cm
                        </div>
                        <div>
                          <span className="font-medium">Diameter:</span> {hardware.diameter || "—"} mm
                        </div>
                        {hardware.color && (
                          <div className="col-span-2">
                            <span className="font-medium">Finish:</span> {hardware.color}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Accessories */}
                  {accessories.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Accessories to Install</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {accessories.map((acc, idx) => (
                          <li key={idx}>
                            {acc.name} {acc.quantity && acc.quantity > 1 ? `(x${acc.quantity})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Installation Notes */}
                  {item.notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Installation Notes</h4>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                  
                  {/* Photo Upload Sections */}
                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BeforeAfterPhotoUpload
                      itemId={item.id}
                      stage="before"
                      label="Before Installation"
                    />
                    <BeforeAfterPhotoUpload
                      itemId={item.id}
                      stage="after"
                      label="After Installation"
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
            Complete installation checklist: {completedItems.size} / {data.rooms.reduce((acc, room) => acc + room.items.length, 0)} items
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
