import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuoteItems } from "@/hooks/useQuoteItems";

export const useCreateQuoteFromTreatments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      treatmentIds = [], 
      quoteConfig = {}
    }: { 
      projectId: string; 
      treatmentIds?: string[];
      quoteConfig?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch project and client info
      const { data: project } = await supabase
        .from("projects")
        .select(`
          *, 
          clients(id, name, email, phone, address)
        `)
        .eq("id", projectId)
        .single();

      if (!project) throw new Error("Project not found");

      // Fetch treatments if specific IDs provided, otherwise get all for project
      let treatmentsQuery = supabase
        .from("treatments")
        .select("*")
        .eq("project_id", projectId);

      if (treatmentIds.length > 0) {
        treatmentsQuery = treatmentsQuery.in("id", treatmentIds);
      }

      const { data: treatments } = await treatmentsQuery;

      // Fetch rooms separately for naming
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id, name")
        .eq("project_id", projectId);

      // Generate quote number
      const { data: existingQuotes } = await supabase
        .from("quotes")
        .select("quote_number")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let newQuoteNumber = "Q-001";
      if (existingQuotes && existingQuotes.length > 0) {
        const lastNumber = existingQuotes[0].quote_number || "Q-000";
        const numberPart = parseInt(lastNumber.split("-")[1] || "0", 10);
        newQuoteNumber = `Q-${(numberPart + 1).toString().padStart(3, "0")}`;
      }

      // Calculate totals from treatments
      const subtotal = treatments?.reduce((sum, treatment) => {
        const unitPrice = treatment.unit_price || 0;
        const laborCost = treatment.labor_cost || 0;
        const materialCost = treatment.material_cost || 0;
        const quantity = treatment.quantity || 1;
        const totalItemPrice = treatment.total_price || ((unitPrice + laborCost + materialCost) * quantity);
        return sum + totalItemPrice;
      }, 0) || 0;

      const markupPercentage = quoteConfig.markupPercentage || 0;
      const taxRate = quoteConfig.taxRate || 0;
      
      const markupAmount = subtotal * (markupPercentage / 100);
      const taxableAmount = subtotal + markupAmount;
      const taxAmount = taxableAmount * (taxRate / 100);
      const totalAmount = taxableAmount + taxAmount;

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          project_id: projectId,
          client_id: project.client_id,
          quote_number: newQuoteNumber,
          status: quoteConfig.status || "draft",
          subtotal: subtotal,
          tax_rate: taxRate / 100,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: quoteConfig.notes || "",
          valid_until: quoteConfig.valid_until || null,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items from treatments
      if (treatments && treatments.length > 0) {
        const quoteItems = treatments.map((treatment, index) => {
          const unitPrice = treatment.unit_price || 0;
          const laborCost = treatment.labor_cost || 0;
          const materialCost = treatment.material_cost || 0;
          const quantity = treatment.quantity || 1;
          const totalPrice = treatment.total_price || ((unitPrice + laborCost + materialCost) * quantity);

          const roomMap = new Map(rooms?.map(r => [r.id, r.name]) || []);
          const roomName = roomMap.get(treatment.room_id) || 'Unknown Room';

          return {
            quote_id: quote.id,
            name: `${roomName} - ${treatment.treatment_type || 'Treatment'}`,
            description: treatment.notes || `${treatment.treatment_type || 'Window treatment'} for ${roomName}`,
            quantity: quantity,
            unit_price: unitPrice + laborCost + materialCost,
            total_price: totalPrice,
            currency: "USD",
            sort_order: index,
            product_details: {
              treatment_id: treatment.id,
              room_id: treatment.room_id,
              window_id: treatment.window_id,
              treatment_type: treatment.treatment_type,
              fabric_type: treatment.fabric_type,
              color: treatment.color,
              hardware: treatment.hardware,
              mounting_type: treatment.mounting_type,
              unit_price: unitPrice,
              labor_cost: laborCost,
              material_cost: materialCost,
              measurements: treatment.measurements,
              fabric_details: treatment.fabric_details,
              calculation_details: treatment.calculation_details,
            },
            breakdown: {
              unit_cost: unitPrice,
              labor_cost: laborCost,
              material_cost: materialCost,
            }
          };
        });

        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(quoteItems);

        if (itemsError) throw itemsError;
      }

      return quote;
    },
    onSuccess: (quote) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: `Quote ${quote.quote_number} created successfully from treatments`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quote from treatments",
        variant: "destructive"
      });
    },
  });
};