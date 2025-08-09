
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

// New: normalize lengths to centimeters based on common unit hints or keyed suffixes.
const normalizeToCm = (val: any, unitHint?: string): number | undefined => {
  const n = toFiniteNumber(val);
  if (n === undefined) return undefined;

  const unit = (unitHint || "").toString().toLowerCase().trim();
  if (!unit) return n; // assume already cm if no hint

  if (["cm", "centimeter", "centimeters"].includes(unit)) return n;
  if (["mm", "millimeter", "millimeters"].includes(unit)) return n / 10;
  if (["in", "inch", "inches"].includes(unit)) return n * 2.54;

  return n; // default: assume cm
};

const pickNumber = (...vals: any[]): number | undefined => {
  for (const v of vals) {
    const n = toFiniteNumber(v);
    if (n !== undefined) return n;
  }
  return undefined;
};

// New: pick with alternate keys and unit normalization support
const pickLengthFromMd = (md: Record<string, any>, keys: string[], defaultUnit?: string): number | undefined => {
  // Try exact cm keys
  for (const k of keys) {
    if (k.endsWith("_cm") && md[k] !== undefined) {
      const cm = normalizeToCm(md[k], "cm");
      if (cm !== undefined) return cm;
    }
  }

  // Try mm and in variants implicitly
  for (const base of keys.map(k => k.replace(/_cm$/, ""))) {
    const mmKey = `${base}_mm`;
    const inKey = `${base}_in`;
    if (md[mmKey] !== undefined) {
      const cm = normalizeToCm(md[mmKey], "mm");
      if (cm !== undefined) return cm;
    }
    if (md[inKey] !== undefined) {
      const cm = normalizeToCm(md[inKey], "in");
      if (cm !== undefined) return cm;
    }
  }

  // Try non-suffixed keys using md.unit hints if present
  const unitHint = (md.unit || md.units || md.measurement_unit || defaultUnit) as string | undefined;
  for (const base of keys.map(k => k.replace(/_cm$/, ""))) {
    if (md[base] !== undefined) {
      const cm = normalizeToCm(md[base], unitHint);
      if (cm !== undefined) return cm;
    }
  }

  return undefined;
};

export const extractWindowMetrics = (summary: AnySummary, surface: AnySurface) => {
  const md = parseMeasurementsDetails(summary);

  // Core measurements (cm) with alternate keys + unit normalization
  const railWidthCm =
    pickLengthFromMd(md, ["rail_width_cm", "rail_width", "width_cm", "width"]) ??
    normalizeToCm(summary?.rail_width, (summary as any)?.unit || (summary as any)?.measurement_unit) ??
    // Last resort: surface; often stored in inches in some datasets
    normalizeToCm(surface?.rail_width ?? surface?.width, (surface as any)?.unit || "in");

  const dropCm =
    pickLengthFromMd(md, ["drop_cm", "drop", "height_cm", "height"]) ??
    normalizeToCm(summary?.drop, (summary as any)?.unit || (summary as any)?.measurement_unit) ??
    normalizeToCm(surface?.drop ?? surface?.height, (surface as any)?.unit || "in");

  const pooling =
    pickLengthFromMd(md, ["pooling_amount_cm", "pooling_cm", "pooling_amount", "pooling"]) ??
    pickNumber(md.pooling_amount, md.pooling, summary?.pooling_amount, summary?.pooling) ??
    0;

  // Allowances and ratios (cm)
  const sideHems =
    pickLengthFromMd(md, ["side_hems_cm", "side_hems"]) ??
    pickNumber(md.side_hems, summary?.side_hems) ??
    0;

  const seamHems =
    pickLengthFromMd(md, ["seam_hems_cm", "seam_hems"]) ??
    pickNumber(md.seam_hems, summary?.seam_hems) ??
    0;

  const headerHem =
    pickLengthFromMd(md, ["header_allowance_cm", "header_hem_cm", "header_allowance", "header_hem"]) ??
    pickNumber(md.header_allowance, md.header_hem, summary?.header_allowance, summary?.header_hem) ??
    0;

  const bottomHem =
    pickLengthFromMd(md, ["bottom_hem_cm", "bottom_hem"]) ??
    pickNumber(md.bottom_hem, summary?.bottom_hem) ??
    0;

  const returnLeft =
    pickLengthFromMd(md, ["return_left_cm", "return_left"]) ??
    pickNumber(md.return_left, summary?.return_left) ??
    0;

  const returnRight =
    pickLengthFromMd(md, ["return_right_cm", "return_right"]) ??
    pickNumber(md.return_right, summary?.return_right) ??
    0;

  const fullness =
    pickNumber(
      md.fullness_ratio,
      md.fullness,
      summary?.fullness_ratio,
      summary?.template_details?.fullness_ratio
    ) ?? 2.0;

  // Fabric and repeats (cm)
  // Prefer worksheet-saved values, including nested under fabric_details or fabric
  const fabricWidthCm =
    pickLengthFromMd(md, ["fabric_width_cm", "fabric_width"]) ??
    pickLengthFromMd((md as any)?.fabric_details || {}, ["width_cm", "width", "fabric_width_cm", "fabric_width"]) ??
    pickLengthFromMd((md as any)?.fabric || {}, ["width_cm", "width", "fabric_width_cm", "fabric_width"]);

  const vRepeat =
    pickLengthFromMd(md, [
      "vertical_pattern_repeat_cm",
      "vertical_pattern_repeat",
      "pattern_repeat_vertical_cm",
      "pattern_repeat_vertical",
      "vertical_repeat_cm",
      "vertical_repeat"
    ]) ??
    pickLengthFromMd((md as any)?.fabric_details || {}, [
      "vertical_repeat_cm",
      "vertical_repeat",
      "pattern_repeat_vertical_cm",
      "pattern_repeat_vertical"
    ]) ??
    pickLengthFromMd((md as any)?.fabric || {}, [
      "vertical_repeat_cm",
      "vertical_repeat",
      "pattern_repeat_vertical_cm",
      "pattern_repeat_vertical"
    ]);

  const hRepeat =
    pickLengthFromMd(md, [
      "horizontal_pattern_repeat_cm",
      "horizontal_pattern_repeat",
      "pattern_repeat_horizontal_cm",
      "pattern_repeat_horizontal",
      "horizontal_repeat_cm",
      "horizontal_repeat"
    ]) ??
    pickLengthFromMd((md as any)?.fabric_details || {}, [
      "horizontal_repeat_cm",
      "horizontal_repeat",
      "pattern_repeat_horizontal_cm",
      "pattern_repeat_horizontal"
    ]) ??
    pickLengthFromMd((md as any)?.fabric || {}, [
      "horizontal_repeat_cm",
      "horizontal_repeat",
      "pattern_repeat_horizontal_cm",
      "pattern_repeat_horizontal"
    ]);

  const wastePercent =
    pickNumber(md.waste_percent, summary?.waste_percent) ?? 0;

  // Treatment structure
  const curtainType = md.curtain_type || summary?.curtain_type || "single";
  const curtainCount = curtainType === "pair" ? 2 : 1;

  // Pricing/currency
  const currency = summary?.currency || "GBP";
  const pricePerMeter =
    pickNumber(
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

  // Debug visibility (non-breaking)
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("extractWindowMetrics:", {
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
      manufacturingType,
      rawMdKeys: Object.keys(md || {}),
    });
  }

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
