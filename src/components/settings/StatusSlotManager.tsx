import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Star, EyeOff, Edit2, Save, X, FileText } from "lucide-react";
import { useJobStatuses, useCreateJobStatus, useUpdateJobStatus } from "@/hooks/useJobStatuses";
import { useNumberSequences } from "@/hooks/useNumberSequences";
import { useToast } from "@/hooks/use-toast";

const SLOT_COUNT = 10;

// Document types that map to number sequences (Draft → Quote → Order → Invoice)
const DOCUMENT_TYPES = [
  { value: 'draft', label: 'Draft' },
  { value: 'quote', label: 'Quote' },
  { value: 'order', label: 'Order' },
  { value: 'invoice', label: 'Invoice' },
] as const;

type DocumentType = typeof DOCUMENT_TYPES[number]['value'];

const DEFAULT_STATUS_TEMPLATES = [
  { slot: 1, name: "Quote Draft", color: "gray", category: "Quote", action: "editable", description: "Initial quote preparation", document_type: "draft" as DocumentType },
  { slot: 2, name: "Quote Sent", color: "blue", category: "Quote", action: "view_only", description: "Quote sent to client", document_type: "quote" as DocumentType },
  { slot: 3, name: "Quote Approved", color: "green", category: "Quote", action: "locked", description: "Quote approved by client", document_type: "quote" as DocumentType },
  { slot: 4, name: "Planning", color: "gray", category: "Project", action: "editable", description: "Project planning phase", document_type: "order" as DocumentType },
  { slot: 5, name: "In Progress", color: "blue", category: "Project", action: "editable", description: "Active project work", document_type: "order" as DocumentType },
  { slot: 6, name: "Materials Ordered", color: "orange", category: "Project", action: "view_only", description: "Materials have been ordered", document_type: "order" as DocumentType },
  { slot: 7, name: "Manufacturing", color: "yellow", category: "Project", action: "view_only", description: "Manufacturing in progress", document_type: "order" as DocumentType },
  { slot: 8, name: "Quality Check", color: "primary", category: "Project", action: "view_only", description: "Quality inspection", document_type: "order" as DocumentType },
  { slot: 9, name: "Ready for Delivery", color: "green", category: "Project", action: "locked", description: "Ready to deliver", document_type: "order" as DocumentType },
  { slot: 10, name: "Completed", color: "green", category: "Project", action: "completed", description: "Project completed", document_type: "invoice" as DocumentType },
];

export const StatusSlotManager = () => {
  const { data: jobStatuses = [], isLoading } = useJobStatuses();
  const { data: numberSequences = [] } = useNumberSequences();
  const createStatus = useCreateJobStatus();
  const updateStatus = useUpdateJobStatus();
  const { toast } = useToast();

  // Get prefix example for a document type
  const getPrefixExample = (docType: string): string => {
    const sequence = numberSequences.find(s => s.entity_type === docType);
    if (sequence) {
      return `${sequence.prefix}${String(sequence.next_number).padStart(sequence.padding, '0')}`;
    }
    return '';
  };
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const getSlotsArray = () => {
    const slots = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const slotNumber = i + 1;
      const status = jobStatuses.find(s => s.slot_number === slotNumber);
      return {
        slotNumber,
        status: status || null
      };
    });
    return slots;
  };

  const handleEdit = (slotNumber: number, status: any) => {
    setEditingSlot(slotNumber);
    // Determine default document_type based on slot number
    const defaultDocType = slotNumber <= 1 ? 'draft' : slotNumber <= 3 ? 'quote' : slotNumber === 10 ? 'invoice' : 'order';
    setEditForm({
      name: status?.name || "",
      color: status?.color || "gray",
      category: status?.category || "Project",
      action: status?.action || "editable",
      description: status?.description || "",
      is_active: status?.is_active ?? true,
      document_type: status?.document_type || defaultDocType,
    });
  };

  const handleSave = async (slotNumber: number, existingStatus: any) => {
    try {
      if (existingStatus) {
        // Update existing status
        await updateStatus.mutateAsync({
          id: existingStatus.id,
          ...editForm,
        });
      } else {
        // Create new status
        await createStatus.mutateAsync({
          ...editForm,
          slot_number: slotNumber,
          sort_order: slotNumber,
        });
      }
      setEditingSlot(null);
      toast({
        title: "Success",
        description: `Status slot ${slotNumber} saved successfully`,
      });
    } catch (error) {
      console.error("Error saving status:", error);
    }
  };

  const handleSetDefault = async (statusId: string) => {
    try {
      // First, unset all defaults
      for (const status of jobStatuses) {
        if (status.is_default) {
          await updateStatus.mutateAsync({ id: status.id, is_default: false });
        }
      }
      // Then set the new default
      await updateStatus.mutateAsync({ id: statusId, is_default: true });
      toast({
        title: "Success",
        description: "Default status updated",
      });
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const handleUseTemplate = async () => {
    try {
      for (const template of DEFAULT_STATUS_TEMPLATES) {
        const existingStatus = jobStatuses.find(s => s.slot_number === template.slot);
        if (!existingStatus) {
          await createStatus.mutateAsync({
            name: template.name,
            color: template.color,
            category: template.category,
            action: template.action,
            description: template.description,
            document_type: template.document_type,
            slot_number: template.slot,
            sort_order: template.slot,
            is_active: true,
            is_default: template.slot === 4, // Planning as default
          });
        }
      }
      toast({
        title: "Success",
        description: "Default workflow template applied",
      });
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  const getColorClass = (color: string, isActive: boolean) => {
    if (!isActive) return "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-600/30 dark:text-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-600/30 dark:text-green-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/30 dark:text-yellow-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/30 dark:text-orange-200',
      'red': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600/30 dark:text-red-200',
      'primary': 'bg-primary/10 text-primary border-primary/20',
    };
    return colorMap[color] || colorMap.gray;
  };

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-shimmer rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted animate-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted animate-shimmer rounded" />
                    <div className="h-4 w-48 bg-muted animate-shimmer rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  const slots = getSlotsArray();
  const hasNoStatuses = jobStatuses.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Status Workflow (10 Slots)</CardTitle>
          {hasNoStatuses && (
            <Button onClick={handleUseTemplate}>
              Use Recommended Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {slots.map(({ slotNumber, status }) => (
          <Card key={slotNumber} className="border-2">
            <CardContent className="pt-6">
              {editingSlot === slotNumber ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Status name"
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Select value={editForm.color} onValueChange={(v) => setEditForm({ ...editForm, color: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gray">Gray</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Action Behavior</Label>
                      <Select value={editForm.action} onValueChange={(v) => setEditForm({ ...editForm, action: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editable">Editable</SelectItem>
                          <SelectItem value="view_only">View Only</SelectItem>
                          <SelectItem value="locked">Locked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="requires_reason">Requires Reason</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Number Sequence Type
                      </Label>
                      <Select 
                        value={editForm.document_type || 'order'} 
                        onValueChange={(v) => setEditForm({ ...editForm, document_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => {
                            const prefix = getPrefixExample(type.value);
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label} {prefix && <span className="text-muted-foreground font-mono">({prefix})</span>}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Determines which number sequence is used at this stage
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Status description"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editForm.is_active}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingSlot(null)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSave(slotNumber, status)}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold">
                      {slotNumber}
                    </div>
                    <div className="flex-1">
                      {status ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getColorClass(status.color, status.is_active)}>
                              {status.name}
                            </Badge>
                            {!status.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Muted
                              </Badge>
                            )}
                            {status.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {status.category} • {status.action.replace(/_/g, " ")}
                            {(status as any).document_type && (
                              <span className="ml-2">
                                <Badge variant="outline" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {(status as any).document_type}
                                </Badge>
                              </span>
                            )}
                          </p>
                          {status.description && (
                            <p className="text-xs text-muted-foreground mt-1">{status.description}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Empty slot - Click configure to set up this status
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {status && !status.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(status.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(slotNumber, status)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      {status ? "Edit" : "Configure"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};