import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, CheckCircle2, Save, CheckCircle } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { BeforeAfterPhotoUpload } from "../components/BeforeAfterPhotoUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkshopNotes } from "@/hooks/useWorkshopNotes";

interface InstallationInstructionsProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
  projectId?: string;
}

export const InstallationInstructions: React.FC<InstallationInstructionsProps> = ({ 
  data, 
  orientation = 'portrait',
  projectId
}) => {
  console.log('🔍 [InstallationInstructions] projectId:', projectId);
  
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [installationDate, setInstallationDate] = useState("");
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
  
  console.log('🔍 [InstallationInstructions] Notes state:', { 
    hasProjectId: !!projectId,
    itemNotesCount: Object.keys(itemNotes).length,
    isSaving 
  });
  
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
    <section aria-label="Installation Instructions" className="space-y-6 p-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Installation Instructions</CardTitle>
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
              title={!projectId ? "Project ID required to save notes" : isSaving ? "Saving..." : "Click to save all notes"}
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
      
      {/* Pre-Installation Checklist */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Pre-Installation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>All hardware present and correct</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Measurements verified on-site</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Walls/ceiling suitable for mounting</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>All tools and equipment ready</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Client contacted about arrival</span>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-0.5" />
              <span>Protection sheets for floors/furniture</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Tools */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Required Tools & Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>• Drill & bits</div>
            <div>• Spirit level</div>
            <div>• Tape measure</div>
            <div>• Pencil</div>
            <div>• Screwdriver set</div>
            <div>• Step ladder</div>
            <div>• Stud finder</div>
            <div>• Wall anchors</div>
            <div>• Safety glasses</div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Items by Room */}
      {data.rooms.map((room, roomIndex) => (
        <div key={roomIndex} className="space-y-4 workshop-room-section">
          <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3">{room.roomName}</h2>
          
          {room.items.map((item, itemIndex) => {
            const isComplete = completedItems.has(item.id);
            const hardware = (item.fullness as any)?.hardware;
            const accessories = item.options?.filter(opt => 
              opt.optionKey.includes('tieback') || 
              opt.optionKey.includes('bracket') || 
              opt.optionKey.includes('hook')
            ) || [];
            
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
                  {/* Critical Measurements - Prominent Display */}
                  <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-400">
                    <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      📏 Critical Measurements - Verify Before Installing
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Width</div>
                        <div className="text-2xl font-bold mt-1">
                          {item.measurements?.width ?? "—"}
                          <span className="text-base ml-1 font-normal">{item.measurements?.unit ?? ""}</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Height/Drop</div>
                        <div className="text-2xl font-bold mt-1">
                          {item.measurements?.drop ?? item.measurements?.height ?? "—"}
                          <span className="text-base ml-1 font-normal">{item.measurements?.unit ?? ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-yellow-900 font-medium bg-yellow-100 p-2 rounded">
                      ⚠️ <span className="font-bold">ALWAYS</span> verify measurements on-site before drilling - walls may not be square!
                    </div>
                  </div>
                  
                  {/* Hardware Installation - Step by Step */}
                  {hardware && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-blue-800">🔧 Hardware Installation Guide</h4>
                      <div className="bg-blue-50 p-3 rounded space-y-3">
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
                        
                        <div className="border-t border-blue-200 pt-2 mt-2">
                          <div className="text-xs font-semibold mb-2">Installation Steps:</div>
                          <ol className="text-xs space-y-1 list-decimal list-inside">
                            <li>Mark center point of window/opening</li>
                            <li>Use level to mark horizontal line for brackets</li>
                            <li>Mark bracket positions (typically {hardware.spacing || "30"} cm from edges)</li>
                            <li>Check for studs/solid fixing points with stud finder</li>
                            <li>Drill pilot holes (use appropriate wall anchors if needed)</li>
                            <li>Install brackets ensuring they're level and secure</li>
                            <li>Mount hardware and verify it's straight before final tightening</li>
                          </ol>
                        </div>
                        
                        <div className="text-xs text-blue-900 font-medium bg-blue-100 p-2 rounded">
                          💡 Tip: For plasterboard walls, use appropriate fixings rated for the weight. For masonry, use 6mm minimum wall plugs.
                        </div>
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
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Installation Notes</h4>
                    <Textarea 
                      placeholder="Add installation instructions..."
                      className="text-sm min-h-[60px]"
                      value={itemNotes[item.id] || ""}
                      onChange={(e) => setItemNote(item.id, e.target.value)}
                    />
                  </div>
                  
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
