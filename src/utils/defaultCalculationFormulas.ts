import { CalculationFormula } from "@/hooks/useCalculationFormulas";

export const DEFAULT_FABRIC_FORMULAS: Omit<CalculationFormula, 'id' | 'created_at' | 'updated_at' | 'user_id'>[] = [
  {
    name: "Curtain Fabric Cut Drop",
    category: "fabric_calculation",
    formula_expression: "finished_drop + top_turn + bottom_hem",
    description: "Calculate the cut drop by adding finished drop plus top turn and bottom hem allowances. This is the basic length measurement before pattern repeat adjustments.",
    variables: [
      { name: "finished_drop", type: "number", unit: "cm", description: "The finished drop measurement from hem to top" },
      { name: "top_turn", type: "number", unit: "cm", description: "Top turn allowance (typically 10cm)", default: 10 },
      { name: "bottom_hem", type: "number", unit: "cm", description: "Bottom hem allowance (typically 20cm)", default: 20 }
    ],
    active: true
  },
  {
    name: "Pattern Repeat Adjusted Drop",
    category: "fabric_calculation", 
    formula_expression: "ceiling(cut_drop / vertical_repeat) * vertical_repeat",
    description: "Adjust the cut drop to account for pattern repeats. If no pattern repeat, this equals the cut drop. Always rounds up to ensure pattern alignment.",
    variables: [
      { name: "cut_drop", type: "number", unit: "cm", description: "Cut drop from previous calculation" },
      { name: "vertical_repeat", type: "number", unit: "cm", description: "Vertical pattern repeat (0 if no pattern)", default: 0 }
    ],
    active: true
  },
  {
    name: "Total Gather Width",
    category: "fabric_calculation",
    formula_expression: "track_width * fullness_ratio",
    description: "Calculate total fabric width needed by multiplying track width by fullness ratio. Fullness ratios: Pencil pleat 2.0, Double pinch 2.2, Wave 2.4.",
    variables: [
      { name: "track_width", type: "number", unit: "cm", description: "Width of the curtain track or pole" },
      { name: "fullness_ratio", type: "number", unit: "ratio", description: "Fullness ratio based on heading style", default: 2.2 }
    ],
    active: true
  },
  {
    name: "Number of Fabric Widths",
    category: "fabric_calculation",
    formula_expression: "ceiling(total_gather_width / fabric_width)",
    description: "Calculate how many fabric widths are needed by dividing total gather width by fabric width and rounding up to the nearest whole number.",
    variables: [
      { name: "total_gather_width", type: "number", unit: "cm", description: "Total gather width from previous calculation" },
      { name: "fabric_width", type: "number", unit: "cm", description: "Width of the fabric (typically 137cm)", default: 137 }
    ],
    active: true
  },
  {
    name: "Total Fabric Meterage",
    category: "fabric_calculation",
    formula_expression: "number_of_widths * (adjusted_drop / 100)",
    description: "Calculate total fabric meterage to order by multiplying number of widths by the adjusted drop (converted to meters).",
    variables: [
      { name: "number_of_widths", type: "number", unit: "widths", description: "Number of fabric widths from previous calculation" },
      { name: "adjusted_drop", type: "number", unit: "cm", description: "Pattern repeat adjusted drop" }
    ],
    active: true
  },
  {
    name: "Quick Fabric Estimate",
    category: "fabric_calculation",
    formula_expression: "ceiling((track_width * fullness_ratio) / fabric_width) * ((finished_drop + top_turn + bottom_hem + (vertical_repeat > 0 ? (ceiling((finished_drop + top_turn + bottom_hem) / vertical_repeat) * vertical_repeat - (finished_drop + top_turn + bottom_hem)) : 0)) / 100)",
    description: "Complete fabric calculation in one formula. Calculates total meterage needed including pattern repeat adjustments. Use this for quick estimates.",
    variables: [
      { name: "track_width", type: "number", unit: "cm", description: "Width of curtain track" },
      { name: "finished_drop", type: "number", unit: "cm", description: "Finished drop measurement" },
      { name: "fullness_ratio", type: "number", unit: "ratio", description: "Fullness ratio (2.0-2.4)", default: 2.2 },
      { name: "fabric_width", type: "number", unit: "cm", description: "Fabric width", default: 137 },
      { name: "top_turn", type: "number", unit: "cm", description: "Top turn allowance", default: 10 },
      { name: "bottom_hem", type: "number", unit: "cm", description: "Bottom hem allowance", default: 20 },
      { name: "vertical_repeat", type: "number", unit: "cm", description: "Pattern repeat (0 if none)", default: 0 }
    ],
    active: true
  },
  {
    name: "Fabric Cost Calculation", 
    category: "pricing_calculation",
    formula_expression: "total_meterage * fabric_price_per_meter",
    description: "Calculate total fabric cost by multiplying total meterage needed by the price per meter.",
    variables: [
      { name: "total_meterage", type: "number", unit: "meters", description: "Total fabric meterage from calculation" },
      { name: "fabric_price_per_meter", type: "number", unit: "currency", description: "Price per meter of fabric" }
    ],
    active: true
  },
  {
    name: "Making Cost - Per Width Method",
    category: "pricing_calculation",
    formula_expression: "number_of_widths * making_price_per_width",
    description: "Calculate making/sewing cost based on number of fabric widths. Common method for workrooms that charge per width of fabric.",
    variables: [
      { name: "number_of_widths", type: "number", unit: "widths", description: "Number of fabric widths needed" },
      { name: "making_price_per_width", type: "number", unit: "currency", description: "Making charge per width of fabric", default: 30 }
    ],
    active: true
  },
  {
    name: "Making Cost - Per Meter Track",
    category: "pricing_calculation",
    formula_expression: "(track_width / 100) * making_price_per_meter",
    description: "Calculate making/sewing cost based on track width in meters. Alternative method for workrooms that charge per meter of track.",
    variables: [
      { name: "track_width", type: "number", unit: "cm", description: "Width of curtain track" },
      { name: "making_price_per_meter", type: "number", unit: "currency", description: "Making charge per meter of track", default: 50 }
    ],
    active: true
  },
  {
    name: "Lining Cost Calculation",
    category: "pricing_calculation",
    formula_expression: "total_meterage * lining_price_per_meter",
    description: "Calculate lining cost when charged separately from main fabric. Uses same meterage as main fabric.",
    variables: [
      { name: "total_meterage", type: "number", unit: "meters", description: "Total fabric meterage (same as main fabric)" },
      { name: "lining_price_per_meter", type: "number", unit: "currency", description: "Price per meter of lining fabric", default: 8 }
    ],
    active: true
  },
  {
    name: "Heading Charge - Per Meter Track",
    category: "pricing_calculation",
    formula_expression: "(track_width / 100) * heading_charge_per_meter",
    description: "Calculate heading/pleating charge when priced separately per meter of track. Common for wave headings or complex pleating.",
    variables: [
      { name: "track_width", type: "number", unit: "cm", description: "Width of curtain track" },
      { name: "heading_charge_per_meter", type: "number", unit: "currency", description: "Heading charge per meter", default: 12 }
    ],
    active: true
  },
  {
    name: "Track Hardware Cost",
    category: "pricing_calculation",
    formula_expression: "(track_width / 100) * track_price_per_meter",
    description: "Calculate track or pole cost based on width. Includes brackets and fittings in per-meter rate.",
    variables: [
      { name: "track_width", type: "number", unit: "cm", description: "Width of curtain track or pole" },
      { name: "track_price_per_meter", type: "number", unit: "currency", description: "Track/pole price per meter including fittings", default: 20 }
    ],
    active: true
  },
  {
    name: "Installation Cost",
    category: "pricing_calculation",
    formula_expression: "(track_width / 100) * installation_rate_per_meter",
    description: "Calculate installation cost when charged per meter of track width. Covers measuring, fitting and hanging.",
    variables: [
      { name: "track_width", type: "number", unit: "cm", description: "Width of curtain track" },
      { name: "installation_rate_per_meter", type: "number", unit: "currency", description: "Installation charge per meter", default: 25 }
    ],
    active: true
  },
  {
    name: "Accessories Cost per Item",
    category: "pricing_calculation",
    formula_expression: "quantity * unit_price",
    description: "Calculate cost for accessories like tiebacks, hooks, or buckram. Use for any items charged per piece or per meter.",
    variables: [
      { name: "quantity", type: "number", unit: "units", description: "Number of items or meters needed" },
      { name: "unit_price", type: "number", unit: "currency", description: "Price per unit/meter of accessory" }
    ],
    active: true
  },
  {
    name: "Total Project Cost",
    category: "pricing_calculation",
    formula_expression: "fabric_cost + making_cost + lining_cost + heading_cost + track_cost + installation_cost + accessories_cost",
    description: "Calculate total project cost before VAT by adding all component costs. Use this as subtotal for final pricing.",
    variables: [
      { name: "fabric_cost", type: "number", unit: "currency", description: "Total fabric cost" },
      { name: "making_cost", type: "number", unit: "currency", description: "Making/sewing cost" },
      { name: "lining_cost", type: "number", unit: "currency", description: "Lining cost (0 if included in fabric)", default: 0 },
      { name: "heading_cost", type: "number", unit: "currency", description: "Heading charge (0 if included in making)", default: 0 },
      { name: "track_cost", type: "number", unit: "currency", description: "Track/pole cost", default: 0 },
      { name: "installation_cost", type: "number", unit: "currency", description: "Installation cost", default: 0 },
      { name: "accessories_cost", type: "number", unit: "currency", description: "Accessories cost", default: 0 }
    ],
    active: true
  },
  {
    name: "Final Price with VAT",
    category: "pricing_calculation",
    formula_expression: "subtotal * (1 + (vat_rate / 100))",
    description: "Calculate final price including VAT. VAT rate should be entered as percentage (e.g., 20 for 20%).",
    variables: [
      { name: "subtotal", type: "number", unit: "currency", description: "Total cost before VAT" },
      { name: "vat_rate", type: "number", unit: "percentage", description: "VAT rate as percentage", default: 20 }
    ],
    active: true
  },
  {
    name: "Labor Time Estimate",
    category: "labor_calculation", 
    formula_expression: "base_making_time + (total_meterage * complexity_factor)",
    description: "Estimate labor time based on base making time plus complexity factor per meter of fabric.",
    variables: [
      { name: "base_making_time", type: "number", unit: "hours", description: "Base time to make curtains", default: 3 },
      { name: "total_meterage", type: "number", unit: "meters", description: "Total fabric meterage" },
      { name: "complexity_factor", type: "number", unit: "hours", description: "Additional time per meter", default: 0.2 }
    ],
    active: true
  }
];

export const DEFAULT_FULLNESS_RATIOS = {
  "pencil_pleat": 2.0,
  "double_pinch": 2.2,
  "wave": 2.4,
  "triple_pinch": 2.5,
  "goblet": 2.3,
  "tab_top": 1.5,
  "eyelet": 2.0
};

export const DEFAULT_HEM_ALLOWANCES = {
  "top_turn": 10, // cm
  "bottom_hem": 20, // cm  
  "side_hem": 2.5, // cm per side
  "lining_allowance": 5 // cm shorter than main fabric
};

export const DEFAULT_PRICING_RATES = {
  "making_per_width": 30, // £ per width
  "making_per_meter": 50, // £ per meter of track
  "lining_per_meter": 8, // £ per meter
  "heading_per_meter": 12, // £ per meter
  "track_per_meter": 20, // £ per meter
  "installation_per_meter": 25, // £ per meter
  "vat_rate": 20 // percentage
};
