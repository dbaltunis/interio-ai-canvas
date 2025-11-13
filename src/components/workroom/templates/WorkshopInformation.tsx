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

      <div className="space-y-4">
        {data.rooms.map((section, idx) => (
          <RoomSection key={`${section.roomName}-${idx}`} section={section} />)
        )}
      </div>
    </section>
  );
};
