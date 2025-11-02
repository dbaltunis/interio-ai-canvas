
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductTemplates } from "@/hooks/useProductTemplates";
import { ProductTemplateForm } from "./products/ProductTemplateForm";
import { SettingsInheritanceInfo } from "../SettingsInheritanceInfo";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";

export const ProductTemplatesTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { templates, isLoading: templatesLoading, createTemplate, updateTemplate, deleteTemplate } = useProductTemplates();
  const { toast } = useToast();
  const { data: profile } = useCurrentUserProfile();
  
  const isTeamMember = profile?.parent_account_id && profile.parent_account_id !== profile.user_id;

  const handleSave = async (templateData: any) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        await createTemplate(templateData);
        toast({
          title: "Success", 
          description: "Template created successfully"
        });
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  if (templatesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Templates</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsInheritanceInfo 
        settingsType="product template" 
        isInheriting={isTeamMember}
      />
      
      {!showForm ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Product Templates</CardTitle>
              <CardDescription>
                Manage product templates for different window coverings. Templates define the calculation method, pricing, and available components for each product type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAdd}>Add Template</Button>
            </CardContent>
          </Card>

          <Table>
            <TableCaption>A list of your product templates.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Window Covering</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Calculation Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.product_type}</TableCell>
                  <TableCell className="capitalize">{template.product_category}</TableCell>
                  <TableCell className="capitalize">
                    {template.calculation_method?.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            the template and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>
                  {templates?.length || 0} template(s) in total
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </>
      ) : (
        <ProductTemplateForm
          template={editingTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={!!editingTemplate}
        />
      )}
    </div>
  );
};
