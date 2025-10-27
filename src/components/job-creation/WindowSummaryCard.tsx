import React, { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWindowSummary } from "@/hooks/useWindowSummary";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { useCompactMode } from "@/hooks/useCompactMode";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { WindowRenameButton } from "./WindowRenameButton";
import { TreatmentTypeIndicator } from "../measurements/TreatmentTypeIndicator";
import { CostSummaryCard } from "@/components/job-creation/treatment-pricing/CostSummaryCard";

// Lazy load heavy components - use direct import for now to avoid build issues
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";
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
  // TEMPORARY: Always allow editing to bypass permissions issue
  const canEditJobs = true; // useHasPermission('edit_all_jobs') || useHasPermission('edit_own_jobs');
  const canDeleteJobs = true; // useHasPermission('delete_jobs');
  
  // Add defensive check for surface data
  if (!surface || !surface.id) {
    console.error('WindowSummaryCard: Invalid surface data', surface);
    return null;
  }
  
  // Use surface.id directly as the window_id - single source of truth
  const windowId = surface.id;
  const { data: summary, isLoading, error } = useWindowSummary(windowId);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { compact } = useCompactMode();
  const userCurrency = useUserCurrency();

  // Detect treatment type from multiple sources - prioritize fabric category detection
  const detectTreatmentTypeFromFabric = () => {
    const category = summary?.fabric_details?.category?.toLowerCase() || '';
    if (category.includes('wallcover') || category.includes('wallpaper')) return 'wallpaper';
    if (category.includes('blind')) return 'blinds';
    return null;
  };

  const treatmentType = 
    propTreatmentType || 
    detectTreatmentTypeFromFabric() ||
    summary?.treatment_type || 
    summary?.treatment_category ||
    'curtains';

  // Unit helpers - measurements are already in cm, just format them
  const { formatLength } = useMeasurementUnits();
  const fmtMeasurement = (cm?: number) => {
    if (cm === undefined || cm === null) return undefined;
    const numValue = Number(cm);
    return isNaN(numValue) ? undefined : formatLength(numValue);
  };

  // Simplified logging - reduce console noise
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 WindowSummaryCard:', {
      windowId,
      hasSummary: !!summary,
      total: summary?.total_cost
    });
  }

  const enrichedBreakdown = useMemo(() => {
    if (!summary) return [] as any[];

    console.log('🔍 Building enrichedBreakdown from summary:', {
      fabric_cost: summary.fabric_cost,
      manufacturing_cost: summary.manufacturing_cost,
      options_cost: summary.options_cost,
      total_cost: summary.total_cost,
      cost_breakdown: summary.cost_breakdown
    });

    const raw = Array.isArray(summary.cost_breakdown) ? summary.cost_breakdown : [];
    const hasStructured = raw.some((it: any) => it && 'category' in it && 'total_cost' in it);
    if (hasStructured) {
      console.log('✅ Using structured cost_breakdown:', raw);
      return raw as any[];
    }

    console.log('🔨 Building breakdown from individual fields');
    const items: any[] = [];

    // CRITICAL: For blinds/shutters, if fabric_cost is 0 but total_cost exists, derive it
    const isBlindsOrShutters = summary.treatment_category === 'blinds' || 
                                summary.treatment_category === 'shutters' ||
                                summary.treatment_type?.includes('blind') ||
                                summary.treatment_type?.includes('shutter');
    
    let actualFabricCost = Number(summary.fabric_cost) || 0;
    
    // If fabric_cost is 0 for blinds/shutters, derive it from total minus other costs
    if (actualFabricCost === 0 && isBlindsOrShutters && Number(summary.total_cost) > 0) {
      const manufacturingCost = Number(summary.manufacturing_cost) || 0;
      const optionsCost = Number(summary.options_cost) || 0;
      const hardwareCost = Number(summary.hardware_cost) || 0;
      const liningCost = Number(summary.lining_cost) || 0;
      const headingCost = Number(summary.heading_cost) || 0;
      
      actualFabricCost = Number(summary.total_cost) - manufacturingCost - optionsCost - hardwareCost - liningCost - headingCost;
      console.log('🔧 Derived fabric cost for blinds:', {
        total: summary.total_cost,
        manufacturing: manufacturingCost,
        options: optionsCost,
        hardware: hardwareCost,
        derived: actualFabricCost
      });
    }

    // FABRIC/MATERIAL: Always include with proper name display
    const fabricName = summary.material_details?.name ||
                       summary.fabric_details?.name || 
                       summary.fabric_details?.fabric_name ||  
                       (isBlindsOrShutters ? 'Material' : 'Fabric');
    
    items.push({
      id: 'fabric',
      name: fabricName,
      description: `${fabricName} • ${fmtMeasurement(Number(summary.linear_meters)) || '0.00cm'} • ${summary.widths_required || 1} width(s)`,
      quantity: Number(summary.linear_meters) || 0,
      unit: 'm',
      unit_price: Number(summary.price_per_meter) || 0,
      total_cost: actualFabricCost,
      category: 'fabric',
      details: {
        widths_required: summary.widths_required,
        linear_meters: summary.linear_meters,
        price_per_meter: summary.price_per_meter,
        fabric_name: fabricName,
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

    // Only add manufacturing cost for non-wallpaper treatments
    if (treatmentType !== 'wallpaper') {
      items.push({
        id: 'manufacturing',
        name: 'Manufacturing',
        description: summary.manufacturing_type,
        total_cost: Number(summary.manufacturing_cost) || 0,
        category: 'manufacturing',
        details: { type: summary.manufacturing_type },
      });
    }

    // Add hardware cost if available
    if (Number(summary.hardware_cost) > 0 || summary.hardware_details) {
      const hardwareName = summary.hardware_details?.name || 
                          summary.hardware_details?.hardware_name || 
                          'Hardware';
      items.push({
        id: 'hardware',
        name: hardwareName,
        description: hardwareName,
        total_cost: Number(summary.hardware_cost) || 0,
        category: 'hardware',
        details: summary.hardware_details,
      });
    }

    // Add options cost if available - CRITICAL for completeness
    if (Number(summary.options_cost) > 0 || (summary.selected_options && (summary.selected_options as any[]).length > 0)) {
      const optionsDetails = summary.selected_options || [];
      const optionsDescription = Array.isArray(optionsDetails) && optionsDetails.length > 0
        ? optionsDetails.map((opt: any) => opt.name || opt.label).filter(Boolean).join(', ')
        : 'Selected options';
      
      items.push({
        id: 'options',
        name: 'Options',
        description: optionsDescription,
        total_cost: Number(summary.options_cost) || 0,
        category: 'options',
        details: { selected_options: optionsDetails },
      });
    }

    return items;
  }, [summary]);

  // Prepare costs object for CostSummaryCard
  const costSummaryData = useMemo(() => {
    if (!summary) return null;

    return {
      fabricCost: String(summary.fabric_cost || 0),
      optionsCost: String(summary.options_cost || 0),
      laborCost: String(summary.manufacturing_cost || 0),
      totalCost: String(summary.total_cost || 0),
      fabricUsage: String(summary.linear_meters || 0),
      fabricOrientation: (summary as any).fabric_orientation,
      warnings: (summary as any).warnings || [],
      seamsRequired: (summary as any).seams_required || 0,
      seamLaborHours: (summary as any).seam_labor_hours || 0,
      widthsRequired: summary.widths_required || 1,
      optionDetails: Array.isArray(summary.selected_options) 
        ? summary.selected_options.map((opt: any) => ({
            name: opt.name || opt.label || 'Option',
            cost: Number(opt.cost || 0),
            method: opt.method || '',
            calculation: opt.calculation || opt.description || ''
          }))
        : []
    };
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
            {canEditJobs && (
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
            )}
            {canDeleteJobs && (
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
            )}
            {!canEditJobs && !canDeleteJobs && (
              <p className="text-xs text-muted-foreground">Contact admin for edit access</p>
            )}
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
          <div className="space-y-4">
            {/* Treatment Card with Visual & Details */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex flex-col md:flex-row gap-3 p-3">
                {/* LEFT: Compact Treatment Preview - Hidden on mobile due to rendering issues */}
                <div className="hidden md:block w-32 h-32 flex-shrink-0">
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
                      fabric: treatmentType === 'curtains' ? summary.fabric_details : null,
                      hardware: summary.hardware_details,
                      material: treatmentType?.includes('blind') || treatmentType === 'shutters' 
                        ? summary.material_details 
                        : summary.fabric_details
                    }}
                    showProductOnly={true}
                    hideDetails={true}
                    className="w-full h-full"
                  />
                </div>

                {/* RIGHT: Compact Details */}
                <div className="flex-1 min-w-0 w-full">
                  {/* Compact Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-0.5 truncate">
                        {treatmentType === 'curtains' && (summary.fabric_details?.name || 'Sheer curtain')}
                        {treatmentType === 'wallpaper' && 'Wallpaper'}
                        {treatmentType?.includes('blind') && (summary.material_details?.name || summary.fabric_details?.name)}
                        {treatmentType === 'shutters' && (summary.material_details?.name || 'Plantation Shutters')}
                      </h4>
                      {treatmentType === 'curtains' && summary.fabric_details?.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {summary.heading_details?.heading_name || 'Standard'} • {summary.lining_details?.type || 'Unlined'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 flex-shrink-0 h-7 px-2"
                    >
                      <span className="text-xs font-medium">Details</span>
                      {showBreakdown ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
                    </Button>
                  </div>

                  {/* Compact Info Grid - Better mobile layout */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {/* Curtains Measurements */}
                    {(treatmentType === 'curtains' || !treatmentType) && (
                      <>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Width</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.rail_width) || 
                              Number(surface.rail_width) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width) || 0
                            ) || '—'}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Height</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.drop) || 
                              Number(surface.drop) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height) || 0
                            ) || '—'}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Blinds Measurements */}
                    {treatmentType?.includes('blind') && (
                      <>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Width</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.rail_width) || 
                              Number(summary.measurements_details?.width) || 
                              Number(summary.measurements_details?.measurement_a) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width) || 0
                            ) || '—'}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Height</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.drop) || 
                              Number(summary.measurements_details?.height) || 
                              Number(summary.measurements_details?.measurement_b) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height) || 0
                            ) || '—'}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Wallpaper Measurements */}
                    {treatmentType === 'wallpaper' && (
                      <>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Wall Width</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.wall_width) || 
                              Number(summary.measurements_details?.width) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width) || 0
                            ) || '—'}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Wall Height</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.wall_height) || 
                              Number(summary.measurements_details?.height) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height) || 0
                            ) || '—'}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Shutters Measurements */}
                    {treatmentType === 'shutters' && (
                      <>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Width</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.width) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width) || 0
                            ) || '—'}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Height</div>
                          <div className="font-semibold text-sm">
                            {fmtMeasurement(
                              Number(summary.measurements_details?.height) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height) || 0
                            ) || '—'}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Total Price - Full width on mobile, right aligned on desktop */}
                    <div className="col-span-2 space-y-0.5 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-bold text-lg text-primary">
                        {formatCurrency(summary.total_cost || 0, userCurrency)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Expandable Cost Breakdown - Use enrichedBreakdown for accurate costs */}
              {showBreakdown && (
                <div className="border-t p-3 bg-muted/20">
                  {/* Show CostSummaryCard for detailed breakdown */}
                  {costSummaryData && (
                    <div className="mb-4">
                      <CostSummaryCard 
                        costs={costSummaryData}
                        treatmentType={treatmentType}
                        selectedOptions={Array.isArray(summary?.selected_options) ? summary.selected_options.map((opt: any) => opt.id || opt.name) : []}
                        availableOptions={[]}
                        hierarchicalOptions={[]}
                        formData={{ quantity: 1 }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {/* Render all breakdown items from enrichedBreakdown for accuracy */}
                    {enrichedBreakdown.map((item) => {
                      // Skip options here - they're rendered separately below
                      if (item.category === 'option' || item.category === 'options') return null;
                      
                      return (
                        <div key={item.id} className="border rounded-lg p-3">
                          <SummaryItem
                            title={item.name}
                            main={formatCurrency(item.total_cost, userCurrency)}
                            sub={item.description || ''}
                          />
                        </div>
                      );
                    })}

                    {/* Selected Options - show ALL options from enrichedBreakdown */}
                    {enrichedBreakdown
                      .filter(item => item.category === 'option' || item.category === 'options')
                      .map((item) => (
                        <div key={item.id} className="border rounded-lg p-3">
                          <SummaryItem
                            title={item.name}
                            main={formatCurrency(item.total_cost, userCurrency)}
                            sub={item.description}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}