import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentTemplates, useDeleteDocumentTemplate } from "@/hooks/useDocumentTemplates";
import { FileText, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TemplateGalleryProps {
  onSelectTemplate: (template: any) => void;
  onCreateNew: () => void;
}

export const TemplateGallery = ({ onSelectTemplate, onCreateNew }: TemplateGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: templates, isLoading } = useDocumentTemplates();
  const deleteTemplate = useDeleteDocumentTemplate();

  const filteredTemplates = templates?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteTemplate.mutateAsync(deleteId);
      toast.success("Template deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Quote Templates</h2>
            <p className="text-sm text-muted-foreground">Design and manage your quote templates</p>
          </div>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first quote template to get started
            </p>
            <Button onClick={onCreateNew}>Create Template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="aspect-[1/1.4] bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-muted-foreground/30" />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {template.document_type === 'quote' ? 'Quote Template' : 'Document'}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(template.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
