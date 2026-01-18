
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useRoomProducts } from "@/hooks/useRoomProducts";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { resolveMarkup, applyMarkup } from "@/utils/pricing/markupResolver";

export const useRoomCardLogic = (room: any, projectId: string, _clientId?: string, onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const { data: roomProducts = [] } = useRoomProducts(room.id);
  const { data: markupSettings } = useMarkupSettings();
  
  const [pricingFormOpen, setPricingFormOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  
  const [currentFormData, setCurrentFormData] = useState({
    treatmentType: "",
    surfaceId: "",
    surfaceType: "",
    windowCovering: null as any
  });

  const roomSurfaces = useMemo(() => 
    allSurfaces?.filter(s => s.room_id === room.id) || [], 
    [allSurfaces, room.id]
  );
  
  const roomTreatments = useMemo(() => 
    allTreatments?.filter(t => t.room_id === room.id) || [], 
    [allTreatments, room.id]
  );
  
  // DISPLAY-ONLY ARCHITECTURE: Use stored total_selling (with per-item markups) for retail display
  const roomTotal = useMemo(() => {
    console.log(`📊 [RETAIL] Room total for ${room.name}`);
    
    let totalCost = 0;
    let totalSelling = 0;

    // Sum all window summaries for this room - USE STORED total_selling
    const windowSummariesForRoom = (projectSummaries?.windows || [])
      .filter((w) => w.room_id === room.id);
    
    windowSummariesForRoom.forEach(w => {
      if (!w.summary) return;
      
      const costPrice = Number(w.summary.total_cost || 0);
      totalCost += costPrice;
      
      // ✅ CRITICAL FIX: Use stored total_selling (calculated with per-item markups)
      // Fall back to recalculation ONLY if total_selling is not yet saved
      const storedSelling = Number(w.summary.total_selling || 0);
      if (storedSelling > 0) {
        totalSelling += storedSelling;
        console.log(`  Window ${w.window_id}: Cost ${costPrice} → Stored Sell ${storedSelling}`);
      } else {
        // Fallback for old data without total_selling
        const markupResult = resolveMarkup({
          gridMarkup: w.summary.pricing_grid_markup || undefined,
          category: w.summary.treatment_category || w.summary.treatment_type,
          subcategory: w.summary.subcategory || undefined,
          markupSettings: markupSettings || undefined
        });
        const sellingPrice = applyMarkup(costPrice, markupResult.percentage);
        totalSelling += sellingPrice;
        console.log(`  Window ${w.window_id}: Cost ${costPrice} → Fallback Sell ${sellingPrice} (${markupResult.percentage}% markup)`);
      }
    });

    // Add room products/services (these already have markup applied at point of sale)
    const roomProductsTotal = roomProducts.reduce((sum, p) => sum + (p.total_price || 0), 0);
    if (roomProductsTotal > 0) {
      console.log(`  Products/services: ${roomProductsTotal}`);
      totalSelling += roomProductsTotal;
    }

    console.log(`📊 [RETAIL] Final room total: Cost ${totalCost} → Sell ${totalSelling}`);
    return totalSelling; // Return RETAIL price for display
  }, [projectSummaries, room.id, room.name, roomProducts, markupSettings]);

  // DISPLAY-ONLY: Use stored total_selling for retail display
  const projectTotal = useMemo(() => {
    if (!projectSummaries?.windows) return 0;
    
    return projectSummaries.windows.reduce((sum, w) => {
      if (!w.summary) return sum;
      
      // ✅ CRITICAL FIX: Use stored total_selling (calculated with per-item markups)
      const storedSelling = Number(w.summary.total_selling || 0);
      if (storedSelling > 0) {
        return sum + storedSelling;
      }
      
      // Fallback for old data without total_selling
      const costPrice = Number(w.summary.total_cost || 0);
      const markupResult = resolveMarkup({
        gridMarkup: w.summary.pricing_grid_markup || undefined,
        category: w.summary.treatment_category || w.summary.treatment_type,
        subcategory: w.summary.subcategory || undefined,
        markupSettings: markupSettings || undefined
      });
      return sum + applyMarkup(costPrice, markupResult.percentage);
    }, 0);
  }, [projectSummaries, markupSettings]);

  // Remove surface creation logic from here - it will be handled by parent

  const handleAddTreatment = (surfaceId: string, treatmentType: string, treatmentData?: any) => {
    if (treatmentData && onCreateTreatment) {
      // Direct treatment creation with data from WindowManagementDialog
      onCreateTreatment(room.id, surfaceId, treatmentType, treatmentData);
    } else {
      // Legacy flow for opening pricing form
      const surface = roomSurfaces.find(s => s.id === surfaceId);
      
      const formData = {
        treatmentType,
        surfaceId,
        surfaceType: surface?.surface_type || 'window',
        windowCovering: treatmentData
      };
      
      setCurrentFormData(formData);
      
      if (treatmentData?.making_cost_id) {
        setCalculatorDialogOpen(true);
      } else {
        setPricingFormOpen(true);
      }
    }
  };

  return {
    allSurfaces,
    allTreatments,
    surfacesLoading,
    roomSurfaces,
    roomTreatments,
    roomTotal,
    projectTotal,
    pricingFormOpen,
    setPricingFormOpen,
    calculatorDialogOpen,
    setCalculatorDialogOpen,
    currentFormData,
    handleAddTreatment
  };
};
