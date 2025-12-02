import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Package, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const CSV_TEMPLATES = [
  {
    id: 'fabrics',
    name: 'Fabrics Template',
    description: 'Curtain fabrics, roller fabrics, roman fabrics',
    url: '/templates/fabrics_import_template.csv',
    icon: '🧵',
  },
  {
    id: 'hardware',
    name: 'Hardware Template',
    description: 'Tracks, rods, brackets, accessories',
    url: '/templates/hardware_import_template.csv',
    icon: '🔩',
  },
  {
    id: 'trimmings',
    name: 'Trimmings Template',
    description: 'Tiebacks, tassels, decorative items',
    url: '/templates/trimmings_import_template.csv',
    icon: '✨',
  },
  {
    id: 'wallpaper',
    name: 'Wallpaper Template',
    description: 'Wallpaper rolls and panels',
    url: '/templates/wallpaper_import_template.csv',
    icon: '🎨',
  },
  {
    id: 'basic',
    name: 'Basic Inventory Template',
    description: 'Simple format with essential fields',
    url: '/templates/inventory_import_template_basic.csv',
    icon: '📋',
  },
  {
    id: 'complete',
    name: 'Complete Inventory Template',
    description: 'Full format with all available fields',
    url: '/templates/inventory_import_template_complete.csv',
    icon: '📑',
  },
];

export const InventoryDataStep = ({ data, updateSection }: StepProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const inventoryData = data.inventory_data || {};

  const handleFileSelect = (type: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
    if (file) {
      // Read file and store CSV content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        updateSection('inventory_data', {
          ...inventoryData,
          [`${type}_csv`]: content,
          imported_count: (inventoryData.imported_count || 0) + 1,
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Product Inventory
        </CardTitle>
        <CardDescription>
          Download CSV templates, fill them with your products, and upload them here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Templates Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Step 1: Download CSV Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CSV_TEMPLATES.map((template) => (
              <a
                key={template.id}
                href={template.url}
                download
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors group"
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {template.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {template.description}
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Step 2: Upload Your Completed Files
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['fabrics', 'hardware', 'services'].map((type) => (
              <div key={type} className="space-y-2">
                <Label className="capitalize">{type}</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id={`upload-${type}`}
                    onChange={(e) => handleFileSelect(type, e.target.files?.[0] || null)}
                  />
                  <label htmlFor={`upload-${type}`} className="cursor-pointer">
                    {uploadedFiles[type] ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">{uploadedFiles[type]?.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileSpreadsheet className="h-8 w-8" />
                        <span className="text-xs">Drop CSV or click to upload</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        {inventoryData.imported_count && inventoryData.imported_count > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium text-sm">Files Uploaded</div>
              <div className="text-xs text-muted-foreground">
                {inventoryData.imported_count} file(s) ready for import
              </div>
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>Tip:</strong> You can skip this step and add products manually later. 
              The uploaded files will be imported when you complete the wizard.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
