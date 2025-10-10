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
  treatmentType
}: WindowSummaryCardProps) {
  // Use surface.id directly as the window_id - single source of truth
  const windowId = surface.id;
  const { data: summary, isLoading, error } = useWindowSummary(windowId);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { compact } = useCompactMode();
  const userCurrency = useUserCurrency();

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
            {/* Summary Header - Compact */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-2xl font-semibold">
                    {(() => {
                      // Calculate total including heading cost
                      const fabricCost = Number(summary.fabric_cost) || 0;
                      const liningCost = Number(summary.lining_cost) || 0;
                      const manufacturingCost = Number(summary.manufacturing_cost) || 0;
                      const headingCost = summary.heading_details?.cost ? Number(summary.heading_details.cost) : 0;
                      const calculatedTotal = fabricCost + liningCost + manufacturingCost + headingCost;
                      
                      return formatCurrency(calculatedTotal, userCurrency);
                    })()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="text-xs mr-1">Details</span>
                  {showBreakdown ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
              
              {/* Essential info only */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{treatmentType || 'Curtains'}</span>
                  {summary.fabric_details?.name && (
                    <span>Fabric: {summary.fabric_details.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>{Math.round(summary.fabric_details?.fabric_width || summary.fabric_details?.width_cm || summary.fabric_details?.width || 137)}cm @ {formatCurrency(summary.fabric_details?.selling_price || 45, userCurrency)}/m</span>
                  <span>{summary.widths_required || 1} width(s)</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown - Only show when expanded */}
            {showBreakdown && (
              <div className="space-y-2">
                {/* Fabric/Material */}
                <div className="border rounded-lg p-3">
                  <SummaryItem
                    title={summary.fabric_details?.category?.includes('blind') ? 'Blind Fabric' : 'Fabric'}
                    main={formatCurrency(summary.fabric_cost, userCurrency)}
                    sub={`${summary.linear_meters?.toFixed(1) || '0'} m • ${summary.widths_required || 1} width(s)`}
                  />
                </div>

                {/* For curtains: show lining and heading */}
                {treatmentType === 'curtains' || !summary.fabric_details?.category?.includes('blind') ? (
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
                ) : null}

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

                {/* Manufacturing */}
                <div className="border rounded-lg p-3">
                  <SummaryItem
                    title="Manufacturing"
                    main={formatCurrency(summary.manufacturing_cost, userCurrency)}
                    sub={summary.manufacturing_type || 'machine'}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}