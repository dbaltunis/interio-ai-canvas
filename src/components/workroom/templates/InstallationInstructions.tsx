import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { useWorkshopNotes } from "@/hooks/useWorkshopNotes";
import { CompactHeader } from "../components/CompactHeader";
import { CompactItemCard } from "../components/CompactItemCard";

interface InstallationInstructionsProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
  projectId?: string;
  isPrintMode?: boolean;
  isReadOnly?: boolean;
  sessionToken?: string;
}

export const InstallationInstructions: React.FC<InstallationInstructionsProps> = ({ 
  data, 
  orientation = 'portrait',
  projectId,
  isPrintMode = false,
  isReadOnly = false,
  sessionToken
}) => {
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [installationDate, setInstallationDate] = useState("");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreChecklist, setShowPreChecklist] = useState(false);
  
  const {
    itemNotes,
    setItemNote,
    saveNotes,
    isSaving
  } = useWorkshopNotes(projectId, { sessionToken });
  
  const hasOverrides = Object.keys(overrides).length > 0;
  
  const getFieldValue = (field: keyof typeof data.header) => {
    return overrides[field] ?? data.header[field] ?? "";
  };
  
  const handleFieldChange = (field: keyof typeof data.header, value: string) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };
  
  const handleReset = () => {
    setOverrides({});
    setInstallationDate("");
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

  const totalItems = data.rooms.reduce((acc, room) => acc + room.items.length, 0);
  
  return (
    <section aria-label="Installation Instructions" className="space-y-4 p-4">
      {/* Compact Header */}
      <CompactHeader
        title="Installation Instructions"
        orderNumber={data.header.orderNumber}
        clientName={data.header.clientName}
        clientPhone={(data.header as any).clientPhone}
        siteAddress={String(getFieldValue('shippingAddress'))}
        scheduledDate={installationDate}
        assignedPerson={String(getFieldValue('assignedMaker'))}
        personLabel="Installer"
        dateLabel="Installation Date"
        editing={editing}
        onEditingChange={setEditing}
        onDateChange={setInstallationDate}
        onPersonChange={(v) => handleFieldChange('assignedMaker', v)}
        onAddressChange={(v) => handleFieldChange('shippingAddress', v)}
        hasOverrides={hasOverrides || !!installationDate}
        onReset={handleReset}
        onSave={handleSaveNotes}
        isSaving={isSaving}
        canSave={!!projectId}
        lastSaved={lastSaved}
        isPrintMode={isPrintMode}
        isReadOnly={isReadOnly}
      />
      
      {/* Collapsible Pre-Installation Checklist */}
      {!isPrintMode && (
        <Collapsible open={showPreChecklist} onOpenChange={setShowPreChecklist}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between h-9 bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
            >
              <span>Pre-Installation Checklist</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showPreChecklist ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  'Hardware complete',
                  'Measurements verified',
                  'Walls suitable',
                  'Tools ready',
                  'Client contacted',
                  'Protection sheets'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 bg-white rounded">
                    <Checkbox className="h-4 w-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Progress Summary */}
      {!isPrintMode && totalItems > 0 && (
        <div className="text-sm text-muted-foreground text-center py-1">
          Progress: {completedItems.size} / {totalItems} items
        </div>
      )}

      {/* Installation Items by Room */}
      {data.rooms.map((room, roomIndex) => (
        <div key={roomIndex} className="space-y-3">
          <h2 className="text-lg font-bold border-l-4 border-blue-600 pl-3 py-1">
            {room.roomName}
          </h2>
          
          {room.items.map((item) => (
            <CompactItemCard
              key={item.id}
              item={item}
              isComplete={completedItems.has(item.id)}
              onToggleComplete={() => toggleItemComplete(item.id)}
              notes={itemNotes[item.id] || ""}
              onNotesChange={(notes) => setItemNote(item.id, notes)}
              isPrintMode={isPrintMode}
              isReadOnly={isReadOnly}
              templateType="installation"
              photoPrefix="install-"
            />
          ))}
        </div>
      ))}
    </section>
  );
};
