import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Save, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
interface FormSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  savedSuccessfully?: boolean;
  children: React.ReactNode;
  className?: string;
}
export const FormSection = ({
  title,
  description,
  icon,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  savedSuccessfully = false,
  children,
  className
}: FormSectionProps) => {
  return <Card className={cn("relative overflow-hidden", className)}>
      {savedSuccessfully && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              
            </div>
          </div>
          
          {!isEditing && <Button variant="outline" size="sm" onClick={onEdit} className="hover:bg-primary hover:text-primary-foreground transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>}
        </div>
        
        {/* Action bar for editing mode - more prominent at the top */}
        {isEditing && <>
            <Separator className="mt-4" />
            <div className="flex gap-3 pt-4 bg-muted/30 -mx-6 px-6 py-4 rounded-lg border border-dashed border-primary/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
                <Edit className="h-4 w-4" />
                <span className="font-medium">Editing mode</span>
              </div>
              <Button variant="outline" onClick={onCancel} disabled={isSaving} className="px-6" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving} className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" size="sm">
                {isSaving ? <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </div> : <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>}
              </Button>
            </div>
          </>}
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
        
        {/* Additional sticky action bar at bottom for longer forms */}
        {isEditing && <>
            <Separator />
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 -mx-6 -mb-6">
              <div className="flex gap-3 justify-end max-w-full">
                <Button variant="outline" onClick={onCancel} disabled={isSaving} className="px-6" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={isSaving} className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" size="sm">
                  {isSaving ? <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </div> : <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>}
                </Button>
              </div>
            </div>
          </>}
        
        {savedSuccessfully && !isEditing && <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center text-green-700 dark:text-green-400 text-sm font-medium">
              <Check className="h-4 w-4 mr-2" />
              Changes saved successfully
            </div>
          </div>}
      </CardContent>
    </Card>;
};