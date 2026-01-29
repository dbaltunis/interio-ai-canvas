import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Users, MoreHorizontal, Edit, Trash2, 
  Mail, Zap, Folder, ChevronRight, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useClientLists, 
  useCreateClientList, 
  useUpdateClientList,
  useDeleteClientList,
  ClientList 
} from "@/hooks/useClientLists";

const LIST_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#64748b', label: 'Slate' },
];

interface ClientListsSidebarProps {
  selectedListId?: string | null;
  onSelectList?: (listId: string | null) => void;
  onSendToList?: (list: ClientList) => void;
  compact?: boolean;
  className?: string;
}

export const ClientListsSidebar = ({
  selectedListId,
  onSelectList,
  onSendToList,
  compact = false,
  className,
}: ClientListsSidebarProps) => {
  const { data: lists = [], isLoading } = useClientLists();
  const createList = useCreateClientList();
  const updateList = useUpdateClientList();
  const deleteList = useDeleteClientList();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingList, setEditingList] = useState<ClientList | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });

  const handleCreateList = async () => {
    if (!formData.name.trim()) return;
    
    await createList.mutateAsync({
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
    });
    
    setShowCreateDialog(false);
    setFormData({ name: '', description: '', color: '#6366f1' });
  };

  const handleEditList = async () => {
    if (!editingList || !formData.name.trim()) return;
    
    await updateList.mutateAsync({
      id: editingList.id,
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
    });
    
    setShowEditDialog(false);
    setEditingList(null);
  };

  const handleDeleteList = async () => {
    if (!editingList) return;
    
    await deleteList.mutateAsync(editingList.id);
    
    setShowDeleteDialog(false);
    setEditingList(null);
    
    if (selectedListId === editingList.id) {
      onSelectList?.(null);
    }
  };

  const openEditDialog = (list: ClientList) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      color: list.color,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (list: ClientList) => {
    setEditingList(list);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Client Lists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("h-full flex flex-col", className)}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            Client Lists
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => {
              setFormData({ name: '', description: '', color: '#6366f1' });
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-3 pb-3 space-y-1">
              {/* All Clients option */}
              <button
                onClick={() => onSelectList?.(null)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  selectedListId === null 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted/50"
                )}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-sm font-medium truncate">All Clients</span>
              </button>

              {lists.length === 0 ? (
                <div className="text-center py-6 px-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Folder className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Create lists to organize your clients
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    New List
                  </Button>
                </div>
              ) : (
                lists.map((list) => (
                  <div
                    key={list.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg transition-colors",
                      selectedListId === list.id 
                        ? "bg-primary/10" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <button
                      onClick={() => onSelectList?.(list.id)}
                      className="flex-1 flex items-center gap-3 px-3 py-2 text-left min-w-0"
                    >
                      <div 
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: list.color }}
                      />
                      <span className={cn(
                        "flex-1 text-sm truncate",
                        selectedListId === list.id ? "font-medium text-primary" : ""
                      )}>
                        {list.name}
                      </span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {list.member_count}
                      </Badge>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0 mr-1"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover">
                        {onSendToList && (
                          <>
                            <DropdownMenuItem onClick={() => onSendToList(list)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Campaign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => openEditDialog(list)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit List
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(list)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}

              {/* Smart Lists coming soon */}
              {lists.length > 0 && (
                <div className="pt-3 mt-3 border-t">
                  <p className="text-xs text-muted-foreground px-3 mb-2 flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    Smart Lists (Coming Soon)
                  </p>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                    Auto-filter clients by funnel stage, tags, or activity
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create List Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Organize your clients into groups for targeted campaigns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                placeholder="e.g., VIP Clients, Recent Inquiries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this list for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      formData.color === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.value }}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList}
              disabled={!formData.name.trim() || createList.isPending}
            >
              {createList.isPending ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">List Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      formData.color === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.value }}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditList}
              disabled={!formData.name.trim() || updateList.isPending}
            >
              {updateList.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{editingList?.name}"? 
              This will not delete the clients in the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
