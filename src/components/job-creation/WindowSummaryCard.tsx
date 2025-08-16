
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWindowSummary } from "@/hooks/useWindowSummary";
import { formatCurrency } from "@/utils/unitConversion";
import { useCompactMode } from "@/hooks/useCompactMode";
import CalculationBreakdown from "@/components/job-creation/CalculationBreakdown";
import WorkshopSendDialog from "@/components/workroom/WorkshopSendDialog";
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
  const [showWorkshop, setShowWorkshop] = useState(false);
  const { compact } = useCompactMode();

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
    summary: summary ? {
      window_id: summary.window_id,
      total_cost: summary.total_cost,
      linear_meters: summary.linear_meters,
      widths_required: summary.widths_required,
      fabric_cost: summary.fabric_cost,
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
            {/* Summary Header */}
            <div className="rounded-lg border p-3">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(summary.total_cost, summary.currency)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-foreground">
                        {treatmentType || surface.treatment_type || 'Curtains'}
                      </span>
                      {summary.fabric_details?.name && (
                        <span className="text-muted-foreground">
                          Fabric: {summary.fabric_details.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-muted-foreground">
                      {(summary as any).rail_width && (
                        <span>Rail: {fmtFabric((summary as any).rail_width)}</span>
                      )}
                      {(summary as any).drop_measurement && (
                        <span>Drop: {fmtFabric((summary as any).drop_measurement)}</span>
                      )}
                      {(summary.fabric_details?.fabric_width || summary.fabric_details?.width_cm || summary.fabric_details?.width) && (
                        <span>Fabric Width: {
                          Math.round(summary.fabric_details?.fabric_width || summary.fabric_details?.width_cm || summary.fabric_details?.width || 137)
                        }cm</span>
                      )}
                      {summary.fabric_details?.pattern_repeat_vertical && Number(summary.fabric_details.pattern_repeat_vertical) > 0 && (
                        <span>V.Repeat: {Math.round(Number(summary.fabric_details.pattern_repeat_vertical))}cm</span>
                      )}
                      {summary.fabric_details?.pattern_repeat_horizontal && Number(summary.fabric_details.pattern_repeat_horizontal) > 0 && (
                        <span>H.Repeat: {Math.round(Number(summary.fabric_details.pattern_repeat_horizontal))}cm</span>
                      )}
                      {summary.price_per_meter && (
                        <span>£{Number(summary.price_per_meter).toFixed(2)}/m</span>
                      )}
                      {summary.widths_required && (
                        <span>{summary.widths_required} width(s)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBreakdown(!showBreakdown);
                    }}
                  >
                    {showBreakdown ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Breakdown
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(surface);
                    }}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Treatment
                  </Button>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWorkshop(true);
                    }}
                    title="Open workshop sheet"
                  >
                    Send to workshop
                  </Button>
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid gap-2 md:grid-cols-3">
                <SummaryItem
                  title="Fabric"
                  main={formatCurrency(summary.fabric_cost, summary.currency)}
                  sub={summary.fabric_details?.name ? 
                    `${summary.fabric_details.name} • ${fmtFabric(summary.linear_meters) || ''} • ${summary.widths_required} width(s)` :
                    `${fmtFabric(summary.linear_meters) || ''} • ${summary.widths_required} width(s)`
                  }
                />
                
                {Number(summary.lining_cost) > 0 && (
                  <SummaryItem
                    title="Lining"
                    main={formatCurrency(summary.lining_cost, summary.currency)}
                    sub={summary.lining_details?.type || summary.lining_type}
                  />
                )}
                
                <SummaryItem
                  title="Manufacturing"
                  main={formatCurrency(summary.manufacturing_cost, summary.currency)}
                  sub={summary.manufacturing_type}
                />
              </div>

              {/* Unified embedded breakdown (no extra container) */}
              {showBreakdown && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    Measurement and cost breakdown (saved from worksheet):
                  </div>
                  <CalculationBreakdown
                    summary={summary}
                    surface={surface}
                    compact={true}
                    costBreakdown={enrichedBreakdown}
                    currency={summary.currency}
                    totalCost={summary.total_cost}
                    embedded
                  />
                </div>
              )}
            </div>

          </div>
        )}
      </CardContent>

      {/* Workshop sheet dialog (print-ready, dynamic per treatment) */}
      {summary && (
        <WorkshopSendDialog
          open={showWorkshop}
          onOpenChange={setShowWorkshop}
          summary={summary}
          surface={surface}
          breakdown={enrichedBreakdown}
          currency={summary.currency}
        />
      )}
    </Card>
  );
}
