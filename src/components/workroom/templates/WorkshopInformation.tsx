import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, Save, CheckCircle } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { MaterialsTable } from "../sections/MaterialsTable";
import { RoomSection } from "../sections/RoomSection";
import { WorkshopInformationLandscape } from "./WorkshopInformationLandscape";
import { useWorkshopNotes } from "@/hooks/useWorkshopNotes";

interface WorkshopInformationProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
  projectId?: string;
  isPrintMode?: boolean;
  isReadOnly?: boolean;
  sessionToken?: string;
}

export const WorkshopInformation: React.FC<WorkshopInformationProps> = ({ data, orientation = 'portrait', projectId, isPrintMode = false, isReadOnly = false, sessionToken }) => {
  // Use landscape layout for landscape orientation
  if (orientation === 'landscape') {
    return <WorkshopInformationLandscape data={data} projectId={projectId} isPrintMode={isPrintMode} isReadOnly={isReadOnly} sessionToken={sessionToken} />;
  }

  console.log('🔍 [WorkshopInformation] projectId:', projectId, 'sessionToken:', !!sessionToken);

  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Integrate workshop notes hook with session token for public page saves
  const {
    productionNotes,
    itemNotes,
    setProductionNotes,
    setItemNote,
    saveNotes,
    isLoading: notesLoading,
    isSaving
  } = useWorkshopNotes(projectId, { sessionToken });
  
  console.log('🔍 [WorkshopInformation] Notes state:', { 
    hasProjectId: !!projectId,
    productionNotesLength: productionNotes.length,
    itemNotesCount: Object.keys(itemNotes).length,
    isSaving 
  });
  
  const hasOverrides = Object.keys(overrides).length > 0;
  const hasUnsavedNotes = productionNotes !== "" || Object.keys(itemNotes).length > 0;
  
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
    console.log('🔍 [WorkshopInformation] Save button clicked', { projectId, itemNotesCount: Object.keys(itemNotes).length });
    try {
      await saveNotes();
      setLastSaved(new Date());
      console.log('✅ [WorkshopInformation] Notes saved successfully');
    } catch (error) {
      console.error("❌ [WorkshopInformation] Failed to save notes:", error);
    }
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
    <section aria-label="Workshop Information" className="space-y-4">
      {/* Header Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Workshop Information</CardTitle>
          {!isPrintMode && (
            <div className="flex items-center gap-2 no-print">
              {lastSaved && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="h-8"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {editing ? "Done" : "Edit"}
                </Button>
              )}
              {editing && hasOverrides && (
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
                disabled={isSaving || !projectId || isReadOnly}
                className="h-8"
                title={!projectId ? "Project ID required to save notes" : isReadOnly ? "You don't have permission to edit" : "Save all notes"}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <EditableField label="Order #:" field="orderNumber" />
            <EditableField label="Client:" field="clientName" />
            <EditableField label="Project:" field="projectName" />
            <EditableField label="Due Date:" field="dueDate" />
            <EditableField label="Created:" field="createdDate" />
            <EditableField label="Maker:" field="assignedMaker" />
          </div>
        </CardContent>
      </Card>

      {/* Production Notes */}
      {projectId && (
        <Card className="bg-yellow-50/50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📝 Production Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {isPrintMode ? (
              <div className="text-sm whitespace-pre-wrap min-h-[80px] p-3 bg-white rounded border">
                {productionNotes || "No production notes"}
              </div>
            ) : (
              <Textarea 
                placeholder="Add general production instructions for this order..."
                className="text-sm min-h-[80px] bg-white"
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                disabled={isReadOnly}
              />
            )}
          </CardContent>
        </Card>
      )}

      <MaterialsTable data={data} />

      {/* Work Order Items - Table Format */}
      <div className="space-y-4">
        {data.rooms.map((room, roomIdx) => (
          <div key={roomIdx} className="space-y-2 workshop-room-section avoid-page-break">
            <h3 className="text-base font-bold bg-muted px-3 py-2 rounded">{room.roomName}</h3>
            
            {/* Table Header */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-semibold border-r">Item</th>
                    <th className="text-left p-2 font-semibold border-r">Fabric & Specs</th>
                    <th className="text-left p-2 font-semibold border-r">Measurements</th>
                    <th className="text-left p-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {room.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      {/* Item Column */}
                      <td className="p-2 border-r align-top w-[20%]">
                        <div className="font-medium mb-1">{item.location}</div>
                        <div className="text-[10px] text-muted-foreground mb-2">
                          {item.treatmentType || 'No treatment'}
                        </div>
                        {item.visualDetails?.thumbnailUrl && (
                          <img 
                            src={item.visualDetails.thumbnailUrl}
                            alt="Fabric"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                      </td>
                      
                      {/* Fabric & Specs Column */}
                      <td className="p-2 border-r align-top w-[30%]">
                        {item.fabricDetails && (
                          <div className="mb-2">
                            <div className="font-medium text-blue-700 mb-1">{item.fabricDetails.name}</div>
                            <div className="text-[10px] space-y-0.5">
                              <div>Width: {item.fabricDetails.fabricWidth}cm</div>
                              <div>Roll: {item.fabricDetails.rollDirection}</div>
                              {item.fabricDetails.patternRepeat && (
                                <div>Repeat: {item.fabricDetails.patternRepeat}cm</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {item.fabricUsage && (
                          <div className="bg-green-50 p-1.5 rounded text-[10px] mb-2">
                            <div className="font-semibold text-green-800">Usage: {item.fabricUsage.linearMeters.toFixed(2)}m</div>
                            <div>Widths: {item.fabricUsage.widthsRequired} | Seams: {item.fabricUsage.seamsRequired}</div>
                          </div>
                        )}
                        
                        {item.fullness && (
                          <div className="bg-purple-50 p-1.5 rounded text-[10px]">
                            <div className="font-semibold">{item.fullness.headingType}</div>
                            <div>Fullness: {item.fullness.ratio}x</div>
                          </div>
                        )}
                        
                        {item.hems && (
                          <div className="mt-2 text-[10px]">
                            <div className="font-semibold mb-0.5">Hems (cm):</div>
                            <div>H:{item.hems.header} | B:{item.hems.bottom} | S:{item.hems.side}</div>
                          </div>
                        )}
                      </td>
                      
                      {/* Measurements Column */}
                      <td className="p-2 border-r align-top w-[15%]">
                        {item.measurements && (
                          <div className="space-y-1 text-[10px] font-mono">
                            {item.measurements.width && (
                              <div>
                                <span className="font-semibold">W:</span> {item.measurements.width}{item.measurements.unit}
                              </div>
                            )}
                            {item.measurements.drop && (
                              <div>
                                <span className="font-semibold">D:</span> {item.measurements.drop}{item.measurements.unit}
                              </div>
                            )}
                            {item.measurements.pooling && item.measurements.pooling > 0 && (
                              <div>
                                <span className="font-semibold">P:</span> {item.measurements.pooling}{item.measurements.unit}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {item.liningDetails && (
                          <div className="mt-2 text-[10px]">
                            <div className="font-semibold">Lining:</div>
                            <div>{item.liningDetails.name}</div>
                          </div>
                        )}
                      </td>
                      
                      {/* Notes Column */}
                      <td className="p-2 align-top w-[35%]">
                        {item.options && item.options.length > 0 && (
                          <div className="mb-2">
                            <div className="font-semibold text-[10px] mb-0.5">Options:</div>
                            <div className="text-[10px] space-y-0.5">
                              {item.options.slice(0, 3).map((opt, idx) => (
                                <div key={idx}>• {opt.name}</div>
                              ))}
                              {item.options.length > 3 && (
                                <div className="text-muted-foreground">+{item.options.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {isPrintMode ? (
                          <div className="text-[10px] min-h-[60px] p-2 bg-muted/30 rounded whitespace-pre-wrap">
                            {itemNotes[item.id] || "No notes"}
                          </div>
                        ) : (
                          <Textarea 
                            placeholder="Special instructions..."
                            className="text-[10px] min-h-[60px] resize-none"
                            value={itemNotes[item.id] || ""}
                            onChange={(e) => setItemNote(item.id, e.target.value)}
                            disabled={isReadOnly}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
