import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, ChevronDown, ChevronRight, Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWindowSummary } from "@/hooks/useWindowSummary";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { useCompactMode } from "@/hooks/useCompactMode";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { WindowRenameButton } from "./WindowRenameButton";
import { TreatmentTypeIndicator } from "../measurements/TreatmentTypeIndicator";
import { TreatmentPreviewEngine } from "@/components/treatment-visualizers/TreatmentPreviewEngine";

interface WindowSummaryCardProps {
  surface: any;
  onEditSurface?: (surface: any) => void;
  onDeleteSurface?: (id: string) => void;
  onViewDetails?: (surface: any) => void;
  onRenameSurface?: (id: string, newName: string) => void;
  isMainWindow?: boolean;
  treatmentLabel?: string;
  treatmentType?: string;
}

function SummaryItem({ title, main, sub }: { title: string; main: string; sub?: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="font-semibold">{main}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function WindowSummaryCard({ 
  surface, 
  onEditSurface, 
  onDeleteSurface, 
  onViewDetails, 
  onRenameSurface, 
  isMainWindow = true,
  treatmentLabel,
  treatmentType: propTreatmentType
}: WindowSummaryCardProps) {
  // Use surface.id directly as the window_id - single source of truth
  const windowId = surface.id;
  const { data: summary, isLoading, error } = useWindowSummary(windowId);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const { compact } = useCompactMode();
  const userCurrency = useUserCurrency();

  // Detect treatment type - PRIORITY ORDER:
  // 1. Explicitly passed prop (from surface.treatment_type)
  // 2. Treatment type from summary (most reliable)
  // 3. Detect from fabric category (wallpaper only)
  // 4. Default to curtains
  const detectTreatmentTypeFromFabric = () => {
    const category = summary?.fabric_details?.category?.toLowerCase() || '';
    // Only use fabric category to detect wallpaper, not other types
    if (category.includes('wallcover') || category.includes('wallpaper')) return 'wallpaper';
    return null;
  };

  const treatmentType = 
    propTreatmentType ||                    // Use prop if explicitly passed
    summary?.treatment_type ||               // Use treatment_type from summary (MOST RELIABLE)
    detectTreatmentTypeFromFabric() ||       // Only for wallpaper detection
    summary?.treatment_category ||           // Fallback to category
    'curtains';                              // Final fallback

  // Unit helpers
  const { convertToUserUnit, formatFabric } = useMeasurementUnits();
  const fmtFabric = (m?: number) => (m !== undefined ? formatFabric(convertToUserUnit(m, 'm')) : undefined);

  // Debug logging
  console.log('📊 CARD: WindowSummaryCard render:', {
    windowId,
    surfaceName: surface.name,
    isLoading,
    error: error?.message,
    hasSummary: !!summary,
    detectedTreatmentType: treatmentType,
    propTreatmentType,
    summaryTreatmentType: summary?.treatment_type,
    fabricCategory: summary?.fabric_details?.category,
    fabricDetails: summary?.fabric_details,
    headingDetails: summary?.heading_details,
    liningDetails: summary?.lining_details,
    summary: summary ? {
      window_id: summary.window_id,
      total_cost: summary.total_cost,
      fabric_cost: summary.fabric_cost,
      lining_cost: summary.lining_cost,
      manufacturing_cost: summary.manufacturing_cost,
      linear_meters: summary.linear_meters,
      widths_required: summary.widths_required,
      updated_at: summary.updated_at
    } : null
  });

  const enrichedBreakdown = useMemo(() => {
    if (!summary) return [] as any[];

    const raw = Array.isArray(summary.cost_breakdown) ? summary.cost_breakdown : [];
    const hasStructured = raw.some((it: any) => it && 'category' in it && 'total_cost' in it);
    if (hasStructured) return raw as any[];

    const items: any[] = [];

    items.push({
      id: 'fabric',
      name: summary.fabric_details?.name || 'Fabric',
      description: summary.fabric_details?.name
        ? `${summary.fabric_details.name} • ${fmtFabric(summary.linear_meters) || ''} • ${summary.widths_required} width(s)`
        : `${fmtFabric(summary.linear_meters) || ''} • ${summary.widths_required} width(s)`,
      quantity: Number(summary.linear_meters) || 0,
      unit: 'm',
      unit_price: Number(summary.price_per_meter) || 0,
      total_cost: Number(summary.fabric_cost) || 0,
      category: 'fabric',
      details: {
        widths_required: summary.widths_required,
        linear_meters: summary.linear_meters,
        price_per_meter: summary.price_per_meter,
      },
    });

    if (Number(summary.lining_cost) > 0) {
      items.push({
        id: 'lining',
        name: summary.lining_details?.type || 'Lining',
        description: summary.lining_details?.type,
        quantity: Number(summary.linear_meters) || 0,
        unit: 'm',
        unit_price: Number(summary.lining_details?.price_per_metre) || undefined,
        total_cost: Number(summary.lining_cost) || 0,
        category: 'lining',
        details: summary.lining_details || undefined,
      });
    }

    // Add heading cost if available
    if (summary.heading_details && Object.keys(summary.heading_details).length > 0) {
      const headingCost = summary.heading_details.cost || 0;
      if (headingCost > 0) {
        items.push({
          id: 'heading',
          name: 'Heading',
          description: summary.heading_details.heading_name || 'Custom heading',
          total_cost: Number(headingCost) || 0,
          category: 'heading',
          details: summary.heading_details,
        });
      }
    }

    items.push({
      id: 'manufacturing',
      name: 'Manufacturing',
      description: summary.manufacturing_type,
      total_cost: Number(summary.manufacturing_cost) || 0,
      category: 'manufacturing',
      details: { type: summary.manufacturing_type },
    });

    return items;
  }, [summary]);

  const displayName = treatmentLabel || surface.name;

  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isMainWindow 
          ? 'bg-card border-border shadow-md hover:border-primary/30' 
          : 'bg-muted/30 border-muted-foreground/20 ml-4 shadow-sm hover:bg-muted/50'
      }`}
    >
      <CardHeader className={`relative ${isMainWindow ? 'pb-3' : 'pb-2 py-3'}`}>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            {isMainWindow && onRenameSurface ? (
              <WindowRenameButton
                windowName={displayName}
                onRename={(newName) => onRenameSurface(surface.id, newName)}
              />
            ) : (
              <div className="flex items-center gap-2">
                {!isMainWindow && (
                  <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
                )}
                <CardTitle className={`${isMainWindow ? 'text-lg' : 'text-base'} truncate`}>
                  {displayName}
                </CardTitle>
              </div>
            )}
            {!isMainWindow && (
              <div className="flex items-center gap-2 mt-1">
                {treatmentType && (
                  <TreatmentTypeIndicator treatmentType={treatmentType} size="sm" />
                )}
                <Badge variant="outline" className="text-xs">
                  Additional Treatment
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(surface);
              }}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSurface?.(surface.id);
              }}
              className="text-destructive hover:text-destructive hover:border-destructive/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && <div>Loading summary...</div>}
        
        {error && (
          <div className="text-destructive text-sm">
            Error loading summary: {error.message}
          </div>
        )}

        {!summary && !isLoading && !error && (
          <div className="text-muted-foreground text-sm">
            No pricing data available. Open worksheet, enter measurements, and save to calculate costs.
          </div>
        )}

        {summary && (
          <div className="space-y-3">
            {/* Treatment Card with Visual & Details */}
            <div className="rounded-lg border bg-card">
              <div className="flex flex-col md:flex-row gap-6 p-4">
                {/* LEFT: Clean Treatment Visualization Only */}
                <div className="w-full md:w-64 h-64 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-muted/10 to-muted/30 border-2 border-border/50">
                  <TreatmentPreviewEngine
                    windowType={surface.window_type || 'standard'}
                    treatmentType={treatmentType}
                    measurements={{
                      measurement_a: surface.measurement_a || surface.width || 200,
                      measurement_b: surface.measurement_b || surface.height || 250,
                      rail_width: surface.rail_width || surface.width || 200,
                      drop: surface.drop || surface.height || 250,
                      ...surface
                    }}
                    selectedItems={{
                      fabric: summary.fabric_details,
                      hardware: summary.hardware_details,
                      material: summary.fabric_details
                    }}
                    showProductOnly={false}
                    hideDetails={true}
                    className="w-full h-full"
                  />
                </div>

                {/* RIGHT: Treatment Details */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Treatment Name - Editable */}
                  <div className="flex items-center gap-2 pb-3 border-b">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="font-semibold text-lg"
                          autoFocus
                          onBlur={() => {
                            if (editedName.trim()) {
                              onRenameSurface?.(surface.id, editedName);
                            }
                            setIsEditingName(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editedName.trim()) {
                                onRenameSurface?.(surface.id, editedName);
                              }
                              setIsEditingName(false);
                            }
                            if (e.key === 'Escape') {
                              setIsEditingName(false);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg flex-1">
                          {treatmentType === 'curtains' && (summary.fabric_details?.name || 'Curtain')}
                          {treatmentType === 'wallpaper' && 'Wallpaper'}
                          {(treatmentType === 'blinds' || treatmentType === 'roller_blinds' || treatmentType === 'roman_blinds' || 
                            treatmentType === 'venetian_blinds' || treatmentType === 'cellular_blinds' || treatmentType === 'vertical_blinds') && 
                            (summary.fabric_details?.name || 'Blind')}
                          {treatmentType === 'shutters' && 'Plantation Shutters'}
                          {!['curtains', 'wallpaper', 'shutters', 'blinds', 'roller_blinds', 'roman_blinds', 'venetian_blinds', 'cellular_blinds', 'vertical_blinds'].includes(treatmentType) && 
                            (summary.fabric_details?.name || treatmentType)}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditedName(displayName);
                            setIsEditingName(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Dimensions */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Dimensions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">Width:</span>
                        <span className="font-medium">{fmtFabric(surface.measurement_a || surface.rail_width || surface.width)}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">Height:</span>
                        <span className="font-medium">{fmtFabric(surface.measurement_b || surface.drop || surface.height)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Options Selected */}
                  {summary.heading_details || summary.lining_details || summary.hardware_details ? (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Options Selected</h4>
                      <div className="space-y-2">
                        {treatmentType === 'curtains' && summary.heading_details && (
                          <div className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded">
                            <span className="text-sm">Heading: {summary.heading_details.heading_name || 'Standard'}</span>
                            <span className="text-sm font-medium">{formatCurrency(summary.heading_details.cost || 0, userCurrency)}</span>
                          </div>
                        )}
                        {treatmentType === 'curtains' && summary.lining_details && (
                          <div className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded">
                            <span className="text-sm">Lining: {summary.lining_details.type || 'Standard'}</span>
                            <span className="text-sm font-medium">{formatCurrency(summary.lining_cost || 0, userCurrency)}</span>
                          </div>
                        )}
                        {summary.hardware_details && (
                          <div className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded">
                            <span className="text-sm">Hardware: {summary.hardware_details.name}</span>
                            <span className="text-sm font-medium">{formatCurrency(summary.hardware_details.price || 0, userCurrency)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Inventory Products */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Inventory Products</h4>
                    <div className="space-y-2">
                      {summary.fabric_details && (
                        <div className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{summary.fabric_details.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {treatmentType === 'wallpaper' 
                                ? `${summary.widths_required || 1} roll(s)`
                                : `${summary.linear_meters?.toFixed(2) || '0'} m • ${summary.widths_required || 1} width(s)`
                              }
                            </div>
                          </div>
                          <span className="text-sm font-medium ml-2">{formatCurrency(summary.fabric_cost || 0, userCurrency)}</span>
                        </div>
                      )}
                      {summary.manufacturing_cost && treatmentType !== 'wallpaper' && (
                        <div className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium">Manufacturing</div>
                            <div className="text-xs text-muted-foreground">{summary.manufacturing_type || 'Machine made'}</div>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(summary.manufacturing_cost || 0, userCurrency)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-semibold text-lg">Total Price</span>
                    <span className="font-bold text-xl text-primary">
                      {(() => {
                        const fabricCost = Number(summary.fabric_cost) || 0;
                        const liningCost = Number(summary.lining_cost) || 0;
                        const manufacturingCost = Number(summary.manufacturing_cost) || 0;
                        const headingCost = summary.heading_details?.cost ? Number(summary.heading_details.cost) : 0;
                        const hardwareCost = summary.hardware_details?.price ? Number(summary.hardware_details.price) : 0;
                        return formatCurrency(fabricCost + liningCost + manufacturingCost + headingCost + hardwareCost, userCurrency);
                      })()}
                    </span>
                  </div>

                  {/* View Full Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full"
                  >
                    <span className="text-sm">{showBreakdown ? 'Hide' : 'View'} Full Cost Breakdown</span>
                    {showBreakdown ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </div>

              {/* Cost Breakdown - Only show when expanded */}
              {showBreakdown && (
              <div className="space-y-2">
                {/* Fabric/Material/Wallpaper */}
                <div className="border rounded-lg p-3">
                  <SummaryItem
                    title={
                      treatmentType === 'wallpaper' 
                        ? 'Wallpaper' 
                        : treatmentType?.includes('blind') 
                          ? 'Material' 
                          : 'Fabric'
                    }
                    main={formatCurrency(summary.fabric_cost, userCurrency)}
                    sub={
                      treatmentType === 'wallpaper'
                        ? `${summary.widths_required || 1} roll(s)`
                        : `${summary.linear_meters?.toFixed(1) || '0'} m • ${summary.widths_required || 1} width(s)`
                    }
                  />
                </div>

                {/* Curtains-specific items */}
                {(treatmentType === 'curtains' || !treatmentType) && (
                  <>
                    {Number(summary.lining_cost) > 0 && (
                      <div className="border rounded-lg p-3">
                        <SummaryItem
                          title="Lining"
                          main={formatCurrency(summary.lining_cost, userCurrency)}
                          sub={summary.lining_details?.type || 'Interlining'}
                        />
                      </div>
                    )}
                    
                    {Number(summary.heading_details?.cost || 0) > 0 && (
                      <div className="border rounded-lg p-3">
                        <SummaryItem
                          title="Heading"
                          main={formatCurrency(summary.heading_details?.cost || 0, userCurrency)}
                          sub={summary.heading_details?.heading_name || 'Standard'}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Blinds-specific items */}
                {(treatmentType?.includes('blind') || treatmentType?.includes('shutter')) && (
                  <>
                    {summary.hardware_details && (
                      <div className="border rounded-lg p-3">
                        <SummaryItem
                          title="Hardware/Mechanism"
                          main={formatCurrency(summary.hardware_details?.price || 0, userCurrency)}
                          sub={summary.hardware_details?.name || 'Control mechanism'}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Wallpaper-specific items */}
                {treatmentType === 'wallpaper' && (
                  <>
                    {summary.wallpaper_details?.adhesive_cost && (
                      <div className="border rounded-lg p-3">
                        <SummaryItem
                          title="Adhesive"
                          main={formatCurrency(summary.wallpaper_details.adhesive_cost, userCurrency)}
                          sub="Installation adhesive"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Selected Options - show ALL options (even zero-price) */}
                {enrichedBreakdown
                  .filter(item => item.category === 'option')
                  .map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <SummaryItem
                        title={item.name}
                        main={formatCurrency(item.total_cost, userCurrency)}
                        sub={item.description}
                      />
                    </div>
                  ))}

                {/* Manufacturing (show for curtains and blinds, not wallpaper) */}
                {treatmentType !== 'wallpaper' && (
                  <div className="border rounded-lg p-3">
                    <SummaryItem
                      title="Manufacturing"
                      main={formatCurrency(summary.manufacturing_cost, userCurrency)}
                      sub={summary.manufacturing_type || 'machine'}
                    />
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}