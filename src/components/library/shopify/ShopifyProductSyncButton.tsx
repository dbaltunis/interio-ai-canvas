import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ShopifyProductSyncButton = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const pushToShopify = useMutation({
    mutationFn: async () => {
      // Get all inventory items
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: inventory, error } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .neq('category', 'treatment_option');

      if (error) throw error;

      // Call edge function to push products to Shopify
      const { data, error: functionError } = await supabase.functions.invoke(
        'shopify-push-products',
        {
          method: 'POST',
          body: { products: inventory },
        }
      );

      if (functionError) throw functionError;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      toast({
        title: 'Products pushed to Shopify',
        description: `Successfully synced ${data.synced || 0} products to your Shopify store`,
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Sync failed',
        description: error.message || 'Failed to push products to Shopify',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Push to Shopify
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Push Products to Shopify</DialogTitle>
          <DialogDescription>
            This will sync all your InterioApp inventory products to your connected Shopify store.
            Products will be created or updated based on SKU matching.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">What will be synced:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Product names and descriptions</li>
              <li>Pricing and cost information</li>
              <li>Inventory quantities</li>
              <li>Categories as product types</li>
              <li>Images (if available)</li>
              <li>Variants (sizes, colors)</li>
            </ul>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => pushToShopify.mutate()}
              disabled={pushToShopify.isPending}
            >
              {pushToShopify.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Push Products
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
