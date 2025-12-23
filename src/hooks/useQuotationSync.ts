import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";
import { resolveMarkup, applyMarkup, calculateGrossMargin } from "@/utils/pricing/markupResolver";

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
  
  // Fetch all room products for this project's rooms
  const roomIds = rooms.map(r => r.id);
  const { data: allRoomProducts = [] } = useQuery({
    queryKey: ["project-room-products", projectId, roomIds],
    queryFn: async () => {
      if (roomIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("room_products")
        .select(`
          *,
          inventory_item:enhanced_inventory_items(
            id,
            name,
            category,
            subcategory,
            image_url,
            unit
          )
        `)
        .in("room_id", roomIds)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: roomIds.length > 0,
  });
  
  const queryClient = useQueryClient();
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
    roomProductsCount: number;
    breakdownHash?: string;
  }>({
    treatmentCount: 0,
    roomCount: 0,
    surfaceCount: 0,
    totalCost: 0,
    windowCosts: {},
    roomProductsCount: 0,
    breakdownHash: ''
  });

  // Build quotation items from current project data
  const buildQuotationItems = () => {
    const items: any[] = [];
    let totalCostPrice = 0; // Track total cost for profit calculation
    let totalSellingPrice = 0; // Track total selling for profit calculation

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
          // CRITICAL FIX: Skip windows with missing or invalid treatment type
          // This prevents auto-generated "curtains" from appearing when treatment type wasn't properly saved
          const windowTreatmentType = window.summary.treatment_category || window.summary.treatment_type;
          if (!windowTreatmentType || windowTreatmentType === 'unknown' || windowTreatmentType === 'null') {
            console.warn('[QUOTE] Skipping window with invalid treatment type:', {
              windowId: window.window_id,
              treatmentCategory: windowTreatmentType,
              treatmentType: window.summary.treatment_type
            });
            return;
          }
          
          // GHOST FIX: Skip windows with incomplete or missing data
          const hasMaterialOrFabric = window.summary.fabric_details?.name || 
                                       window.summary.material_details?.name || 
                                       window.summary.template_name;
          const hasValidCostBreakdown = Array.isArray(window.summary.cost_breakdown) && 
                                         window.summary.cost_breakdown.length > 0;
          
          // Skip if neither material/fabric name nor valid cost breakdown exists
          if (!hasMaterialOrFabric && !hasValidCostBreakdown) {
            console.warn('[QUOTE] Skipping ghost window with no material/fabric data:', {
              windowId: window.window_id,
              hasMaterialOrFabric,
              hasValidCostBreakdown,
              fabricDetails: window.summary.fabric_details,
              materialDetails: window.summary.material_details
            });
            return;
          }
          
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

          const breakdown = buildClientBreakdown(window.summary, undefined, markupSettings);
          const summary = window.summary;
          
          // CRITICAL: Check if cost_breakdown is structured (already has children items)
          const hasStructuredBreakdown = breakdown && breakdown.length > 0 && breakdown.some((item: any) => item.category);
          
          console.log('[BREAKDOWN] Breakdown check:', {
            hasStructuredBreakdown,
            breakdownLength: breakdown?.length,
            windowId: window.window_id
          });
          
          // Extract REAL details from JSON - handle both fabric and material
          const treatmentCategory = summary.treatment_category || summary.treatment_type || '';
          const isBlindsOrShutters = treatmentCategory?.includes('blind') || treatmentCategory?.includes('shutter');
          
          // For blinds/shutters, use material_details; for curtains/wallpaper, use fabric_details
          const materialDetails = isBlindsOrShutters ? (summary.material_details || {}) : (summary.fabric_details || {});
          const fabricDetails = summary.fabric_details || {};
          const liningDetails = summary.lining_details || {};
          const headingDetails = summary.heading_details || {};
          const wallpaperDetails = summary.wallpaper_details || {};
          
          // Extract image URLs separately:
          // ✅ FIX: Treatment template image - PRIORITY: template_image_url > template_details.image_url > fabric/material image
          // This ensures treatment templates with custom images show in quote even when fabric has no image
          const templateDetails = summary.template_details || {};
          const treatmentImageUrl = summary.template_image_url || 
                                    templateDetails.image_url || 
                                    templateDetails.display_image_url ||
                                    summary.image_url || 
                                    materialDetails.image_url || 
                                    fabricDetails.image_url || 
                                    null;
          
          // Material/Fabric image from inventory (for child rows - the actual fabric swatch)
          const materialImageUrl = materialDetails.image_url || fabricDetails.image_url || null;
          
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
          
          // PRIMARY NAME - Use template_name (user-editable) first, then fallback to material/fabric name
          const productName = summary.template_name || materialDetails.name || fabricDetails.name || window.surface_name || 'Window Treatment';
          
          // Build description - use description_text first (user-editable), then build from material name
          const materialName = materialDetails.name || fabricDetails.name || productName;
          let description = summary.description_text || materialName;
          if (treatmentCategory === 'wallpaper' && wallpaperDetails.total_rolls) {
            description = `${wallpaperDetails.strips_needed || 0} strips × ${wallpaperDetails.strip_length_cm || 0}cm = ${wallpaperDetails.total_length_m || 0}m (${wallpaperDetails.total_rolls} rolls)`;
          }
          
          console.log('[QUOTE ITEM] Final item data:', {
            productName,
            description,
            treatmentCategory,
            isWallpaper: treatmentCategory === 'wallpaper'
          });
          
          // Get currency from business settings measurement_units
          const getMeasurementCurrency = () => {
            if (!businessSettings?.measurement_units) return 'USD';
            const units = typeof businessSettings.measurement_units === 'string' 
              ? JSON.parse(businessSettings.measurement_units)
              : businessSettings.measurement_units;
            return units?.currency || 'USD';
          };
          const itemCurrency = getMeasurementCurrency();
          
          // MARKUP INTEGRATION: Calculate selling price from cost
          const costPrice = summary.total_cost || 0;
          const markupResult = resolveMarkup({
            productMarkup: undefined, // Could add product-level markup from inventory
            gridMarkup: summary.pricing_grid_markup || undefined,
            category: treatmentCategory,
            subcategory: summary.subcategory || undefined,
            markupSettings: markupSettings || undefined
          });
          const sellingPrice = applyMarkup(costPrice, markupResult.percentage);
          const grossMargin = calculateGrossMargin(costPrice, sellingPrice);
          
          const parentItem = {
            id: window.window_id,
            name: productName,
            description,
            quantity: 1,
            // Store both cost and selling prices
            cost_price: costPrice,
            unit_price: sellingPrice, // Selling price (with markup)
            total: sellingPrice,
            cost_total: costPrice,
            markup_percentage: markupResult.percentage,
            markup_source: markupResult.sourceName,
            gross_margin: grossMargin,
            breakdown,
            currency: summary.currency || itemCurrency,
            room_name: roomName,
            room_id: roomId,
            surface_name: window.surface_name,
            treatment_type: summary.template_name,
            image_url: treatmentImageUrl,
            hasChildren: true,
            children: [] as any[]
          };

          // CRITICAL FIX: If cost_breakdown is structured, USE IT DIRECTLY
          // Do NOT build children from scratch - prevents duplicate fabric lines
          if (hasStructuredBreakdown) {
            console.log('[BREAKDOWN] Using structured breakdown directly (prevents duplicates)');
            // Convert breakdown items to children format - INCLUDE color for fallback display
            parentItem.children = breakdown.map((item: any, idx: number) => {
              // CRITICAL FIX: Get color/image from fabric_details or material_details for fabric items
              let itemColor = item.color || null;
              let itemImageUrl = item.image_url || null;
              let formattedName = item.name || item.category || 'Item';
              let formattedDescription = '-';
              
              if (item.category === 'fabric') {
                itemColor = itemColor || materialDetails?.color || fabricDetails?.color || null;
                itemImageUrl = itemImageUrl || materialImageUrl || null;
              }
              
              // CRITICAL FIX: ALWAYS extract value from "option_key: value" format as description FIRST
              if (formattedName && formattedName.includes(':')) {
                const colonIndex = formattedName.indexOf(':');
                if (colonIndex > 0) {
                  const key = formattedName.substring(0, colonIndex).trim();
                  const value = formattedName.substring(colonIndex + 1).trim();
                  formattedName = key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                  // ALWAYS set description from extracted value - never leave empty
                  formattedDescription = value || '-';
                }
              }
              
              // Use explicit item.description as override ONLY if it has meaningful content
              if (item.description && item.description !== '-' && item.description.trim().length > 0) {
                formattedDescription = item.description;
              }
              
              // CRITICAL: buildClientBreakdown already applied markup, so use prices directly
              // DO NOT apply markup again - that causes double-markup
              return {
                id: `${window.window_id}-${item.id || item.category}-${idx}`,
                name: formattedName,
                description: formattedDescription,
                quantity: item.quantity || 1,
                unit: item.unit || '',
                // Prices already include markup from buildClientBreakdown
                unit_price: item.unit_price || 0,
                total: item.total_cost || 0,
                image_url: itemImageUrl,
                color: itemColor,
                category: item.category,
                isChild: true
              };
            });
          } else {
            console.log('[BREAKDOWN] No structured breakdown - building children from scratch');
            // ONLY BUILD CHILDREN IF NO STRUCTURED BREAKDOWN EXISTS

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
            
            // Get currency from business settings measurement_units
            const getMeasurementCurrency = () => {
              if (!businessSettings?.measurement_units) return 'USD';
              const units = typeof businessSettings.measurement_units === 'string' 
                ? JSON.parse(businessSettings.measurement_units)
                : businessSettings.measurement_units;
              return units?.currency || 'USD';
            };
            const itemCurrency = getMeasurementCurrency();
            
            // MARKUP FIX: Apply markup to material/fabric prices
            const materialCostUnitPrice = pricePerMetre;
            const materialCostTotal = summary.fabric_cost;
            const materialSellingUnitPrice = applyMarkup(materialCostUnitPrice, markupResult.percentage);
            const materialSellingTotal = applyMarkup(materialCostTotal, markupResult.percentage);
            
            parentItem.children.push({
            id: `${window.window_id}-material`,
            name: materialLabel,
            description: productName,
            quantity: summary.linear_meters || 0,
            unit: 'm',
            unit_price: materialSellingUnitPrice,
            total: materialSellingTotal,
            cost_unit_price: materialCostUnitPrice,
            cost_total: materialCostTotal,
            image_url: materialImageUrl,
            color: materialDetails.color || fabricDetails.color || null,
            inventory_item_id: materialDetails.inventory_item_id || fabricDetails.inventory_item_id || null,
            isChild: true
          });
          }

          // DETAILED BREAKDOWN - Manufacturing (skip for wallpaper)
          if (summary.manufacturing_cost && summary.manufacturing_cost > 0 && treatmentCategory !== 'wallpaper') {
            console.log('[QUOTE ITEM] Adding manufacturing (NOT wallpaper)');
            // MARKUP FIX: Apply markup to manufacturing prices
            const mfgCostPrice = summary.manufacturing_cost;
            const mfgSellingPrice = applyMarkup(mfgCostPrice, markupResult.percentage);
            
            parentItem.children.push({
              id: `${window.window_id}-manufacturing`,
              name: 'Manufacturing price',
              description: '-',
              quantity: 1,
              unit: '',
              unit_price: mfgSellingPrice,
              total: mfgSellingPrice,
              cost_unit_price: mfgCostPrice,
              cost_total: mfgCostPrice,
              isChild: true
            });
          } else if (treatmentCategory === 'wallpaper') {
            console.log('[QUOTE ITEM] SKIPPING manufacturing for wallpaper');
          }

          // DETAILED BREAKDOWN - Lining (use REAL lining details)
          if (summary.lining_cost && summary.lining_cost > 0) {
            const liningType = liningDetails.type || 'Interlining';
            const liningPricePerMetre = liningDetails.price_per_metre || (summary.lining_cost / (summary.linear_meters || 1));
            
            // MARKUP FIX: Apply markup to lining prices
            const liningCostUnitPrice = liningPricePerMetre;
            const liningCostTotal = summary.lining_cost;
            const liningSellingUnitPrice = applyMarkup(liningCostUnitPrice, markupResult.percentage);
            const liningSellingTotal = applyMarkup(liningCostTotal, markupResult.percentage);
            
            parentItem.children.push({
              id: `${window.window_id}-lining`,
              name: 'Lining',
              description: liningType,
              quantity: summary.linear_meters || 0,
              unit: 'm',
              unit_price: liningSellingUnitPrice,
              total: liningSellingTotal,
              cost_unit_price: liningCostUnitPrice,
              cost_total: liningCostTotal,
              image_url: liningDetails.image_url || null,
              color: liningDetails.color || null,
              isChild: true
            });
          }

          // DETAILED BREAKDOWN - Heading (use REAL heading details)
          if (summary.heading_cost && summary.heading_cost > 0) {
            const headingName = headingDetails.heading_name || 'Pencil Pleat';
            const headingCost = headingDetails.cost || summary.heading_cost;
            
            // MARKUP FIX: Apply markup to heading prices
            const headingCostUnitPrice = headingCost / ((summary.finished_width_cm || 100) / 100);
            const headingCostTotal = headingCost;
            const headingSellingUnitPrice = applyMarkup(headingCostUnitPrice, markupResult.percentage);
            const headingSellingTotal = applyMarkup(headingCostTotal, markupResult.percentage);
            
            parentItem.children.push({
              id: `${window.window_id}-heading`,
              name: 'Heading',
              description: headingName,
              quantity: summary.finished_width_cm || 0,
              unit: 'cm',
              unit_price: headingSellingUnitPrice,
              total: headingSellingTotal,
              cost_unit_price: headingCostUnitPrice,
              cost_total: headingCostTotal,
              isChild: true
            });
          }

          // DETAILED BREAKDOWN - Hardware (Tracks/Rods with length-based pricing)
          if (summary.hardware_cost && summary.hardware_cost > 0) {
            const hardwareDetails = summary.hardware_details || {};
            const hardwareName = hardwareDetails.name || 'Track/Rod';
            const orderedLength = summary.track_width_cm || summary.width || 100;
            
            // Check if hardware has length-based pricing in metadata
            let calculatedPrice = summary.hardware_cost;
            let priceDescription = hardwareName;
            
            if (hardwareDetails.metadata) {
              const metadata = hardwareDetails.metadata;
              
              if (metadata.pricingMode === 'simple' && metadata.pricePerMeter && metadata.maxLength) {
                // Simple pricing: Calculate based on price per meter
                const pricingUnit = metadata.pricingUnit || 100; // Default to 100cm = 1m
                const lengthInPricingUnits = orderedLength / pricingUnit;
                calculatedPrice = lengthInPricingUnits * parseFloat(metadata.pricePerMeter);
                priceDescription = `${hardwareName} - ${orderedLength}cm @ $${metadata.pricePerMeter}/m`;
              } else if (metadata.pricingMode === 'advanced' && metadata.lengthPricingGrid) {
                // Advanced pricing: Look up tier from grid
                const grid = metadata.lengthPricingGrid;
                let matchedPrice = null;
                
                for (const tier of grid) {
                  if (orderedLength >= tier.from && orderedLength <= tier.to) {
                    matchedPrice = tier.price;
                    break;
                  }
                }
                
                if (matchedPrice) {
                  calculatedPrice = matchedPrice;
                  priceDescription = `${hardwareName} - ${orderedLength}cm`;
                }
              }
            }
            
            // MARKUP FIX: Apply markup to hardware prices
            const hwCostUnitPrice = calculatedPrice / orderedLength;
            const hwCostTotal = calculatedPrice;
            const hwSellingUnitPrice = applyMarkup(hwCostUnitPrice, markupResult.percentage);
            const hwSellingTotal = applyMarkup(hwCostTotal, markupResult.percentage);
            
            parentItem.children.push({
              id: `${window.window_id}-hardware`,
              name: 'Track/Rod',
              description: priceDescription,
              quantity: orderedLength,
              unit: 'cm',
              unit_price: hwSellingUnitPrice,
              total: hwSellingTotal,
              cost_unit_price: hwCostUnitPrice,
              cost_total: hwCostTotal,
              isChild: true
            });
          }

          // DETAILED BREAKDOWN - Options (CRITICAL: Display ALL selected options, even €0 ones)
          const selectedOptions = summary.selected_options || [];
          
          if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
              selectedOptions.forEach((opt: any, index: number) => {
                // UNIVERSAL: Extract option key and value - works for ALL treatment types
                let optionName = '';
                let optionValue = '';
                
                // Priority 1: Use optionKey if available (cleanest source)
                if (opt.optionKey) {
                  optionName = opt.optionKey
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                  // Get value from label or value field
                  optionValue = opt.label || opt.value || '';
                }
                
                // Priority 2: Extract from "name: value" format
                if (!optionName && opt.name) {
                  const colonIndex = opt.name.indexOf(':');
                  if (colonIndex > 0) {
                    optionName = opt.name.substring(0, colonIndex).trim()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c: string) => c.toUpperCase());
                    optionValue = opt.name.substring(colonIndex + 1).trim();
                  } else {
                    optionName = opt.name
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c: string) => c.toUpperCase());
                    optionValue = opt.label || opt.value || '';
                  }
                }
                
                // Priority 3: Use explicit description if meaningful
                if (opt.description && opt.description !== '-' && opt.description.trim().length > 0) {
                  optionValue = opt.description;
                }
                
                const quantity = opt.quantity || 1;
                // CRITICAL: Use calculatedPrice if available, otherwise fall back to price
                const effectivePrice = Number(opt.calculatedPrice) || Number(opt.price) || 0;
                const unitPrice = Number(opt.basePrice) || Number(opt.price) || effectivePrice;
                const total = effectivePrice;
                
                // MARKUP FIX: Apply markup to option prices
                const optCostUnitPrice = unitPrice;
                const optCostTotal = total;
                const optSellingUnitPrice = applyMarkup(optCostUnitPrice, markupResult.percentage);
                const optSellingTotal = applyMarkup(optCostTotal, markupResult.percentage);
                
                parentItem.children.push({
                  id: `${window.window_id}-option-${index}`,
                  name: optionName || 'Option',
                  description: optionValue || '-',
                  quantity: quantity,
                  unit: opt.unit || '',
                  unit_price: optSellingUnitPrice,
                  total: optSellingTotal,
                  cost_unit_price: optCostUnitPrice,
                  cost_total: optCostTotal,
                  image_url: opt.image_url || null,
                  pricingDetails: opt.pricingDetails || '',
                  category: 'option',
                  isChild: true
              });
            });
          }
          } // END else block for building children from scratch

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
    // Track cost vs selling totals for profit calculation
    Object.values(roomGroups).forEach((roomGroup: any) => {
      if (roomGroup.items.length > 0) {
        roomGroup.items.forEach((item: any) => {
          totalCostPrice += item.cost_price || item.cost_total || 0;
          totalSellingPrice += item.unit_price || item.total || 0;
        });
        // Add room items directly (room headers displayed in UI, not as items)
        items.push(...roomGroup.items);
      }
    });

    // Add room products/services to quote items
    let roomProductsCostTotal = 0;
    let roomProductsSellingTotal = 0;
    allRoomProducts.forEach((product: any) => {
      const room = rooms.find(r => r.id === product.room_id);
      const roomName = room?.name || 'Unknown Room';
      const inventoryItem = product.inventory_item;
      const isCustom = product.is_custom;
      
      // For custom items, use product fields; for inventory items, use inventory_item
      const displayName = isCustom ? (product.name || 'Custom Item') : (inventoryItem?.name || 'Product');
      const displayDescription = isCustom 
        ? (product.description || 'Custom') 
        : (inventoryItem?.subcategory?.replace(/_/g, ' ') || inventoryItem?.category || '');
      const displayImage = isCustom ? product.image_url : inventoryItem?.image_url;
      
      // Track cost and selling totals for room products
      // Room products: total_price is user-entered selling price, cost_price is cost (if tracked)
      const productCost = product.cost_price || product.total_price || 0; // Fall back to total if no cost tracked
      const productSelling = product.total_price || 0;
      
      items.push({
        id: `product-${product.id}`,
        name: displayName,
        description: displayDescription,
        quantity: product.quantity,
        cost_price: productCost,
        unit_price: product.unit_price,
        total: productSelling,
        cost_total: productCost,
        currency: (() => {
          if (!businessSettings?.measurement_units) return 'USD';
          const units = typeof businessSettings.measurement_units === 'string' 
            ? JSON.parse(businessSettings.measurement_units)
            : businessSettings.measurement_units;
          return units?.currency || 'USD';
        })(),
        room_name: roomName,
        room_id: product.room_id,
        image_url: displayImage,
        isRoomProduct: true,
        isCustomProduct: isCustom,
        inventory_item_id: isCustom ? null : product.inventory_item_id,
      });
      
      roomProductsCostTotal += productCost;
      roomProductsSellingTotal += productSelling;
    });

    // Include room products in totals - CRITICAL for consistency
    const combinedCostTotal = totalCostPrice + roomProductsCostTotal;
    const combinedSellingTotal = totalSellingPrice + roomProductsSellingTotal;
    const combinedSubtotal = baseSubtotal + roomProductsSellingTotal;

    // Calculate tax based on tax_inclusive setting
    const pricingSettings = businessSettings?.pricing_settings as any;
    const taxInclusive = pricingSettings?.tax_inclusive || false;
    
    let taxAmount: number;
    let total: number;
    let subtotal: number;
    
    // CRITICAL FIX: Use SELLING price (with markup) for subtotal display, not cost
    // combinedSellingTotal includes both window treatments AND room products
    const sellingSubtotal = combinedSellingTotal;
    
    if (taxInclusive) {
      // Prices already include tax, so extract tax from total
      total = sellingSubtotal;
      subtotal = sellingSubtotal / (1 + taxRate);
      taxAmount = total - subtotal;
    } else {
      // Prices exclude tax, so add tax on top
      subtotal = sellingSubtotal;
      taxAmount = subtotal * taxRate;
      total = subtotal + taxAmount;
    }

    // Calculate overall profit metrics using COMBINED totals (includes room products)
    const overallGrossMargin = combinedSellingTotal > 0 
      ? calculateGrossMargin(combinedCostTotal, combinedSellingTotal) 
      : 0;

    return {
      items,
      baseSubtotal,
      subtotal,
      taxAmount,
      total,
      // Profit tracking - use COMBINED totals for consistency
      costTotal: combinedCostTotal,
      sellingTotal: combinedSellingTotal,
      profitTotal: combinedSellingTotal - combinedCostTotal,
      grossMarginPercent: overallGrossMargin
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
      windowCosts: currentWindowCosts,
      roomProductsCount: allRoomProducts.length
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

    // CRITICAL: Also check if breakdown items have changed (options, types, etc.)
    // This catches changes where total stays same but options changed
    const currentBreakdownHash = (projectSummaries?.windows || [])
      .map(w => {
        const breakdown = w.summary?.cost_breakdown || [];
        const selectedOpts = w.summary?.selected_options || [];
        return JSON.stringify({ breakdown, selectedOpts });
      })
      .join('|');
    
    const breakdownChanged = currentBreakdownHash !== previousDataRef.current.breakdownHash;

    // Check if data has changed
    const hasChanges = 
      currentData.treatmentCount !== previousDataRef.current.treatmentCount ||
      currentData.roomCount !== previousDataRef.current.roomCount ||
      currentData.surfaceCount !== previousDataRef.current.surfaceCount ||
      currentData.roomProductsCount !== previousDataRef.current.roomProductsCount ||
      Math.abs(currentData.totalCost - previousDataRef.current.totalCost) > 0.01 ||
      windowIdsChanged ||
      windowValuesChanged ||
      breakdownChanged;

    if (!hasChanges) {
      return; // No changes detected
    }

    // Find existing draft quote for this project
    const existingQuote = quotes.find(quote => 
      quote.project_id === projectId && quote.status === 'draft'
    );

    let quoteId: string;

    if (existingQuote) {
      // Update existing quote - PROTECT user-edited fields
      await updateQuote.mutateAsync({
        id: existingQuote.id,
        subtotal: quotationData.subtotal,
        tax_rate: taxRate, // CRITICAL: Also update tax_rate so tax line displays
        tax_amount: quotationData.taxAmount,
        total_amount: quotationData.total,
        notes: `Updated with ${quotationData.items.length} items - ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
        // DO NOT include company_logo_url, custom_notes, or other user-edited fields
        // These should only be updated through explicit user actions in the quote editor
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
      const itemsToSave = quotationData.items.map((item, index) => {
        // Extract inventory_item_id from the first material/fabric child
        // This is used for automatic inventory deduction
        let inventoryItemId = null;
        if (item.children && item.children.length > 0) {
          // Find the first child that represents material/fabric (has inventory_item_id)
          const materialChild = item.children.find((child: any) => 
            child.inventory_item_id || 
            ['Material', 'Fabric', 'Wallpaper'].includes(child.name)
          );
          inventoryItemId = materialChild?.inventory_item_id || null;
        }

        return {
          quote_id: quoteId,
          name: item.name,
          description: item.description || item.treatment_type || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.total || 0,
          total_price: item.total || 0,
          inventory_item_id: inventoryItemId, // NEW: Link to inventory for tracking
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
        currency: item.currency || (() => {
          if (!businessSettings?.measurement_units) return 'USD';
          const units = typeof businessSettings.measurement_units === 'string' 
            ? JSON.parse(businessSettings.measurement_units)
            : businessSettings.measurement_units;
          return units?.currency || 'USD';
        })(),
        sort_order: index,
      };
      });

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
          // CRITICAL: Invalidate quote-items cache to refresh UI immediately
          queryClient.invalidateQueries({ queryKey: ["quote-items", quoteId] });
          queryClient.invalidateQueries({ queryKey: ["quote-items"] });
          queryClient.invalidateQueries({ queryKey: ["quotes"] });
        }
      }
    } catch (error) {
      console.error("Failed to save quote items:", error);
    }

    // Update reference data including window costs and breakdown hash
    previousDataRef.current = {
      ...currentData,
      roomProductsCount: allRoomProducts.length,
      breakdownHash: (projectSummaries?.windows || [])
        .map(w => JSON.stringify({ 
          breakdown: w.summary?.cost_breakdown || [], 
          selectedOpts: w.summary?.selected_options || [] 
        }))
        .join('|')
    };
  };

  // Monitor changes and sync with immediate + debounced pattern
  useEffect(() => {
    if (projectId && (treatments.length > 0 || projectSummaries?.windows?.length > 0 || allRoomProducts.length > 0)) {
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
      
      // Check if room products changed
      const roomProductsCountChanged = allRoomProducts.length !== previousDataRef.current.roomProductsCount;

      if (windowCountChanged || windowCostsChanged || roomProductsCountChanged) {
        console.log('[QUOTE SYNC] Data changed, triggering immediate sync', {
          windowCountChanged,
          windowCostsChanged,
          roomProductsCountChanged,
          currentRoomProducts: allRoomProducts.length,
          prevRoomProducts: previousDataRef.current.roomProductsCount
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
  }, [projectId, treatments, rooms, surfaces, projectSummaries, projectSummaries?.windows, allRoomProducts]);

  return {
    isLoading: createQuote.isPending || updateQuote.isPending,
    error: createQuote.error || updateQuote.error,
    lastSync: previousDataRef.current,
    buildQuotationItems
  };
};
