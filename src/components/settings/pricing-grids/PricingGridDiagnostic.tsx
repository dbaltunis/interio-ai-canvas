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
import { Search, CheckCircle2, XCircle, AlertTriangle, Grid3x3 } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { getTreatmentOptions } from '@/types/treatmentCategories';
import { resolveGridForProduct } from '@/utils/pricing/gridResolver';

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
}

export const PricingGridDiagnostic = () => {
  const [supplierId, setSupplierId] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [priceGroup, setPriceGroup] = useState<string>('');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: vendors = [] } = useVendors();

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

  const runDiagnostic = async () => {
    if (!productType || !priceGroup) {
      return;
    }

    setIsSearching(true);
    const possibleIssues: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get supplier name for display
      const supplierName = vendors.find(v => v.id === supplierId)?.name;

      // Try to resolve grid
      const resolution = await resolveGridForProduct({
        productType,
        fabricPriceGroup: priceGroup,
        fabricSupplierId: supplierId || undefined,
        userId: user.id
      });

      // Analyze why it might not match
      if (!resolution.gridId) {
        // Check for partial matches
        const matchingProductType = allGrids.filter(g => g.product_type === productType);
        const matchingPriceGroup = allGrids.filter(g => 
          g.price_group?.toLowerCase() === priceGroup.toLowerCase()
        );
        const matchingSupplier = supplierId 
          ? allGrids.filter(g => g.supplier_id === supplierId)
          : allGrids;

        if (matchingProductType.length === 0) {
          possibleIssues.push(`No grids exist for product type "${productType}"`);
        } else if (matchingPriceGroup.length === 0) {
          possibleIssues.push(`No grids exist with price group "${priceGroup}"`);
        } else if (supplierId && matchingSupplier.length === 0) {
          possibleIssues.push(`No grids exist for supplier "${supplierName}"`);
        } else {
          // Check if the combination doesn't exist
          const exactMatch = allGrids.find(g => 
            g.product_type === productType &&
            g.price_group?.toLowerCase() === priceGroup.toLowerCase() &&
            (!supplierId || g.supplier_id === supplierId)
          );
          if (!exactMatch) {
            possibleIssues.push('No grid matches the exact combination of supplier + product type + price group');
            
            // Show what's close
            const closeMatches = allGrids.filter(g => 
              (g.product_type === productType || g.price_group?.toLowerCase() === priceGroup.toLowerCase())
            );
            if (closeMatches.length > 0) {
              possibleIssues.push(`Found ${closeMatches.length} grids with partial matches`);
            }
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
          supplierId: supplierId || undefined,
          supplierName: supplierName,
          productType,
          priceGroup
        },
        availableGrids: allGrids,
        possibleIssues
      });

    } catch (error) {
      console.error('Diagnostic error:', error);
      possibleIssues.push(`Error: ${(error as Error).message}`);
      setResult({
        success: false,
        gridId: null,
        searchParams: {
          supplierId: supplierId || undefined,
          supplierName: vendors.find(v => v.id === supplierId)?.name,
          productType,
          priceGroup
        },
        availableGrids: allGrids,
        possibleIssues
      });
    } finally {
      setIsSearching(false);
    }
  };

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
        {/* Search Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Supplier (Optional)</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Any supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any supplier</SelectItem>
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
          onClick={runDiagnostic} 
          disabled={!productType || !priceGroup || isSearching}
          className="w-full"
        >
          {isSearching ? 'Searching...' : 'Test Grid Resolution'}
        </Button>

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
                <Badge variant="outline">Group: {result.searchParams.priceGroup}</Badge>
              </div>
            </div>

            {/* Issues Found */}
            {result.possibleIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Possible Issues:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.possibleIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
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
                          grid.price_group?.toLowerCase() === result.searchParams.priceGroup.toLowerCase()
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
