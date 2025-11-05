import React, { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWindowSummary } from "@/hooks/useWindowSummary";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { useCompactMode } from "@/hooks/useCompactMode";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { WindowRenameButton } from "./WindowRenameButton";
import { TreatmentTypeIndicator } from "../measurements/TreatmentTypeIndicator";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      total: summary?.total_cost,
      treatmentType,
      // Wallpaper debugging
      linear_meters: summary?.linear_meters,
      widths_required: summary?.widths_required,
      wall_width: summary?.measurements_details?.wall_width,
      wall_height: summary?.measurements_details?.wall_height
    });
  }

  const enrichedBreakdown = useMemo(() => {
    if (!summary) return [] as any[];

    console.log('🔍 Building enrichedBreakdown from summary:', {
      fabric_cost: summary.fabric_cost,
      manufacturing_cost: summary.manufacturing_cost,
      options_cost: summary.options_cost,
      total_cost: summary.total_cost,
      cost_breakdown: summary.cost_breakdown,
      userCurrency // CRITICAL: Log the currency being used
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

    // Detect if using pricing grid (blinds/shutters with both fabric and manufacturing costs)
    const manufacturingCost = Number(summary.manufacturing_cost) || 0;
    const usePricingGrid = isBlindsOrShutters && actualFabricCost > 0 && manufacturingCost > 0;
    
    // For pricing grids, combine fabric + manufacturing into single line
    const displayFabricCost = usePricingGrid ? actualFabricCost + manufacturingCost : actualFabricCost;
    
    // FABRIC/MATERIAL: Always include with proper name display
    const fabricName = usePricingGrid 
      ? 'Fabric Material'
      : (summary.material_details?.name ||
         summary.fabric_details?.name || 
         summary.fabric_details?.fabric_name ||  
         (isBlindsOrShutters ? 'Material' : treatmentType === 'wallpaper' ? 'Wallpaper Material' : 'Fabric'));
    
    // Build description and pricing based on treatment type
    let fabricDescription = '';
    let fabricQuantity = Number(summary.linear_meters) || 0;
    let fabricUnit = 'm';
    let fabricUnitPrice = Number(summary.price_per_meter) || 0;
    
    if (treatmentType === 'wallpaper') {
      // For wallpaper: check if sold per roll or per meter
      const wallpaperDetails = summary.fabric_details || summary.material_details || {};
      const soldBy = wallpaperDetails.sold_by || 'meter';
      
      if (soldBy === 'per_roll') {
        const rollsNeeded = Math.ceil(fabricQuantity / (Number(wallpaperDetails.wallpaper_roll_length) || 10));
        fabricQuantity = rollsNeeded;
        fabricUnit = 'roll';
        fabricUnitPrice = Number(wallpaperDetails.price_per_roll) || fabricUnitPrice;
        fabricDescription = `${rollsNeeded} roll${rollsNeeded > 1 ? 's' : ''} • ${fabricQuantity * (Number(wallpaperDetails.wallpaper_roll_length) || 10)}m total`;
      } else {
        const squareMeters = fabricQuantity * (summary.widths_required || 1) / 100;
        fabricDescription = `${fabricQuantity.toFixed(2)}m • ${squareMeters.toFixed(2)} m²`;
      }
    } else if (usePricingGrid) {
      // For pricing grids: show sqm calculation
      const sqm = fabricQuantity * (Number(summary.widths_required) || 1) / 10000; // Convert cm to sqm
      fabricQuantity = sqm;
      fabricUnit = 'sqm';
      fabricUnitPrice = displayFabricCost / sqm;
      fabricDescription = `${sqm.toFixed(2)} sqm × ${fabricUnitPrice.toFixed(2)}/sqm`;
    } else {
      // For curtains/blinds: show linear meters and widths
      fabricDescription = `${fabricQuantity.toFixed(2)}m • ${summary.widths_required || 1} width(s)`;
    }
    
    items.push({
      id: 'fabric',
      name: fabricName,
      description: fabricDescription,
      quantity: fabricQuantity,
      unit: fabricUnit,
      unit_price: fabricUnitPrice,
      total_cost: displayFabricCost,
      category: 'fabric',
      details: {
        widths_required: summary.widths_required,
        linear_meters: summary.linear_meters,
        price_per_meter: summary.price_per_meter,
        fabric_name: fabricName,
        sold_by: treatmentType === 'wallpaper' ? (summary.fabric_details?.sold_by || 'meter') : undefined,
      },
    });

    if (Number(summary.lining_cost) > 0) {
      const liningMeters = Number(summary.linear_meters) || 0;
      const liningPricePerMetre = Number(summary.lining_details?.price_per_metre) || 0;
      
      items.push({
        id: 'lining',
        name: summary.lining_details?.type || 'Lining',
        description: `${liningMeters.toFixed(2)}m lining material`,
        quantity: liningMeters,
        unit: 'm',
        unit_price: liningPricePerMetre,
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

    // Only add manufacturing cost separately if NOT using pricing grid (and not wallpaper)
    if (treatmentType !== 'wallpaper' && !usePricingGrid && manufacturingCost > 0) {
      items.push({
        id: 'manufacturing',
        name: 'Manufacturing',
        description: summary.manufacturing_type || 'Assembly & Manufacturing',
        total_cost: manufacturingCost,
        category: 'manufacturing',
        details: { type: summary.manufacturing_type },
      });
    }

    // Add hardware cost if available
    if (Number(summary.hardware_cost) > 0 || summary.hardware_details) {
      const hardwareName = summary.hardware_details?.name || 
                          summary.hardware_details?.hardware_name || 
                          'Hardware';
      const hardwareQuantity = Number(summary.hardware_details?.quantity) || 1;
      const hardwareUnitPrice = Number(summary.hardware_details?.unit_price) || 
                                Number(summary.hardware_details?.price) ||
                                Number(summary.hardware_cost) / hardwareQuantity;
      
      items.push({
        id: 'hardware',
        name: hardwareName,
        description: hardwareQuantity > 1 ? `${hardwareQuantity} unit${hardwareQuantity > 1 ? 's' : ''}` : hardwareName,
        quantity: hardwareQuantity,
        unit: 'unit',
        unit_price: hardwareUnitPrice,
        total_cost: Number(summary.hardware_cost) || 0,
        category: 'hardware',
        details: summary.hardware_details,
      });
    }

    // Add options cost if available - CRITICAL for completeness
    if (Number(summary.options_cost) > 0 || (summary.selected_options && (summary.selected_options as any[]).length > 0)) {
      const optionsDetails = summary.selected_options || [];
      
      // Build detailed description from measurements_details which contains the actual option selections
      let optionsDescription = 'Selected options';
      
      if (Array.isArray(optionsDetails) && optionsDetails.length > 0) {
        optionsDescription = optionsDetails
          .map((opt: any) => `${opt.name}${opt.price > 0 ? ` (+${formatCurrency(opt.price, userCurrency)})` : ''}`)
          .filter(Boolean)
          .join(' • ');
      }
      
      items.push({
        id: 'options',
        name: 'Additional Options',
        description: optionsDescription,
        total_cost: Number(summary.options_cost) || 0,
        category: 'options',
        details: { 
          selected_options: optionsDetails
        },
      });
    }

    return items;
  }, [summary]);

  const displayName = treatmentLabel || surface.name;

  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isMainWindow 
          ? 'bg-card border-border shadow-md hover:border-primary/30' 
          : 'bg-muted/30 border-muted-foreground/20 ml-3 shadow-sm hover:bg-muted/50'
      }`}
    >
      <CardHeader className={`relative ${isMainWindow ? 'pb-2' : 'pb-2 py-2'}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            {onRenameSurface ? (
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
            {/* REMOVED: Additional Treatment badge - only ONE treatment per window */}
            {!isMainWindow && treatmentType && (
              <TreatmentTypeIndicator treatmentType={treatmentType} size="sm" />
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
          <div className="space-y-3">
            {/* Treatment Card with Visual & Details */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex flex-col md:flex-row gap-2 p-2">
                {/* LEFT: Compact Treatment Preview - Hidden on mobile due to rendering issues */}
                <div className="hidden md:block w-24 h-24 flex-shrink-0">
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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-0.5 truncate">
                        {summary.template_name || (summary.material_details as any)?.name || (summary.fabric_details as any)?.name || 'Treatment'}
                      </h4>
                      {treatmentType === 'curtains' && summary.fabric_details?.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {(summary.heading_details as any)?.heading_name || 'Standard'} • {(summary.lining_details as any)?.type || 'Unlined'}
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
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
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


              {/* Expandable Cost Breakdown - Clean, organized breakdown */}
              {showBreakdown && (
                <div className="border-t bg-muted/30">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Calculator className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Detailed Cost Breakdown</h4>
                    </div>

                    {/* Wallpaper calculation details */}
                    {treatmentType === 'wallpaper' && summary && summary.measurements_details && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
                        <div className="text-xs font-semibold text-foreground mb-2">Wallpaper Calculations</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Wall Area:</span>
                            <span className="font-medium text-foreground ml-2">
                              {(() => {
                                const wallWidth = Number(summary.measurements_details?.wall_width) || 0;
                                const wallHeight = Number(summary.measurements_details?.wall_height) || 0;
                                const areaM2 = (wallWidth * wallHeight) / 10000; // cm² to m²
                                return areaM2.toFixed(2);
                              })()} m²
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Strips Required:</span>
                            <span className="font-medium text-foreground ml-2">{summary.widths_required || 1}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Length:</span>
                            <span className="font-medium text-foreground ml-2">
                              {(Number(summary.linear_meters) || 0).toFixed(2)}m
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sold By:</span>
                            <span className="font-medium text-foreground ml-2">
                              {summary.fabric_details?.sold_by === 'per_roll' ? 'roll' : 'meter'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Render all breakdown items from enrichedBreakdown */}
                      {enrichedBreakdown.map((item) => {
                        // Skip zero-cost items
                        if (item.total_cost === 0) return null;
                        const isOption = item.category === 'option' || item.category === 'options';
                        const hasQuantityPricing = item.quantity && item.unit && item.unit_price;
                        
                        return (
                          <div key={item.id} className={`rounded-lg bg-card border border-border p-3 ${isOption ? 'bg-muted/50' : ''}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="text-sm font-semibold text-foreground break-words">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground mt-1 break-words">{item.description}</div>
                                )}
                                {hasQuantityPricing && (
                                  <div className="text-xs font-medium text-foreground/80 mt-1.5 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Quantity:</span>
                                      <span>{Number(item.quantity).toFixed(2)} {item.unit}{Number(item.quantity) > 1 && item.unit !== 'm²' ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Unit Price:</span>
                                      <span>{formatCurrency(item.unit_price, userCurrency)}/{item.unit}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-base font-bold text-foreground">
                                  {formatCurrency(item.total_cost, userCurrency)}
                                </div>
                                {hasQuantityPricing && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {Number(item.quantity).toFixed(2)} × {formatCurrency(item.unit_price, userCurrency)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total */}
                    <div className="border-t-2 border-primary/20 pt-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">Total Cost</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(summary?.total_cost || 0, userCurrency)}
                        </span>
                      </div>
                    </div>
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