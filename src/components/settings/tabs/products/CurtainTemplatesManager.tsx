import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CurtainTemplateForm } from "./CurtainTemplateForm";
import { CurtainTemplatesList } from "./CurtainTemplatesList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CurtainTemplate, useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface CreateTemplateData {
  name: string;
  category: string;
  description: string;
  inventoryItemId: string;
}

interface CurtainTemplatesManagerProps {
  highlightedTemplateId?: string | null;
  createTemplateData?: CreateTemplateData | null;
  onTemplateCreated?: () => void;
  editTemplateId?: string | null;
  onTemplateEdited?: () => void;
}

export const CurtainTemplatesManager = ({ 
  highlightedTemplateId,
  createTemplateData,
  onTemplateCreated,
  editTemplateId,
  onTemplateEdited
}: CurtainTemplatesManagerProps) => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CurtainTemplate | null>(null);
  const [prefilledData, setPrefilledData] = useState<CreateTemplateData | null>(null);
  const { data: templates } = useCurtainTemplates();

  // Permission checks - following the same pattern as jobs
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[CurtainTemplatesManager] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if manage_templates is explicitly in user_permissions table
  const hasManageTemplatesPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_templates'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow manage if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include manage_templates)
  const canManageTemplates =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasManageTemplatesPermission
          : hasManageTemplatesPermission;

  // Auto-open form when createTemplateData is provided - only if user has permission
  useEffect(() => {
    if (createTemplateData && canManageTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      setEditingTemplate(null);
      setPrefilledData(createTemplateData);
      setIsFormOpen(true);
    }
  }, [createTemplateData, canManageTemplates, permissionsLoading, roleLoading, explicitPermissions]);

  // Auto-open form when editTemplateId is provided - only if user has permission
  useEffect(() => {
    if (editTemplateId && templates && canManageTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      const templateToEdit = templates.find(t => t.id === editTemplateId);
      if (templateToEdit) {
        setEditingTemplate(templateToEdit);
        setPrefilledData(null);
        setIsFormOpen(true);
        onTemplateEdited?.();
      }
    }
  }, [editTemplateId, templates, canManageTemplates, permissionsLoading, roleLoading, explicitPermissions]);

  const handleAddTemplate = () => {
    // Only allow if user has permission
    if (!canManageTemplates || permissionsLoading || roleLoading || explicitPermissions === undefined) {
      return;
    }
    console.log("Add Template button clicked");
    setEditingTemplate(null);
    setPrefilledData(null);
    setIsFormOpen(true);
  };
  const handleEditTemplate = (template: CurtainTemplate) => {
    // Only allow if user has permission
    if (!canManageTemplates || permissionsLoading || roleLoading || explicitPermissions === undefined) {
      return;
    }
    setEditingTemplate(template);
    setPrefilledData(null);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
    setPrefilledData(null);
    onTemplateCreated?.();
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Window Covering Templates</h3>
          
        </div>
        <Button 
          onClick={handleAddTemplate} 
          className="flex items-center gap-2 pointer-events-auto z-50" 
          type="button"
          disabled={!canManageTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
          title={!canManageTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to manage templates" : undefined}
        >
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      <CurtainTemplatesList 
        onEdit={handleEditTemplate} 
        highlightedTemplateId={highlightedTemplateId}
        canManageTemplates={canManageTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
      />

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-6xl">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? "Edit Window Covering Template" : "Add Window Covering Template"}
            </SheetTitle>
            <SheetDescription>
              {editingTemplate ? "Update the window covering template configuration" : "Create a new template for curtains, blinds, shutters or other window coverings"}
            </SheetDescription>
          </SheetHeader>
          <CurtainTemplateForm 
            template={editingTemplate} 
            onClose={handleCloseForm}
            prefilledData={prefilledData}
          />
        </SheetContent>
      </Sheet>
    </div>;
};