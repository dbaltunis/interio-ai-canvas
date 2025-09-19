import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Copy, Trash2, Eye, Search, Filter } from "lucide-react";
import { useCurtainTemplates, useDeleteCurtainTemplate, CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurtainTemplatesListProps {
  onEdit: (template: CurtainTemplate) => void;
}

export const CurtainTemplatesList = ({ onEdit }: CurtainTemplatesListProps) => {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useCurtainTemplates();
  const { data: headingStyles = [] } = useHeadingInventory();
  const deleteTemplate = useDeleteCurtainTemplate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<CurtainTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter and search templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.heading_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
                         template.curtain_type === filterType ||
                         template.pricing_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicate = (template: CurtainTemplate) => {
    // Create a new template based on the existing one
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined, // Remove ID so it creates a new one
    };
    onEdit(duplicatedTemplate as CurtainTemplate);
  };

  const handlePreview = (template: CurtainTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Templates Overview</CardTitle>
              <CardDescription>
                {templates.length} template{templates.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Curtains</SelectItem>
                  <SelectItem value="pair">Pair Curtains</SelectItem>
                  <SelectItem value="per_metre">Per Metre</SelectItem>
                  <SelectItem value="per_drop">Per Drop</SelectItem>
                  <SelectItem value="per_panel">Per Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filterType !== "all" ? (
                <div>
                  <p>No templates match your search criteria</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => { setSearchQuery(""); setFilterType("all"); }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <p>No curtain templates yet. Create your first template to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline">{template.curtain_type}</Badge>
                          <Badge variant="secondary">{template.pricing_type.replace('_', ' ')}</Badge>
                          {template.offers_hand_finished && (
                            <Badge variant="default">Hand Finished</Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Heading:</span>
                            <p className="text-muted-foreground">{template.heading_name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fullness:</span>
                            <p className="text-muted-foreground">{template.fullness_ratio}x</p>
                          </div>
                          <div>
                            <span className="font-medium">Fabric Width:</span>
                            <p className="text-muted-foreground capitalize">{template.fabric_width_type}</p>
                          </div>
                          <div>
                            <span className="font-medium">Base Price:</span>
                            <p className="text-muted-foreground">
                              ${template.machine_price_per_metre || template.machine_price_per_drop || template.machine_price_per_panel || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePreview(template)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(template)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{template.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(template.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TemplatePreviewDialog 
        template={previewTemplate}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  );
};