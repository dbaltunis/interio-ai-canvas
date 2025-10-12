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
              <div className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4">
                {/* Treatment Visualization - Clean product image only */}
                <div className="w-full sm:w-40 h-40 sm:flex-shrink-0 rounded-md overflow-hidden bg-muted/20 border">
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
                    showProductOnly={true}
                    hideDetails={true}
                    className="w-full h-full"
                  />
                </div>

                {/* Product Details Grid */}
                <div className="flex-1 min-w-0">
                  {/* Product Type Header */}
                  <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="font-semibold text-base">
                      {treatmentType === 'curtains' && 'Sheer curtain'}
                      {treatmentType === 'wallpaper' && 'Wallpaper'}
                      {treatmentType?.includes('blind') && summary.fabric_details?.name}
                      {treatmentType === 'shutters' && 'Plantation Shutters'}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-primary hover:text-primary/80 self-start sm:self-auto"
                    >
                      <span className="text-sm">Full details</span>
                      {showBreakdown ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
                    </Button>
                  </div>

                  {/* Details Grid - 2 Columns on desktop, 1 on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 text-sm">
                    {/* Curtains Details */}
                    {(treatmentType === 'curtains' || !treatmentType) && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rail width</span>
                          <span className="font-medium">{fmtFabric(surface.rail_width || surface.width)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Curtain drop</span>
                          <span className="font-medium">{fmtFabric(surface.drop || surface.height)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heading name</span>
                          <span className="font-medium">{summary.heading_details?.heading_name || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lining</span>
                          <span className="font-medium">{summary.lining_details?.type || 'Unlined'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabric article</span>
                          <span className="font-medium truncate">{summary.fabric_details?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabric price</span>
                          <span className="font-medium">{formatCurrency(summary.fabric_cost, userCurrency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Manufacturing price</span>
                          <span className="font-medium">{formatCurrency(summary.manufacturing_cost, userCurrency)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total price</span>
                          <span>{(() => {
                            const fabricCost = Number(summary.fabric_cost) || 0;
                            const liningCost = Number(summary.lining_cost) || 0;
                            const manufacturingCost = Number(summary.manufacturing_cost) || 0;
                            const headingCost = summary.heading_details?.cost ? Number(summary.heading_details.cost) : 0;
                            return formatCurrency(fabricCost + liningCost + manufacturingCost + headingCost, userCurrency);
                          })()}</span>
                        </div>
                      </>
                    )}

                    {/* Blinds Details */}
                    {treatmentType?.includes('blind') && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Width</span>
                          <span className="font-medium">{fmtFabric(surface.measurement_a || surface.width)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height</span>
                          <span className="font-medium">{fmtFabric(surface.measurement_b || surface.height)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">
                            {treatmentType === 'roller_blinds' && 'Roller'}
                            {treatmentType === 'roman_blinds' && 'Roman'}
                            {treatmentType === 'venetian_blinds' && 'Venetian'}
                            {treatmentType === 'cellular_blinds' && 'Cellular'}
                            {treatmentType === 'vertical_blinds' && 'Vertical'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Operation</span>
                          <span className="font-medium">{summary.hardware_details?.name || 'Manual'}</span>
                        </div>
                        {treatmentType === 'cellular_blinds' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pleat cell size</span>
                            <span className="font-medium">25mm</span>
                          </div>
                        )}
                        {treatmentType === 'venetian_blinds' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Slat size</span>
                            <span className="font-medium">25mm</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Material</span>
                          <span className="font-medium truncate">{summary.fabric_details?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Manufacturing price</span>
                          <span className="font-medium">{formatCurrency(summary.manufacturing_cost, userCurrency)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total price</span>
                          <span>{formatCurrency((Number(summary.fabric_cost) || 0) + (Number(summary.manufacturing_cost) || 0), userCurrency)}</span>
                        </div>
                      </>
                    )}

                    {/* Wallpaper Details */}
                    {treatmentType === 'wallpaper' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Width</span>
                          <span className="font-medium">{fmtFabric(surface.measurement_a || surface.width)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height</span>
                          <span className="font-medium">{fmtFabric(surface.measurement_b || surface.height)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wallpaper article</span>
                          <span className="font-medium truncate">{summary.fabric_details?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sold by</span>
                          <span className="font-medium">{summary.wallpaper_details?.sold_by || 'Roll'}</span>
                        </div>
                        {summary.wallpaper_details?.rolls_needed && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rolls needed</span>
                              <span className="font-medium">{summary.wallpaper_details.rolls_needed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Coverage</span>
                              <span className="font-medium">{summary.wallpaper_details.total_meters}m</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wallpaper price</span>
                          <span className="font-medium">{formatCurrency(summary.fabric_cost, userCurrency)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total price</span>
                          <span>{formatCurrency(Number(summary.fabric_cost) || 0, userCurrency)}</span>
                        </div>
                      </>
                    )}

                    {/* Shutters Details */}
                    {(treatmentType === 'shutters' || treatmentType === 'plantation_shutters') && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Width</span>
                          <span className="font-medium">{fmtFabric(surface.measurement_a || surface.width)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height</span>
                          <span className="font-medium">{fmtFabric(surface.measurement_b || surface.height)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Material</span>
                          <span className="font-medium">{summary.fabric_details?.name || 'Basswood'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Louver size</span>
                          <span className="font-medium">63mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Manufacturing price</span>
                          <span className="font-medium">{formatCurrency(summary.manufacturing_cost, userCurrency)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total price</span>
                          <span>{formatCurrency((Number(summary.fabric_cost) || 0) + (Number(summary.manufacturing_cost) || 0), userCurrency)}</span>
                        </div>
                      </>
                    )}
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