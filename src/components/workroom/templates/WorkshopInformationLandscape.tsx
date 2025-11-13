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
        
        {/* Header info */}
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">Project</div>
            <div className="font-medium mt-0.5">{data.header.projectName ?? "—"}</div>
          </div>
          <EditableField label="Order #" field="orderNumber" />
          <EditableField label="Client" field="clientName" />
          <EditableField label="Due Date" field="dueDate" />
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-xs mt-2">
          <EditableField label="Created" field="createdDate" />
          <EditableField label="Assigned Maker" field="assignedMaker" />
          <EditableField label="Shipping Address" field="shippingAddress" multiline />
        </div>
      </div>

      {/* Items Table */}
      {data.rooms.map((room, roomIdx) => (
        <div key={roomIdx} className="workshop-room-section mb-6">
          <h3 className="text-sm font-bold bg-gray-800 text-white px-3 py-2 mb-0">{room.roomName}</h3>
          <table className="w-full border-collapse bg-white text-[10px]">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="w-[10%] text-left py-2 px-2 border-r border-gray-700">Item</th>
                <th className="w-[32%] text-left py-2 px-2 border-r border-gray-700">Fabric & Details</th>
                <th className="w-[22%] text-left py-2 px-2 border-r border-gray-700">Measurements</th>
                <th className="w-[36%] text-left py-2 px-2">Sewing Details</th>
              </tr>
            </thead>
            <tbody>
              {room.items.map((item, itemIdx) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 workshop-item-row">
                  {/* Item column with thumbnail */}
                  <td className="py-3 px-2 align-top border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="font-medium">{item.location}</div>
                      {item.visualDetails?.thumbnailUrl && (
                        <img 
                          src={item.visualDetails.thumbnailUrl} 
                          alt="Fabric" 
                          className="w-12 h-12 object-cover rounded border"
                        />
                      )}
                    </div>
                  </td>
                  
                  {/* Fabric & Details column */}
                  <td className="py-3 px-2 align-top border-r border-gray-200">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-blue-700">
                        {item.fabricDetails?.name || 'No fabric selected'}
                      </div>
                      {item.fabricDetails && (
                        <>
                          <div className="text-[9px] text-gray-600">
                            Fabric Width: {item.fabricDetails.fabricWidth}cm, 
                            {item.fabricDetails.rollDirection === 'Horizontal' ? ' ↔️ Horizontal' : ' ↕️ Vertical'}
                          </div>
                          {item.fabricDetails.patternRepeat && (
                            <div className="text-[9px]">
                              Pattern Repeat: {item.fabricDetails.patternRepeat}cm
                            </div>
                          )}
                        </>
                      )}
                      {item.fabricUsage && (
                        <>
                          <div className="font-medium text-green-700 mt-1">
                            Usage: {item.fabricUsage.linearMeters.toFixed(2)}m 
                            ({item.fabricUsage.widthsRequired} width{item.fabricUsage.widthsRequired > 1 ? 's' : ''})
                          </div>
                          {item.fabricUsage.seamsRequired > 0 && (
                            <div className="text-[9px] text-orange-600 font-medium">
                              ⚠️ {item.fabricUsage.seamsRequired} seam(s) required
                            </div>
                          )}
                          {item.fabricUsage.leftover > 0 && (
                            <div className="text-[9px] text-gray-500">
                              Leftover: ~{item.fabricUsage.leftover.toFixed(1)}cm per width
                            </div>
                          )}
                        </>
                      )}
                      {item.options && item.options.length > 0 && (
                        <div className="text-[9px] mt-1 pt-1 border-t border-gray-200">
                          <div className="font-medium">Options:</div>
                          {item.options.map((opt, idx) => (
                            <div key={idx}>• {opt.name}</div>
                          ))}
                        </div>
                      )}
                      {item.liningDetails && (
                        <div className="text-[9px]">
                          Lining: {item.liningDetails.name}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Measurements column */}
                  <td className="py-3 px-2 align-top border-r border-gray-200">
                    <div className="space-y-0.5 font-mono">
                      {item.measurements?.width && (
                        <div>Width: {item.measurements.width}{item.measurements.unit}</div>
                      )}
                      {item.measurements?.drop && (
                        <div>Drop: {item.measurements.drop}{item.measurements.unit}</div>
                      )}
                      {item.measurements?.pooling && item.measurements.pooling > 0 && (
                        <div>Pool: {item.measurements.pooling}{item.measurements.unit}</div>
                      )}
                      <div className="text-[9px] text-gray-500 mt-1">
                        {item.treatmentType || 'No treatment'}
                      </div>
                    </div>
                  </td>
                  
                  {/* Sewing Details column */}
                  <td className="py-3 px-2 align-top">
                    <div className="space-y-0.5">
                      {item.fullness && (
                        <div className="font-medium text-purple-700">
                          Fullness: {item.fullness.ratio}x ({item.fullness.headingType})
                        </div>
                      )}
                      {item.hems && (
                        <div className="text-[9px] space-y-0.5 mt-1">
                          <div className="font-medium">Hem Allowances:</div>
                          <div>• Header: {item.hems.header}cm</div>
                          <div>• Bottom: {item.hems.bottom}cm</div>
                          <div>• Side: {item.hems.side}cm (each)</div>
                          {item.fabricUsage && item.fabricUsage.seamsRequired > 0 && (
                            <div className="text-orange-600 font-medium">
                              • Seam: {item.hems.seam}cm (per join × {item.fabricUsage.seamsRequired})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

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
