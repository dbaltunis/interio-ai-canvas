import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Loader2, Plus, Minus, X } from "lucide-react";
import { TagInput } from "./TagInput";
import { useBulkInventoryUpdate } from "@/hooks/useBulkInventoryUpdate";
import { useToast } from "@/hooks/use-toast";
import { getAllTags } from "@/constants/inventoryTags";
import { cn } from "@/lib/utils";

interface BulkTagEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemIds: string[];
  selectedItems: any[];
  onSuccess?: () => void;
}

export const BulkTagEditor = ({
  open,
  onOpenChange,
  selectedItemIds,
  selectedItems,
  onSuccess
}: BulkTagEditorProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'add' | 'remove' | 'replace'>('add');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const bulkUpdate = useBulkInventoryUpdate();
  const isLoading = bulkUpdate.isPending;
  
  // Get all common tags across selected items
  const commonTags = selectedItems.length > 0
    ? selectedItems.reduce((common, item) => {
        const itemTags = item.tags || [];
        if (common === null) return itemTags;
        return common.filter((t: string) => itemTags.includes(t));
      }, null as string[] | null) || []
    : [];
  
  // Get all unique tags across selected items
  const allItemTags = [...new Set(
    selectedItems.flatMap(item => item.tags || [])
  )];
  
  const handleApply = async () => {
    if (selectedTags.length === 0 && mode !== 'replace') {
      toast({
        title: "No Tags Selected",
        description: "Please select at least one tag",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (mode === 'add') {
        await bulkUpdate.mutateAsync({
          ids: selectedItemIds,
          updates: { addTags: selectedTags }
        });
        toast({
          title: "Tags Added",
          description: `Added ${selectedTags.length} tag(s) to ${selectedItemIds.length} items`
        });
      } else if (mode === 'remove') {
        await bulkUpdate.mutateAsync({
          ids: selectedItemIds,
          updates: { removeTags: selectedTags }
        });
        toast({
          title: "Tags Removed",
          description: `Removed ${selectedTags.length} tag(s) from ${selectedItemIds.length} items`
        });
      } else if (mode === 'replace') {
        await bulkUpdate.mutateAsync({
          ids: selectedItemIds,
          updates: { tags: selectedTags }
        });
        toast({
          title: "Tags Replaced",
          description: `Set ${selectedTags.length} tag(s) on ${selectedItemIds.length} items`
        });
      }
      
      setSelectedTags([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to update tags:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tags",
        variant: "destructive"
      });
    }
  };
  
  const predefinedTags = getAllTags();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Edit Tags for {selectedItemIds.length} Items
          </DialogTitle>
          <DialogDescription>
            Add, remove, or replace tags on selected items.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(v) => {
          setMode(v as 'add' | 'remove' | 'replace');
          setSelectedTags([]);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Tags
            </TabsTrigger>
            <TabsTrigger value="remove" className="gap-1">
              <Minus className="h-4 w-4" />
              Remove Tags
            </TabsTrigger>
            <TabsTrigger value="replace" className="gap-1">
              <X className="h-4 w-4" />
              Replace All
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Add these tags to all selected items (existing tags will be kept)
            </p>
            <TagInput
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Search or add tags..."
              showSuggestions={true}
            />
          </TabsContent>
          
          <TabsContent value="remove" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Remove these tags from all selected items
            </p>
            
            {allItemTags.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Click tags to select for removal:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allItemTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    const tagInfo = predefinedTags.find(t => t.key === tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          isSelected 
                            ? "bg-destructive text-destructive-foreground" 
                            : tagInfo?.color || "hover:bg-muted"
                        )}
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tagInfo?.label || tag.replace(/_/g, ' ')}
                        {isSelected && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tags on selected items
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="replace" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Replace all existing tags with these new tags
            </p>
            <TagInput
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Search or add tags..."
              showSuggestions={true}
            />
            {commonTags.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Current common tags (will be replaced):
                </p>
                <div className="flex flex-wrap gap-1">
                  {commonTags.map(tag => {
                    const tagInfo = predefinedTags.find(t => t.key === tag);
                    return (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={cn("text-xs opacity-60", tagInfo?.color)}
                      >
                        {tagInfo?.label || tag.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Apply {mode === 'add' ? 'Tags' : mode === 'remove' ? 'Removal' : 'Changes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
