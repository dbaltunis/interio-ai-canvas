
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FabricCSVUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FabricCSVUpload = ({ open, onOpenChange }: FabricCSVUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const fabrics = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const fabric: any = {};
      
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
      
      // Set defaults and required fields
      if (fabric.name) {
        fabric.category = 'Fabric';
        fabric.unit = 'yard';
        fabrics.push(fabric);
      }
    }
    
    return fabrics;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log("Starting CSV upload process...");

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload fabrics");
      }
      console.log("User authenticated:", user.email);

      // Read file content
      const csvText = await file.text();
      console.log("CSV file read successfully, length:", csvText.length);
      
      // Parse CSV
      const fabrics = parseCSV(csvText);
      console.log("Parsed fabrics:", fabrics.length);
      
      if (fabrics.length === 0) {
        throw new Error("No valid fabric data found in CSV file");
      }

      // Add user_id to each fabric
      const fabricsWithUserId = fabrics.map(fabric => ({
        ...fabric,
        user_id: user.id
      }));

      console.log("Inserting fabrics into database...");
      
      // Insert fabrics into database
      const { data, error } = await supabase
        .from("inventory")
        .insert(fabricsWithUserId)
        .select();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Successfully inserted fabrics:", data?.length);

      toast({
        title: "Success!",
        description: `Successfully imported ${data?.length || fabrics.length} fabrics`,
      });

      setFile(null);
      onOpenChange(false);
      
      // Refresh the page to show new data
      window.location.reload();

    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload CSV file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Fabric CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">CSV Format Requirements:</p>
              <p>Columns: name, sku, supplier, color, pattern, type, width, cost_per_unit, quantity</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
