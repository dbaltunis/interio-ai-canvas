import { useQuery } from '@tanstack/react-query';
import { settingsCacheService, CACHE_KEYS } from '@/services/settingsCacheService';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';

export const SettingsFooter = () => {
  const { isOnline } = useOfflineSupport();
  
  // Get cache timestamp for business settings
  const timestamp = settingsCacheService.getTimestamp(CACHE_KEYS.BUSINESS_SETTINGS);
  
  const lastSyncedText = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : 'Never synced';

  return (
    <div className="mt-8 pt-4 border-t border-border">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Last synced: {lastSyncedText}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-500">Offline</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
