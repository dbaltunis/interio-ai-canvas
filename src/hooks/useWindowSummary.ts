import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WindowSummary {
  window_id: string;
  linear_meters: number;
  widths_required: number;
  price_per_meter: number;
  fabric_cost: number;
  lining_type?: string;
  lining_cost: number;
  manufacturing_type: string;
  manufacturing_cost: number;
  total_cost: number;
  template_id?: string;
  pricing_type: string;
  waste_percent: number;
  currency: string;
  updated_at: string;
  // New detailed breakdown fields
  template_name?: string;
  template_details?: any;
  fabric_details?: any;
  lining_details?: any;
  heading_details?: any;
  extras_details?: any[];
  cost_breakdown?: any[];
  measurements_details?: any;
  hardware_details?: any;
  wallpaper_details?: any;
}

export const useWindowSummary = (windowId: string | undefined) => {
  return useQuery({
    queryKey: ["window-summary", windowId],
    queryFn: async () => {
      if (!windowId) return null;
      
      const { data, error } = await supabase
        .from("windows_summary")
        .select("*")
        .eq("window_id", windowId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null as WindowSummary | null;

      // Attempt gentle backfill if essential worksheet details are missing
      try {
        const mdRaw = (data as any).measurements_details;
        const md = typeof mdRaw === "string" ? JSON.parse(mdRaw) : (mdRaw || {});
        const fabricDetails = (data as any).fabric_details || {};

        const needsWorksheetEnrichment = (
          md?.total_width_with_allowances_cm === undefined ||
          md?.required_width_cm === undefined ||
          md?.seams_required === undefined ||
          md?.total_drop_per_width_cm === undefined
        );
        const needsFabricWidth = (fabricDetails?.width_cm === undefined);

        if (needsWorksheetEnrichment || needsFabricWidth) {
          const enriched = enrichSummaryForPersistence(data as any);
          const { data: saved, error: saveErr } = await supabase
            .from("windows_summary")
            .upsert(enriched)
            .select()
            .maybeSingle();
          if (!saveErr && saved) {
            // Extract selected_options from measurements_details and expose at top level
            if (saved.measurements_details && (saved.measurements_details as any).selected_options) {
              (saved as any).selected_options = (saved.measurements_details as any).selected_options;
            }
            return saved as WindowSummary;
          }
        }
      } catch (e) {
        console.warn("WindowSummary backfill skipped:", e);
      }

      // Extract selected_options from measurements_details and expose at top level
      if (data.measurements_details && (data.measurements_details as any).selected_options) {
        (data as any).selected_options = (data.measurements_details as any).selected_options;
      }

      return data as WindowSummary | null;
    },
    enabled: !!windowId,
  });
};

// Helpers for enrichment before save
const toNum = (v: any): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : undefined;
  return Number.isFinite(n as number) ? (n as number) : undefined;
};

const pick = (...vals: any[]): number | undefined => {
  for (const v of vals) {
    const n = toNum(v);
    if (n !== undefined) return n;
  }
  return undefined;
};

const enrichSummaryForPersistence = (summary: Omit<WindowSummary, "updated_at">) => {
  const template = (summary as any).template_details || {};
  const incomingMd = (summary as any).measurements_details;
  let md: Record<string, any> =
    typeof incomingMd === "string"
      ? (() => {
          try {
            return JSON.parse(incomingMd);
          } catch {
            return {};
          }
        })()
      : (incomingMd || {});

  // Base inputs (cm)
  const railWidth = pick(md.rail_width_cm, md.rail_width, (summary as any).rail_width);
  const drop = pick(md.drop_cm, md.drop, (summary as any).drop);
  const pooling = pick(md.pooling_amount_cm, md.pooling_cm, md.pooling_amount, md.pooling) ?? 0;

  // Allowances (cm) and fullness
  const sideHems =
    pick(md.side_hems_cm, md.side_hems, template.side_hems) ?? 0;
  const seamHems =
    pick(md.seam_hems_cm, md.seam_hems, template.seam_hems) ?? 0;
  const headerHem =
    pick(md.header_allowance_cm, md.header_hem_cm, md.header_allowance, md.header_hem, template.header_allowance) ?? 0;
  const bottomHem =
    pick(md.bottom_hem_cm, md.bottom_hem, template.bottom_hem) ?? 0;
  const returnLeft =
    pick(md.return_left_cm, md.return_left, template.return_left) ?? 0;
  const returnRight =
    pick(md.return_right_cm, md.return_right, template.return_right) ?? 0;
  const fullness =
    pick(md.fullness_ratio, md.fullness, (summary as any).fullness_ratio, template.fullness_ratio) ?? 2.0;

  // Curtain structure
  const curtainType = md.curtain_type || (summary as any).curtain_type || template.curtain_type || "single";
  const curtainCount = toNum(md.curtain_count) ?? (curtainType === "pair" ? 2 : 1);

  // Fabric width
  const fabricDetails = (summary as any).fabric_details || {};
  const fabricWidthCm =
    pick(md.fabric_width_cm, md.fabric_width, fabricDetails.width_cm, fabricDetails.width) ?? 137;

  // Derived steps (guard if essentials missing)
  if (railWidth !== undefined && drop !== undefined) {
    const requiredWidth = railWidth * fullness;
    const totalSideHems = sideHems * 2 * (curtainCount || 1);
    const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;

    const widthsRequired = Math.max(1, Math.ceil(totalWidthWithAllowances / fabricWidthCm));
    const seamsRequired = Math.max(0, widthsRequired - 1);
    const seamAllowTotalCm = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0;

    const totalDropPerWidth = drop + headerHem + bottomHem + pooling;

    const fabricCapacityWidthTotal = widthsRequired * fabricWidthCm;
    const leftoverWidthTotal = Math.max(0, fabricCapacityWidthTotal - totalWidthWithAllowances);
    const leftoverPerPanel = widthsRequired > 0 ? leftoverWidthTotal / widthsRequired : 0;

    // Persist new/updated worksheet details into md
    md = {
      ...md,
      // explicit inputs normalized to *_cm
      rail_width_cm: railWidth,
      drop_cm: drop,
      pooling_amount_cm: pooling,
      fabric_width_cm: fabricWidthCm,
      side_hems_cm: sideHems,
      seam_hems_cm: seamHems,
      header_allowance_cm: headerHem,
      bottom_hem_cm: bottomHem,
      return_left_cm: returnLeft,
      return_right_cm: returnRight,
      fullness_ratio: fullness,
      curtain_type: curtainType,
      curtain_count: curtainCount,

      // derived
      required_width_cm: requiredWidth,
      total_width_with_allowances_cm: totalWidthWithAllowances,
      widths_required: md.widths_required ?? (summary as any).widths_required ?? widthsRequired,
      seams_required: seamsRequired,
      seam_allow_total_cm: seamAllowTotalCm,
      total_drop_per_width_cm: totalDropPerWidth,
      fabric_capacity_width_total_cm: fabricCapacityWidthTotal,
      leftover_width_total_cm: leftoverWidthTotal,
      leftover_per_panel_cm: leftoverPerPanel,
      // keep any existing repeats if present
    };
  }

  // Ensure fabric_details carries width for downstream pages
  const normalizedFabricDetails = {
    ...fabricDetails,
    width_cm: fabricWidthCm,
    width: fabricDetails.width ?? fabricWidthCm,
  };

  // Merge back into summary
  const enriched = {
    ...summary,
    fabric_details: normalizedFabricDetails,
    measurements_details: md,
  };

  return enriched;
};

export const useSaveWindowSummary = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (summary: Omit<WindowSummary, "updated_at">) => {
      // Enrich with derived worksheet steps and ensure fabric width is present
      const enriched = enrichSummaryForPersistence(summary);

      const { data, error } = await supabase
        .from("windows_summary")
        .upsert(enriched)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["window-summary", data.window_id] });
      // Invalidate project summaries to trigger quote sync
      queryClient.invalidateQueries({ queryKey: ["project-window-summaries"] });
      toast({
        title: "Success",
        description: "Window summary saved successfully",
      });
    },
    onError: (error) => {
      console.error("Save window summary error:", error);
      toast({
        title: "Error",
        description: "Failed to save window summary",
        variant: "destructive",
      });
    },
  });
};
