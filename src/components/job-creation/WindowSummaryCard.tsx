import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react";
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
        ? `${summary.fabric_details.name} • ${fmtMeasurement(Number(summary.linear_meters)) || '0.00cm'} • ${summary.widths_required || 0} width(s)`
        : `${fmtMeasurement(Number(summary.linear_meters)) || '0.00cm'} • ${summary.widths_required || 0} width(s)`,
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
          <div className="space-y-4">
            {/* Treatment Card with Visual & Details */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-0">
                {/* LEFT: Treatment Visualization */}
                <div className="w-full sm:w-48 h-48 sm:flex-shrink-0 bg-gradient-to-br from-muted/30 to-muted/10 border-b sm:border-b-0 sm:border-r flex items-center justify-center p-4">
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
                    className="w-full h-full max-w-[180px]"
                  />
                </div>

                {/* RIGHT: Product Details */}
                <div className="flex-1 min-w-0 p-4">
                  {/* Header with Product Name and Expand Button */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-1">
                        {treatmentType === 'curtains' && (summary.fabric_details?.name || 'Sheer curtain')}
                        {treatmentType === 'wallpaper' && 'Wallpaper'}
                        {treatmentType?.includes('blind') && (summary.material_details?.name || summary.fabric_details?.name)}
                        {treatmentType === 'shutters' && (summary.material_details?.name || 'Plantation Shutters')}
                      </h4>
                      {treatmentType === 'curtains' && summary.fabric_details?.name && (
                        <p className="text-xs text-muted-foreground">
                          {summary.heading_details?.heading_name || 'Standard'} • {summary.lining_details?.type || 'Unlined'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 flex-shrink-0"
                    >
                      <span className="text-sm font-medium">Full details</span>
                      {showBreakdown ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
                    </Button>
                  </div>

                  {/* Measurements Section */}
                  <div className="space-y-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Measurements</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Curtains Measurements */}
                        {(treatmentType === 'curtains' || !treatmentType) && (
                          <>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Rail width</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
                                  Number(summary.measurements_details?.rail_width) || 
                                  Number(surface.rail_width) || 
                                  Number(surface.measurement_a) || 
                                  Number(surface.width) || 0
                                ) || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Curtain drop</div>
                              <div className="font-semibold text-base">
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
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Width</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
                                  Number(summary.measurements_details?.width) || 
                                  Number(summary.measurements_details?.measurement_a) || 
                                  Number(surface.measurement_a) || 
                                  Number(surface.width) || 0
                                ) || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Height</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
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
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Width</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
                                  Number(summary.measurements_details?.width) || 
                                  Number(surface.measurement_a) || 
                                  Number(surface.width) || 0
                                ) || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Height</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
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
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Width</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
                                  Number(summary.measurements_details?.width) || 
                                  Number(surface.measurement_a) || 
                                  Number(surface.width) || 0
                                ) || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Height</div>
                              <div className="font-semibold text-base">
                                {fmtMeasurement(
                                  Number(summary.measurements_details?.height) || 
                                  Number(surface.measurement_b) || 
                                  Number(surface.height) || 0
                                ) || '—'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Materials & Costs Section */}
                    <div className="grid grid-cols-1 gap-2">
                      {/* Curtains: Fabric Info */}
                      {(treatmentType === 'curtains' || !treatmentType) && summary.linear_meters > 0 && (
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Fabric quantity</div>
                            <div className="font-medium">{fmtMeasurement(Number(summary.linear_meters) || 0)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(summary.fabric_cost || 0, userCurrency)}</div>
                          </div>
                        </div>
                      )}

                      {/* Blinds: Material Info */}
                      {treatmentType?.includes('blind') && summary.linear_meters > 0 && (
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Material quantity</div>
                            <div className="font-medium">{fmtMeasurement(Number(summary.linear_meters))}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(summary.fabric_cost || 0, userCurrency)}</div>
                          </div>
                        </div>
                      )}

                      {/* Manufacturing */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">Manufacturing</div>
                          {summary.manufacturing_type && (
                            <div className="text-xs text-muted-foreground/70">{summary.manufacturing_type}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(summary.manufacturing_cost || 0, userCurrency)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Total Price - Highlighted */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">Total price</span>
                        <span className="font-bold text-xl text-primary">{formatCurrency(summary.total_cost || 0, userCurrency)}</span>
                      </div>
                    </div>
                  </div>
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