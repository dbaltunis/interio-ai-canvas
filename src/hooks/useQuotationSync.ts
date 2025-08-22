import { useEffect, useRef } from "react";
import { useQuotes, useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";

interface QuotationSyncOptions {
  projectId: string;
  clientId?: string;
  autoCreateQuote?: boolean;
  markupPercentage?: number;
  taxRate?: number;
}

/**
 * Hook that automatically synchronizes room and treatment data to quotations
 * Updates quotation whenever rooms, treatments, or window summaries change
 */
export const useQuotationSync = ({ 
  projectId, 
  clientId,
  autoCreateQuote = true,
  markupPercentage = 25,
  taxRate = 0.08
}: QuotationSyncOptions) => {
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: treatments = [] } = useTreatments(projectId);
  const { data: rooms = [] } = useRooms(projectId);
  const { data: surfaces = [] } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  
  // Keep track of previous data to detect changes
  const previousDataRef = useRef<{
    treatmentCount: number;
    roomCount: number;
    surfaceCount: number;
    totalCost: number;
  }>({
    treatmentCount: 0,
    roomCount: 0,
    surfaceCount: 0,
    totalCost: 0
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
          
          roomGroups[roomId].items.push({
            id: window.window_id,
            name: window.surface_name || 'Window Treatment',
            description: `${window.summary.template_name || 'Window Treatment'} - ${window.surface_name}`,
            quantity: 1,
            unit_price: window.summary.total_cost,
            total: window.summary.total_cost,
            breakdown,
            currency: window.summary.currency || 'GBP',
            room_name: roomName,
            room_id: roomId,
            surface_name: window.surface_name,
            treatment_type: window.summary.template_name,
          });
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
        // Add room header
        items.push({
          type: 'room_header',
          id: `room-${roomGroup.room.id}`,
          name: roomGroup.room.name,
          isHeader: true
        });
        
        // Add room items
        items.push(...roomGroup.items);
      }
    });

    return {
      items,
      baseSubtotal,
      subtotal: baseSubtotal * (1 + markupPercentage / 100),
      taxAmount: (baseSubtotal * (1 + markupPercentage / 100)) * taxRate,
      total: (baseSubtotal * (1 + markupPercentage / 100)) * (1 + taxRate)
    };
  };

  // Sync quotation data
  const syncQuotation = async () => {
    const quotationData = buildQuotationItems();
    const currentData = {
      treatmentCount: treatments.length,
      roomCount: rooms.length,
      surfaceCount: surfaces.length,
      totalCost: quotationData.baseSubtotal
    };

    // Check if data has changed
    const hasChanges = 
      currentData.treatmentCount !== previousDataRef.current.treatmentCount ||
      currentData.roomCount !== previousDataRef.current.roomCount ||
      currentData.surfaceCount !== previousDataRef.current.surfaceCount ||
      Math.abs(currentData.totalCost - previousDataRef.current.totalCost) > 0.01;

    if (!hasChanges) {
      return; // No changes detected
    }

    console.log('🔄 QuotationSync: Data changes detected, updating quotation...', {
      previous: previousDataRef.current,
      current: currentData,
      items: quotationData.items.length
    });

    // Find existing draft quote for this project
    const existingQuote = quotes.find(quote => 
      quote.project_id === projectId && quote.status === 'draft'
    );

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
      
      console.log('✅ QuotationSync: Updated existing quote', existingQuote.id);
    } else if (autoCreateQuote && quotationData.baseSubtotal > 0) {
      // Create new quote
      const quoteNumber = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      await createQuote.mutateAsync({
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
      
      console.log('✅ QuotationSync: Created new quote', quoteNumber);
    }

    // Update reference data
    previousDataRef.current = currentData;
  };

  // Monitor changes and sync
  useEffect(() => {
    if (projectId && (treatments.length > 0 || projectSummaries?.windows?.length > 0)) {
      // Debounce the sync to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        syncQuotation();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [projectId, treatments, rooms, surfaces, projectSummaries]);

  return {
    isLoading: createQuote.isPending || updateQuote.isPending,
    error: createQuote.error || updateQuote.error,
    lastSync: previousDataRef.current,
    buildQuotationItems
  };
};
