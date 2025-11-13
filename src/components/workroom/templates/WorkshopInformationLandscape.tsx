import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw } from "lucide-react";
import { WorkshopData } from "@/hooks/useWorkshopData";

interface WorkshopInformationLandscapeProps {
  data: WorkshopData;
}

export const WorkshopInformationLandscape: React.FC<WorkshopInformationLandscapeProps> = ({ data }) => {
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
    className?: string;
  }> = ({ label, field, multiline, className }) => {
    const value = getFieldValue(field);
    const isOverridden = field in overrides;
    
    return (
      <div className={className}>
        <div className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
          {label}
          {isOverridden && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Modified" />
          )}
        </div>
        {editing ? (
          multiline ? (
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="mt-0.5 text-xs min-h-[50px]"
              placeholder={data.header[field] || "—"}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="mt-0.5 text-xs h-7"
              placeholder={data.header[field] || "—"}
            />
          )
        ) : (
          <div className="text-xs font-medium mt-0.5">{value || "—"}</div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Compact Header Section */}
      <div className="border-b-2 border-gray-900 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WORK ORDER</h1>
            <div className="text-xs text-gray-600 mt-0.5">Manufacturing Instructions</div>
          </div>
          <div className="flex items-center gap-2 no-print">
            {hasOverrides && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              onClick={() => setEditing(!editing)}
              className="h-7 text-xs"
            >
              <Pencil className="h-3 w-3 mr-1" />
              {editing ? "Done" : "Edit"}
            </Button>
          </div>
        </div>
        
        {/* Three-column header info */}
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">Project</div>
            <div className="font-medium mt-0.5">{data.header.projectName ?? "—"}</div>
          </div>
          <EditableField label="Order #" field="orderNumber" />
          <EditableField label="Client" field="clientName" />
          <EditableField label="Created" field="createdDate" />
          
          <EditableField label="Due Date" field="dueDate" />
          <EditableField label="Assigned Maker" field="assignedMaker" />
          <EditableField label="Shipping Address" field="shippingAddress" className="col-span-2" multiline />
        </div>
      </div>

      {/* Items Table - Optimized for Landscape */}
      <div>
        <h2 className="text-sm font-bold mb-2 uppercase tracking-wide">Order Items</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-900">
              <th className="text-left py-2 px-2 font-semibold">Room</th>
              <th className="text-left py-2 px-2 font-semibold">Location</th>
              <th className="text-left py-2 px-2 font-semibold">Treatment</th>
              <th className="text-right py-2 px-2 font-semibold">Width</th>
              <th className="text-right py-2 px-2 font-semibold">Height</th>
              <th className="text-center py-2 px-2 font-semibold">Qty</th>
              <th className="text-left py-2 px-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {data.rooms.map((room, roomIdx) => (
              <React.Fragment key={`room-${roomIdx}`}>
                {room.items.map((item, itemIdx) => (
                  <tr 
                    key={`${room.roomName}-${itemIdx}`}
                    className="border-b border-gray-200 workshop-item-card hover:bg-gray-50"
                  >
                    <td className="py-2 px-2 font-medium">{room.roomName}</td>
                    <td className="py-2 px-2">{item.location || "—"}</td>
                    <td className="py-2 px-2">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                        {item.treatmentType || "Standard"}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {item.measurements?.width ? `${item.measurements.width}` : "—"}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {item.measurements?.height ? `${item.measurements.height}` : "—"}
                    </td>
                    <td className="py-2 px-2 text-center font-medium">
                      {item.quantity || 1}
                    </td>
                    <td className="py-2 px-2 text-[10px] text-gray-600">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
                {/* Room subtotal row */}
                {roomIdx < data.rooms.length - 1 && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="py-1"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-900">
            <tr className="bg-gray-100 font-bold">
              <td colSpan={5} className="py-2 px-2 text-right">Total Items:</td>
              <td className="py-2 px-2 text-center">{data.projectTotals?.itemsCount || 0}</td>
              <td className="py-2 px-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Production Notes Section */}
      <div className="border-t pt-3 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2">Production Notes</h3>
        <div className="bg-gray-50 rounded p-3 min-h-[60px] text-xs text-gray-600">
          <p className="italic">Additional manufacturing instructions can be added here...</p>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-center text-[9px] text-gray-500 border-t pt-2 mt-4">
        <div>Prepared: {new Date().toLocaleDateString()}</div>
        <div className="page-number-placeholder">Page <span className="page-number"></span></div>
      </div>
    </div>
  );
};
