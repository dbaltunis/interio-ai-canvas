
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/unitConversion";
import { extractWindowMetrics, numberFmt, metersFmt } from "@/utils/windowSummaryExtractors";

interface CalculationBreakdownProps {
  summary: any;
  surface: any;
  compact?: boolean;
  // New: embed cost breakdown directly in this container
  costBreakdown?: any[];
  currency?: string;
  totalCost?: number;
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
  totalCost
}) => {
  // Extract accurate worksheet-backed metrics with clear precedence
  const metrics = extractWindowMetrics(summary, surface);

  const {
    railWidthCm,
    dropCm,
    pooling,
    sideHems,
    seamHems,
    headerHem,
    bottomHem,
    returnLeft,
    returnRight,
    fullness,
    fabricWidthCm,
    vRepeat,
    hRepeat,
    wastePercent,
    curtainCount,
    currency: detectedCurrency,
    pricePerMeter,
    widthsRequired: widthsFromSummary,
    linearMeters: linearFromSummary,
    fabricName,
    liningType,
    manufacturingType
  } = metrics;

  // Derived metrics
  const requiredWidth = railWidthCm && fullness ? railWidthCm * fullness : undefined;
  const totalSideHems = sideHems ? sideHems * 2 * curtainCount : 0;
  const totalWidthWithAllowances =
    (requiredWidth ?? 0) + totalSideHems + (returnLeft ?? 0) + (returnRight ?? 0);

  const computedWidthsNeeded =
    widthsFromSummary !== undefined && widthsFromSummary !== null
      ? widthsFromSummary
      : fabricWidthCm
      ? Math.max(1, Math.ceil(totalWidthWithAllowances / fabricWidthCm))
      : undefined;

  const seamsRequired = computedWidthsNeeded ? Math.max(0, computedWidthsNeeded - 1) : 0;
  const seamAllowTotalCm = seamHems ? seamsRequired * seamHems * 2 : 0;

  const totalDropPerWidth = (dropCm ?? 0) + (headerHem ?? 0) + (bottomHem ?? 0) + (pooling ?? 0);

  // Linear metres calculation - prefer saved value for exact parity
  const dropMetersTimesPieces = ((totalDropPerWidth || 0) / 100) * (computedWidthsNeeded || 0);
  const seamAllowanceMeters = (seamAllowTotalCm || 0) / 100;
  const computedLinearMeters = dropMetersTimesPieces + seamAllowanceMeters;
  const linearMeters =
    typeof linearFromSummary === "number" && Number.isFinite(linearFromSummary)
      ? linearFromSummary
      : computedLinearMeters;

  const activeCurrency = currency || detectedCurrency || summary?.currency || "GBP";

  const hasCostBreakdown = Array.isArray(costBreakdown) && costBreakdown.length > 0;

  // Leftover (offcut) calculation across fabric widths
  const totalCapacityWidth =
    typeof computedWidthsNeeded === "number" && typeof fabricWidthCm === "number"
      ? computedWidthsNeeded * fabricWidthCm
      : undefined;
  const leftoverWidthCm =
    totalCapacityWidth !== undefined && totalWidthWithAllowances !== undefined
      ? Math.max(0, totalCapacityWidth - totalWidthWithAllowances)
      : undefined;
  const leftoverPerPanelCm =
    leftoverWidthCm !== undefined && typeof computedWidthsNeeded === "number" && computedWidthsNeeded > 0
      ? leftoverWidthCm / computedWidthsNeeded
      : undefined;

  // Make debug info available in console to verify mismatches
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("🧮 CalculationBreakdown metrics:", {
      metrics,
      requiredWidth,
      totalWidthWithAllowances,
      computedWidthsNeeded,
      seamsRequired,
      seamAllowTotalCm,
      totalDropPerWidth,
      linearMeters,
      activeCurrency,
      leftoverWidthCm,
      leftoverPerPanelCm,
    });
  }

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
    <div className={compact ? "rounded-lg border p-3 bg-muted/30" : "rounded-lg border p-4 bg-muted/30"}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Calculation breakdown</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {manufacturingType && (
            <Badge variant="outline" className="text-xs">Manufacturing: {manufacturingType}</Badge>
          )}
          {typeof computedWidthsNeeded === "number" && (
            <Badge variant="secondary" className="text-xs">Widths: {computedWidthsNeeded}</Badge>
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
            {fabricWidthCm ? ` • ${numberFmt(fabricWidthCm)}cm` : ""}
            {pricePerMeter ? ` • ${formatCurrency(pricePerMeter, activeCurrency)}/m` : ""}
          </Badge>
        )}
        {liningType && (
          <Badge variant="secondary" className="text-xs">
            Lining: {liningType}
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
        <Item label="Fabric width" value={fabricWidthCm !== undefined ? `${numberFmt(fabricWidthCm)}cm` : undefined} />
        <Item label="Rail width" value={railWidthCm !== undefined ? `${numberFmt(railWidthCm)}cm` : undefined} />
        <Item label="Fullness multiplier" value={fullness !== undefined ? `${trimFixed(fullness, 2)}x` : undefined} />
        <Item label="Required width" value={requiredWidth !== undefined ? `${numberFmt(requiredWidth)}cm` : undefined} />
        {sideHems !== undefined && curtainCount !== undefined && (
          <Item
            label="Side hems"
            value={`${numberFmt(sideHems ?? 0)}cm × 2 sides × ${curtainCount} curtain(s) = ${numberFmt(totalSideHems)}cm total`}
          />
        )}
        {(returnLeft !== undefined || returnRight !== undefined) && (Number(returnLeft) > 0 || Number(returnRight) > 0) && (
          <Item
            label="Returns"
            value={`${numberFmt(returnLeft ?? 0)}cm + ${numberFmt(returnRight ?? 0)}cm = ${numberFmt((returnLeft ?? 0) + (returnRight ?? 0))}cm`}
          />
        )}
        <Item
          label="Total width with allowances"
          value={totalWidthWithAllowances !== undefined ? `${numberFmt(totalWidthWithAllowances)}cm` : undefined}
        />
        <Item
          label="Widths needed"
          value={computedWidthsNeeded !== undefined ? `${computedWidthsNeeded}` : undefined}
        />
        {seamHems !== undefined && seamsRequired !== undefined && seamsRequired > 0 && (
          <Item
            label="Seam allowances"
            value={`${numberFmt(seamHems ?? 0)}cm × 2 sides × ${seamsRequired} seam(s) = ${numberFmt(seamAllowTotalCm)}cm`}
          />
        )}

        {/* Repeats */}
        {vRepeat !== undefined && Number(vRepeat) > 0 && (
          <Item label="Vertical pattern repeat" value={`${numberFmt(vRepeat)}cm`} />
        )}
        {hRepeat !== undefined && Number(hRepeat) > 0 && (
          <Item label="Horizontal pattern repeat" value={`${numberFmt(hRepeat)}cm`} />
        )}

        {/* Drops and hems */}
        <Item label="Drop measurement" value={dropCm !== undefined ? `${numberFmt(dropCm)}cm` : undefined} />
        {headerHem !== undefined && Number(headerHem) > 0 && <Item label="Header hem allowance" value={`${numberFmt(headerHem)}cm`} />}
        {bottomHem !== undefined && Number(bottomHem) > 0 && <Item label="Bottom hem allowance" value={`${numberFmt(bottomHem)}cm`} />}
        {pooling !== undefined && pooling > 0 && <Item label="Pooling amount" value={`${numberFmt(pooling)}cm`} />}

        <Item
          label="Total drop per width"
          value={totalDropPerWidth !== undefined ? `${numberFmt(totalDropPerWidth)}cm` : undefined}
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
          • Final calculation: {metersFmt(totalDropPerWidth / 100, 2) ?? "—"} drop × {computedWidthsNeeded ?? "—"} piece(s)
          {seamAllowTotalCm ? ` + ${metersFmt(seamAllowTotalCm / 100, 2)} seam allowances` : ""} = {linearMeters !== undefined ? `${Number(linearMeters).toFixed(2)}m` : "—"} linear
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

