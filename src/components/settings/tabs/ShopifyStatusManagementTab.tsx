import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useJobStatuses, useUpdateJobStatus } from "@/hooks/useJobStatuses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, ShoppingBag, Edit2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const ShopifyStatusManagementTab = () => {
  const { data: statuses = [], isLoading } = useJobStatuses();
  const updateStatus = useUpdateJobStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', description: '' });
  const [isInitializing, setIsInitializing] = useState(false);

  const shopifyStatuses = statuses.filter(
    (s) => s.name === 'Online Store Lead' || s.name === 'Online Store Sale'
  );

  // Auto-create statuses on mount if they don't exist
  useEffect(() => {
    const initializeStatuses = async () => {
      if (isLoading) return;
      if (shopifyStatuses.length > 0) return; // Already exist
      
      setIsInitializing(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.rpc('ensure_shopify_statuses', {
          p_user_id: user.id
        });

        await queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      } catch (error) {
        console.error('Failed to initialize statuses:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeStatuses();
  }, [isLoading, shopifyStatuses.length, queryClient]);

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

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription>
          <p className="text-sm font-semibold text-blue-900 mb-1">💡 What are Shopify Statuses?</p>
          <p className="text-xs text-blue-800">
            These are job statuses automatically applied to Shopify orders: <strong>Online Store Lead</strong> (unpaid) and <strong>Online Store Sale</strong> (paid).
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Shopify Order Statuses</CardTitle>
          <CardDescription>
            Customize how Shopify orders appear in your system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(isLoading || isInitializing) && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-medium">Loading statuses...</span>
              </div>
            </div>
          )}
          
          {!isLoading && !isInitializing && shopifyStatuses.map((status) => {
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
        </CardContent>
      </Card>
    </div>
  );
};
