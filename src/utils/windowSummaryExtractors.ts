
/**
 * Helpers to extract accurate metrics from a window summary with strict precedence:
 * 1) summary.measurements_details (worksheet-saved values)
 * 2) summary.* fields
 * 3) surface.* fields (as a last resort)
 */

type AnySummary = Record<string, any> | null | undefined;
type AnySurface = Record<string, any> | null | undefined;

const toFiniteNumber = (val: any): number | undefined => {
  if (val === null || val === undefined) return undefined;
  const n = typeof val === "string" ? parseFloat(val) : typeof val === "number" ? val : undefined;
  return Number.isFinite(n as number) ? (n as number) : undefined;
};

const parseMeasurementsDetails = (summary: AnySummary): Record<string, any> => {
  const raw = summary?.measurements_details;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as Record<string, any>;
  return {};
};

const pickNumber = (...vals: any[]): number | undefined => {
  for (const v of vals) {
    const n = toFiniteNumber(v);
    if (n !== undefined) return n;
  }
  return undefined;
};

export const extractWindowMetrics = (summary: AnySummary, surface: AnySurface) => {
  const md = parseMeasurementsDetails(summary);

  // Core measurements (cm)
  const railWidthCm = pickNumber(
    md.rail_width,
    summary?.rail_width,
    surface?.rail_width,
    surface?.width
  );

  const dropCm = pickNumber(
    md.drop,
    summary?.drop,
    surface?.drop,
    surface?.height
  );

  const pooling = pickNumber(
    md.pooling_amount,
    md.pooling,
    summary?.pooling_amount,
    summary?.pooling
  ) ?? 0;

  // Allowances and ratios (cm)
  const sideHems = pickNumber(
    md.side_hems,
    summary?.side_hems
  ) ?? 0;

  const seamHems = pickNumber(
    md.seam_hems,
    summary?.seam_hems
  ) ?? 0;

  const headerHem = pickNumber(
    md.header_allowance,
    md.header_hem,
    summary?.header_allowance,
    summary?.header_hem
  ) ?? 0;

  const bottomHem = pickNumber(
    md.bottom_hem,
    summary?.bottom_hem
  ) ?? 0;

  const returnLeft = pickNumber(
    md.return_left,
    summary?.return_left
  ) ?? 0;

  const returnRight = pickNumber(
    md.return_right,
    summary?.return_right
  ) ?? 0;

  const fullness = pickNumber(
    md.fullness_ratio,
    summary?.fullness_ratio,
    summary?.template_details?.fullness_ratio
  ) ?? 2.0;

  // Fabric and repeats
  const fabricWidthCm = pickNumber(
    md.fabric_width_cm,
    summary?.fabric_details?.width_cm,
    summary?.fabric_width_cm,
    summary?.fabric_width
  ) ?? 137;

  const vRepeat = pickNumber(
    md.vertical_pattern_repeat,
    summary?.vertical_pattern_repeat,
    summary?.fabric_details?.vertical_repeat_cm
  ) ?? 0;

  const hRepeat = pickNumber(
    md.horizontal_pattern_repeat,
    summary?.horizontal_pattern_repeat,
    summary?.fabric_details?.horizontal_repeat_cm
  ) ?? 0;

  const wastePercent = pickNumber(
    md.waste_percent,
    summary?.waste_percent
  ) ?? 0;

  // Treatment structure
  const curtainType = md.curtain_type || summary?.curtain_type || "single";
  const curtainCount = curtainType === "pair" ? 2 : 1;

  // Pricing/currency
  const currency = summary?.currency || "GBP";
  const pricePerMeter = pickNumber(
    summary?.price_per_meter,
    summary?.fabric_details?.price_per_meter,
    summary?.fabric_details?.unit_price
  ) ?? 0;

  // Outputs from calculation (prefer exact worksheet/saved values)
  const widthsRequired = pickNumber(
    summary?.widths_required,
    md.widths_required
  );

  const linearMeters = pickNumber(
    summary?.linear_meters,
    md.linear_meters
  );

  const fabricName = summary?.fabric_details?.name || md.fabric_name || "Fabric";
  const liningType = summary?.lining_details?.type || summary?.lining_type || md.lining_type;

  const manufacturingType = summary?.manufacturing_type || summary?.template_details?.manufacturing_type;

  return {
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
    curtainType,
    curtainCount,
    currency,
    pricePerMeter,
    widthsRequired,
    linearMeters,
    fabricName,
    liningType,
    manufacturingType
  };
};

export const numberFmt = (n?: number, digits = 0): string | undefined =>
  n === undefined ? undefined : n.toFixed(digits);

export const metersFmt = (n?: number, digits = 2): string | undefined =>
  n === undefined ? undefined : `${n.toFixed(digits)}m`;
