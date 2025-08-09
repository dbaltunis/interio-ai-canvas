
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/unitConversion";

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

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({ summary, surface, compact, costBreakdown, currency, totalCost }) => {
  // Attempt to extract meaningful inputs with broad key coverage and safe fallbacks
  const fabricWidthCm = pickFirstNumber(
    summary?.fabric_details?.width_cm,
    summary?.fabric_details?.fabric_width_cm,
    summary?.fabric_details?.width,
    summary?.fabric_width_cm,
    summary?.fabric_width,
    137
  );

  const railWidthCm = pickFirstNumber(
    summary?.rail_width,
    surface?.rail_width,
    surface?.width
  );

  const dropCm = pickFirstNumber(
    summary?.drop,
    surface?.drop,
    surface?.height
  );

  const fullness = pickFirstNumber(
    summary?.fullness_ratio,
    summary?.fullness,
    summary?.manufacturing_details?.fullness_ratio,
    2.0
  );

  const sideHems = pickFirstNumber(
    summary?.side_hems,
    summary?.manufacturing_details?.side_hems,
    0
  );

  const seamHems = pickFirstNumber(
    summary?.seam_hems,
    summary?.manufacturing_details?.seam_hems,
    summary?.seam_allowance,
    0
  );

  const headerHem = pickFirstNumber(
    summary?.header_allowance,
    summary?.header_hem,
    summary?.manufacturing_details?.header_allowance,
    0
  );

  const bottomHem = pickFirstNumber(
    summary?.bottom_hem,
    summary?.manufacturing_details?.bottom_hem,
    0
  );

  const returnLeft = pickFirstNumber(
    summary?.return_left,
    summary?.manufacturing_details?.return_left,
    0
  );

  const returnRight = pickFirstNumber(
    summary?.return_right,
    summary?.manufacturing_details?.return_right,
    0
  );

  const pooling = pickFirstNumber(
    summary?.pooling_amount,
    summary?.pooling,
    0
  );

  const vRepeat = pickFirstNumber(
    summary?.fabric_details?.vertical_repeat_cm,
    summary?.vertical_pattern_repeat,
    0
  );

  const hRepeat = pickFirstNumber(
    summary?.fabric_details?.horizontal_repeat_cm,
    summary?.horizontal_pattern_repeat,
    0
  );

  const wastePercent = pickFirstNumber(
    summary?.waste_percent,
    summary?.manufacturing_details?.waste_percent,
    0
  );

  const widthsRequired = pickFirstNumber(
    summary?.widths_required
  );

  const curtainCount = (summary?.curtain_type === "pair") ? 2 : 1;

  // Derived metrics
  const requiredWidth = railWidthCm && fullness ? railWidthCm * fullness : undefined;
  const totalSideHems = sideHems ? (sideHems * 2 * curtainCount) : 0;
  const totalWidthWithAllowances = (requiredWidth ?? 0) + totalSideHems + (returnLeft ?? 0) + (returnRight ?? 0);

  const computedWidthsNeeded = !widthsRequired && fabricWidthCm
    ? Math.max(1, Math.ceil(totalWidthWithAllowances / fabricWidthCm))
    : widthsRequired;

  const seamsRequired = computedWidthsNeeded ? Math.max(0, computedWidthsNeeded - 1) : 0;
  const seamAllowTotalCm = seamHems ? (seamsRequired * seamHems * 2) : 0;

  const totalDropPerWidth = (dropCm ?? 0) + (headerHem ?? 0) + (bottomHem ?? 0) + (pooling ?? 0);

  // Linear metres calculation (approx), align with summary if provided
  const dropMetersTimesPieces = ((totalDropPerWidth || 0) / 100) * (computedWidthsNeeded || 0);
  const seamAllowanceMeters = (seamAllowTotalCm || 0) / 100;
  const linearMeters = pickFirstNumber(summary?.linear_meters) ?? (dropMetersTimesPieces + seamAllowanceMeters);

  const fabricName = summary?.fabric_details?.name || "Fabric";
  const fabricPricePerM = pickFirstNumber(
    summary?.price_per_meter,
    summary?.fabric_details?.price_per_meter,
    summary?.fabric_details?.unit_price,
    0
  );
  const liningType = summary?.lining_details?.type || summary?.lining_type || undefined;

  const manufacturingType = summary?.manufacturing_type || undefined;

  const Item = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="text-xs text-muted-foreground">
        • {label}: {value}
      </div>
    );
  };

  const numberFmt = (n?: number, digits = 0) =>
    n === undefined ? undefined : n.toFixed(digits);

  const metersFmt = (n?: number, digits = 2) =>
    n === undefined ? undefined : `${n.toFixed(digits)}m`;

  const hasCostBreakdown = Array.isArray(costBreakdown) && costBreakdown.length > 0;

  return (
    <div className={compact ? "rounded-lg border p-3 bg-muted/30" : "rounded-lg border p-4 bg-muted/30"}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Calculation breakdown</span>
        </div>
        {manufacturingType && <Badge variant="outline" className="text-xs">Manufacturing: {manufacturingType}</Badge>}
      </div>

      {/* Materials quick info */}
      <div className="flex flex-wrap gap-2 mb-2">
        {fabricName && (
          <Badge variant="secondary" className="text-xs">
            {fabricName}{fabricWidthCm ? ` • ${numberFmt(fabricWidthCm)}cm` : ""}{fabricPricePerM ? ` • ${formatCurrency(fabricPricePerM, currency || summary?.currency || 'GBP')}/m` : ""}
          </Badge>
        )}
        {liningType && (
          <Badge variant="secondary" className="text-xs">
            Lining: {liningType}
          </Badge>
        )}
        {fullness && (
          <Badge variant="secondary" className="text-xs">
            Fullness: {numberFmt(fullness, 2)}x
          </Badge>
        )}
      </div>

      {/* Step-by-step points */}
      <div className="space-y-1">
        <Item label="Fabric width" value={fabricWidthCm !== undefined ? `${numberFmt(fabricWidthCm)}cm` : undefined} />
        <Item label="Rail width" value={railWidthCm !== undefined ? `${numberFmt(railWidthCm)}cm` : undefined} />
        <Item label="Fullness multiplier" value={fullness !== undefined ? `${numberFmt(fullness, 2)}x` : undefined} />
        <Item label="Required width" value={requiredWidth !== undefined ? `${numberFmt(requiredWidth)}cm` : undefined} />
        {sideHems !== undefined && curtainCount !== undefined && (
          <Item
            label="Side hems"
            value={`${numberFmt(sideHems)}cm × 2 sides × ${curtainCount} curtain(s) = ${numberFmt(totalSideHems)}cm total`}
          />
        )}
        {(returnLeft !== undefined || returnRight !== undefined) && (
          <Item
            label="Returns"
            value={`${numberFmt(returnLeft)}cm + ${numberFmt(returnRight)}cm = ${numberFmt((returnLeft ?? 0) + (returnRight ?? 0))}cm`}
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
        {seamHems !== undefined && seamsRequired !== undefined && (
          <Item
            label="Seam allowances"
            value={`${numberFmt(seamHems)}cm × 2 sides × ${seamsRequired} seam(s) = ${numberFmt(seamAllowTotalCm)}cm`}
          />
        )}
        <Item label="Drop measurement" value={dropCm !== undefined ? `${numberFmt(dropCm)}cm` : undefined} />
        {headerHem !== undefined && <Item label="Header hem allowance" value={`${numberFmt(headerHem)}cm`} />}
        {bottomHem !== undefined && <Item label="Bottom hem allowance" value={`${numberFmt(bottomHem)}cm`} />}
        {pooling !== undefined && pooling > 0 && <Item label="Pooling amount" value={`${numberFmt(pooling)}cm`} />}
        {vRepeat !== undefined && <Item label="Vertical pattern repeat" value={`${numberFmt(vRepeat)}cm`} />}
        {hRepeat !== undefined && <Item label="Horizontal pattern repeat" value={`${numberFmt(hRepeat)}cm`} />}
        <Item
          label="Total drop per width"
          value={totalDropPerWidth !== undefined ? `${numberFmt(totalDropPerWidth)}cm` : undefined}
        />
        <Item
          label="Waste factor"
          value={wastePercent !== undefined ? `${numberFmt(wastePercent)}%` : undefined}
        />
        <div className="text-xs text-muted-foreground">
          • Final calculation: {metersFmt(totalDropPerWidth / 100, 2) ?? "—"} drop × {computedWidthsNeeded ?? "—"} piece(s){seamAllowTotalCm ? ` + ${metersFmt(seamAllowTotalCm / 100, 2)} seam allowances` : ""} = {linearMeters !== undefined ? `${linearMeters.toFixed(2)}m` : "—"} linear
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
            {costBreakdown?.map((item: any, idx: number) => (
              <div key={item.id || `${item.category || 'row'}-${idx}`} className="flex items-start justify-between">
                <div className="text-xs">
                  <div className="font-medium">{item.name || item.category || "Item"}</div>
                  {item.description && (
                    <div className="text-muted-foreground">{item.description}</div>
                  )}
                  {(item.quantity || item.unit_price) && (
                    <div className="text-muted-foreground">
                      {(Number(item.quantity) || 0) > 0 ? `${Number(item.quantity)}${item.unit ? ` ${item.unit}` : ""}` : ""}
                      {(Number(item.quantity) || 0) > 0 && (Number(item.unit_price) || 0) > 0 ? " × " : ""}
                      {(Number(item.unit_price) || 0) > 0 ? `${formatCurrency(Number(item.unit_price), currency || summary?.currency || 'GBP')}` : ""}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(Number(item.total_cost) || 0, currency || summary?.currency || 'GBP')}
                </div>
              </div>
            ))}

            {typeof totalCost === "number" && totalCost > 0 && (
              <div className="flex items-center justify-between border-t mt-2 pt-2">
                <div className="text-sm font-medium">Total</div>
                <div className="text-sm font-semibold">
                  {formatCurrency(totalCost, currency || summary?.currency || 'GBP')}
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
