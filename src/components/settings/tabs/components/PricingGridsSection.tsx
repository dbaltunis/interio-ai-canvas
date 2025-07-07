
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const PricingGridsSection = () => {
  const [gridName, setGridName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const generateCSVTemplate = () => {
    const csvContent = `Width (mm),200-400,401-600,601-800,801-1000,1001-1200,1201-1400,1401-1600,1601-1800,1801-2000,2001-2200,2201-2400
"Height 300-600",25,30,35,40,45,50,55,60,65,70,75
"Height 601-900",30,35,40,45,50,55,60,65,70,75,80
"Height 901-1200",35,40,45,50,55,60,65,70,75,80,85
"Height 1201-1500",40,45,50,55,60,65,70,75,80,85,90
"Height 1501-1800",45,50,55,60,65,70,75,80,85,90,95
"Height 1801-2100",50,55,60,65,70,75,80,85,90,95,100
"Height 2101-2400",55,60,65,70,75,80,85,90,95,100,105
"Height 2401-2700",60,65,70,75,80,85,90,95,100,105,110`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pricing_grid_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV template downloaded successfully");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!gridName.trim()) {
      toast.error("Please enter a grid name");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      console.log('CSV content:', fileContent);
      
      // Here you would process the CSV and save to database
      // For now, just show success message
      toast.success(`Pricing grid "${gridName}" uploaded successfully`);
      setGridName("");
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error("Failed to process CSV file");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">CSV Pricing Grids</h4>
          <p className="text-sm text-brand-neutral">Upload CSV files with width/height pricing tables for blinds and curtains</p>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={generateCSVTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Pricing Grid
            </CardTitle>
            <CardDescription>
              Upload CSV files with width/height pricing tables from your vendors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gridName">Grid Name</Label>
              <Input 
                id="gridName" 
                placeholder="e.g., Roman Blinds - Premium, Venetian Blinds - Standard" 
                value={gridName}
                onChange={(e) => setGridName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="csvFile">CSV File</Label>
              <Input 
                id="csvFile" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <Button 
              onClick={handleUpload}
              className="w-full bg-brand-primary hover:bg-brand-accent"
              disabled={!gridName.trim() || !selectedFile}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload & Process Grid
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              CSV Format Guide
            </CardTitle>
            <CardDescription>
              How to structure your CSV pricing files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>Required Format:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>First row: Width ranges (e.g., 200-400, 401-600)</li>
                <li>First column: Height ranges (e.g., Height 300-600)</li>
                <li>Intersection cells: Prices for that width/height combination</li>
                <li>Use consistent units (mm or cm)</li>
              </ul>
              
              <p className="mt-3"><strong>Vendor Compatibility:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>✅ Direct upload from most blind suppliers</li>
                <li>✅ Excel exports saved as CSV</li>
                <li>✅ Standard pricing table formats</li>
              </ul>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateCSVTemplate}
                className="w-full mt-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Get Example Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <p className="text-brand-neutral">No pricing grids uploaded yet</p>
            <p className="text-xs text-brand-neutral mt-1">
              Upload your first CSV pricing grid to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
