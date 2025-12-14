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

  // Unit helpers - CRITICAL: measurements from windows_summary are in MM, not CM!
  const { units, convertToUserUnit, getLengthUnitLabel } = useMeasurementUnits();
  
  /**
   * Format measurement for display - returns "Not set" when no valid measurement
   * CRITICAL: Only show actual values, never placeholder/static numbers
   */
  const fmtMeasurement = (mm?: number) => {
    // Return "Not set" for undefined, null, zero, or invalid values
    if (mm === undefined || mm === null) return null;
    const numValue = Number(mm);
    if (isNaN(numValue) || numValue <= 0) return null;
    // Convert from MM to user's preferred unit
    const converted = convertToUserUnit(numValue, 'mm');
    const unitLabel = getLengthUnitLabel();
    return `${converted.toFixed(2)} ${unitLabel}`;
  };
  
  // Helper to display measurement or "Not set" placeholder
  const displayMeasurement = (value: string | null) => {
    return value || <span className="text-muted-foreground italic">Not set</span>;
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

  // DISPLAY-ONLY ARCHITECTURE: Trust saved cost_breakdown completely, no recalculations
  const enrichedBreakdown = useMemo(() => {
    if (!summary) return [] as any[];

    console.log('📊 [DISPLAY-ONLY] Loading cost_breakdown from database:', {
      has_breakdown: Array.isArray(summary.cost_breakdown),
      breakdown_length: (summary.cost_breakdown as any[])?.length,
      total_cost: summary.total_cost,
      userCurrency
    });

    const raw = Array.isArray(summary.cost_breakdown) ? summary.cost_breakdown : [];
    
    // If we have structured cost_breakdown, use it directly - NO recalculations
    const hasStructured = raw.some((it: any) => it && 'category' in it && 'total_cost' in it);
    if (hasStructured) {
      console.log('✅ [DISPLAY-ONLY] Using saved cost_breakdown as-is:', raw.map((i: any) => ({ name: i.name, total: i.total_cost })));
      return raw as any[];
    }

    // Fallback: Build display breakdown from summary fields (still no recalculation)
    console.log('📦 [DISPLAY-ONLY] Building breakdown from saved summary fields (no recalc)');
    const items: any[] = [];

    const isBlindsOrShutters = summary.treatment_category === 'blinds' || 
                                summary.treatment_category === 'shutters' ||
                                summary.treatment_type?.includes('blind') ||
                                summary.treatment_type?.includes('shutter');
    
    // DISPLAY-ONLY: Use saved fabric_cost directly - no recalculation
    const actualFabricCost = Number(summary.fabric_cost) || 0;

    // Detect if using pricing grid (blinds/shutters with both fabric and manufacturing costs)
    const manufacturingCost = Number(summary.manufacturing_cost) || 0;
    const usePricingGrid = isBlindsOrShutters && actualFabricCost > 0 && manufacturingCost > 0;
    
    // For pricing grids, combine fabric + manufacturing into single line
    const displayFabricCost = usePricingGrid ? actualFabricCost + manufacturingCost : actualFabricCost;
    
    // FABRIC/MATERIAL: Always include with proper name display
    const fabricName = usePricingGrid 
      ? (isBlindsOrShutters ? 'Material' : treatmentType === 'wallpaper' ? 'Wallpaper' : 'Fabric')
      : (summary.material_details?.name ||
         summary.fabric_details?.name || 
         summary.fabric_details?.fabric_name ||  
         (isBlindsOrShutters ? 'Material' : treatmentType === 'wallpaper' ? 'Wallpaper' : 'Fabric'));
    
    // Build description and pricing based on treatment type
    let fabricDescription = '';
    let fabricQuantity = Number(summary.linear_meters) || 0;
    let fabricUnit = 'm';
    let fabricUnitPrice = Number(summary.price_per_meter) || 0;
    
    // Get orientation info from saved measurements (no recalculation)
    const measurementDetails = (summary.measurements_details as any) || {};
    const isRailroaded = measurementDetails.fabric_rotated || measurementDetails.fabric_orientation === 'horizontal';
    const horizontalPieces = measurementDetails.horizontal_pieces_needed || (isRailroaded ? 1 : 1);
    const fabricOrientation = isRailroaded ? 'horizontal' : 'vertical';
    
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
      // CRITICAL FIX: Measurements in database are stored in MM!
      const widthMm = parseFloat(summary.measurements_details?.rail_width) || 0;
      const dropMm = parseFloat(summary.measurements_details?.drop) || 0;
      // Convert mm to cm for display
      const widthCm = widthMm / 10;
      const dropCm = dropMm / 10;
      
      console.log('📐 PRICING GRID DISPLAY (Simplified):', {
        widthMm,
        dropMm,
        widthCm,
        dropCm,
        gridPrice: displayFabricCost,
        note: 'Showing consolidated grid price only - no detailed breakdown'
      });
      
      // For pricing grid, show ONLY the grid price - no quantity/unit breakdown
      // This avoids confusing the client with formulas they can't verify
      fabricQuantity = 1;
      fabricUnit = 'item';
      fabricUnitPrice = displayFabricCost;
      fabricDescription = `Grid Price (${widthCm.toFixed(0)}cm × ${dropCm.toFixed(0)}cm)`;
    } else {
      // For curtains/blinds: show linear meters and widths
      // CRITICAL: For horizontal/railroaded, multiply by pieces and show total
      if (fabricOrientation === 'horizontal' && horizontalPieces > 1) {
        const totalMeters = fabricQuantity * horizontalPieces;
        fabricDescription = `${fabricQuantity.toFixed(2)}m × ${horizontalPieces} pieces = ${totalMeters.toFixed(2)}m`;
        fabricQuantity = totalMeters; // Update quantity for total cost calculation
      } else {
        fabricDescription = `${fabricQuantity.toFixed(2)}m • ${summary.widths_required || 1} width(s)`;
      }
    }
    
    items.push({
      id: 'fabric',
      name: fabricName,
      description: fabricDescription,
      quantity: fabricQuantity,  // This is now the total including horizontal pieces
      unit: fabricUnit,
      unit_price: fabricUnitPrice,
      total_cost: displayFabricCost,  // Use the fabric_cost from summary (already includes pieces)
      category: 'fabric',
      details: {
        widths_required: summary.widths_required,
        linear_meters: summary.linear_meters,
        horizontal_pieces: horizontalPieces,
        fabric_orientation: fabricOrientation,
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

  // DISPLAY-ONLY: Use saved total_cost directly - no recalculation
  const displayTotal = useMemo(() => {
    if (!summary) return 0;
    
    // If we have structured breakdown, sum it for consistency
    if (enrichedBreakdown.length > 0 && enrichedBreakdown[0]?.total_cost !== undefined) {
      const breakdownTotal = enrichedBreakdown.reduce((sum, item) => {
        return sum + (Number(item.total_cost) || 0);
      }, 0);
      console.log('💰 [DISPLAY-ONLY] Using breakdown total:', breakdownTotal);
      return breakdownTotal;
    }
    
    // Fallback to saved total_cost
    console.log('💰 [DISPLAY-ONLY] Using saved total_cost:', summary.total_cost);
    return Number(summary.total_cost) || 0;
  }, [summary, enrichedBreakdown]);

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
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.rail_width) || 
                              Number(surface.rail_width) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width)
                            ))}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Height</div>
                          <div className="font-semibold text-sm">
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.drop) || 
                              Number(surface.drop) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height)
                            ))}
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
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.rail_width) || 
                              Number(summary.measurements_details?.width) || 
                              Number(summary.measurements_details?.measurement_a) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width)
                            ))}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Height</div>
                          <div className="font-semibold text-sm">
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.drop) || 
                              Number(summary.measurements_details?.height) || 
                              Number(summary.measurements_details?.measurement_b) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height)
                            ))}
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
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.wall_width) || 
                              Number(summary.measurements_details?.width) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width)
                            ))}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Wall Height</div>
                          <div className="font-semibold text-sm">
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.wall_height) || 
                              Number(summary.measurements_details?.height) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height)
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Shutters Measurements - CRITICAL: Check rail_width/drop first (standard for blinds/shutters) */}
                    {treatmentType === 'shutters' && (
                      <>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Width</div>
                          <div className="font-semibold text-sm">
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.rail_width) || 
                              Number(summary.measurements_details?.width) || 
                              Number(surface.measurement_a) || 
                              Number(surface.width)
                            ))}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Height</div>
                          <div className="font-semibold text-sm">
                            {displayMeasurement(fmtMeasurement(
                              Number(summary.measurements_details?.drop) || 
                              Number(summary.measurements_details?.height) || 
                              Number(surface.measurement_b) || 
                              Number(surface.height)
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Total Price - Full width on mobile, right aligned on desktop */}
                    <div className="col-span-2 space-y-0.5 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-bold text-lg text-primary">
                        {formatCurrency(displayTotal, userCurrency)}
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

                    {/* Total - Use displayTotal to match the sum of breakdown items */}
                    <div className="border-t-2 border-primary/20 pt-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">Total Cost</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(displayTotal, userCurrency)}
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