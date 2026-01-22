import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { useWorkshopNotes } from "@/hooks/useWorkshopNotes";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { MaterialsTable } from "../sections/MaterialsTable";

export interface WorkshopInformationLandscapeProps {
  data: WorkshopData;
  projectId?: string;
  isPrintMode?: boolean;
  isReadOnly?: boolean;
  sessionToken?: string;
}

export const WorkshopInformationLandscape: React.FC<WorkshopInformationLandscapeProps> = ({ data, projectId, isPrintMode = false, isReadOnly = false, sessionToken }) => {
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Partial<typeof data.header>>({});
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);
  const { units } = useMeasurementUnits();
  const { toast } = useToast();
  
  // Use workshop notes hook for database persistence
  const {
    productionNotes,
    itemNotes,
    setProductionNotes,
    setItemNote,
    saveNotes,
    saveItemNotePublic,
    isLoading,
    isSaving
  } = useWorkshopNotes(projectId, { sessionToken });
  
  const hasOverrides = Object.keys(overrides).length > 0;
  
  // Track note changes
  const handleNoteChange = (itemId: string, note: string) => {
    setItemNote(itemId, note);
    setHasUnsavedNotes(true);
  };
  
  const handleProductionNoteChange = (note: string) => {
    setProductionNotes(note);
    setHasUnsavedNotes(true);
  };
  
  // Direct save notes function
  const handleSaveNotes = async () => {
    try {
      await saveNotes();
      setHasUnsavedNotes(false);
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  };
  
  const getFieldValue = (field: keyof typeof data.header) => {
    return overrides[field] ?? data.header[field] ?? "";
  };
  
  const handleFieldChange = (field: keyof typeof data.header, value: string) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };
  
  const handleReset = () => {
    setOverrides({});
  };
  
  const handleSaveAndClose = async () => {
    await saveNotes();
    setEditing(false);
  };
  
  const getItemNote = (itemId: string, defaultNote?: string) => {
    return itemNotes[itemId] ?? defaultNote ?? "";
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
        {editing && !isReadOnly ? (
          multiline ? (
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="mt-0.5 text-xs min-h-[50px]"
              placeholder={data.header[field] || "—"}
              disabled={isReadOnly}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="mt-0.5 text-xs h-7"
              placeholder={data.header[field] || "—"}
              disabled={isReadOnly}
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
          {!isPrintMode && (
            <div className="flex items-center gap-2 no-print">
              {/* Unsaved changes indicator */}
              {hasUnsavedNotes && (
                <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved
                </span>
              )}
              
              {hasOverrides && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 text-xs"
                  disabled={isReadOnly}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
              
              {/* Edit Headers button */}
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="h-7 text-xs"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  {editing ? "Done Editing" : "Edit Headers"}
                </Button>
              )}
              
              {/* Save Notes button - always visible when can edit */}
              {!isReadOnly && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="h-7 text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? "Saving..." : "Save Notes"}
                </Button>
              )}
            </div>
          )}
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

      {/* Materials Summary - matches portrait */}
      <MaterialsTable data={data} />

      {/* Items Table */}
      {data.rooms.map((room, roomIdx) => (
        <div key={roomIdx} className="workshop-room-section mb-6">
          <h3 className="text-sm font-bold bg-blue-100 text-blue-900 px-3 py-2 mb-0">{room.roomName}</h3>
          <table className="w-full border-collapse bg-white text-[10px]">
            <thead>
              <tr className="bg-blue-50 text-gray-800 border-b-2 border-blue-200">
                <th className="w-[10%] text-left py-2 px-2 border-r border-gray-200 font-semibold">Item</th>
                <th className="w-[32%] text-left py-2 px-2 border-r border-gray-200 font-semibold">Fabric & Details</th>
                <th className="w-[22%] text-left py-2 px-2 border-r border-gray-200 font-semibold">Measurements</th>
                <th className="w-[36%] text-left py-2 px-2 font-semibold">Sewing Details</th>
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
                    {(() => {
                      // Determine if this is a blind/shutter treatment (material-based) vs curtain/roman (fabric-based)
                      const treatmentLower = (item.treatmentType || '').toLowerCase();
                      const isBlindTreatment = treatmentLower.includes('blind') || 
                                               treatmentLower.includes('venetian') || 
                                               treatmentLower.includes('vertical') ||
                                               treatmentLower.includes('cellular') ||
                                               treatmentLower.includes('shutter') ||
                                               treatmentLower.includes('roller');
                      
                      // Get color from material (for blinds) or fabric (for curtains)
                      const displayColor = item.materialDetails?.color || item.fabricDetails?.color;
                      
                      return (
                        <div className="space-y-0.5">
                          {/* Product/Material Name */}
                          <div className="font-semibold text-blue-700">
                            {isBlindTreatment && item.materialDetails?.name 
                              ? item.materialDetails.name 
                              : (item.fabricDetails?.name || 'No product selected')}
                          </div>
                          
                          {/* COLOR - CRITICAL for work orders */}
                          {displayColor && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{ 
                                  backgroundColor: displayColor.startsWith('#') 
                                    ? displayColor 
                                    : displayColor.toLowerCase() 
                                }}
                              />
                              <span className="text-[9px] font-medium">Color: {displayColor}</span>
                            </div>
                          )}
                          
                          {/* Material-specific details for blinds */}
                          {isBlindTreatment && item.materialDetails && (
                            <>
                              {item.materialDetails.slatWidth && (
                                <div className="text-[9px] text-gray-600">
                                  Slat Width: {item.materialDetails.slatWidth}mm
                                </div>
                              )}
                              {item.materialDetails.materialType && (
                                <div className="text-[9px] text-gray-600">
                                  Material: {item.materialDetails.materialType}
                                </div>
                              )}
                              {item.materialDetails.resolvedGridName && (
                                <div className="text-[9px] text-gray-500">
                                  Pricing: {item.materialDetails.resolvedGridName}
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Fabric-specific details for curtains/romans */}
                          {!isBlindTreatment && item.fabricDetails && (
                            <>
                              <div className="text-[9px] text-gray-600">
                                Fabric Width: {formatFromCM(item.fabricDetails.fabricWidth, units.length)}
                                {item.fabricDetails.rollDirection && (
                                  <>, {item.fabricDetails.rollDirection === 'Horizontal' ? ' ↔️ Horizontal' : ' ↕️ Vertical'}</>
                                )}
                              </div>
                              {item.fabricDetails.patternRepeat && item.fabricDetails.patternRepeat > 0 && (
                                <div className="text-[9px]">
                                  Pattern Repeat: {formatFromCM(item.fabricDetails.patternRepeat, units.length)}
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Fabric usage - only for fabric-based treatments */}
                          {!isBlindTreatment && item.fabricUsage && item.fabricUsage.linearMeters > 0 && (
                            <>
                              <div className="font-medium text-green-700 mt-1">
                                Usage: {item.fabricUsage.linearMeters.toFixed(2)}m 
                                ({item.fabricUsage.widthsRequired} width{item.fabricUsage.widthsRequired > 1 ? 's' : ''})
                              </div>
                              
                              {/* Horizontal pieces info - explains why 1 or 2 widths */}
                              {item.fabricUsage.isHorizontal && item.fabricUsage.horizontalPiecesNeeded && item.fabricUsage.horizontalPiecesNeeded > 1 && (
                                <div className="text-[9px] mt-1 p-1.5 bg-amber-50 border border-amber-200 rounded">
                                  <div className="font-medium text-amber-700">
                                    ↔️ Railroaded: {item.fabricUsage.horizontalPiecesNeeded} horizontal piece{item.fabricUsage.horizontalPiecesNeeded > 1 ? 's' : ''}
                                  </div>
                                  {item.fabricUsage.usesLeftover ? (
                                    <div className="text-green-700 font-medium">
                                      ✓ Using leftover fabric for extra width - 1 piece charged
                                    </div>
                                  ) : (
                                    <div className="text-gray-600">
                                      Drop exceeds fabric width, requires seaming
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {item.fabricUsage.seamsRequired > 0 && !item.fabricUsage.isHorizontal && (
                                <div className="text-[9px] text-orange-600 font-medium">
                                  ⚠️ {item.fabricUsage.seamsRequired} vertical seam(s) required
                                </div>
                              )}
                              {item.fabricUsage.leftover > 0 && (
                                <div className="text-[9px] text-gray-500">
                                  Leftover: ~{formatFromCM(item.fabricUsage.leftover, units.length)} per width
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Options - show for all treatments */}
                          {item.options && item.options.length > 0 && (
                            <div className="text-[9px] mt-1 pt-1 border-t border-gray-200">
                              <div className="font-medium">Options:</div>
                              {item.options.map((opt, idx) => (
                                <div key={idx}>• {opt.name}</div>
                              ))}
                            </div>
                          )}
                          
                          {/* Lining - only for fabric-based treatments */}
                          {!isBlindTreatment && item.liningDetails && (
                            <div className="text-[9px]">
                              Lining: {item.liningDetails.name}
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
                      
                      {/* Cut dimensions for manufacturing - only show for curtains and roman blinds that use hems/fullness */}
                      {(() => {
                        const treatmentLower = (item.treatmentType || '').toLowerCase();
                        const isCurtainOrRoman = treatmentLower.includes('curtain') || treatmentLower.includes('roman');
                        const hasFabricUsage = item.fabricUsage && (item.fabricUsage.totalDropCm > 0 || item.fabricUsage.totalWidthCm > 0);
                        
                        if (!isCurtainOrRoman || !hasFabricUsage) return null;
                        
                        return (
                          <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                            <div className="text-[9px] font-medium text-purple-700 mb-1">Cut Dimensions:</div>
                            {item.fabricUsage.totalWidthCm > 0 && (
                              <div className="text-[9px]">
                                Total Width: {formatFromCM(item.fabricUsage.totalWidthCm, units.length)}
                                <span className="text-gray-500 ml-1">(incl. fullness, returns, hems)</span>
                              </div>
                            )}
                            {item.fabricUsage.totalDropCm > 0 && (
                              <div className="text-[9px]">
                                Total Drop: {formatFromCM(item.fabricUsage.totalDropCm, units.length)}
                                <span className="text-gray-500 ml-1">(incl. header, bottom, pool)</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                  
                  {/* Sewing/Manufacturing Details column */}
                  <td className="py-3 px-2 align-top">
                    {(() => {
                      // Determine if this is a blind/shutter treatment
                      const treatmentLower = (item.treatmentType || '').toLowerCase();
                      const isBlindTreatment = treatmentLower.includes('blind') || 
                                               treatmentLower.includes('venetian') || 
                                               treatmentLower.includes('vertical') ||
                                               treatmentLower.includes('cellular') ||
                                               treatmentLower.includes('shutter') ||
                                               treatmentLower.includes('roller');
                      
                      // Check if fullness and hems have meaningful values (not default zeros)
                      const hasFullness = item.fullness && item.fullness.ratio > 0 && item.fullness.ratio !== 1;
                      const hasHems = item.hems && (item.hems.header > 0 || item.hems.bottom > 0 || item.hems.side > 0);
                      
                      return (
                        <div className="space-y-0.5">
                          {/* Fullness - ONLY for curtains/romans with actual fullness values */}
                          {!isBlindTreatment && hasFullness && (
                            <div className="font-medium text-purple-700">
                              Fullness: {item.fullness!.ratio}x ({item.fullness!.headingType})
                            </div>
                          )}
                          
                          {/* Hem Allowances - ONLY for curtains/romans with actual hem values */}
                          {!isBlindTreatment && hasHems && (
                            <div className="text-[9px] space-y-0.5 mt-1">
                              <div className="font-medium">Hem Allowances:</div>
                              {item.hems!.header > 0 && (
                                <div>• Header: {formatFromCM(item.hems!.header, units.length)}</div>
                              )}
                              {item.hems!.bottom > 0 && (
                                <div>• Bottom: {formatFromCM(item.hems!.bottom, units.length)}</div>
                              )}
                              {item.hems!.side > 0 && (
                                <div>• Side: {formatFromCM(item.hems!.side, units.length)} (each)</div>
                              )}
                              {item.fabricUsage && item.fabricUsage.seamsRequired > 0 && item.hems!.seam && item.hems!.seam > 0 && (
                                <div className="text-orange-600 font-medium">
                                  • Seam: {formatFromCM(item.hems!.seam, units.length)} (per join × {item.fabricUsage.seamsRequired})
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* For blinds - show manufacturing info if no sewing details */}
                          {isBlindTreatment && (
                            <div className="text-[9px] text-gray-600">
                              <div className="font-medium">Manufacturing:</div>
                              <div>Standard blind assembly</div>
                            </div>
                          )}
                          
                          {/* Notes - show for all treatments - always editable when not read-only */}
                          <div className="text-[9px] mt-2 pt-2 border-t border-gray-200">
                            <div className="font-medium text-gray-700 mb-1">Notes:</div>
                            {isPrintMode || isReadOnly ? (
                              <div className="text-gray-600 italic min-h-[20px]">
                                {getItemNote(item.id, item.notes) || "No notes"}
                              </div>
                            ) : (
                              <Textarea
                                value={getItemNote(item.id, item.notes)}
                                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                className="text-[9px] min-h-[40px] w-full"
                                placeholder="Add manufacturing notes for this item..."
                              />
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Production Notes Section - always editable when not read-only */}
      <div className="border-t pt-3 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2">Production Notes</h3>
        {isPrintMode || isReadOnly ? (
          <div className="bg-gray-50 rounded p-3 min-h-[60px] text-xs text-gray-600">
            {productionNotes ? (
              <p className="whitespace-pre-wrap">{productionNotes}</p>
            ) : (
              <p className="italic">No additional production notes.</p>
            )}
          </div>
        ) : (
          <Textarea
            value={productionNotes}
            onChange={(e) => handleProductionNoteChange(e.target.value)}
            className="text-xs min-h-[80px] w-full"
            placeholder="Add general manufacturing instructions, special handling notes, or additional details..."
          />
        )}
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-center text-[9px] text-gray-500 border-t pt-2 mt-4">
        <div>Prepared: {new Date().toLocaleDateString()}</div>
        <div className="page-number-placeholder">Page <span className="page-number"></span></div>
      </div>
    </div>
  );
};
