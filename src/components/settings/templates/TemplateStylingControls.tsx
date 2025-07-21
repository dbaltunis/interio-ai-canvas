
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface TemplateStylingControlsProps {
  data: any;
  onChange: (data: any) => void;
}

export const TemplateStylingControls = ({ data, onChange }: TemplateStylingControlsProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={data.fontFamily} onValueChange={(value) => updateField('fontFamily', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Base Font Size</Label>
              <Select value={data.fontSize} onValueChange={(value) => updateField('fontSize', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px</SelectItem>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Line Height</Label>
            <Select value={data.lineHeight || "1.5"} onValueChange={(value) => updateField('lineHeight', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2">Tight (1.2)</SelectItem>
                <SelectItem value="1.5">Normal (1.5)</SelectItem>
                <SelectItem value="1.8">Loose (1.8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={data.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={data.textColor || "#000000"}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={data.textColor || "#000000"}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={data.backgroundColor || "#FFFFFF"}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <Input
                value={data.backgroundColor || "#FFFFFF"}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Borders and Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Borders & Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Border Style</Label>
            <Select value={data.borderStyle} onValueChange={(value) => updateField('borderStyle', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Border Width</Label>
            <Select value={data.borderWidth || "1px"} onValueChange={(value) => updateField('borderWidth', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0px">None</SelectItem>
                <SelectItem value="1px">Thin (1px)</SelectItem>
                <SelectItem value="2px">Medium (2px)</SelectItem>
                <SelectItem value="3px">Thick (3px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Table Spacing</Label>
            <Select value={data.spacing} onValueChange={(value) => updateField('spacing', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Page Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Page Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Page Size</Label>
            <Select value={data.pageSize || "A4"} onValueChange={(value) => updateField('pageSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Margins</Label>
            <Select value={data.margins || "normal"} onValueChange={(value) => updateField('margins', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
