
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFabricImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const importFabricsFromCSV = async (file: File) => {
    setIsImporting(true);
    console.log("Starting fabric import from CSV...");

    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to import fabrics");
      }

      console.log("User authenticated:", user.email);

      // Read and parse CSV file
      const csvText = await file.text();
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      console.log("CSV headers found:", headers);

      const fabrics = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const fabric: any = {
          user_id: user.id,
          category: 'Fabric',
          unit: 'yard',
          quantity: 0
        };
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          switch (header) {
            case 'name':
            case 'fabric_name':
              fabric.name = value;
              break;
            case 'sku':
            case 'code':
            case 'fabric_code':
              fabric.sku = value;
              break;
            case 'supplier':
            case 'brand':
            case 'vendor':
              fabric.supplier = value;
              break;
            case 'color':
              fabric.color = value;
              break;
            case 'pattern':
              fabric.pattern = value;
              break;
            case 'type':
            case 'fabric_type':
              fabric.type = value;
              break;
            case 'width':
              fabric.width = parseFloat(value) || null;
              break;
            case 'cost':
            case 'price':
            case 'cost_per_unit':
              fabric.cost_per_unit = parseFloat(value) || null;
              break;
            case 'quantity':
              fabric.quantity = parseFloat(value) || 0;
              break;
          }
        });
        
        if (fabric.name) {
          fabrics.push(fabric);
        }
      }

      console.log(`Parsed ${fabrics.length} fabrics from CSV`);

      if (fabrics.length === 0) {
        throw new Error("No valid fabric data found in CSV. Please check the format.");
      }

      // Insert in batches to avoid timeout
      const batchSize = 50;
      let inserted = 0;
      
      for (let i = 0; i < fabrics.length; i += batchSize) {
        const batch = fabrics.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}, items ${i + 1} to ${Math.min(i + batchSize, fabrics.length)}`);
        
        const { data, error } = await supabase
          .from("inventory")
          .insert(batch)
          .select();

        if (error) {
          console.error("Database insert error:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        inserted += data?.length || batch.length;
        console.log(`Successfully inserted ${data?.length || batch.length} items`);
      }

      console.log(`Total fabrics imported: ${inserted}`);

      toast({
        title: "Import Successful!",
        description: `Successfully imported ${inserted} fabrics`,
      });

      return { success: true, count: inserted };

    } catch (error: any) {
      console.error("Fabric import failed:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import fabrics from CSV",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFabricsFromCSV,
    isImporting
  };
};
