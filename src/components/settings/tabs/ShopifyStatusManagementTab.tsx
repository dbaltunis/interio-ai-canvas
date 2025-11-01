import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobStatuses, useUpdateJobStatus } from "@/hooks/useJobStatuses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, ShoppingBag, Edit2, Check, X, Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const ShopifyStatusManagementTab = () => {
  const { data: statuses = [] } = useJobStatuses();
  const updateStatus = useUpdateJobStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const shopifyStatuses = statuses.filter(
    (s) => s.name === 'Online Store Lead' || s.name === 'Online Store Sale'
  );

  const handleEdit = (status: any) => {
    setEditingId(status.id);
    setEditForm({
      name: status.name,
      color: status.color,
      description: status.description || '',
    });
  };

  const handleSave = (id: string) => {
    updateStatus.mutate({ id, ...editForm }, {
      onSuccess: () => setEditingId(null),
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', color: '', description: '' });
  };

  const handleCreateStatuses = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('ensure_shopify_statuses', {
        p_user_id: user.id
      });

      if (error) throw error;

      // Immediately refetch to show the new statuses
      await queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      await queryClient.refetchQueries({ queryKey: ["job_statuses"] });
      
      toast({
        title: "✅ Statuses Created Successfully!",
        description: "You can now customize 'Online Store Lead' and 'Online Store Sale' below.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <ShoppingCart className="h-5 w-5" />
            What are Shopify Statuses?
          </CardTitle>
          <CardDescription className="text-blue-800">
            These are special job statuses that InterioApp automatically applies to orders coming from your Shopify store.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-blue-900">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-3 bg-white rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">🛒 Online Store Lead</p>
                <p className="text-xs text-blue-700 mt-1">
                  Applied when a customer places an unpaid order (like abandoned carts or payment pending)
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-white rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">💰 Online Store Sale</p>
                <p className="text-xs text-blue-700 mt-1">
                  Applied when an order is paid or fulfilled - ready to process!
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="font-semibold mb-2">🔄 How it works:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Customer places order on your Shopify store</li>
              <li>InterioApp automatically creates a job/project with the appropriate status</li>
              <li>Customer details are added to your CRM</li>
              <li>You can track and manage the order in InterioApp</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Shopify Statuses</CardTitle>
          <CardDescription>
            Customize the names, colors, and descriptions of your Shopify order statuses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-semibold">Creating your Shopify statuses...</span>
              </div>
            </div>
          )}
          
          {!isCreating && shopifyStatuses.map((status) => {
            const isEditing = editingId === status.id;
            const Icon = status.name === 'Online Store Lead' ? ShoppingCart : ShoppingBag;

            return (
              <Card key={status.id} className="border-2">
                <CardContent className="pt-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Status Name</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Status name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color (Hex)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editForm.color}
                            onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                            placeholder="#10b981"
                          />
                          <div
                            className="w-12 h-10 rounded border"
                            style={{ backgroundColor: editForm.color }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Status description"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(status.id)}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: status.color + '20' }}
                        >
                          <Icon className="h-6 w-6" style={{ color: status.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{status.name}</p>
                            <Badge variant={status.is_active ? "default" : "secondary"}>
                              {status.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {status.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(status)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {shopifyStatuses.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="max-w-md mx-auto">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="font-semibold text-lg text-foreground mb-2">Set Up Your Shopify Statuses</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Click below to create two special job statuses that InterioApp will use to categorize orders from your Shopify store:
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                      <p className="font-semibold text-sm">Online Store Lead</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Unpaid orders</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                      <p className="font-semibold text-sm">Online Store Sale</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Paid orders</p>
                  </div>
                </div>
                <Button onClick={handleCreateStatuses} disabled={isCreating} size="lg">
                  {isCreating ? (
                    <>Creating Statuses...</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Shopify Statuses Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
