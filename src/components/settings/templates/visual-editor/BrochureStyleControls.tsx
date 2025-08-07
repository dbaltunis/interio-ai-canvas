import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Palette, Layout, Type, Image, Sparkles } from "lucide-react";

interface BrochureStyleControlsProps {
  block: any;
  onUpdate: (content: any) => void;
}

const gradientPresets = [
  { name: "Ocean Blue", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Company Gradient", value: "linear-gradient(135deg, hsl(var(--company-primary)) 0%, hsl(var(--company-secondary)) 100%)" },
  { name: "Golden Hour", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { name: "Emerald", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }
];

const fontPairings = [
  { name: "Modern Professional", heading: "Inter", body: "Inter" },
  { name: "Classic Elegant", heading: "Playfair Display", body: "Source Sans Pro" },
  { name: "Creative Bold", heading: "Montserrat", body: "Open Sans" },
  { name: "Sophisticated", heading: "Poppins", body: "Nunito Sans" }
];

export const BrochureStyleControls = ({ block, onUpdate }: BrochureStyleControlsProps) => {
  const updateStyle = (field: string, value: any) => {
    onUpdate({
      ...block.content,
      style: { ...block.content.style, [field]: value }
    });
  };

  const updateStyles = (newStyles: any) => {
    onUpdate({
      ...block.content,
      styles: { ...block.content.styles, ...newStyles }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Premium Brochure Styling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Background Gradient</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {gradientPresets.map((gradient) => (
                      <button
                        key={gradient.name}
                        onClick={() => updateStyles({ background: gradient.value })}
                        className="h-12 rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                        style={{ background: gradient.value }}
                        title={gradient.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="color"
                        value={block.content.style?.primaryColor || "#7c3aed"}
                        onChange={(e) => updateStyle('primaryColor', e.target.value)}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <Input
                        value={block.content.style?.primaryColor || "#7c3aed"}
                        onChange={(e) => updateStyle('primaryColor', e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="color"
                        value={block.content.style?.accentColor || "hsl(var(--primary))"}
                        onChange={(e) => updateStyle('accentColor', e.target.value)}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <Input
                        value={block.content.style?.accentColor || "hsl(var(--primary))"}
                        onChange={(e) => updateStyle('accentColor', e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Content Alignment</Label>
                  <Select 
                    value={block.content.styles?.textAlign || 'left'} 
                    onValueChange={(value) => updateStyles({ textAlign: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left Aligned</SelectItem>
                      <SelectItem value="center">Center Aligned</SelectItem>
                      <SelectItem value="right">Right Aligned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Padding</Label>
                  <Slider
                    value={[parseInt(block.content.styles?.padding?.replace('rem', '') || '2')]}
                    onValueChange={([value]) => updateStyles({ padding: `${value}rem` })}
                    max={5}
                    min={0.5}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {block.content.styles?.padding || '2rem'}
                  </div>
                </div>

                <div>
                  <Label>Border Radius</Label>
                  <Slider
                    value={[parseInt(block.content.styles?.borderRadius?.replace('rem', '') || '1')]}
                    onValueChange={([value]) => updateStyles({ borderRadius: `${value}rem` })}
                    max={3}
                    min={0}
                    step={0.25}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {block.content.styles?.borderRadius || '1rem'}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Font Pairing</Label>
                  <div className="space-y-2 mt-2">
                    {fontPairings.map((pairing) => (
                      <Button
                        key={pairing.name}
                        variant="outline"
                        onClick={() => updateStyle('fontFamily', pairing)}
                        className="w-full justify-start h-auto p-3"
                      >
                        <div>
                          <div className="font-semibold" style={{ fontFamily: pairing.heading }}>
                            {pairing.name}
                          </div>
                          <div className="text-xs text-muted-foreground" style={{ fontFamily: pairing.body }}>
                            {pairing.heading} + {pairing.body}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Text Size Scale</Label>
                  <Slider
                    value={[parseFloat(block.content.style?.fontSize || '1')]}
                    onValueChange={([value]) => updateStyle('fontSize', value.toString())}
                    max={1.5}
                    min={0.8}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Scale: {block.content.style?.fontSize || '1'}x
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={block.content.styles?.boxShadow?.includes('shadow')}
                    onCheckedChange={(checked) => 
                      updateStyles({ 
                        boxShadow: checked ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none' 
                      })
                    }
                  />
                  <Label>Drop Shadow</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={block.content.styles?.backdropFilter?.includes('blur')}
                    onCheckedChange={(checked) => 
                      updateStyles({ 
                        backdropFilter: checked ? 'blur(8px)' : 'none',
                        backgroundColor: checked ? 'rgba(255, 255, 255, 0.9)' : undefined
                      })
                    }
                  />
                  <Label>Glass Effect</Label>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      checked={block.content.styles?.border?.includes('gradient')}
                      onCheckedChange={(checked) => 
                        updateStyles({ 
                          border: checked ? '2px solid transparent' : 'none',
                          backgroundImage: checked ? 
                            'linear-gradient(white, white), linear-gradient(45deg, #667eea, #764ba2)' : 
                            undefined,
                          backgroundOrigin: checked ? 'border-box' : undefined,
                          backgroundClip: checked ? 'padding-box, border-box' : undefined
                        })
                      }
                    />
                    <Label>Gradient Border</Label>
                  </div>
                </div>

                <div>
                  <Label>Opacity</Label>
                  <Slider
                    value={[parseFloat(block.content.styles?.opacity || '1')]}
                    onValueChange={([value]) => updateStyles({ opacity: value.toString() })}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((parseFloat(block.content.styles?.opacity || '1')) * 100)}%
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Style Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => updateStyles({
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                borderRadius: '1rem',
                padding: '3rem',
                textAlign: 'center'
              })}
              className="h-auto p-2"
            >
              <div className="text-xs">
                <div className="font-medium">Elegant</div>
                <div className="text-muted-foreground">Company gradient</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => updateStyles({
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem'
              })}
              className="h-auto p-2"
            >
              <div className="text-xs">
                <div className="font-medium">Vibrant</div>
                <div className="text-muted-foreground">Sunset colors</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => updateStyles({
                backgroundColor: '#ffffff',
                color: '#1e293b',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                border: '1px solid #e2e8f0'
              })}
              className="h-auto p-2"
            >
              <div className="text-xs">
                <div className="font-medium">Clean</div>
                <div className="text-muted-foreground">Minimal white</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => updateStyles({
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                borderRadius: '1rem',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              })}
              className="h-auto p-2"
            >
              <div className="text-xs">
                <div className="font-medium">Luxury</div>
                <div className="text-muted-foreground">Premium feel</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};