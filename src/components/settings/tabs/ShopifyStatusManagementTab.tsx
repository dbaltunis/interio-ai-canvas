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
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";

export const ShopifyStatusManagementTab = () => {
  const { user } = useAuth();
  const { data: statuses = [], isLoading } = useJobStatuses();
  const updateStatus = useUpdateJobStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', description: '' });
  const [isInitializing, setIsInitializing] = useState(false);

  // Permission checks - following the same pattern as other settings
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-shopify-status', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[ShopifyStatusManagementTab] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if manage_shopify is explicitly in user_permissions table
  const hasManageShopifyPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_shopify'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Check manage_shopify permission using the same pattern
  const canManageShopify = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasManageShopifyPermission
        : hasManageShopifyPermission;

  const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;

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
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }
    if (!canManageShopify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage Shopify settings.",
        variant: "destructive"
      });
      return;
    }
    setEditingId(status.id);
    setEditForm({
      name: status.name,
      color: status.color,
      description: status.description || '',
    });
  };

  const handleSave = (id: string) => {
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }
    if (!canManageShopify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage Shopify settings.",
        variant: "destructive"
      });
      return;
    }
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
      {isPermissionLoaded && !canManageShopify && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription>
            <p className="font-semibold text-orange-900 mb-1">Permission Required</p>
            <p className="text-sm text-orange-800">
              You don't have permission to manage Shopify settings. Contact your administrator to configure Shopify integration.
            </p>
          </AlertDescription>
        </Alert>
      )}

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
            <div className="space-y-4 animate-fade-in">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted animate-shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-muted animate-shimmer rounded" />
                        <div className="h-4 w-48 bg-muted animate-shimmer rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                          disabled={!canManageShopify && isPermissionLoaded}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color (Hex)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editForm.color}
                            onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                            placeholder="#10b981"
                            disabled={!canManageShopify && isPermissionLoaded}
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
                          disabled={!canManageShopify && isPermissionLoaded}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(status.id)}
                          disabled={updateStatus.isPending || (!canManageShopify && isPermissionLoaded)}
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
                        disabled={!canManageShopify && isPermissionLoaded}
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
