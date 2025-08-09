import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/unitConversion";
import { numberFmt, metersFmt, extractWindowMetrics } from "@/utils/windowSummaryExtractors";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface CalculationBreakdownProps {
  summary: any;
  surface: any;
  compact?: boolean;
  // New: embed cost breakdown directly in this container
  costBreakdown?: any[];
  currency?: string;
  totalCost?: number;
  embedded?: boolean;
}

const toNumber = (val: any): number | undefined => {
  const n = typeof val === "string" ? parseFloat(val) : typeof val === "number" ? val : undefined;
  return Number.isFinite(n as number) ? (n as number) : undefined;
};

const pickFirstNumber = (...vals: any[]): number | undefined => {
  for (const v of vals) {
    const n = toNumber(v);
    if (n !== undefined) return n;
  }
  return undefined;
};

// Trim trailing zeros for nicer display (e.g., 2.50 -> 2.5, 3.00 -> 3)
const trimFixed = (n?: number, digits = 2): string | undefined => {
  if (n === undefined || n === null || !Number.isFinite(Number(n))) return undefined;
  return Number(n).toFixed(digits).replace(/\.?0+$/, "");
};

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({
  summary,
  surface,
  compact,
  costBreakdown,
  currency,
  totalCost,
  embedded
}) => {
  // Use only saved worksheet values; do not recompute derived metrics
  const mdRaw = summary?.measurements_details;
  const md = React.useMemo(() => {
    try {
      return typeof mdRaw === "string" ? JSON.parse(mdRaw) : (mdRaw || {});
    } catch {
      return {} as Record<string, any>;
    }
  }, [mdRaw]);

  const getNum = (val: any): number | undefined => {
    const n = typeof val === "string" ? parseFloat(val) : typeof val === "number" ? val : undefined;
    return Number.isFinite(n as number) ? (n as number) : undefined;
  };

  // Use normalized, unit-safe metrics
  const xm = extractWindowMetrics(summary, surface);
  const fabricWidthCm = xm.fabricWidthCm;
  const railWidthCm = xm.railWidthCm;
  const fullness = xm.fullness;
  const sideHems = xm.sideHems;
  const headerHem = xm.headerHem;
  const bottomHem = xm.bottomHem;
  const seamHems = xm.seamHems;
  const dropCm = xm.dropCm;
  const pooling = xm.pooling;
  const returnLeft = xm.returnLeft;
  const returnRight = xm.returnRight;
  const vRepeat = xm.vRepeat;
  const hRepeat = xm.hRepeat;
  const wastePercent = xm.wastePercent;
  const curtainCount = xm.curtainCount;
  // Saved outputs from worksheet
  const widthsRequired = getNum(summary?.widths_required ?? md.widths_required);
  const linearMeters = getNum(summary?.linear_meters ?? md.linear_meters);
  const manufacturingType = summary?.manufacturing_type ?? md.manufacturing_type;
  const pricePerMeter = getNum(
    summary?.price_per_meter ?? summary?.fabric_details?.price_per_meter ?? summary?.fabric_details?.unit_price
  );
  const fabricName = summary?.fabric_details?.name ?? md.fabric_name;
  const liningType = summary?.lining_details?.type ?? summary?.lining_type ?? md.lining_type;
  const headingType = summary?.heading_details?.type ?? md.heading_type ?? md.selected_heading;

  // Saved derived steps (use only if present)
  const requiredWidthCm = getNum(md.required_width_cm ?? md.required_width);
  const totalWidthWithAllowancesCm = getNum(
    md.total_width_with_allowances_cm ?? md.total_width_with_allowances
  );
  const seamsRequired = getNum(md.seams_required ?? md.seams_count);
  const seamAllowTotalCm = getNum(
    md.seam_allow_total_cm ?? md.seam_allowances_total_cm ?? md.seam_allow_total ?? md.seam_allowances_total
  );
  const totalDropPerWidth = getNum(
    md.total_drop_per_width_cm ?? md.total_drop_cm ?? md.drop_total_cm
  );

  // Saved leftovers (if provided by worksheet)
  const totalCapacityWidth = getNum(md.fabric_capacity_width_total_cm ?? md.fabric_capacity_total_cm);
  const leftoverWidthCm = getNum(
    md.leftover_width_total_cm ?? md.leftover_total_cm ?? md.leftover_width_cm
  );
  const leftoverPerPanelCm = getNum(
    md.leftover_per_panel_cm ?? md.leftover_width_per_panel_cm
  );

  const activeCurrency = currency || summary?.currency || "GBP";
  const hasCostBreakdown = Array.isArray(costBreakdown) && costBreakdown.length > 0;

  // Unit-aware formatting helpers
  const { convertToUserUnit, formatLength, formatFabric } = useMeasurementUnits();
  const fmtLen = (cm?: number) => (cm !== undefined ? formatLength(convertToUserUnit(cm, 'cm')) : undefined);
  const fmtFabric = (m?: number) => (m !== undefined ? formatFabric(convertToUserUnit(m, 'm')) : undefined);

  // Pre-format complex line items using saved totals if available
  const totalSideHemsSaved = getNum(md.total_side_hems_cm ?? md.side_hems_total_cm);
  const sideHemsDisplay = (() => {
    if (totalSideHemsSaved !== undefined && sideHems !== undefined && curtainCount !== undefined) {
      return `${fmtLen(sideHems)} × 2 sides × ${curtainCount} curtain(s) = ${fmtLen(totalSideHemsSaved)} total`;
    }
    if (totalSideHemsSaved !== undefined) return `${fmtLen(totalSideHemsSaved)} total`;
    if (sideHems !== undefined) return `${fmtLen(sideHems)}`;
    return undefined;
  })();

  const returnsTotalSaved = getNum(md.returns_total_cm ?? md.returns_total);
  const returnsDisplay = (() => {
    if (returnsTotalSaved !== undefined) return `${fmtLen(returnsTotalSaved)}`;
    if ((returnLeft ?? 0) > 0 || (returnRight ?? 0) > 0) {
      // Show components without computing total
      const leftStr = returnLeft !== undefined ? `${fmtLen(returnLeft)}` : undefined;
      const rightStr = returnRight !== undefined ? `${fmtLen(returnRight)}` : undefined;
      return [leftStr, rightStr].filter(Boolean).join(" + ");
    }
    return undefined;
  })();

  // Row component with dotted leader between label and value
  const Item = ({ label, value }: { label: string; value?: string | number }) => {
    const hasValue = value !== undefined && value !== null && String(value).length > 0;
    if (!label || !hasValue) return null;
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <span className="text-muted-foreground/80">{label}</span>
        <span aria-hidden="true" className="flex-1 border-b border-dotted border-muted-foreground/40" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    );
  };

  return (
    <div className={embedded ? "" : (compact ? "rounded-lg border p-2 bg-muted/30" : "rounded-lg border p-3 bg-muted/30") }>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Calculation breakdown</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {manufacturingType && (
            <Badge variant="outline" className="text-xs">Manufacturing: {manufacturingType}</Badge>
          )}
          {typeof widthsRequired === "number" && (
            <Badge variant="secondary" className="text-xs">Widths: {widthsRequired}</Badge>
          )}
          {typeof linearMeters === "number" && linearMeters > 0 && (
            <Badge variant="secondary" className="text-xs">
              Linear: {metersFmt(linearMeters, 2)}
            </Badge>
          )}
        </div>
      </div>

      {/* Materials quick info */}
      <div className="flex flex-wrap gap-2 mb-2">
        {fabricName && (
          <Badge variant="secondary" className="text-xs">
            {fabricName}
            {fabricWidthCm ? ` • ${fmtLen(fabricWidthCm)}` : ""}
            {pricePerMeter ? ` • ${formatCurrency(pricePerMeter, activeCurrency)}` : ""}
          </Badge>
        )}
        {liningType && (
          <Badge variant="secondary" className="text-xs">
            Lining: {liningType}
          </Badge>
        )}
        {headingType && (
          <Badge variant="secondary" className="text-xs">
            Heading: {headingType}
          </Badge>
        )}
        {fullness !== undefined && (
          <Badge variant="secondary" className="text-xs">
            Fullness: {trimFixed(fullness, 2)}x
          </Badge>
        )}
      </div>

      {/* Step-by-step points */}
      <div className="space-y-1">
        <Item label="Fabric width" value={fmtLen(fabricWidthCm)} />
        <Item label="Rail width" value={fmtLen(railWidthCm)} />
        <Item label="Fullness multiplier" value={fullness !== undefined ? `${trimFixed(fullness, 2)}x` : undefined} />
        <Item label="Required width" value={fmtLen(requiredWidthCm)} />
        {sideHemsDisplay && (
          <Item label="Side hems" value={sideHemsDisplay} />
        )}
        {returnsDisplay && (
          <Item label="Returns" value={returnsDisplay} />
        )}
        <Item
          label="Total width with allowances"
          value={fmtLen(totalWidthWithAllowancesCm)}
        />
        <Item
          label="Widths needed"
          value={widthsRequired !== undefined ? `${widthsRequired}` : undefined}
        />
        {seamHems !== undefined && seamsRequired !== undefined && seamsRequired > 0 && (
          <Item
            label="Seam allowances"
            value={`${fmtLen(seamHems ?? 0)} × 2 sides × ${seamsRequired} seam(s) = ${fmtLen(seamAllowTotalCm)}`}
          />
        )}

        {/* Repeats */}
        {vRepeat !== undefined && Number(vRepeat) > 0 && (
          <Item label="Vertical pattern repeat" value={`${fmtLen(vRepeat)}`} />
        )}
        {hRepeat !== undefined && Number(hRepeat) > 0 && (
          <Item label="Horizontal pattern repeat" value={`${fmtLen(hRepeat)}`} />
        )}

        {/* Drops and hems */}
        <Item label="Drop measurement" value={fmtLen(dropCm)} />
        {headerHem !== undefined && Number(headerHem) > 0 && <Item label="Header hem allowance" value={`${fmtLen(headerHem)}`} />}
        {bottomHem !== undefined && Number(bottomHem) > 0 && <Item label="Bottom hem allowance" value={`${fmtLen(bottomHem)}`} />}
        {pooling !== undefined && pooling > 0 && <Item label="Pooling amount" value={`${fmtLen(pooling)}`} />}

        <Item
          label="Total drop per width"
          value={fmtLen(totalDropPerWidth)}
        />

        {/* Leftovers (offcuts) */}
        {totalCapacityWidth !== undefined && (
          <Item
            label="Fabric capacity (width)"
            value={`${numberFmt(totalCapacityWidth)}cm`}
          />
        )}
        {leftoverWidthCm !== undefined && leftoverWidthCm > 0 && (
          <Item
            label="Leftover width (total)"
            value={`${numberFmt(leftoverWidthCm)}cm`}
          />
        )}
        {leftoverPerPanelCm !== undefined && leftoverPerPanelCm > 0 && (
          <Item
            label="Leftover width (per panel)"
            value={`${numberFmt(leftoverPerPanelCm)}cm`}
          />
        )}

        <Item
          label="Waste factor"
          value={wastePercent !== undefined ? `${numberFmt(wastePercent)}%` : undefined}
        />
        <div className="text-xs text-muted-foreground">
          {/* Guard against undefined to avoid NaN */}
          • Final calculation: {totalDropPerWidth !== undefined ? (fmtLen(totalDropPerWidth) ?? "—") : "—"} drop × {widthsRequired ?? "—"} piece(s)
          {seamAllowTotalCm ? ` + ${fmtLen(seamAllowTotalCm)} seam allowances` : ""} = {linearMeters !== undefined ? `${fmtFabric(linearMeters)}` : "—"} linear
        </div>
      </div>

      <div className="mt-2 text-xs italic text-muted-foreground">
        Linear meters = length to buy from fabric roll (not area calculation)
      </div>

      {/* Unified Cost Breakdown inside same container */}
      <div className="mt-4 border-t pt-3">
        <div className="mb-2 text-sm font-medium">Cost breakdown</div>
        {hasCostBreakdown ? (
          <div className="space-y-2">
            {costBreakdown?.map((item: any, idx: number) => {
              const qty = toNumber(item.quantity);
              const unitPrice = toNumber(item.unit_price);
              return (
                <div key={item.id || `${item.category || 'row'}-${idx}`} className="flex items-start justify-between">
                  <div className="text-xs">
                    <div className="font-medium">{item.name || item.category || "Item"}</div>
                    {item.description && (
                      <div className="text-muted-foreground">{item.description}</div>
                    )}
                    {(qty || unitPrice) && (
                      <div className="text-muted-foreground">
                        {qty && qty > 0 ? `${trimFixed(qty, 2)}${item.unit ? ` ${item.unit}` : ""}` : ""}
                        {qty && qty > 0 && unitPrice && unitPrice > 0 ? " × " : ""}
                        {unitPrice && unitPrice > 0 ? `${formatCurrency(unitPrice, activeCurrency)}` : ""}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(Number(item.total_cost) || 0, activeCurrency)}
                  </div>
                </div>
              );
            })}

            {typeof totalCost === "number" && totalCost > 0 && (
              <div className="flex items-center justify-between border-t mt-2 pt-2">
                <div className="text-sm font-medium">Total</div>
                <div className="text-sm font-semibold">
                  {formatCurrency(totalCost, activeCurrency)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            No detailed breakdown available. This pricing was calculated with an older version.
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculationBreakdown;
