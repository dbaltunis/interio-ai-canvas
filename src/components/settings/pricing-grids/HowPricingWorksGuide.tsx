import { Info, ArrowRight, Package, Grid3x3, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const HowPricingWorksGuide = () => {
  return (
    <Alert className="bg-blue-500/5 border-blue-500/30">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium text-blue-700 dark:text-blue-300">
            How Grids Connect to Materials
          </p>
          
          {/* Visual Flow */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border">
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
              <span>Upload Grid</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border">
              <Badge variant="secondary" className="text-xs font-mono">Price Group</Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border">
              <Package className="h-3.5 w-3.5 text-emerald-500" />
              <span>Materials Match</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border">
              <Grid3x3 className="h-3.5 w-3.5 text-purple-500" />
              <span>Auto-Price</span>
            </div>
          </div>
          
          {/* Key Point */}
          <p className="text-xs text-muted-foreground">
            <strong>Key:</strong> The <code className="bg-muted px-1 rounded">Price Group</code> field 
            links this grid to inventory materials. Materials with matching price_group will automatically 
            use this grid for pricing calculations.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
