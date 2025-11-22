import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createBatchProcessor } from '@/utils/batchProcessor';
import { generateSKU } from '@/utils/skuGenerator';

export interface ImportResultRow {
  row: number;
  status: 'success' | 'updated' | 'error';
  message?: string;
  sku?: string;
  name?: string;
}

interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
  successCount: number;
  updatedCount: number;
  errorCount: number;
}

interface ImportState {
  status: 'idle' | 'preparing' | 'processing' | 'paused' | 'completed' | 'error';
  progress: ImportProgress;
  results: ImportResultRow[];
  canPause: boolean;
  canResume: boolean;
  errorMessage?: string;
}

interface ParsedItem {
  data: Record<string, any>;
  rowNumber: number;
}

const BATCH_SIZE = 100;

export const useBatchInventoryImport = () => {
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    progress: {
      current: 0,
      total: 0,
      percentage: 0,
      successCount: 0,
      updatedCount: 0,
      errorCount: 0,
    },
    results: [],
    canPause: false,
    canResume: false,
  });

  const pauseSignal = useRef({ paused: false });

  const updateProgress = useCallback((current: number, total: number, results: ImportResultRow[]) => {
    const successCount = results.filter(r => r.status === 'success').length;
    const updatedCount = results.filter(r => r.status === 'updated').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    setState(prev => ({
      ...prev,
      progress: {
        current,
        total,
        percentage: total > 0 ? Math.round((current / total) * 100) : 0,
        successCount,
        updatedCount,
        errorCount,
      },
      results,
    }));
  }, []);

  const processItemsBatch = useCallback(async (batch: ParsedItem[]): Promise<ImportResultRow[]> => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Prepare batch for upsert
    const itemsToUpsert: any[] = [];
    const batchResults: ImportResultRow[] = [];

    for (const { data: item, rowNumber } of batch) {
      try {
        // Derive unit_price if missing
        if (item.unit_price == null) {
          if (typeof item.selling_price === 'number') item.unit_price = item.selling_price;
          else if (typeof item.price_per_unit === 'number') item.unit_price = item.price_per_unit;
          else if (typeof item.cost_price === 'number') item.unit_price = item.cost_price;
          else item.unit_price = 0;
        }

        const insertPayload = {
          ...item,
          user_id: userId,
          active: item.active ?? true,
        };

        itemsToUpsert.push({ payload: insertPayload, rowNumber, sku: item.sku, name: item.name });
      } catch (e: any) {
        batchResults.push({
          row: rowNumber,
          status: 'error',
          message: e?.message || 'Failed to prepare item',
          sku: item.sku,
          name: item.name,
        });
      }
    }

    // Perform batch upsert using onConflict
    if (itemsToUpsert.length > 0) {
      const payloads = itemsToUpsert.map(i => i.payload);
      
      // Use upsert with onConflict on SKU
      const { data: upserted, error } = await supabase
        .from('enhanced_inventory_items')
        .upsert(payloads, { 
          onConflict: 'sku',
          ignoreDuplicates: false 
        })
        .select('sku');

      if (error) {
        // If batch upsert fails, mark all items as errors
        for (const item of itemsToUpsert) {
          batchResults.push({
            row: item.rowNumber,
            status: 'error',
            message: error.message,
            sku: item.sku,
            name: item.name,
          });
        }
      } else {
        // Determine which items were inserted vs updated
        // For simplicity, we'll check if SKU existed before
        for (const item of itemsToUpsert) {
          if (item.sku) {
            // If item had SKU, it was likely an update
            const { data: existing } = await supabase
              .from('enhanced_inventory_items')
              .select('id')
              .eq('sku', item.sku)
              .eq('user_id', userId)
              .single();
            
            batchResults.push({
              row: item.rowNumber,
              status: existing ? 'updated' : 'success',
              sku: item.sku,
              name: item.name,
            });
          } else {
            batchResults.push({
              row: item.rowNumber,
              status: 'success',
              sku: item.sku,
              name: item.name,
            });
          }
        }
      }
    }

    return batchResults;
  }, []);

  const startImport = useCallback(async (parsedItems: ParsedItem[]) => {
    try {
      setState(prev => ({
        ...prev,
        status: 'preparing',
        progress: { current: 0, total: parsedItems.length, percentage: 0, successCount: 0, updatedCount: 0, errorCount: 0 },
        results: [],
        canPause: false,
        canResume: false,
      }));

      // Get userId for SKU generation
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // Pre-generate SKUs for items without SKU in parallel
      const skuPromises = parsedItems.map(async ({ data: item }) => {
        if (!item.sku && item.category) {
          item.sku = await generateSKU(item.category, userId);
        }
      });

      await Promise.all(skuPromises);

      setState(prev => ({
        ...prev,
        status: 'processing',
        canPause: true,
      }));

      pauseSignal.current.paused = false;

      const processor = createBatchProcessor({
        items: parsedItems,
        batchSize: BATCH_SIZE,
        processor: processItemsBatch,
        onProgress: updateProgress,
        pauseSignal: pauseSignal.current,
      });

      const result = await processor.process();

      setState(prev => ({
        ...prev,
        status: 'completed',
        canPause: false,
        canResume: false,
        results: result.results,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
        canPause: false,
        canResume: false,
      }));
      throw error;
    }
  }, [processItemsBatch, updateProgress]);

  const pause = useCallback(() => {
    pauseSignal.current.paused = true;
    setState(prev => ({
      ...prev,
      status: 'paused',
      canPause: false,
      canResume: true,
    }));
  }, []);

  const resume = useCallback(() => {
    pauseSignal.current.paused = false;
    setState(prev => ({
      ...prev,
      status: 'processing',
      canPause: true,
      canResume: false,
    }));
  }, []);

  const reset = useCallback(() => {
    pauseSignal.current.paused = false;
    setState({
      status: 'idle',
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        successCount: 0,
        updatedCount: 0,
        errorCount: 0,
      },
      results: [],
      canPause: false,
      canResume: false,
    });
  }, []);

  return {
    state,
    startImport,
    pause,
    resume,
    reset,
  };
};
