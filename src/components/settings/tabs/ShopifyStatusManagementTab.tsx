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

      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      toast({
        title: "Success",
        description: "Shopify statuses created successfully",
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
      <Card>
        <CardHeader>
          <CardTitle>Shopify Integration Statuses</CardTitle>
          <CardDescription>
            Customize the statuses used for leads and sales from your Shopify store. 
            These statuses appear in Jobs and CRM when orders come through Shopify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {shopifyStatuses.map((status) => {
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
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-foreground mb-2">No Shopify statuses found</p>
              <p className="text-sm mb-4">Create the default Shopify integration statuses to start tracking online orders</p>
              <Button onClick={handleCreateStatuses} disabled={isCreating}>
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Shopify Statuses
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <ShoppingCart className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Online Store Lead</p>
              <p>Applied when a customer places an order that hasn't been paid yet</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShoppingBag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Online Store Sale</p>
              <p>Applied when an order is paid or fulfilled in Shopify</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium text-foreground mb-2">Automatic Sync</p>
            <p>
              When connected to Shopify, orders automatically create jobs/work orders with these statuses.
              Customers are added to your CRM, and products are synced to your inventory.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
