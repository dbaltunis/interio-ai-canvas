
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface BlockStyleControlsProps {
  block: any;
  onUpdate: (content: any) => void;
}

export const BlockStyleControls = ({ block, onUpdate }: BlockStyleControlsProps) => {
  const updateStyle = (field: string, value: any) => {
    onUpdate({
      ...block.content,
      style: { ...block.content.style, [field]: value }
    });
  };

  if (block.type === 'products') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Table Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Table Layout</Label>
            <Select 
              value={block.content.layout} 
              onValueChange={(value) => onUpdate({ ...block.content, layout: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple View</SelectItem>
                <SelectItem value="detailed">Detailed/Itemized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Column Configuration</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.content.showProduct}
                  onCheckedChange={(checked) => onUpdate({ ...block.content, showProduct: checked })}
                />
                <Label>Product/Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.content.showDescription}
                  onCheckedChange={(checked) => onUpdate({ ...block.content, showDescription: checked })}
                />
                <Label>Description</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.content.showQuantity}
                  onCheckedChange={(checked) => onUpdate({ ...block.content, showQuantity: checked })}
                />
                <Label>Quantity</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.content.showUnitPrice}
                  onCheckedChange={(checked) => onUpdate({ ...block.content, showUnitPrice: checked })}
                />
                <Label>Unit Price</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.content.showTotal}
                  onCheckedChange={(checked) => onUpdate({ ...block.content, showTotal: checked })}
                />
                <Label>Total</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.content.showTax}
                  onCheckedChange={(checked) => onUpdate({ ...block.content, showTax: checked })}
                />
                <Label>Tax/VAT</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Table Style</Label>
            <Select 
              value={block.content.tableStyle || 'bordered'} 
              onValueChange={(value) => onUpdate({ ...block.content, tableStyle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bordered">Bordered</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="striped">Striped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Styling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.content.style?.primaryColor || "#415e6b"}
              onChange={(e) => updateStyle('primaryColor', e.target.value)}
              className="w-12 h-10 border rounded cursor-pointer"
            />
            <Input
              value={block.content.style?.primaryColor || "#415e6b"}
              onChange={(e) => updateStyle('primaryColor', e.target.value)}
              placeholder="#415e6b"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={block.content.style?.textColor || "#575656"}
              onChange={(e) => updateStyle('textColor', e.target.value)}
              className="w-12 h-10 border rounded cursor-pointer"
            />
            <Input
              value={block.content.style?.textColor || "#575656"}
              onChange={(e) => updateStyle('textColor', e.target.value)}
              placeholder="#575656"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Font Size</Label>
          <Select 
            value={block.content.style?.fontSize || 'medium'} 
            onValueChange={(value) => updateStyle('fontSize', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
