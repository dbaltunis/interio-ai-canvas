import { useState, useEffect } from 'react';
import { settingsCacheService, CACHE_KEYS } from '@/services/settingsCacheService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Debug component to inspect cache status
 * Remove this in production or hide behind a flag
 */
export const CacheStatusDebugger = () => {
  const [cacheInfo, setCacheInfo] = useState<any>({});
  const queryClient = useQueryClient();
  
  const refreshCacheInfo = () => {
    const info = {
      business_settings: {
        data: settingsCacheService.getInstant(CACHE_KEYS.BUSINESS_SETTINGS),
        timestamp: settingsCacheService.getTimestamp(CACHE_KEYS.BUSINESS_SETTINGS),
        isStale: settingsCacheService.isStale(CACHE_KEYS.BUSINESS_SETTINGS),
      },
      measurement_units: {
        data: settingsCacheService.getInstant(CACHE_KEYS.MEASUREMENT_UNITS),
        timestamp: settingsCacheService.getTimestamp(CACHE_KEYS.MEASUREMENT_UNITS),
        isStale: settingsCacheService.isStale(CACHE_KEYS.MEASUREMENT_UNITS),
      },
    };
    setCacheInfo(info);
  };

  useEffect(() => {
    refreshCacheInfo();
    const interval = setInterval(refreshCacheInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    settingsCacheService.clearAll();
    queryClient.clear();
    refreshCacheInfo();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Cache Status (Debug)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(cacheInfo).map(([key, value]: [string, any]) => (
          <div key={key} className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">{key}</span>
              <Badge variant={value.isStale ? "destructive" : "default"}>
                {value.isStale ? 'Stale' : 'Fresh'}
              </Badge>
            </div>
            
            {value.timestamp && (
              <div className="text-xs text-muted-foreground">
                Cached {formatDistanceToNow(new Date(value.timestamp), { addSuffix: true })}
              </div>
            )}
            
            {value.data && (
              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(value.data, null, 2)}
              </pre>
            )}
            
            {!value.data && !value.timestamp && (
              <div className="text-xs text-muted-foreground italic">No cache data</div>
            )}
          </div>
        ))}
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={refreshCacheInfo}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" variant="destructive" onClick={clearCache}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
