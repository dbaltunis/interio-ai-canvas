import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, CheckCircle2, Save, CheckCircle } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { BeforeAfterPhotoUpload } from "../components/BeforeAfterPhotoUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useWorkshopNotes } from "@/hooks/useWorkshopNotes";

interface FittingInstructionsProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
  projectId?: string;
}

export const FittingInstructions: React.FC<FittingInstructionsProps> = ({ 
  data, 
  orientation = 'portrait',
  projectId
}) => {
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [fittingDate, setFittingDate] = useState("");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Integrate workshop notes hook
  const {
    productionNotes,
    itemNotes,
    setProductionNotes,
    setItemNote,
    saveNotes,
    isLoading: notesLoading,
    isSaving
  } = useWorkshopNotes(projectId);
  
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
  
  const handleSaveNotes = async () => {
    try {
      await saveNotes();
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
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
            {lastSaved && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
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
              variant="default"
              size="sm"
              onClick={handleSaveNotes}
              disabled={isSaving || !projectId}
              className="h-8"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
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
      
      {/* Pre-Fitting Checklist */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Pre-Fitting Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>All items steamed and pressed</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Hardware installed and secure</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Seams aligned and pressed</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Hems measured and straight</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Lining hangs evenly</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Client present for final approval</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitting Items by Room */}
      {data.rooms.map((room, roomIndex) => (
        <div key={roomIndex} className="space-y-4 workshop-room-section">
          <h2 className="text-xl font-bold border-l-4 border-purple-600 pl-3">{room.roomName}</h2>
          
          {room.items.map((item, itemIndex) => {
            const isComplete = completedItems.has(item.id);
            const hardware = (item.fullness as any)?.hardware;
            
            return (
              <Card key={itemIndex} className={`workshop-item-card avoid-page-break ${isComplete ? "border-green-500" : ""}`}>
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
                  
                  {/* Fabric Details with Direction Indicators */}
                  {item.fabricDetails && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-purple-800">🧵 Fabric Information</h4>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="flex gap-4 items-start">
                          {item.fabricDetails.imageUrl && (
                            <div className="relative">
                              <img 
                                src={item.fabricDetails.imageUrl} 
                                alt={item.fabricDetails.name}
                                className="w-24 h-24 object-cover rounded border-2 border-purple-200 print-image"
                              />
                              {item.fabricDetails.rollDirection && (
                                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold">
                                  {item.fabricDetails.rollDirection === 'vertical' ? '↕️' : '↔️'} {item.fabricDetails.rollDirection}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-sm space-y-2 flex-1">
                            <div className="font-medium text-base">{item.fabricDetails.name}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><span className="font-medium">Width:</span> {item.fabricDetails.fabricWidth} cm</div>
                              {item.fabricDetails.patternRepeat && (
                                <div><span className="font-medium">Pattern:</span> {item.fabricDetails.patternRepeat} cm repeat</div>
                              )}
                            </div>
                            {item.fabricDetails.rollDirection && (
                              <div className="bg-yellow-100 p-2 rounded text-xs mt-2">
                                <span className="font-bold">⚠️ Direction:</span> Fabric runs {item.fabricDetails.rollDirection} - ensure seams match pattern!
                              </div>
                            )}
                          </div>
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
                  
                  {/* On-Site Fitting Checklist */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 text-green-800">✓ On-Site Fitting Checklist</h4>
                    <div className="bg-green-50 p-3 rounded space-y-2">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Steam Treatment:</span> Remove all transport creases with steamer
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Hardware Check:</span> Verify rails/tracks are secure and level
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Drop Measurement:</span> Check pooling matches specification ({item.measurements?.pooling || 0}{item.measurements?.unit})
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Seam Alignment:</span> Ensure all seams match pattern and are hidden in folds
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Lining Check:</span> Verify lining hangs straight and doesn't show from front
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Function Test:</span> Test opening/closing - should glide smoothly
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded">
                          <Checkbox className="mt-0.5" />
                          <div>
                            <span className="font-medium">Client Approval:</span> Walk through with client before leaving
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Special Instructions */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Special Instructions</h4>
                    <Textarea 
                      placeholder="Add special fitting instructions..."
                      className="text-sm min-h-[60px]"
                      value={itemNotes[item.id] || ""}
                      onChange={(e) => setItemNote(item.id, e.target.value)}
                    />
                  </div>
                  
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
