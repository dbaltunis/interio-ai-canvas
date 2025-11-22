interface BatchProcessorConfig<T, R> {
  items: T[];
  batchSize: number;
  processor: (batch: T[]) => Promise<R[]>;
  onProgress?: (current: number, total: number, results: R[]) => void;
  onBatchComplete?: (batchResults: R[], batchIndex: number) => void;
  onError?: (error: Error, batch: T[], batchIndex: number) => void;
  pauseSignal?: { paused: boolean };
}

interface BatchProcessorResult<R> {
  results: R[];
  totalProcessed: number;
  errors: Array<{ batchIndex: number; error: Error; batch: any[] }>;
}

export class BatchProcessor<T, R> {
  private config: BatchProcessorConfig<T, R>;
  private allResults: R[] = [];
  private errors: Array<{ batchIndex: number; error: Error; batch: T[] }> = [];

  constructor(config: BatchProcessorConfig<T, R>) {
    this.config = config;
  }

  async process(): Promise<BatchProcessorResult<R>> {
    const { items, batchSize, processor, onProgress, onBatchComplete, onError, pauseSignal } = this.config;
    
    const batches = this.createBatches(items, batchSize);
    let processedCount = 0;

    for (let i = 0; i < batches.length; i++) {
      // Check pause signal
      if (pauseSignal?.paused) {
        await this.waitForResume(pauseSignal);
      }

      const batch = batches[i];
      
      try {
        const batchResults = await processor(batch);
        this.allResults.push(...batchResults);
        processedCount += batch.length;

        if (onBatchComplete) {
          onBatchComplete(batchResults, i);
        }

        if (onProgress) {
          onProgress(processedCount, items.length, this.allResults);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.errors.push({ batchIndex: i, error: err, batch });
        
        if (onError) {
          onError(err, batch, i);
        }

        // Continue processing remaining batches despite error
        processedCount += batch.length;
        if (onProgress) {
          onProgress(processedCount, items.length, this.allResults);
        }
      }
    }

    return {
      results: this.allResults,
      totalProcessed: processedCount,
      errors: this.errors,
    };
  }

  private createBatches(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async waitForResume(pauseSignal: { paused: boolean }): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!pauseSignal.paused) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
}

export const createBatchProcessor = <T, R>(config: BatchProcessorConfig<T, R>) => {
  return new BatchProcessor<T, R>(config);
};
