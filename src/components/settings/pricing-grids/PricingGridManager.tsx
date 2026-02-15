import { useState, useMemo } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Upload, Trash2, Grid3x3, Building2, Layers, FolderOpen, Pencil, Check, X, HelpCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SampleDataHelper } from './SampleDataHelper';
import { PricingGridExplainer } from './PricingGridExplainer';
import { BulkGridUploader } from './BulkGridUploader';
import { GridCoverageDashboard } from './GridCoverageDashboard';
import { CategoryProductTypeGuide } from './CategoryProductTypeGuide';
import { PriceGroupAutocomplete } from './PriceGroupAutocomplete';
import { MaterialMatchPreview } from './MaterialMatchPreview';
import { HowPricingWorksGuide } from './HowPricingWorksGuide';
import { PricingSystemGuide } from '@/components/guides/PricingSystemGuide';
import { useVendors } from '@/hooks/useVendors';
import { 
  getTreatmentOptions, 
  getUnifiedConfig 
} from '@/types/treatmentCategories';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Get treatment options from unified categories (single source of truth)
const TREATMENT_OPTIONS = getTreatmentOptions();

export const PricingGridManager = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState('single');
  const [newGridName, setNewGridName] = useState('');
  const [newGridCode, setNewGridCode] = useState('');
  const [newGridDescription, setNewGridDescription] = useState('');
  const [newSupplierId, setNewSupplierId] = useState<string>('');
  const [newProductType, setNewProductType] = useState<string>('');
  const [newPriceGroup, setNewPriceGroup] = useState('');
  const [newMarkupPercentage, setNewMarkupPercentage] = useState<string>('');
  const [newDiscountPercentage, setNewDiscountPercentage] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Inline edit state
  const [editingGridId, setEditingGridId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'markup' | 'discount'>('markup');
  const [editMarkupValue, setEditMarkupValue] = useState<string>('');
  
  // Guide modal state
  const [showGuide, setShowGuide] = useState(false);

  // Get selected treatment config for display
  const selectedTreatmentConfig = useMemo(() => {
    return newProductType ? getUnifiedConfig(newProductType) : null;
  }, [newProductType]);

  const { data: vendors = [] } = useVendors();
  
  // Handler for coverage dashboard clicks
  const handleCoverageUploadClick = (productType: string, priceGroup: string) => {
    setNewProductType(productType);
    setNewPriceGroup(priceGroup);
    setActiveTab('single');
    toast.info(`Set up grid for ${productType.replace(/_/g, ' ')} - Group ${priceGroup}`);
  };

  // Fetch pricing grids with supplier info
  const { data: grids, isLoading, refetch } = useQuery({
    queryKey: ['pricing-grids'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing_grids')
        .select(`
          *,
          vendor:supplier_id (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const parseCsvToGridData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and data rows');

    // First row is headers (widths)
    const headers = lines[0].split(',').map(h => h.trim());
    const widthColumns = headers.slice(1); // Skip first column (Drop)

    // Remaining rows are drop values with prices
    const dropRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        drop: values[0],
        prices: values.slice(1).map(p => parseFloat(p) || 0)
      };
    });

    return {
      widthColumns,
      dropRows
    };
  };

  const handleCreateGrid = async () => {
    if (!newGridName || !newGridCode) {
      toast.error('Please provide grid name and code');
      return;
    }

    if (!newSupplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (!newProductType) {
      toast.error('Please select a product type');
      return;
    }

    if (!newPriceGroup) {
      toast.error('Please enter a price group (e.g., A, B, C)');
      return;
    }

    if (!csvFile) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Read CSV file
      const csvText = await csvFile.text();
      const gridData = parseCsvToGridData(csvText);

      // Create grid with supplier, product type, price group, and markup
      const { error } = await supabase
        .from('pricing_grids')
        .insert({
          user_id: user.id,
          name: newGridName,
          grid_code: newGridCode,
          description: newGridDescription || null,
          grid_data: gridData,
          supplier_id: newSupplierId,
          product_type: newProductType,
          price_group: newPriceGroup.toUpperCase().trim(),
          markup_percentage: parseFloat(newMarkupPercentage) || 0,
          discount_percentage: parseFloat(newDiscountPercentage) || 0,
          active: true
        } as any);

      if (error) throw error;

      toast.success('Pricing grid created successfully');
      setNewGridName('');
      setNewGridCode('');
      setNewGridDescription('');
      setNewSupplierId('');
      setNewProductType('');
      setNewPriceGroup('');
      setNewMarkupPercentage('');
      setNewDiscountPercentage('');
      setCsvFile(null);
      refetch();
    } catch (error: any) {
      console.error('Error creating pricing grid:', error);
      toast.error(error.message || 'Failed to create pricing grid');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGrid = async (gridId: string) => {
    const confirmed = await confirm({
      title: "Delete Pricing Grid",
      description: "Are you sure you want to delete this pricing grid?",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('pricing_grids')
        .update({ active: false })
        .eq('id', gridId);

      if (error) throw error;

      toast.success('Pricing grid deleted');
      refetch();
    } catch (error: any) {
      console.error('Error deleting pricing grid:', error);
      toast.error('Failed to delete pricing grid');
    }
  };

  const getProductTypeLabel = (value: string) => {
    const config = getUnifiedConfig(value);
    return config?.display_name || value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Mutation for updating markup or discount
  const updateGridFieldMutation = useMutation({
    mutationFn: async ({ gridId, field, value }: { gridId: string; field: 'markup' | 'discount'; value: number }) => {
      const updateData = field === 'markup'
        ? { markup_percentage: value }
        : { discount_percentage: value };
      const { error } = await supabase
        .from('pricing_grids')
        .update(updateData as any)
        .eq('id', gridId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${editField === 'markup' ? 'Markup' : 'Discount'} updated`);
      queryClient.invalidateQueries({ queryKey: ['pricing-grids'] });
      setEditingGridId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update');
    }
  });

  const handleStartEdit = (gridId: string, field: 'markup' | 'discount', currentValue: number) => {
    setEditingGridId(gridId);
    setEditField(field);
    setEditMarkupValue(String(currentValue || 0));
  };

  const handleSaveEdit = (gridId: string) => {
    const value = parseFloat(editMarkupValue) || 0;
    updateGridFieldMutation.mutate({ gridId, field: editField, value });
  };

  const handleCancelEdit = () => {
    setEditingGridId(null);
    setEditMarkupValue('');
  };

  return (
    <div className="space-y-6">
      {/* Interactive Guide Modal */}
      <PricingSystemGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      
      {/* Help Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing Grids</h2>
          <p className="text-sm text-muted-foreground">
            Upload grids with supplier + product type + price group for automatic matching
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            How It Works
          </Button>
          <PricingGridExplainer />
        </div>
      </div>

      {/* Grid Coverage Dashboard */}
      <GridCoverageDashboard onUploadClick={handleCoverageUploadClick} />

      {/* How Pricing Works Guide */}
      <HowPricingWorksGuide />

      {/* Sample CSV Helper */}
      <SampleDataHelper />

      {/* Upload Options - Tabs for Single vs Bulk */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Single Grid
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="mt-4">
          <BulkGridUploader onComplete={refetch} />
        </TabsContent>

        <TabsContent value="single" className="mt-4 space-y-4">
      {/* Category Mapping Guide */}
      <CategoryProductTypeGuide 
        onSelectProductType={(pt) => {
          setNewProductType(pt);
        }} 
      />

      {/* Create New Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Pricing Grid
          </CardTitle>
          <CardDescription>
            Upload a CSV with pricing data. Assign supplier, treatment type, and price group for auto-matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">
              <Building2 className="h-3.5 w-3.5 inline mr-1" />
              Supplier *
            </Label>
            <Select value={newSupplierId} onValueChange={setNewSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {vendors.length === 0 && (
              <p className="text-xs text-amber-600">
                No suppliers found. Add suppliers in Settings → Vendors first.
              </p>
            )}
          </div>

          {/* Treatment Type - Single dropdown replacing Category + Product Type */}
          <div className="space-y-2">
            <Label htmlFor="treatment-type">
              <FolderOpen className="h-3.5 w-3.5 inline mr-1" />
              Treatment Type *
            </Label>
            <Select 
              value={newProductType} 
              onValueChange={setNewProductType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select treatment type" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTreatmentConfig && (
              <p className="text-xs text-muted-foreground">
                {selectedTreatmentConfig.description} • 
                <span className="ml-1">
                  Compatible with: <code className="bg-muted px-1 rounded">{selectedTreatmentConfig.inventory_subcategories.join(', ')}</code>
                </span>
              </p>
            )}
          </div>

          {/* Price Group (Key linking field) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="price-group" className="flex items-center gap-1">
                Price Group (Links to Materials) *
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Materials with matching price_group will use this pricing grid. Select an existing group or create a new one.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <PriceGroupAutocomplete
              value={newPriceGroup}
              onChange={setNewPriceGroup}
              placeholder="Select or type a price group..."
            />
          </div>

          {/* Material Match Preview */}
          <MaterialMatchPreview
            supplierId={newSupplierId}
            productType={newProductType}
            priceGroup={newPriceGroup}
          />

          {/* Grid Code and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grid-code">
                Grid Code *
                <span className="text-xs text-muted-foreground ml-2">(Internal reference)</span>
              </Label>
              <Input
                id="grid-code"
                placeholder="e.g., RB-STD-2024"
                value={newGridCode}
                onChange={(e) => setNewGridCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grid-name">
                Grid Name *
                <span className="text-xs text-muted-foreground ml-2">(Display name)</span>
              </Label>
              <Input
                id="grid-name"
                placeholder="e.g., Roller Blind - Standard"
                value={newGridName}
                onChange={(e) => setNewGridName(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="grid-description">Description</Label>
            <Input
              id="grid-description"
              placeholder="Optional notes about this grid"
              value={newGridDescription}
              onChange={(e) => setNewGridDescription(e.target.value)}
            />
          </div>

          {/* Discount and Markup */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="discount-percentage">Trade Discount %</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Supplier/trade discount off the grid's list prices. E.g., 10% discount means you pay 90% of list. Leave at 0 for no discount.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  id="discount-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0"
                  value={newDiscountPercentage}
                  onChange={(e) => setNewDiscountPercentage(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="markup-percentage">Markup %</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Markup applied on top of the discounted cost. Leave at 0 to use global markup settings.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  id="markup-percentage"
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  placeholder="0"
                  value={newMarkupPercentage}
                  onChange={(e) => setNewMarkupPercentage(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File *</Label>
            <div className="flex gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="flex-1"
              />
              {csvFile && (
                <Button variant="outline" size="sm" onClick={() => setCsvFile(null)}>
                  Clear
                </Button>
              )}
            </div>
            {csvFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {csvFile.name}
              </p>
            )}
          </div>

          <Button 
            onClick={handleCreateGrid} 
            disabled={isUploading || !newGridName || !newGridCode || !csvFile || !newSupplierId || !newProductType || !newPriceGroup}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Creating...' : 'Create Pricing Grid'}
          </Button>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Existing Grids */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Existing Pricing Grids
          </CardTitle>
          <CardDescription>
            Grids are auto-matched to fabrics/materials by Supplier + Product Type + Price Group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          ) : !grids || grids.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pricing grids yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {grids.map((grid) => (
                <div 
                  key={grid.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-card-foreground">{grid.name}</h4>
                      {grid.price_group && (
                        <Badge variant="secondary" className="text-xs">
                          Group {grid.price_group}
                        </Badge>
                      )}
                      {grid.product_type && (
                        <Badge variant="outline" className="text-xs">
                          {getProductTypeLabel(grid.product_type)}
                        </Badge>
                      )}
                      {/* Inline Edit (Markup or Discount) */}
                      {editingGridId === grid.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">{editField === 'markup' ? 'Markup:' : 'Discount:'}</span>
                          <Input
                            type="number"
                            min="0"
                            max={editField === 'markup' ? 500 : 100}
                            step="0.5"
                            value={editMarkupValue}
                            onChange={(e) => setEditMarkupValue(e.target.value)}
                            className="w-20 h-7 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(grid.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSaveEdit(grid.id)}
                            disabled={updateGridFieldMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* Discount badge */}
                          <Badge
                            variant={(grid as any).discount_percentage > 0 ? "default" : "outline"}
                            className={`text-xs cursor-pointer hover:opacity-80 ${(grid as any).discount_percentage > 0 ? 'bg-amber-500' : ''}`}
                            onClick={() => handleStartEdit(grid.id, 'discount', (grid as any).discount_percentage || 0)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            {(grid as any).discount_percentage > 0 ? `-${(grid as any).discount_percentage}%` : 'Set discount'}
                          </Badge>
                          {/* Markup badge */}
                          <Badge
                            variant={(grid as any).markup_percentage > 0 ? "default" : "outline"}
                            className={`text-xs cursor-pointer hover:opacity-80 ${(grid as any).markup_percentage > 0 ? 'bg-emerald-500' : ''}`}
                            onClick={() => handleStartEdit(grid.id, 'markup', (grid as any).markup_percentage || 0)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            {(grid as any).markup_percentage > 0 ? `+${(grid as any).markup_percentage}%` : 'Set markup'}
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Code: {grid.grid_code}
                      {(grid as any).vendor?.name && ` • Supplier: ${(grid as any).vendor.name}`}
                      {grid.description && ` • ${grid.description}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(grid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGrid(grid.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};