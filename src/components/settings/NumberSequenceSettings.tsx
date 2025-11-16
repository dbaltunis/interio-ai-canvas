import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  useNumberSequences, 
  useCreateNumberSequence, 
  useUpdateNumberSequence, 
  useDeleteNumberSequence,
  EntityType 
} from "@/hooks/useNumberSequences";
import { Plus, Save, Trash2, Hash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENTITY_TYPES: { value: EntityType; label: string; description: string }[] = [
  { value: 'job', label: 'Jobs', description: 'Main job/project numbers' },
  { value: 'draft', label: 'Drafts', description: 'Draft document numbers' },
  { value: 'quote', label: 'Quotes', description: 'Quote numbers' },
  { value: 'order', label: 'Orders', description: 'Order numbers' },
  // Invoice sequences not yet implemented in backend
  // { value: 'invoice', label: 'Invoices', description: 'Invoice numbers' },
];

export const NumberSequenceSettings = () => {
  const { data: sequences = [], isLoading } = useNumberSequences();
  const createSequence = useCreateNumberSequence();
  const updateSequence = useUpdateNumberSequence();
  const deleteSequence = useDeleteNumberSequence();

  const [newSequence, setNewSequence] = useState<{
    entity_type: EntityType;
    prefix: string;
    next_number: number;
    padding: number;
    active: boolean;
  } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    prefix: string;
    next_number: number;
    padding: number;
    active: boolean;
  } | null>(null);

  const handleAddNew = () => {
    setNewSequence({
      entity_type: 'quote',
      prefix: 'QUOTE-',
      next_number: 1,
      padding: 4,
      active: true,
    });
  };

  const handleCancelNew = () => {
    setNewSequence(null);
  };

  const handleSaveNew = async () => {
    if (!newSequence) return;
    await createSequence.mutateAsync(newSequence);
    setNewSequence(null);
  };

  const handleEdit = (sequence: any) => {
    setEditingId(sequence.id);
    setEditValues({
      prefix: sequence.prefix,
      next_number: sequence.next_number,
      padding: sequence.padding,
      active: sequence.active,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValues) return;
    await updateSequence.mutateAsync({ id, updates: editValues });
    setEditingId(null);
    setEditValues(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this number sequence?")) {
      await deleteSequence.mutateAsync(id);
    }
  };

  const getExampleNumber = (prefix: string, nextNumber: number, padding: number) => {
    return `${prefix}${String(nextNumber).padStart(padding, '0')}`;
  };

  const usedEntityTypes = sequences.map(s => s.entity_type);
  const availableEntityTypes = ENTITY_TYPES.filter(t => !usedEntityTypes.includes(t.value));

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Number Sequences
            </CardTitle>
            <CardDescription>
              Configure sequential numbering for jobs, quotes, and orders
            </CardDescription>
          </div>
          {availableEntityTypes.length > 0 && (
            <Button onClick={handleAddNew} disabled={!!newSequence} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Sequence
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Next Number</TableHead>
              <TableHead>Padding</TableHead>
              <TableHead>Example</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newSequence && (
              <TableRow className="bg-muted/50">
                <TableCell>
                  <Select
                    value={newSequence.entity_type}
                    onValueChange={(value) => setNewSequence({ ...newSequence, entity_type: value as EntityType })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={newSequence.prefix}
                    onChange={(e) => setNewSequence({ ...newSequence, prefix: e.target.value })}
                    className="w-24"
                    placeholder="PREFIX-"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newSequence.next_number}
                    onChange={(e) => setNewSequence({ ...newSequence, next_number: parseInt(e.target.value) })}
                    className="w-24"
                    min={1}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newSequence.padding}
                    onChange={(e) => setNewSequence({ ...newSequence, padding: parseInt(e.target.value) })}
                    className="w-20"
                    min={1}
                    max={10}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {getExampleNumber(newSequence.prefix, newSequence.next_number, newSequence.padding)}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={newSequence.active}
                    onCheckedChange={(checked) => setNewSequence({ ...newSequence, active: checked })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSaveNew} size="sm" variant="default">
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button onClick={handleCancelNew} size="sm" variant="outline">
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {sequences.map((sequence) => {
              const isEditing = editingId === sequence.id;
              const values = isEditing && editValues ? editValues : sequence;
              const entityType = ENTITY_TYPES.find(t => t.value === sequence.entity_type);

              return (
                <TableRow key={sequence.id}>
                  <TableCell className="font-medium">
                    {entityType?.label}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={values.prefix}
                        onChange={(e) => setEditValues({ ...values, prefix: e.target.value })}
                        className="w-24"
                      />
                    ) : (
                      <span className="font-mono text-sm">{sequence.prefix}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={values.next_number}
                        onChange={(e) => setEditValues({ ...values, next_number: parseInt(e.target.value) })}
                        className="w-24"
                        min={1}
                      />
                    ) : (
                      sequence.next_number
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={values.padding}
                        onChange={(e) => setEditValues({ ...values, padding: parseInt(e.target.value) })}
                        className="w-20"
                        min={1}
                        max={10}
                      />
                    ) : (
                      sequence.padding
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">
                      {getExampleNumber(values.prefix, values.next_number, values.padding)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Switch
                        checked={values.active}
                        onCheckedChange={(checked) => setEditValues({ ...values, active: checked })}
                      />
                    ) : (
                      <Switch checked={sequence.active} disabled />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleSaveEdit(sequence.id)} size="sm" variant="default">
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleCancelEdit} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEdit(sequence)} size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleDelete(sequence.id)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {sequences.length === 0 && !newSequence && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No number sequences configured. Click "Add Sequence" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">How Number Sequences Work</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li><strong>Prefix:</strong> Text that appears before the number (e.g., "QUOTE-", "ORDER-")</li>
            <li><strong>Next Number:</strong> The next sequential number to be used</li>
            <li><strong>Padding:</strong> How many digits the number should have (adds leading zeros)</li>
            <li><strong>Example:</strong> Prefix "QUOTE-" + Next Number 42 + Padding 4 = "QUOTE-0042"</li>
            <li><strong>Active:</strong> Only active sequences will be used for new records</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
