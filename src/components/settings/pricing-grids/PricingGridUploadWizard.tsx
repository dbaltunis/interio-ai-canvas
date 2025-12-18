import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, 
  Package, 
  Upload, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useVendors } from '@/hooks/useVendors';
import { getTreatmentOptions, getUnifiedConfig } from '@/types/treatmentCategories';
import { PriceGroupAutocomplete } from './PriceGroupAutocomplete';
import { useMaterialMatchCount } from '@/hooks/useInventoryPriceGroups';
import { cn } from '@/lib/utils';

const TREATMENT_OPTIONS = getTreatmentOptions();

interface PricingGridUploadWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  initialProductType?: string;
  initialPriceGroup?: string;
}

type WizardStep = 'supplier' | 'product' | 'upload' | 'review';

export const PricingGridUploadWizard = ({ 
  onComplete, 
  onCancel,
  initialProductType,
  initialPriceGroup 
}: PricingGridUploadWizardProps) => {
  const { data: vendors = [] } = useVendors();
  
  const [step, setStep] = useState<WizardStep>('supplier');
  const [supplierId, setSupplierId] = useState('');
  const [productType, setProductType] = useState(initialProductType || '');
  const [priceGroup, setPriceGroup] = useState(initialPriceGroup || '');
  const [includesFabricPrice, setIncludesFabricPrice] = useState(true);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [gridName, setGridName] = useState('');
  const [gridCode, setGridCode] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Get material count for selected price group
  const { data: materialMatch } = useMaterialMatchCount(supplierId, productType, priceGroup);

  const selectedVendor = vendors.find(v => v.id === supplierId);
  const selectedConfig = productType ? getUnifiedConfig(productType) : null;

  const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
    { key: 'supplier', label: 'Supplier', icon: <Building2 className="h-4 w-4" /> },
    { key: 'product', label: 'Product', icon: <Package className="h-4 w-4" /> },
    { key: 'upload', label: 'Upload', icon: <Upload className="h-4 w-4" /> },
    { key: 'review', label: 'Review', icon: <Check className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const canProceed = () => {
    switch (step) {
      case 'supplier': return !!supplierId;
      case 'product': return !!productType && !!priceGroup;
      case 'upload': return !!csvFile;
      case 'review': return !!gridName && !!gridCode;
      default: return false;
    }
  };

  const handleNext = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1].key);
    }
  };

  const handleBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(steps[idx - 1].key);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setCsvFile(file);
    
    // Preview first few rows
    const text = await file.text();
    const lines = text.trim().split('\n').slice(0, 5);
    const preview = lines.map(line => line.split(',').map(cell => cell.trim()));
    setCsvPreview(preview);
    
    // Auto-generate grid name and code
    const supplierName = selectedVendor?.name || 'Unknown';
    const productLabel = selectedConfig?.display_name || productType.replace(/_/g, ' ');
    setGridName(`${productLabel} - Group ${priceGroup}`);
    setGridCode(`${supplierName.substring(0, 3).toUpperCase()}-${productType.substring(0, 3).toUpperCase()}-${priceGroup}`);
  };

  const parseCsvToGridData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and data rows');

    const headers = lines[0].split(',').map(h => h.trim());
    const widthColumns = headers.slice(1);

    const dropRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        drop: values[0],
        prices: values.slice(1).map(p => parseFloat(p) || 0)
      };
    });

    return { widthColumns, dropRows };
  };

  const handleSubmit = async () => {
    if (!csvFile || !supplierId || !productType || !priceGroup || !gridName || !gridCode) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const csvText = await csvFile.text();
      const gridData = parseCsvToGridData(csvText);

      const { error } = await supabase
        .from('pricing_grids')
        .insert({
          user_id: user.id,
          name: gridName,
          grid_code: gridCode,
          grid_data: gridData,
          supplier_id: supplierId,
          product_type: productType,
          price_group: priceGroup.toUpperCase().trim(),
          markup_percentage: parseFloat(markupPercentage) || 0,
          includes_fabric_price: includesFabricPrice,
          active: true
        });

      if (error) throw error;

      toast.success('Pricing grid created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Error creating pricing grid:', error);
      toast.error(error.message || 'Failed to create pricing grid');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Add Pricing Grid
            </CardTitle>
            <CardDescription>Follow the steps to upload your pricing</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4 px-2">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center">
              <div 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                  step === s.key 
                    ? "bg-primary text-primary-foreground" 
                    : idx < currentStepIndex 
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {idx < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  s.icon
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1",
                  idx < currentStepIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Supplier */}
        {step === 'supplier' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Select Supplier</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Which supplier's price list is this?
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {vendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSupplierId(vendor.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                    supplierId === vendor.id 
                      ? "border-primary bg-primary/5" 
                      : "border-muted"
                  )}
                >
                  <Building2 className={cn(
                    "h-5 w-5 mb-2",
                    supplierId === vendor.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <p className="font-medium truncate">{vendor.name}</p>
                  {vendor.contact_person && (
                    <p className="text-xs text-muted-foreground truncate">{vendor.contact_person}</p>
                  )}
                </button>
              ))}
            </div>
            
            {vendors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No suppliers found.</p>
                <p className="text-sm">Add suppliers in Settings → Vendors first.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Product Type */}
        {step === 'product' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">What product is this pricing for?</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select the product type and price group
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TREATMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setProductType(option.value)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                    productType === option.value 
                      ? "border-primary bg-primary/5" 
                      : "border-muted"
                  )}
                >
                  <Package className={cn(
                    "h-5 w-5 mb-2",
                    productType === option.value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <p className="font-medium text-sm">{option.label}</p>
                </button>
              ))}
            </div>

            {productType && (
              <div className="mt-6 space-y-4">
                <div className="space-y-3">
                  <Label>Price Group</Label>
                  <PriceGroupAutocomplete
                    value={priceGroup}
                    onChange={setPriceGroup}
                    placeholder="e.g., 1, 2, 3 or A, B, C"
                  />
                  {priceGroup && materialMatch && (
                    <div className="flex items-center gap-2 text-xs">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      {materialMatch.count > 0 ? (
                        <span className="text-primary font-medium">
                          {materialMatch.count} materials will use this grid
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          No materials with this price group yet - assign after upload
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Materials with matching price_group in inventory will auto-use this grid
                  </p>
                </div>

                {/* Includes Fabric Price Toggle */}
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 border">
                  <Checkbox
                    id="includes-fabric"
                    checked={includesFabricPrice}
                    onCheckedChange={(checked) => setIncludesFabricPrice(!!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="includes-fabric" className="text-sm font-medium cursor-pointer">
                      Grid price includes fabric cost
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {includesFabricPrice 
                        ? "TWC mode: Grid price is all-inclusive (fabric + fabrication)"
                        : "Separate mode: Grid is fabrication only - fabric cost will be added"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Upload Price List (CSV)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a CSV with width columns and drop rows
              </p>
            </div>

            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                csvFile ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
              )}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                {csvFile ? (
                  <>
                    <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="font-medium">{csvFile.name}</p>
                    <p className="text-sm text-muted-foreground">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Click to upload CSV</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </>
                )}
              </label>
            </div>

            {csvPreview.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm">Preview (first 5 rows)</Label>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs border rounded">
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className={i === 0 ? "bg-muted font-medium" : ""}>
                          {row.slice(0, 6).map((cell, j) => (
                            <td key={j} className="border px-2 py-1 truncate max-w-20">
                              {cell}
                            </td>
                          ))}
                          {row.length > 6 && (
                            <td className="border px-2 py-1 text-muted-foreground">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Review & Confirm</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Confirm the details and create your grid
              </p>
            </div>

            {/* Summary */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Supplier</span>
                <Badge variant="outline">{selectedVendor?.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Product Type</span>
                <Badge variant="outline">{selectedConfig?.display_name || productType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Group</span>
                <Badge>{priceGroup}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pricing Mode</span>
                <Badge variant={includesFabricPrice ? "default" : "secondary"}>
                  {includesFabricPrice ? "All-inclusive (fabric + fabrication)" : "Fabrication only"}
                </Badge>
              </div>
              {materialMatch && materialMatch.count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Materials to link</span>
                  <span className="text-sm font-medium text-primary">{materialMatch.count} items</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">File</span>
                <span className="text-sm">{csvFile?.name}</span>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grid Name *</Label>
                <Input
                  value={gridName}
                  onChange={(e) => setGridName(e.target.value)}
                  placeholder="e.g., Roller Blind - Standard"
                />
              </div>
              <div className="space-y-2">
                <Label>Grid Code *</Label>
                <Input
                  value={gridCode}
                  onChange={(e) => setGridCode(e.target.value)}
                  placeholder="e.g., TWC-ROL-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Markup % (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(e.target.value)}
                  placeholder="0"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Leave at 0 to use global markup settings
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {step === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isUploading}
              className="bg-primary"
            >
              {isUploading ? 'Creating...' : 'Create Grid'}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
