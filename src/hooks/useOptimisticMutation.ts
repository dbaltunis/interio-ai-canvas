import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useOfflineSupport } from './useOfflineSupport';
import { toast } from 'sonner';

interface OptimisticMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  table?: string;
  operationType?: 'create' | 'update' | 'delete';
  optimisticUpdate?: (oldData: any, variables: TVariables) => any;
}

/**
 * Hook for mutations with optimistic updates and offline support
 * Automatically queues operations when offline
 */
export const useOptimisticMutation = <TData = unknown, TVariables = unknown>({
  mutationFn,
  queryKey,
  table,
  operationType = 'update',
  optimisticUpdate,
  onSuccess,
  onError,
  ...options
}: OptimisticMutationOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();
  const { isOnline, queueOfflineOperation } = useOfflineSupport();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      // If offline and table is provided, queue the operation
      if (!isOnline && table) {
        queueOfflineOperation(operationType, table, variables);
        toast.info('Changes saved locally and will sync when online');
        // Return a placeholder response
        return variables as unknown as TData;
      }

      // If online, perform the mutation normally
      return mutationFn(variables);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      if (optimisticUpdate) {
        queryClient.setQueryData(queryKey, (old: any) => 
          optimisticUpdate(old, variables)
        );
      }

      // Return context with the snapshot
      return { previousData };
    },
    onError: (error, variables, context: any) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      console.error('Mutation error:', error);
      toast.error('Failed to save changes');

      if (onError) {
        // @ts-ignore - context type mismatch
        onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey });

      if (isOnline) {
        toast.success('Changes saved successfully');
      }

      if (onSuccess) {
        // @ts-ignore - context type mismatch
        onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
