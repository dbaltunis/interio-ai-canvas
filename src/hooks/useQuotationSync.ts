import { useEffect, useRef } from "react";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";

interface QuotationSyncOptions {
  projectId: string;
  clientId?: string;
  autoCreateQuote?: boolean;
}

/**
 * Hook that automatically synchronizes room and treatment data to quotations
 * Updates quotation whenever rooms, treatments, or window summaries change
 */
export const useQuotationSync = ({ 
  projectId, 
  clientId,
  autoCreateQuote = true
}: QuotationSyncOptions) => {
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: treatments = [] } = useTreatments(projectId);
  const { data: rooms = [] } = useRooms(projectId);
  const { data: surfaces = [] } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const { data: markupSettings } = useMarkupSettings();
  const { data: businessSettings } = useBusinessSettings();
  
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  // Get settings (prices already include markup, we just add tax)
  const taxRate = (businessSettings?.tax_rate || 0) / 100;
  
  // Keep track of previous data to detect changes
  const previousDataRef = useRef<{
    treatmentCount: number;
    roomCount: number;
    surfaceCount: number;
    totalCost: number;
    windowCosts: Record<string, number>;
  }>({
    treatmentCount: 0,
    roomCount: 0,
    surfaceCount: 0,
    totalCost: 0,
    windowCosts: {}
  });

  // Build quotation items from current project data
  const buildQuotationItems = () => {
    const items: any[] = [];

    // Get the most accurate cost data - prioritize window summaries over treatments
    const summariesTotal = projectSummaries?.projectTotal || 0;
    const treatmentTotal = treatments.reduce((sum, treatment) => {
      return sum + (treatment.total_price || 0);
    }, 0);

    const hasTreatments = treatments.length > 0;
    const baseSubtotal = summariesTotal > 0 ? summariesTotal : treatmentTotal;

    // Group items by room for better organization
    const roomGroups = rooms.reduce((groups, room) => {
      groups[room.id] = {
        room,
        items: []
      };
      return groups;
    }, {} as Record<string, any>);

    // Add treatments/window summaries to room groups
    if (projectSummaries?.windows && projectSummaries.windows.length > 0) {
      // Use window summaries (most accurate)
      projectSummaries.windows.forEach((window) => {
        if (window.summary && window.summary.total_cost > 0) {
          const roomId = window.room_id || 'no-room';
          
          // Find the actual room data
          const roomData = rooms.find(r => r.id === roomId);
          const roomName = roomData?.name || 'Unassigned Room';
          
          if (!roomGroups[roomId]) {
            roomGroups[roomId] = {
              room: { id: roomId, name: roomName },
              items: []
            };
          }

          const breakdown = buildClientBreakdown(window.summary);
          const summary = window.summary;
          
          // Extract REAL details from JSON - handle both fabric and material
          const treatmentCategory = summary.treatment_category || summary.treatment_type || '';
          const isBlindsOrShutters = treatmentCategory?.includes('blind') || treatmentCategory?.includes('shutter');
          
          // For blinds/shutters, use material_details; for curtains/wallpaper, use fabric_details
          const materialDetails = isBlindsOrShutters ? (summary.material_details || {}) : (summary.fabric_details || {});
          const fabricDetails = summary.fabric_details || {};
          const liningDetails = summary.lining_details || {};
          const headingDetails = summary.heading_details || {};
          const wallpaperDetails = summary.wallpaper_details || {};
          
          // Extract image URLs from material/fabric details
          const imageUrl = materialDetails.image_url || fabricDetails.image_url || null;
          
          // Determine material type label
          const getMaterialLabel = () => {
            if (treatmentCategory === 'wallpaper' || fabricDetails.category === 'wallcovering' || fabricDetails.category === 'wallcover') return 'Wallpaper';
            if (treatmentCategory?.includes('blind')) return 'Material';
            return 'Fabric';
          };
          
          console.log(`[QUOTE ITEM] Window ${window.surface_name}:`, {
            fabricName: fabricDetails.name,
            materialName: materialDetails.name,
            isBlindsOrShutters,
            treatmentCategory,
            materialLabel: getMaterialLabel(),
            wallpaperDetails: wallpaperDetails
          });
          
          // PARENT ITEM - Use actual product name from material_details (blinds) or fabric_details (curtains)
          const productName = materialDetails.name || fabricDetails.name || window.surface_name || 'Window Treatment';
          
          // Build description based on treatment type
          let description = productName;
          if (treatmentCategory === 'wallpaper' && wallpaperDetails.total_rolls) {
            description = `${wallpaperDetails.strips_needed || 0} strips × ${wallpaperDetails.strip_length_cm || 0}cm = ${wallpaperDetails.total_length_m || 0}m (${wallpaperDetails.total_rolls} rolls)`;
          }
          
          console.log('[QUOTE ITEM] Final item data:', {
            productName,
            description,
            treatmentCategory,
            isWallpaper: treatmentCategory === 'wallpaper'
          });
          
          const parentItem = {
            id: window.window_id,
            name: productName,
            description,
            quantity: 1,
            unit_price: summary.total_cost,
            total: summary.total_cost,
            breakdown,
            currency: summary.currency || 'GBP',
            room_name: roomName,
            room_id: roomId,
            surface_name: window.surface_name,
            treatment_type: summary.template_name,
            image_url: imageUrl,
            hasChildren: true,
            children: [] as any[]
          };

          // DETAILED BREAKDOWN - Material (dynamic label)
          if (summary.fabric_cost && summary.fabric_cost > 0) {
            const materialLabel = getMaterialLabel();
            // Use material_details for blinds/shutters, fabric_details for curtains
            const pricePerMetre = materialDetails.selling_price || materialDetails.unit_price || 
                                 fabricDetails.selling_price || fabricDetails.unit_price || 
                                 (summary.fabric_cost / (summary.linear_meters || 1));
            
            console.log('[QUOTE ITEM] Adding material child:', {
              materialLabel,
              productName,
              treatmentCategory,
              isWallpaper: treatmentCategory === 'wallpaper'
            });
            
            parentItem.children.push({
              id: `${window.window_id}-material`,
              name: materialLabel,
              description: productName,
              quantity: summary.linear_meters || 0,
              unit: 'm',
              unit_price: pricePerMetre,
              total: summary.fabric_cost,
              image_url: imageUrl,
              isChild: true
            });
          }

          // DETAILED BREAKDOWN - Manufacturing (skip for wallpaper)
          if (summary.manufacturing_cost && summary.manufacturing_cost > 0 && treatmentCategory !== 'wallpaper') {
            console.log('[QUOTE ITEM] Adding manufacturing (NOT wallpaper)');
            parentItem.children.push({
              id: `${window.window_id}-manufacturing`,
              name: 'Manufacturing price',
              description: '-',
              quantity: 1,
              unit: '',
              unit_price: summary.manufacturing_cost,
              total: summary.manufacturing_cost,
              isChild: true
            });
          } else if (treatmentCategory === 'wallpaper') {
            console.log('[QUOTE ITEM] SKIPPING manufacturing for wallpaper');
          }

          // DETAILED BREAKDOWN - Lining (use REAL lining details)
          if (summary.lining_cost && summary.lining_cost > 0) {
            const liningType = liningDetails.type || 'Interlining';
            const liningPricePerMetre = liningDetails.price_per_metre || (summary.lining_cost / (summary.linear_meters || 1));
            
            parentItem.children.push({
              id: `${window.window_id}-lining`,
              name: 'Lining',
              description: liningType,
              quantity: summary.linear_meters || 0,
              unit: 'm',
              unit_price: liningPricePerMetre,
              total: summary.lining_cost,
              image_url: liningDetails.image_url || null,
              isChild: true
            });
          }

          // DETAILED BREAKDOWN - Heading (use REAL heading details)
          if (summary.heading_cost && summary.heading_cost > 0) {
            const headingName = headingDetails.heading_name || 'Pencil Pleat';
            const headingCost = headingDetails.cost || summary.heading_cost;
            
            parentItem.children.push({
              id: `${window.window_id}-heading`,
              name: 'Heading',
              description: headingName,
              quantity: summary.finished_width_cm || 0,
              unit: 'cm',
              unit_price: headingCost / ((summary.finished_width_cm || 100) / 100),
              total: headingCost,
              isChild: true
            });
          }

          // DETAILED BREAKDOWN - Options (CRITICAL: Include options cost!)
          if (summary.options_cost && summary.options_cost > 0) {
            const selectedOptions = summary.selected_options || [];
            const optionsDescription = Array.isArray(selectedOptions) && selectedOptions.length > 0
              ? selectedOptions.map((opt: any) => opt.name || opt.label).filter(Boolean).join(', ')
              : 'Selected options';
            
            parentItem.children.push({
              id: `${window.window_id}-options`,
              name: 'Options',
              description: optionsDescription,
              quantity: 1,
              unit: '',
              unit_price: summary.options_cost,
              total: summary.options_cost,
              isChild: true
            });
          }

          roomGroups[roomId].items.push(parentItem);
        }
      });
    } else if (hasTreatments) {
      // Use treatments table - FIXED: No duplicate manufacturing cost
      treatments.forEach((treatment) => {
        const roomId = treatment.room_id || 'no-room';
        
        // Find the actual room data  
        const roomData = rooms.find(r => r.id === roomId);
        const roomName = roomData?.name || 'Unassigned Room';
        
        if (!roomGroups[roomId]) {
          roomGroups[roomId] = {
            room: { id: roomId, name: roomName },
            items: []
          };
        }

        // Parse calculation details to get accurate breakdown
        let breakdown = {};
        try {
          if (treatment.calculation_details) {
            const calcDetails = typeof treatment.calculation_details === 'string' 
              ? JSON.parse(treatment.calculation_details) 
              : treatment.calculation_details;
            breakdown = calcDetails.breakdown || {};
          }
        } catch (e) {
          console.warn("Failed to parse calculation details:", e);
        }

        // SINGLE ITEM - the complete treatment cost (no separate manufacturing line)
        roomGroups[roomId].items.push({
          id: treatment.id,
          name: treatment.product_name || treatment.treatment_type || 'Treatment',
          description: treatment.treatment_type || 'Window Treatment',
          quantity: 1,
          unit_price: treatment.total_price || 0,
          total: treatment.total_price || 0,
          breakdown, // Include breakdown for detailed view if needed
          currency: 'GBP',
          room_name: roomName,
          room_id: roomId,
          treatment_type: treatment.treatment_type,
        });
      });
    }

    // Flatten room groups into a linear array for quotation
    Object.values(roomGroups).forEach((roomGroup: any) => {
      if (roomGroup.items.length > 0) {
        // Add room items directly (room headers displayed in UI, not as items)
        items.push(...roomGroup.items);
      }
    });

    // Calculate tax based on tax_inclusive setting
    const pricingSettings = businessSettings?.pricing_settings as any;
    const taxInclusive = pricingSettings?.tax_inclusive || false;
    
    let taxAmount: number;
    let total: number;
    let subtotal: number;
    
    if (taxInclusive) {
      // Prices already include tax, so extract tax from total
      total = baseSubtotal;
      subtotal = baseSubtotal / (1 + taxRate);
      taxAmount = total - subtotal;
    } else {
      // Prices exclude tax, so add tax on top
      subtotal = baseSubtotal;
      taxAmount = subtotal * taxRate;
      total = subtotal + taxAmount;
    }

    return {
      items,
      baseSubtotal,
      subtotal,
      taxAmount,
      total
    };
  };

  // Sync quotation data
  const syncQuotation = async () => {
    const quotationData = buildQuotationItems();
    
    // Build current window costs map for comparison
    const currentWindowCosts: Record<string, number> = {};
    (projectSummaries?.windows || []).forEach(w => {
      currentWindowCosts[w.window_id] = Number(w.summary?.total_cost || 0);
    });

    const currentData = {
      treatmentCount: treatments.length,
      roomCount: rooms.length,
      surfaceCount: surfaces.length,
      totalCost: quotationData.baseSubtotal,
      windowCosts: currentWindowCosts
    };

    // Check if window costs have changed (more granular detection)
    const prevWindowCosts = previousDataRef.current.windowCosts || {};
    const windowIdsChanged = 
      Object.keys(currentWindowCosts).length !== Object.keys(prevWindowCosts).length ||
      Object.keys(currentWindowCosts).some(id => !prevWindowCosts[id]) ||
      Object.keys(prevWindowCosts).some(id => !currentWindowCosts[id]);
    
    const windowValuesChanged = Object.keys(currentWindowCosts).some(
      id => Math.abs((currentWindowCosts[id] || 0) - (prevWindowCosts[id] || 0)) > 0.01
    );

    // Check if data has changed
    const hasChanges = 
      currentData.treatmentCount !== previousDataRef.current.treatmentCount ||
      currentData.roomCount !== previousDataRef.current.roomCount ||
      currentData.surfaceCount !== previousDataRef.current.surfaceCount ||
      Math.abs(currentData.totalCost - previousDataRef.current.totalCost) > 0.01 ||
      windowIdsChanged ||
      windowValuesChanged;

    if (!hasChanges) {
      return; // No changes detected
    }

    // Find existing draft quote for this project
    const existingQuote = quotes.find(quote => 
      quote.project_id === projectId && quote.status === 'draft'
    );

    let quoteId: string;

    if (existingQuote) {
      // Update existing quote
      await updateQuote.mutateAsync({
        id: existingQuote.id,
        subtotal: quotationData.subtotal,
        tax_amount: quotationData.taxAmount,
        total_amount: quotationData.total,
        notes: `Updated with ${quotationData.items.length} items - ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
      });
      quoteId = existingQuote.id;
      console.log('✅ QuotationSync: Updated quote', existingQuote.quote_number);
    } else if (autoCreateQuote && quotationData.baseSubtotal > 0) {
      // Create new quote
      const quoteNumber = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const newQuote = await createQuote.mutateAsync({
        project_id: projectId,
        client_id: clientId,
        quote_number: quoteNumber,
        status: 'draft',
        subtotal: quotationData.subtotal,
        tax_rate: taxRate,
        tax_amount: quotationData.taxAmount,
        total_amount: quotationData.total,
        valid_until: validUntil.toISOString().split('T')[0],
        notes: `Auto-generated from ${quotationData.items.length} project items`,
      });
      
      quoteId = newQuote.id;
      console.log('✅ QuotationSync: Created new quote', quoteNumber);
    } else {
      // Update reference data and return early
      previousDataRef.current = currentData;
      return;
    }

    // Save quote items to database
    try {
      const itemsToSave = quotationData.items.map((item, index) => ({
        quote_id: quoteId,
        name: item.name,
        description: item.description || item.treatment_type || "",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.total || 0,
        total_price: item.total || 0,
        product_details: {
          room_id: item.room_id,
          room_name: item.room_name,
          surface_name: item.surface_name,
          treatment_type: item.treatment_type,
          image_url: item.image_url,
          hasChildren: item.hasChildren || false,
          children: item.children || [],
        },
        breakdown: item.breakdown || {},
        currency: item.currency || "GBP",
        sort_order: index,
      }));

      // Delete existing items for this quote
      await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", quoteId);

      // Insert new items
      if (itemsToSave.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(itemsToSave);

        if (itemsError) {
          console.error("Error saving quote items:", itemsError);
        } else {
          console.log(`✅ QuotationSync: Saved ${itemsToSave.length} quote items`);
        }
      }
    } catch (error) {
      console.error("Failed to save quote items:", error);
    }

    // Update reference data including window costs
    previousDataRef.current = currentData;
  };

  // Monitor changes and sync with immediate + debounced pattern
  useEffect(() => {
    if (projectId && (treatments.length > 0 || projectSummaries?.windows?.length > 0)) {
      // Check if we need immediate sync
      const currentWindowCosts: Record<string, number> = {};
      (projectSummaries?.windows || []).forEach(w => {
        currentWindowCosts[w.window_id] = Number(w.summary?.total_cost || 0);
      });

      const prevWindowCosts = previousDataRef.current.windowCosts || {};
      const windowCountChanged = Object.keys(currentWindowCosts).length !== Object.keys(prevWindowCosts).length;
      const windowCostsChanged = Object.keys(currentWindowCosts).some(
        id => currentWindowCosts[id] !== prevWindowCosts[id]
      );

      if (windowCountChanged || windowCostsChanged) {
        console.log('[QUOTE SYNC] Window data changed, triggering immediate sync', {
          windowCountChanged,
          windowCostsChanged,
          currentCosts: currentWindowCosts,
          prevCosts: prevWindowCosts
        });
        syncQuotation();
        previousDataRef.current.windowCosts = currentWindowCosts;
      }

      // Also debounce for other changes
      const timeoutId = setTimeout(() => {
        syncQuotation();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [projectId, treatments, rooms, surfaces, projectSummaries, projectSummaries?.windows]);

  return {
    isLoading: createQuote.isPending || updateQuote.isPending,
    error: createQuote.error || updateQuote.error,
    lastSync: previousDataRef.current,
    buildQuotationItems
  };
};
