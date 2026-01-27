import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, FileX } from 'lucide-react';
import type { OrphanedData } from '@/hooks/useSaaSAudit';

interface OrphanedDataCardProps {
  orphanedData: OrphanedData | null;
  onCleanup: () => void;
  isCleaning: boolean;
}

export function OrphanedDataCard({ orphanedData, onCleanup, isCleaning }: OrphanedDataCardProps) {
  if (!orphanedData) return null;

  const totalOrphans = 
    orphanedData.projects.length +
    orphanedData.quotes.length +
    orphanedData.clients.length +
    orphanedData.inventory_items.length +
    orphanedData.treatment_options.length;

  if (totalOrphans === 0) return null;

  const dataTypes = [
    { label: 'Projects', count: orphanedData.projects.length },
    { label: 'Quotes', count: orphanedData.quotes.length },
    { label: 'Clients', count: orphanedData.clients.length },
    { label: 'Inventory', count: orphanedData.inventory_items.length },
    { label: 'Options', count: orphanedData.treatment_options.length },
  ].filter(d => d.count > 0);

  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          Orphaned Data Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {dataTypes.map((type) => (
              <Badge key={type.label} variant="outline" className="text-red-600 border-red-500/20">
                <FileX className="w-3 h-3 mr-1" />
                {type.count} {type.label}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={onCleanup}
            disabled={isCleaning}
          >
            <Trash2 className={`w-4 h-4 mr-1 ${isCleaning ? 'animate-spin' : ''}`} />
            {isCleaning ? 'Cleaning...' : 'Cleanup All'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          These records belong to deleted user accounts and can be safely removed.
        </p>
      </CardContent>
    </Card>
  );
}
