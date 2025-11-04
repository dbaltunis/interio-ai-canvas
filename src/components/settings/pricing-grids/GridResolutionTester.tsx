import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { resolveGridForProduct } from '@/utils/pricing/gridResolver';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';
import { supabase } from '@/integrations/supabase/client';

export const GridResolutionTester = () => {
  const [productType, setProductType] = useState('roller_blinds');
  const [systemType, setSystemType] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [width, setWidth] = useState('120');
  const [height, setHeight] = useState('180');
  const [result, setResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!systemType || !priceGroup) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsTesting(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Resolve grid
      const gridResult = await resolveGridForProduct({
        productType,
        systemType,
        fabricPriceGroup: priceGroup,
        userId: user.id
      });

      if (!gridResult) {
        setResult({ error: 'No matching pricing grid found for these parameters' });
        toast.error('No matching pricing grid found');
        return;
      }

      // Calculate price
      const widthCm = parseFloat(width);
      const heightCm = parseFloat(height);
      const price = getPriceFromGrid(gridResult.gridData, widthCm, heightCm);

      setResult({
        success: true,
        gridName: gridResult.gridName,
        gridCode: gridResult.gridCode,
        matchedRule: gridResult.matchedRule,
        dimensions: `${widthCm}cm × ${heightCm}cm`,
        price: price,
        gridData: gridResult.gridData
      });

      toast.success(`Grid resolved: ${gridResult.gridName}`);
    } catch (error: any) {
      console.error('Test failed:', error);
      setResult({ error: error.message });
      toast.error('Test failed: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Test Grid Resolution
        </CardTitle>
        <CardDescription>
          Test which pricing grid would be used for specific parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roller_blinds">Roller Blinds</SelectItem>
                <SelectItem value="roman_blinds">Roman Blinds</SelectItem>
                <SelectItem value="venetian_blinds">Venetian Blinds</SelectItem>
                <SelectItem value="vertical_blinds">Vertical Blinds</SelectItem>
                <SelectItem value="shutters">Shutters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>System Type</Label>
            <Input
              placeholder="e.g., Cassette, Open Roll"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price Group</Label>
            <Input
              placeholder="e.g., Standard, Premium"
              value={priceGroup}
              onChange={(e) => setPriceGroup(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Dimensions (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <span className="flex items-center">×</span>
              <Input
                type="number"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleTest} disabled={isTesting} className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          {isTesting ? 'Testing...' : 'Test Resolution'}
        </Button>

        {result && (
          <div className="mt-4 p-4 border border-border rounded-lg bg-card">
            {result.error ? (
              <div className="text-destructive">
                <p className="font-medium">❌ No Grid Found</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Grid</p>
                  <p className="text-lg font-semibold text-card-foreground">{result.gridName}</p>
                  <p className="text-sm text-muted-foreground">Code: {result.gridCode}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matched Rule</p>
                  <p className="text-sm text-card-foreground">
                    {result.matchedRule?.product_type}
                    {result.matchedRule?.system_type && ` • ${result.matchedRule.system_type}`}
                    {result.matchedRule?.price_group && ` • ${result.matchedRule.price_group}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Priority: {result.matchedRule?.priority}</p>
                </div>

                {result.price > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Test Calculation</p>
                    <p className="text-sm text-card-foreground">
                      {result.dimensions} = <span className="font-semibold text-primary">£{result.price.toFixed(2)}</span>
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grid Coverage</p>
                  <p className="text-xs text-muted-foreground">
                    Widths: {result.gridData?.widthColumns?.join(', ') || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drops: {result.gridData?.dropRows?.map((r: any) => r.drop).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
