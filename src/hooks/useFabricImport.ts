
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FabricCSVRow {
  vendor_name: string;
  collection_name: string;
  fabric_name: string;
  fabric_code: string;
  width_cm: string;
  pattern_repeat_v_cm: string;
  pattern_repeat_h_cm: string;
  weight: string;
  type: string;
  color: string;
  pattern: string;
  confidential_price: string;
  retail_price: string;
  cost_per_unit: string;
  initial_quantity: string;
  reorder_point: string;
  supplier_sku: string;
  lead_time_days: string;
  description: string;
  tags: string;
  image_filename: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export const useFabricImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      csvData, 
      imageFiles 
    }: { 
      csvData: FabricCSVRow[]; 
      imageFiles?: FileList;
    }): Promise<ImportResult> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const result: ImportResult = {
        success: true,
        imported: 0,
        errors: []
      };

      // Process each row
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        try {
          // 1. Create or get vendor
          let vendorId: string;
          const { data: existingVendor } = await supabase
            .from("vendors")
            .select("id")
            .eq("name", row.vendor_name)
            .eq("user_id", user.id)
            .single();

          if (existingVendor) {
            vendorId = existingVendor.id;
          } else {
            const { data: newVendor, error: vendorError } = await supabase
              .from("vendors")
              .insert({
                name: row.vendor_name,
                user_id: user.id,
                contact_person: "Import",
                email: "",
                phone: "",
                address: "",
              })
              .select("id")
              .single();

            if (vendorError) throw vendorError;
            vendorId = newVendor.id;
          }

          // 2. Create inventory record
          const { data: inventoryItem, error: inventoryError } = await supabase
            .from("inventory")
            .insert({
              name: row.fabric_name,
              category: "Fabric",
              type: row.type,
              color: row.color,
              pattern: row.pattern,
              sku: row.fabric_code,
              quantity: parseFloat(row.initial_quantity) || 0,
              unit: "yard",
              cost_per_unit: parseFloat(row.cost_per_unit) || null,
              reorder_point: parseFloat(row.reorder_point) || null,
              supplier: row.vendor_name,
              width: parseFloat(row.width_cm) || null,
              notes: row.description,
              user_id: user.id,
            })
            .select("id")
            .single();

          if (inventoryError) throw inventoryError;

          // 3. Handle image upload if provided
          if (imageFiles && row.image_filename) {
            const imageFile = Array.from(imageFiles).find(file => 
              file.name === row.image_filename
            );

            if (imageFile) {
              const fileExt = imageFile.name.split('.').pop();
              const fileName = `fabrics/${user.id}/${inventoryItem.id}.${fileExt}`;

              const { error: uploadError } = await supabase.storage
                .from('fabric-images')
                .upload(fileName, imageFile);

              if (uploadError && uploadError.message !== 'The resource already exists') {
                console.warn(`Failed to upload image for ${row.fabric_name}:`, uploadError);
              }
            }
          }

          result.imported++;
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          result.errors.push(`Row ${i + 1} (${row.fabric_name}): ${error.message}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.imported} fabric records.`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `Imported ${result.imported} records. ${result.errors.length} errors occurred.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useShopifyFabricSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // This would integrate with Shopify API to sync fabric data
      // For now, we'll return a placeholder
      throw new Error("Shopify integration not yet implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "Shopify Sync Complete",
        description: "Successfully synced fabric data from Shopify.",
      });
    },
    onError: (error) => {
      toast({
        title: "Shopify Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
