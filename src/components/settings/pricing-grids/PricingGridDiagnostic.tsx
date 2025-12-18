import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CheckCircle2, XCircle, AlertTriangle, Grid3x3, Package, ArrowRight } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { getTreatmentOptions } from '@/types/treatmentCategories';
import { resolveGridForProduct } from '@/utils/pricing/gridResolver';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';

const TREATMENT_OPTIONS = getTreatmentOptions();

interface DiagnosticResult {
  success: boolean;
  gridId: string | null;
  gridName?: string;
  gridCode?: string;
  matchDetails?: string;
  searchParams: {
    supplierId?: string;
    supplierName?: string;
    productType: string;
    priceGroup: string;
  };
  availableGrids: Array<{
    id: string;
    name: string;
    grid_code: string;
    supplier_id: string;
    supplier_name?: string;
    product_type: string;
    price_group: string;
  }>;
  possibleIssues: string[];
  fixSteps: string[];
}

export const PricingGridDiagnostic = () => {
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [supplierId, setSupplierId] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [priceGroup, setPriceGroup] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: vendors = [] } = useVendors();
  const { data: inventory = [] } = useEnhancedInventory();

  // Filter to materials only
  const materials = inventory.filter(item => 
    item.category === 'material' || 
    ['roller_fabric', 'venetian_slats', 'vertical_slats', 'cellular', 'panel_glide_fabric', 'shutter_material'].includes(item.subcategory || '')
  );

  // Fetch all grids for comparison
  const { data: allGrids = [] } = useQuery({
    queryKey: ['all-pricing-grids-diagnostic'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('pricing_grids')
        .select(`
          id,
          name,
          grid_code,
          supplier_id,
          product_type,
          price_group,
          vendor:supplier_id (name)
        `)
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) {
        console.error('Error fetching grids:', error);
        return [];
      }

      return data?.map(g => ({
        ...g,
        supplier_name: (g.vendor as any)?.name || 'Unknown'
      })) || [];
    }
  });

  const runDiagnostic = async (params: { supplierId?: string; productType: string; priceGroup: string }) => {
    if (!params.productType || !params.priceGroup) {
      return;
    }

    setIsSearching(true);
    const possibleIssues: string[] = [];
    const fixSteps: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get supplier name for display
      const supplierName = vendors.find(v => v.id === params.supplierId)?.name;

      // Try to resolve grid
      const resolution = await resolveGridForProduct({
        productType: params.productType,
        fabricPriceGroup: params.priceGroup,
        fabricSupplierId: params.supplierId || undefined,
        userId: user.id
      });

      // Analyze why it might not match
      if (!resolution.gridId) {
        // Check for partial matches
        const matchingProductType = allGrids.filter(g => g.product_type === params.productType);
        const matchingPriceGroup = allGrids.filter(g => 
          g.price_group?.toLowerCase() === params.priceGroup.toLowerCase()
        );
        const matchingSupplier = params.supplierId 
          ? allGrids.filter(g => g.supplier_id === params.supplierId)
          : allGrids;

        if (allGrids.length === 0) {
          possibleIssues.push('No pricing grids exist yet');
          fixSteps.push('Go to Settings → Pricing → Grids tab and upload a pricing grid CSV');
        } else if (matchingProductType.length === 0) {
          possibleIssues.push(`No grids exist for product type "${params.productType.replace(/_/g, ' ')}"`);
          fixSteps.push(`Upload a grid with Product Type = "${params.productType}"`);
        } else if (matchingPriceGroup.length === 0) {
          possibleIssues.push(`No grids exist with price group "${params.priceGroup}"`);
          fixSteps.push(`Upload a grid with Price Group = "${params.priceGroup}" OR update the material's price group`);
        } else if (params.supplierId && matchingSupplier.length === 0) {
          possibleIssues.push(`No grids exist for supplier "${supplierName}"`);
          fixSteps.push(`Upload a grid with Supplier = "${supplierName}" OR remove supplier filter`);
        } else {
          // Check if the combination doesn't exist
          const exactMatch = allGrids.find(g => 
            g.product_type === params.productType &&
            g.price_group?.toLowerCase() === params.priceGroup.toLowerCase() &&
            (!params.supplierId || g.supplier_id === params.supplierId)
          );
          if (!exactMatch) {
            possibleIssues.push('No grid matches the exact combination of supplier + product type + price group');
            
            // Show what's close
            const closeMatches = allGrids.filter(g => 
              (g.product_type === params.productType || g.price_group?.toLowerCase() === params.priceGroup.toLowerCase())
            );
            if (closeMatches.length > 0) {
              possibleIssues.push(`Found ${closeMatches.length} grids with partial matches - check the table below`);
            }
            fixSteps.push('Create a grid with the correct combination OR update the material\'s price group to match an existing grid');
          }
        }
      }

      setResult({
        success: !!resolution.gridId,
        gridId: resolution.gridId,
        gridName: resolution.gridName,
        gridCode: resolution.gridCode,
        matchDetails: resolution.matchedRule 
          ? `Matched via ${resolution.matchedRule.id === 'auto-match' ? 'Auto-Match' : 'Legacy Rule'}`
          : undefined,
        searchParams: {
          supplierId: params.supplierId || undefined,
          supplierName: supplierName,
          productType: params.productType,
          priceGroup: params.priceGroup
        },
        availableGrids: allGrids,
        possibleIssues,
        fixSteps
      });

    } catch (error) {
      console.error('Diagnostic error:', error);
      possibleIssues.push(`Error: ${(error as Error).message}`);
      setResult({
        success: false,
        gridId: null,
        searchParams: {
          supplierId: params.supplierId || undefined,
          supplierName: vendors.find(v => v.id === params.supplierId)?.name,
          productType: params.productType,
          priceGroup: params.priceGroup
        },
        availableGrids: allGrids,
        possibleIssues,
        fixSteps
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = () => {
    runDiagnostic({ supplierId, productType, priceGroup });
  };

  const handleMaterialLookup = () => {
    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;

    // Map subcategory to product type
    const subcategoryToProductType: Record<string, string> = {
      'roller_fabric': 'roller_blinds',
      'venetian_slats': 'venetian_blinds',
      'vertical_slats': 'vertical_blinds',
      'cellular': 'cellular_blinds',
      'panel_glide_fabric': 'panel_glide',
      'shutter_material': 'shutters'
    };

    const mappedProductType = subcategoryToProductType[material.subcategory || ''] || 'roller_blinds';
    const materialPriceGroup = material.price_group || '';
    const materialVendorId = material.vendor_id || '';

    runDiagnostic({
      supplierId: materialVendorId,
      productType: mappedProductType,
      priceGroup: materialPriceGroup
    });
  };

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Grid Resolution Diagnostic
        </CardTitle>
        <CardDescription>
          Test why a pricing grid might not be resolving for a product configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Search</TabsTrigger>
            <TabsTrigger value="material">Material Lookup</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 pt-4">
            {/* Manual Search Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Supplier (Optional)</Label>
                <Select value={supplierId || "_any"} onValueChange={(val) => setSupplierId(val === "_any" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Any supplier</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Type *</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREATMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Group *</Label>
                <Input
                  placeholder="e.g., A, B, Group 1"
                  value={priceGroup}
                  onChange={(e) => setPriceGroup(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleManualSearch} 
              disabled={!productType || !priceGroup || isSearching}
              className="w-full"
            >
              {isSearching ? 'Searching...' : 'Test Grid Resolution'}
            </Button>
          </TabsContent>

          <TabsContent value="material" className="space-y-4 pt-4">
            {/* Material Lookup Mode */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select a Material</Label>
                <Select value={selectedMaterialId || "_none"} onValueChange={(val) => setSelectedMaterialId(val === "_none" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose material to diagnose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Select a material...</SelectItem>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        <div className="flex items-center gap-2">
                          <span>{material.name}</span>
                          {material.price_group && (
                            <Badge variant="outline" className="text-xs">
                              Group {material.price_group}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMaterial && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Material Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{selectedMaterial.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="ml-2 font-medium">{selectedMaterial.supplier || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price Group:</span>
                      <span className={`ml-2 font-medium ${!selectedMaterial.price_group ? 'text-amber-600' : ''}`}>
                        {selectedMaterial.price_group || '⚠️ Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vendor ID:</span>
                      <span className={`ml-2 font-medium ${!selectedMaterial.vendor_id ? 'text-amber-600' : ''}`}>
                        {selectedMaterial.vendor_id ? '✓ Linked' : '⚠️ Not linked'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subcategory:</span>
                      <span className="ml-2 font-medium">{selectedMaterial.subcategory?.replace(/_/g, ' ') || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Linkage status warnings */}
                  {(!selectedMaterial.vendor_id || !selectedMaterial.price_group) && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Missing Linkage Data</AlertTitle>
                      <AlertDescription className="text-sm">
                        {!selectedMaterial.vendor_id && !selectedMaterial.price_group && (
                          <span>This material has no vendor_id or price_group set. Grids cannot match.</span>
                        )}
                        {!selectedMaterial.vendor_id && selectedMaterial.price_group && (
                          <span>This material has no vendor_id. Supplier-specific grids won't match.</span>
                        )}
                        {selectedMaterial.vendor_id && !selectedMaterial.price_group && (
                          <span>This material has no price_group. Grids require price_group to match.</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Button 
                onClick={handleMaterialLookup} 
                disabled={!selectedMaterialId || isSearching}
                className="w-full"
              >
                {isSearching ? 'Diagnosing...' : 'Diagnose Material Grid Resolution'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Result Status */}
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? 'Grid Found!' : 'No Grid Match'}
              </AlertTitle>
              <AlertDescription>
                {result.success ? (
                  <div className="mt-2">
                    <p><strong>Grid:</strong> {result.gridName} ({result.gridCode})</p>
                    <p className="text-xs text-muted-foreground">{result.matchDetails}</p>
                  </div>
                ) : (
                  <p>Could not find a pricing grid matching your search criteria.</p>
                )}
              </AlertDescription>
            </Alert>

            {/* Search Parameters Used */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Search Parameters:</h4>
              <div className="flex flex-wrap gap-2">
                {result.searchParams.supplierName && (
                  <Badge variant="outline">Supplier: {result.searchParams.supplierName}</Badge>
                )}
                <Badge variant="outline">Type: {result.searchParams.productType.replace(/_/g, ' ')}</Badge>
                <Badge variant="outline">Group: {result.searchParams.priceGroup || '(none)'}</Badge>
              </div>
            </div>

            {/* Issues Found */}
            {result.possibleIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Issues Found:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.possibleIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fix Steps */}
            {result.fixSteps.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  How to Fix:
                </h4>
                <ol className="list-decimal list-inside text-sm text-green-600 dark:text-green-400 space-y-1">
                  {result.fixSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Available Grids Reference */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Available Grids ({result.availableGrids.length}):
              </h4>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1 text-left">Supplier</th>
                      <th className="px-2 py-1 text-left">Product Type</th>
                      <th className="px-2 py-1 text-left">Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.availableGrids.map((grid) => (
                      <tr 
                        key={grid.id} 
                        className={`border-t hover:bg-muted/50 ${
                          grid.product_type === result.searchParams.productType &&
                          grid.price_group?.toLowerCase() === result.searchParams.priceGroup?.toLowerCase()
                            ? 'bg-green-50 dark:bg-green-950'
                            : ''
                        }`}
                      >
                        <td className="px-2 py-1">{grid.name}</td>
                        <td className="px-2 py-1">{grid.supplier_name}</td>
                        <td className="px-2 py-1">{grid.product_type?.replace(/_/g, ' ')}</td>
                        <td className="px-2 py-1">{grid.price_group}</td>
                      </tr>
                    ))}
                    {result.availableGrids.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-2 py-4 text-center text-muted-foreground">
                          No pricing grids configured yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};