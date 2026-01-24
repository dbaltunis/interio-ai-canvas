import { Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterialMatchCount } from '@/hooks/useInventoryPriceGroups';
import { cn } from '@/lib/utils';

interface MaterialMatchPreviewProps {
  supplierId: string | null;
  productType: string | null;
  priceGroup: string | null;
  className?: string;
}

export const MaterialMatchPreview = ({
  supplierId,
  productType,
  priceGroup,
  className
}: MaterialMatchPreviewProps) => {
  const { data, isLoading, isFetching } = useMaterialMatchCount(
    supplierId,
    productType,
    priceGroup
  );

  // Don't show anything if no price group entered
  if (!priceGroup || priceGroup.trim().length === 0) {
    return null;
  }

  const matchCount = data?.count || 0;
  const materials = data?.materials || [];
  const hasMatches = matchCount > 0;

  return (
    <Alert 
      className={cn(
        "transition-all duration-200",
        hasMatches ? "border-emerald-500/50 bg-emerald-500/5" : "border-amber-500/50 bg-amber-500/5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {isLoading || isFetching ? (
          <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
        ) : hasMatches ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
        )}
        
        <AlertDescription className="flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : hasMatches ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-emerald-600">
                  {matchCount} material{matchCount !== 1 ? 's' : ''} will use this grid
                </span>
                <Badge variant="outline" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  Price Group: {priceGroup}
                </Badge>
              </div>
              
              {materials.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Preview: </span>
                  {materials.slice(0, 5).map((m: any) => m.name).join(', ')}
                  {matchCount > 5 && ` and ${matchCount - 5} more...`}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-medium text-amber-600">
                No materials found with price group "{priceGroup}"
              </span>
              <p className="text-xs text-muted-foreground">
                Materials need a matching <code className="bg-muted px-1 rounded">price_group</code> value 
                to use this grid. You can:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside ml-2">
                <li>Add materials with this price group first</li>
                <li>Use an existing price group from the dropdown</li>
                <li>Update materials later to match this group</li>
              </ul>
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};
