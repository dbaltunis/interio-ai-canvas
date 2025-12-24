import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, Check, X, AlertCircle, Users } from 'lucide-react';
import { useShopifyHistoryImport } from '@/hooks/useShopifyHistoryImport';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQueryClient } from '@tanstack/react-query';

interface ShopifyHistoryImportProps {
  onComplete?: () => void;
}

export function ShopifyHistoryImport({ onComplete }: ShopifyHistoryImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  
  const {
    isProcessing,
    progress,
    result,
    processedShops,
    processFile,
    importShops,
    reset,
  } = useShopifyHistoryImport();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await processFile(file);
    }
  };

  const handleImport = async () => {
    const importResult = await importShops(processedShops);
    if (importResult && importResult.inserted > 0) {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onComplete?.();
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Group shops by funnel stage for preview
  const stageGroups = processedShops.reduce((acc, shop) => {
    const stage = shop.funnel_stage;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(shop);
    return acc;
  }, {} as Record<string, typeof processedShops>);

  const stageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'customer': return 'default';
      case 'trial': return 'secondary';
      case 'churned': return 'outline';
      case 'closed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Shopify App History
        </CardTitle>
        <CardDescription>
          Import your Shopify app install history to CRM. Test accounts will be automatically filtered out.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <>
            {/* File Upload */}
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select CSV File
              </Button>
              {selectedFile && (
                <span className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </span>
              )}
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Preview */}
            {processedShops.length > 0 && !isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{processedShops.length} unique shops found</span>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(stageGroups).map(([stage, shops]) => (
                      <Badge key={stage} variant={stageBadgeVariant(stage)}>
                        {stage}: {shops.length}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Shop List Preview */}
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-3 space-y-2">
                    {processedShops.slice(0, 20).map((shop, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <div className="flex flex-col">
                          <span className="font-medium">{shop.company_name}</span>
                          <span className="text-muted-foreground text-xs">{shop.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{shop.country}</span>
                          <Badge variant={stageBadgeVariant(shop.funnel_stage)} className="text-xs">
                            {shop.funnel_stage}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {processedShops.length > 20 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        ... and {processedShops.length - 20} more
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Import Button */}
                <div className="flex gap-2">
                  <Button onClick={handleImport} disabled={isProcessing}>
                    <Check className="h-4 w-4 mr-2" />
                    Import {processedShops.length} Clients
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" />
              <span className="font-medium">Import Complete</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-success/10 rounded-md text-center">
                <div className="text-2xl font-bold text-success">{result.inserted}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="p-3 bg-muted rounded-md text-center">
                <div className="text-2xl font-bold">{result.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped (duplicates)</div>
              </div>
              <div className="p-3 bg-muted rounded-md text-center">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-md">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{result.errors.length} Errors</span>
                </div>
                <ScrollArea className="h-24">
                  <ul className="text-sm space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-muted-foreground">{err}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            <Button variant="outline" onClick={handleReset}>
              Import Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
