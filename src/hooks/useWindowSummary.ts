import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateWindowSummaryCache } from "@/utils/cacheInvalidation";
import { useRef, useCallback } from "react";
import {
  isHardBlindType,
  isShutterType,
  isWallpaperType
} from "@/utils/treatmentTypeUtils";

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
  total_selling?: number; // CRITICAL: Pre-calculated selling price with per-item markups
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
  material_details?: any;
  wallpaper_details?: any;
  // Treatment type fields
  treatment_type?: string;
  treatment_category?: string;
  // Options and hardware costs - CRITICAL for accurate totals
  options_cost?: number;
  hardware_cost?: number;
  heading_cost?: number; // CRITICAL: Heading cost now included
  selected_options?: any[];
  // Dimensions - preserve from measurement dialog
  rail_width?: number;
  drop?: number;
}

// Track fetch count to detect excessive fetching (dev only)
const fetchCountRef = { current: 0 };
const lastLogTimeRef = { current: 0 };

export const useWindowSummary = (windowId: string | undefined) => {
  // Use ref to prevent duplicate logs in React Strict Mode
  const hasLoggedRef = useRef(false);
  
  return useQuery({
    queryKey: ["window-summary", windowId],
    queryFn: async () => {
      if (!windowId) return null;
      
      // Performance tracking: limit console spam
      fetchCountRef.current++;
      const now = Date.now();
      const shouldLog = now - lastLogTimeRef.current > 5000; // Log at most every 5 seconds
      
      if (shouldLog && import.meta.env.DEV) {
        console.log('🔄 Fetched window summary:', { 
          windowId, 
          fetchCount: fetchCountRef.current 
        });
        lastLogTimeRef.current = now;
        
        // Warn if fetching too frequently
        if (fetchCountRef.current > 10) {
          console.warn('⚠️ [Performance] Window summary fetched', fetchCountRef.current, 'times. Consider memoization.');
          fetchCountRef.current = 0; // Reset counter after warning
        }
      }
      
      const { data, error } = await supabase
        .from("windows_summary")
        .select("*")
        .eq("window_id", windowId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null as WindowSummary | null;

      // Extract selected_options from top-level OR measurements_details
      if (!data.selected_options && data.measurements_details && (data.measurements_details as any).selected_options) {
        (data as any).selected_options = (data.measurements_details as any).selected_options;
      } else if (!data.selected_options) {
        // Fallback to empty array if not found anywhere
        (data as any).selected_options = [];
      }

      // Extract dimensions if missing at top level
      if (!data.rail_width && data.measurements_details) {
        const md = data.measurements_details as any;
        (data as any).rail_width = md.rail_width_cm || md.rail_width;
        (data as any).drop = md.drop_cm || md.drop;
      }

      // Only log full summary details once per component lifecycle
      if (!hasLoggedRef.current) {
        console.log('📖 Loaded summary data:', {
          window_id: data.window_id,
          treatment_category: data.treatment_category,
          fabric_name: (data.fabric_details as any)?.name,
          options_cost: data.options_cost,
          selected_options_count: (data.selected_options as any)?.length,
          total_cost: data.total_cost
        });
        hasLoggedRef.current = true;
      }

      return data as WindowSummary | null;
    },
    enabled: !!windowId,
    staleTime: 5000, // 5 seconds - balance between performance and freshness
    gcTime: 60000, // Keep in cache for 1 minute
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: true, // FIX: Always refetch when component mounts to ensure fresh data when editing
    refetchInterval: false, // Disable automatic refetching
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
  // CRITICAL FIX: If cost_summary exists from TreatmentPricingForm, preserve it completely
  // This prevents data loss (£501.62 -> £145.20 issue)
  if ((summary as any).cost_summary) {
    return {
      ...summary,
      fabric_details: (summary as any).fabric_details || {},
      measurements_details: (summary as any).measurements_details || {}
    };
  }

  const treatmentCategory = (summary as any).treatment_category;
  const treatmentType = (summary as any).treatment_type;
  
  // CRITICAL: Roman blinds use same fabrics/linings as curtains, so DON'T skip enrichment
  // Only skip for roller, venetian, vertical, cellular blinds, shutters, and wallpaper
  // Use centralized utilities for consistent detection
  const isBlind = isHardBlindType(treatmentCategory) || isHardBlindType(treatmentType);
  const isShutter = isShutterType(treatmentCategory) || isShutterType(treatmentType);
  const isWallpaper = isWallpaperType(treatmentCategory) || isWallpaperType(treatmentType);
  
  if (isBlind || isShutter || isWallpaper) {
    // CRITICAL: For blinds/shutters/wallpaper, preserve ALL cost fields exactly as provided
    // Do NOT recalculate - the total_cost already includes options_cost from calculateTreatmentPricing
    console.log('📦 Preserving exact costs for blinds/shutters/wallpaper:', {
      treatment_category: treatmentCategory,
      treatment_type: treatmentType,
      total_cost: (summary as any).total_cost,
      options_cost: (summary as any).options_cost,
      fabric_cost: (summary as any).fabric_cost,
      manufacturing_cost: (summary as any).manufacturing_cost
    });
    
    return {
      ...summary,
      fabric_details: (summary as any).fabric_details || {},
      measurements_details: (summary as any).measurements_details || {},
      // Explicitly preserve all cost fields to prevent recalculation
      total_cost: (summary as any).total_cost,
      options_cost: (summary as any).options_cost,
      selected_options: (summary as any).selected_options,
      fabric_cost: (summary as any).fabric_cost,
      lining_cost: (summary as any).lining_cost,
      manufacturing_cost: (summary as any).manufacturing_cost,
      hardware_cost: (summary as any).hardware_cost
    };
  }
  
  // Continue with existing curtain enrichment logic
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

  // Allowances (cm) and fullness - NO HIDDEN DEFAULTS
  // If values are missing, they remain undefined and calculations should use engine instead
  const sideHems = pick(md.side_hems_cm, md.side_hems, template.side_hems);
  const seamHems = pick(md.seam_hems_cm, md.seam_hems, template.seam_hems);
  const headerHem = pick(md.header_allowance_cm, md.header_hem_cm, md.header_allowance, md.header_hem, template.header_allowance);
  const bottomHem = pick(md.bottom_hem_cm, md.bottom_hem, template.bottom_hem);
  const returnLeft = pick(md.return_left_cm, md.return_left, template.return_left);
  const returnRight = pick(md.return_right_cm, md.return_right, template.return_right);
  const fullness = pick(md.fullness_ratio, md.fullness, (summary as any).fullness_ratio, template.fullness_ratio);

  // Curtain structure
  const curtainType = md.curtain_type || (summary as any).curtain_type || template.curtain_type || "single";
  const curtainCount = toNum(md.curtain_count) ?? (curtainType === "pair" ? 2 : 1);

  // Fabric width - NO HIDDEN DEFAULT
  const fabricDetails = (summary as any).fabric_details || {};
  const fabricWidthCm = pick(md.fabric_width_cm, md.fabric_width, fabricDetails.width_cm, fabricDetails.width, fabricDetails.fabric_width);
  
  // Log warning if critical values are missing
  if (import.meta.env.DEV && (railWidth !== undefined || drop !== undefined)) {
    const missingValues: string[] = [];
    if (fullness == null) missingValues.push('fullness');
    if (fabricWidthCm == null) missingValues.push('fabricWidth');
    if (missingValues.length > 0) {
      console.warn('[useWindowSummary] Missing critical values for calculation:', { 
        windowId: (summary as any).window_id,
        missing: missingValues,
        hint: 'Use CalculationEngine via useCurtainEngine for accurate calculations'
      });
    }
  }

  // Derived steps - ONLY if ALL essential values are present
  // If any critical value is missing, skip derivation and let CalculationEngine handle it
  const hasAllEssentials = (
    railWidth !== undefined && 
    drop !== undefined && 
    fullness != null && 
    fabricWidthCm != null
  );
  
  if (hasAllEssentials) {
    // Safe to do derived calculations - all values are present
    const safeFullness = fullness!;
    const safeFabricWidth = fabricWidthCm!;
    const safeSideHems = sideHems ?? 0;
    const safeSeamHems = seamHems ?? 0;
    const safeHeaderHem = headerHem ?? 0;
    const safeBottomHem = bottomHem ?? 0;
    const safeReturnLeft = returnLeft ?? 0;
    const safeReturnRight = returnRight ?? 0;
    
    const requiredWidth = railWidth * safeFullness;
    const totalSideHems = safeSideHems * 2 * (curtainCount || 1);
    const totalWidthWithAllowances = requiredWidth + safeReturnLeft + safeReturnRight + totalSideHems;

    const widthsRequired = Math.max(1, Math.ceil(totalWidthWithAllowances / safeFabricWidth));
    const seamsRequired = Math.max(0, widthsRequired - 1);
    const seamAllowTotalCm = widthsRequired > 1 ? (widthsRequired - 1) * safeSeamHems * 2 : 0;

    const totalDropPerWidth = drop + safeHeaderHem + safeBottomHem + pooling;

    const fabricCapacityWidthTotal = widthsRequired * safeFabricWidth;
    const leftoverWidthTotal = Math.max(0, fabricCapacityWidthTotal - totalWidthWithAllowances);
    const leftoverPerPanel = widthsRequired > 0 ? leftoverWidthTotal / widthsRequired : 0;

    // Persist new/updated worksheet details into md
    md = {
      ...md,
      // explicit inputs normalized to *_cm
      rail_width_cm: railWidth,
      drop_cm: drop,
      pooling_amount_cm: pooling,
      fabric_width_cm: safeFabricWidth,
      side_hems_cm: safeSideHems,
      seam_hems_cm: safeSeamHems,
      header_allowance_cm: safeHeaderHem,
      bottom_hem_cm: safeBottomHem,
      return_left_cm: safeReturnLeft,
      return_right_cm: safeReturnRight,
      fullness_ratio: safeFullness,
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
    onSuccess: async (data) => {
      console.log('✅ [SAVE] Window summary saved successfully:', {
        window_id: data.window_id,
        total_cost: data.total_cost,
        options_cost: data.options_cost
      });
      
      // Use comprehensive cache invalidation
      await invalidateWindowSummaryCache(queryClient, data.window_id);
      
      toast({
        title: "Success",
        description: "Window summary saved successfully",
      });
    },
    onError: (error) => {
      console.error("❌ [SAVE] Window summary error:", error);
      toast({
        title: "Error",
        description: "Failed to save window summary",
        variant: "destructive",
      });
    },
  });
};
