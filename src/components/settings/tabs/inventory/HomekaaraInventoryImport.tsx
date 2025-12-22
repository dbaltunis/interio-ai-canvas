import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Package, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BLIND_MATERIALS, 
  TRACK_ITEMS, 
  ROD_ITEMS,
  generateBlindInventoryItems,
  generateTrackInventoryItems,
  generateRodInventoryItems 
} from '@/utils/inventory/homekaaraInventoryImport';

interface ImportStats {
  blinds: { total: number; imported: number };
  tracks: { total: number; imported: number };
  rods: { total: number; imported: number };
}

export const HomekaaraInventoryImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [selectedTypes, setSelectedTypes] = useState({
    blinds: true,
    tracks: true,
    rods: true,
  });

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setStats(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to import inventory');
        return;
      }

      const importStats: ImportStats = {
        blinds: { total: 0, imported: 0 },
        tracks: { total: 0, imported: 0 },
        rods: { total: 0, imported: 0 },
      };

      // Import blinds
      if (selectedTypes.blinds) {
        const blindItems = generateBlindInventoryItems(user.id);
        importStats.blinds.total = blindItems.length;
        setProgress(10);

        for (let i = 0; i < blindItems.length; i += 10) {
          const batch = blindItems.slice(i, i + 10);
          const { error } = await supabase
            .from('enhanced_inventory_items')
            .upsert(batch, { 
              onConflict: 'user_id,sku',
              ignoreDuplicates: true 
            });
          
          if (!error) {
            importStats.blinds.imported += batch.length;
          }
          setProgress(10 + (i / blindItems.length) * 30);
        }
      }

      // Import tracks
      if (selectedTypes.tracks) {
        const trackItems = generateTrackInventoryItems(user.id);
        importStats.tracks.total = trackItems.length;
        setProgress(45);

        const { error } = await supabase
          .from('enhanced_inventory_items')
          .upsert(trackItems, { 
            onConflict: 'user_id,name',
            ignoreDuplicates: true 
          });
        
        if (!error) {
          importStats.tracks.imported = trackItems.length;
        }
        setProgress(70);
      }

      // Import rods
      if (selectedTypes.rods) {
        const rodItems = generateRodInventoryItems(user.id);
        importStats.rods.total = rodItems.length;

        const { error } = await supabase
          .from('enhanced_inventory_items')
          .upsert(rodItems, { 
            onConflict: 'user_id,name',
            ignoreDuplicates: true 
          });
        
        if (!error) {
          importStats.rods.imported = rodItems.length;
        }
        setProgress(100);
      }

      setStats(importStats);
      const totalImported = importStats.blinds.imported + importStats.tracks.imported + importStats.rods.imported;
      toast.success(`Successfully imported ${totalImported} inventory items`);

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const totalSelected = 
    (selectedTypes.blinds ? BLIND_MATERIALS.reduce((acc, b) => acc + b.colors.length, 0) : 0) +
    (selectedTypes.tracks ? TRACK_ITEMS.length : 0) +
    (selectedTypes.rods ? ROD_ITEMS.length : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Homekaara Inventory Import
        </CardTitle>
        <CardDescription>
          Import blind materials, tracks, and rods from Homekaara's product catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection */}
        <div className="space-y-4">
          <h4 className="font-medium">Select items to import:</h4>
          
          <div className="grid gap-4">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <Checkbox 
                checked={selectedTypes.blinds}
                onCheckedChange={(checked) => setSelectedTypes(prev => ({ ...prev, blinds: !!checked }))}
              />
              <div className="flex-1">
                <div className="font-medium">Blind Materials</div>
                <div className="text-sm text-muted-foreground">
                  {BLIND_MATERIALS.length} products with {BLIND_MATERIALS.reduce((acc, b) => acc + b.colors.length, 0)} color variants
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">Roller Blinds</Badge>
                  <Badge variant="outline">Zebra Blinds</Badge>
                  <Badge variant="outline">Blackout</Badge>
                  <Badge variant="outline">Sunscreen</Badge>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <Checkbox 
                checked={selectedTypes.tracks}
                onCheckedChange={(checked) => setSelectedTypes(prev => ({ ...prev, tracks: !!checked }))}
              />
              <div className="flex-1">
                <div className="font-medium">Curtain Tracks</div>
                <div className="text-sm text-muted-foreground">
                  {TRACK_ITEMS.length} track products with accessory pricing
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">Kings Choice</Badge>
                  <Badge variant="outline">Modique</Badge>
                  <Badge variant="outline">Glide</Badge>
                  <Badge variant="outline">Motorised</Badge>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <Checkbox 
                checked={selectedTypes.rods}
                onCheckedChange={(checked) => setSelectedTypes(prev => ({ ...prev, rods: !!checked }))}
              />
              <div className="flex-1">
                <div className="font-medium">Curtain Rods</div>
                <div className="text-sm text-muted-foreground">
                  {ROD_ITEMS.length} rod finishes with accessory pricing
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">SS</Badge>
                  <Badge variant="outline">Black</Badge>
                  <Badge variant="outline">Antique</Badge>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Importing inventory...</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Results */}
        {stats && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>✓ Blinds: {stats.blinds.imported}/{stats.blinds.total} items</div>
                <div>✓ Tracks: {stats.tracks.imported}/{stats.tracks.total} items</div>
                <div>✓ Rods: {stats.rods.imported}/{stats.rods.total} items</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        <ScrollArea className="h-48 border rounded-lg p-4">
          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Preview of items to import:</h5>
            {selectedTypes.blinds && BLIND_MATERIALS.slice(0, 3).map((b, i) => (
              <div key={i} className="text-muted-foreground">
                • {b.name} ({b.categoryType}) - ₹{b.itemMrp}/sqft - {b.colors.length} colors
              </div>
            ))}
            {selectedTypes.tracks && TRACK_ITEMS.slice(0, 3).map((t, i) => (
              <div key={i} className="text-muted-foreground">
                • {t.name} {t.color} - ₹{t.trackMrp}/ft
              </div>
            ))}
            {selectedTypes.rods && ROD_ITEMS.map((r, i) => (
              <div key={i} className="text-muted-foreground">
                • {r.name} - ₹{r.rodPerFeet}/ft
              </div>
            ))}
            <div className="text-muted-foreground mt-2">
              ... and {totalSelected - 9} more items
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleImport}
            disabled={importing || totalSelected === 0}
            className="flex-1"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {totalSelected} Items
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
