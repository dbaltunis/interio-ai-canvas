import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShopifyEvent {
  date: string;
  event: string;
  details: string;
  billingOn: string;
  shopName: string;
  shopCountry: string;
  shopEmail: string;
  shopDomain: string;
}

interface ProcessedShop {
  email: string;
  company_name: string;
  country: string;
  shop_domain: string;
  first_install_date: string;
  last_activity_date: string;
  funnel_stage: string;
  last_event: string;
  events: ShopifyEvent[];
}

interface ImportResult {
  inserted: number;
  skipped: number;
  errors?: string[];
  total: number;
}

// Country code to full name mapping
const countryMap: Record<string, string> = {
  'AU': 'Australia',
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'NZ': 'New Zealand',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'IE': 'Ireland',
  'ZA': 'South Africa',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'JP': 'Japan',
  'KR': 'South Korea',
  'IN': 'India',
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'IL': 'Israel',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PH': 'Philippines',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'ID': 'Indonesia',
  'VN': 'Vietnam',
  'PL': 'Poland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'RO': 'Romania',
  'HU': 'Hungary',
  'TR': 'Turkey',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
};

// Test account patterns to filter out
const testPatterns = [
  '@shopify.com',
  '@curtainscalculator.com',
  'appstoretest',
  'testappreview',
  'review-test',
  'review test',
  'test-store',
];

function isTestAccount(email: string, shopName: string): boolean {
  const emailLower = email.toLowerCase();
  const nameLower = shopName.toLowerCase();
  
  return testPatterns.some(pattern => 
    emailLower.includes(pattern) || nameLower.includes(pattern)
  );
}

function determineFunnelStage(events: ShopifyEvent[]): string {
  if (events.length === 0) return 'lead';
  
  // Sort events by date descending
  const sorted = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const lastEvent = sorted[0].event.toLowerCase();
  
  if (lastEvent.includes('store closed')) {
    return 'closed';
  }
  
  if (lastEvent.includes('uninstalled') || lastEvent.includes('canceled') || lastEvent.includes('expired')) {
    return 'churned';
  }
  
  if (lastEvent.includes('activated') || lastEvent.includes('accepted')) {
    return 'customer';
  }
  
  if (lastEvent.includes('installed')) {
    // Check if they ever had an active subscription
    const hadSubscription = events.some(e => 
      e.event.toLowerCase().includes('activated') || 
      e.event.toLowerCase().includes('accepted')
    );
    return hadSubscription ? 'customer' : 'trial';
  }
  
  return 'lead';
}

export function useShopifyHistoryImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [processedShops, setProcessedShops] = useState<ProcessedShop[]>([]);
  const { toast } = useToast();

  const parseCSV = useCallback((csvContent: string): ShopifyEvent[] => {
    const lines = csvContent.split('\n');
    const events: ShopifyEvent[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handling quoted fields)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length >= 8) {
        events.push({
          date: values[0],
          event: values[1],
          details: values[2],
          billingOn: values[3],
          shopName: values[4],
          shopCountry: values[5],
          shopEmail: values[6],
          shopDomain: values[7],
        });
      }
    }
    
    return events;
  }, []);

  const processEvents = useCallback((events: ShopifyEvent[]): ProcessedShop[] => {
    // Group events by email
    const shopMap = new Map<string, ShopifyEvent[]>();
    
    for (const event of events) {
      if (!event.shopEmail) continue;
      
      const email = event.shopEmail.toLowerCase();
      
      // Skip test accounts
      if (isTestAccount(email, event.shopName)) {
        continue;
      }
      
      if (!shopMap.has(email)) {
        shopMap.set(email, []);
      }
      shopMap.get(email)!.push(event);
    }
    
    // Process each unique shop
    const shops: ProcessedShop[] = [];
    
    for (const [email, shopEvents] of shopMap) {
      // Sort by date
      const sorted = [...shopEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      
      shops.push({
        email: first.shopEmail,
        company_name: first.shopName,
        country: countryMap[first.shopCountry] || first.shopCountry,
        shop_domain: first.shopDomain,
        first_install_date: first.date,
        last_activity_date: last.date,
        funnel_stage: determineFunnelStage(sorted),
        last_event: last.event,
        events: sorted,
      });
    }
    
    return shops;
  }, []);

  const processFile = useCallback(async (file: File): Promise<ProcessedShop[]> => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      const content = await file.text();
      setProgress(30);
      
      const events = parseCSV(content);
      console.log(`Parsed ${events.length} events from CSV`);
      setProgress(50);
      
      const shops = processEvents(events);
      console.log(`Processed ${shops.length} unique shops`);
      setProgress(70);
      
      setProcessedShops(shops);
      setProgress(100);
      
      return shops;
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error processing file',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSV, processEvents, toast]);

  const importShops = useCallback(async (shops: ProcessedShop[]): Promise<ImportResult | null> => {
    if (shops.length === 0) {
      toast({
        title: 'No shops to import',
        description: 'No valid shops found after filtering test accounts',
        variant: 'destructive',
      });
      return null;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Prepare data for edge function
      const shopData = shops.map(s => ({
        email: s.email,
        company_name: s.company_name,
        country: s.country,
        shop_domain: s.shop_domain,
        first_install_date: s.first_install_date,
        last_activity_date: s.last_activity_date,
        funnel_stage: s.funnel_stage,
        last_event: s.last_event,
      }));

      setProgress(20);

      const { data, error } = await supabase.functions.invoke('import-shopify-history', {
        body: { shops: shopData },
      });

      setProgress(100);

      if (error) {
        console.error('Import error:', error);
        toast({
          title: 'Import failed',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      const importResult: ImportResult = {
        inserted: data.inserted || 0,
        skipped: data.skipped || 0,
        errors: data.errors,
        total: data.total || shops.length,
      };

      setResult(importResult);
      
      toast({
        title: 'Import complete',
        description: `${importResult.inserted} clients added, ${importResult.skipped} duplicates skipped`,
      });

      return importResult;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setProgress(0);
    setResult(null);
    setProcessedShops([]);
  }, []);

  return {
    isProcessing,
    progress,
    result,
    processedShops,
    processFile,
    importShops,
    reset,
  };
}
