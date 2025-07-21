
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Minus, GripVertical } from "lucide-react";

interface TemplateBodyEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TemplateBodyEditor = ({ data, onChange }: TemplateBodyEditorProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateColumn = (index: number, field: string, value: any) => {
    const newColumns = [...data.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    onChange({ ...data, columns: newColumns });
  };

  const addColumn = () => {
    const newColumns = [...data.columns, {
      key: `custom_${Date.now()}`,
      label: "New Column",
      visible: true
    }];
    onChange({ ...data, columns: newColumns });
  };

  const removeColumn = (index: number) => {
    const newColumns = data.columns.filter((_: any, i: number) => i !== index);
    onChange({ ...data, columns: newColumns });
  };

  return (
    <div className="space-y-6">
      {/* Layout Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Body Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Layout Style</Label>
            <Select value={data.layout} onValueChange={(value) => updateField('layout', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table Layout</SelectItem>
                <SelectItem value="blocks">Block Layout</SelectItem>
                <SelectItem value="list">List Layout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Column Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Table Columns</CardTitle>
            <Button onClick={addColumn} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Column
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Column Label</TableHead>
                <TableHead>Data Field</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.columns.map((column: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={column.label}
                      onChange={(e) => updateColumn(index, 'label', e.target.value)}
                      className="min-w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={column.key}
                      onValueChange={(value) => updateColumn(index, 'key', value)}
                    >
                      <SelectTrigger className="min-w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room">{{room_name}}</SelectItem>
                        <SelectItem value="treatment">{{treatment_name}}</SelectItem>
                        <SelectItem value="quantity">{{quantity}}</SelectItem>
                        <SelectItem value="unitPrice">{{unit_price}}</SelectItem>
                        <SelectItem value="total">{{total}}</SelectItem>
                        <SelectItem value="description">{{description}}</SelectItem>
                        <SelectItem value="sku">{{sku}}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={column.visible}
                      onCheckedChange={(checked) => updateColumn(index, 'visible', checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(index)}
                      disabled={data.columns.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={data.showSubtotal}
              onCheckedChange={(checked) => updateField('showSubtotal', checked)}
            />
            <Label>Show Subtotal</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={data.showTax}
              onCheckedChange={(checked) => updateField('showTax', checked)}
            />
            <Label>Show Tax</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={data.showTotal}
              onCheckedChange={(checked) => updateField('showTotal', checked)}
            />
            <Label>Show Total</Label>
          </div>
        </CardContent>
      </Card>

      {/* Available Placeholders */}
      <Card>
        <CardHeader>
          <CardTitle>Available Data Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[
              '{{quote_number}}',
              '{{quote_date}}',
              '{{room_name}}',
              '{{treatment_name}}',
              '{{quantity}}',
              '{{unit_price}}',
              '{{total}}',
              '{{subtotal}}',
              '{{tax_amount}}',
              '{{total_amount}}',
              '{{job_number}}',
              '{{description}}'
            ].map((placeholder) => (
              <div key={placeholder} className="p-2 bg-muted rounded text-center">
                {placeholder}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
