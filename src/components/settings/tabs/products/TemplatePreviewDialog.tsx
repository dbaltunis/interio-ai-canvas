import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { Eye, DollarSign, Ruler, Settings2, Layers } from "lucide-react";

interface TemplatePreviewDialogProps {
  template: CurtainTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplatePreviewDialog = ({ template, open, onOpenChange }: TemplatePreviewDialogProps) => {
  if (!template) return null;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Not set";
    return `$${amount.toFixed(2)}`;
  };

  const formatMeasurement = (value: number | undefined, unit = "cm") => {
    if (!value) return "Not set";
    return `${value}${unit}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Template Preview: {template.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Template Name:</span>
                  <p className="text-sm text-muted-foreground">{template.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{template.curtain_type}</Badge>
                </div>
              </div>
              {template.description && (
                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Heading & Fabric Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Heading & Fabric Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium">Heading Style:</span>
                  <p className="text-sm text-muted-foreground">{template.heading_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Fullness Ratio:</span>
                  <Badge variant="secondary">{template.fullness_ratio}x</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Fabric Width:</span>
                  <Badge variant="outline">{template.fabric_width_type}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Fabric Direction:</span>
                  <p className="text-sm text-muted-foreground capitalize">{template.fabric_direction}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Railroadable:</span>
                  <Badge variant={template.is_railroadable ? "default" : "secondary"}>
                    {template.is_railroadable ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              
              {(template.vertical_repeat || template.horizontal_repeat) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Vertical Repeat:</span>
                    <p className="text-sm text-muted-foreground">{formatMeasurement(template.vertical_repeat)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Horizontal Repeat:</span>
                    <p className="text-sm text-muted-foreground">{formatMeasurement(template.horizontal_repeat)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manufacturing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Manufacturing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium">Return Left:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.return_left)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Return Right:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.return_right)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Overlap:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.overlap)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Header:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.header_allowance)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium">Bottom Hem:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.bottom_hem)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Side Hems:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.side_hems)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Seam Hems:</span>
                  <p className="text-sm text-muted-foreground">{formatMeasurement(template.seam_hems)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Waste %:</span>
                  <p className="text-sm text-muted-foreground">{template.waste_percent}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-medium">Pricing Type:</span>
                  <Badge variant="default" className="ml-2">
                    {template.pricing_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Hand Finished Available:</span>
                  <Badge variant={template.offers_hand_finished ? "default" : "secondary"}>
                    {template.offers_hand_finished ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {template.pricing_type === "per_metre" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Machine Price per Metre:</span>
                    <p className="text-sm text-muted-foreground">{formatCurrency(template.machine_price_per_metre)}</p>
                  </div>
                  {template.offers_hand_finished && (
                    <div>
                      <span className="text-sm font-medium">Hand Price per Metre:</span>
                      <p className="text-sm text-muted-foreground">{formatCurrency(template.hand_price_per_metre)}</p>
                    </div>
                  )}
                </div>
              )}
              
              {template.pricing_type === "per_drop" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Machine Price per Drop:</span>
                    <p className="text-sm text-muted-foreground">{formatCurrency(template.machine_price_per_drop)}</p>
                  </div>
                  {template.offers_hand_finished && (
                    <div>
                      <span className="text-sm font-medium">Hand Price per Drop:</span>
                      <p className="text-sm text-muted-foreground">{formatCurrency(template.hand_price_per_drop)}</p>
                    </div>
                  )}
                </div>
              )}
              
              {template.pricing_type === "per_panel" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Machine Price per Panel:</span>
                    <p className="text-sm text-muted-foreground">{formatCurrency(template.machine_price_per_panel)}</p>
                  </div>
                  {template.offers_hand_finished && (
                    <div>
                      <span className="text-sm font-medium">Hand Price per Panel:</span>
                      <p className="text-sm text-muted-foreground">{formatCurrency(template.hand_price_per_panel)}</p>
                    </div>
                  )}
                </div>
              )}
              
              {template.uses_height_pricing && template.height_price_ranges && (
                <div>
                  <span className="text-sm font-medium">Height-Based Pricing:</span>
                  <div className="mt-2 space-y-2">
                    {template.height_price_ranges.map((range, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-accent/50 rounded">
                        <span>{range.min_height}cm - {range.max_height}cm</span>
                        <span className="font-medium">{formatCurrency(range.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lining Options */}
          {template.lining_types && template.lining_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lining Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.lining_types.map((lining, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{lining.type}</span>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(lining.price_per_metre)} per metre
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Labour: {formatCurrency(lining.labour_per_curtain)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hardware Compatibility */}
          {template.compatible_hardware && template.compatible_hardware.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Compatible Hardware</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.compatible_hardware.map((hardware, index) => (
                    <Badge key={index} variant="outline">
                      {hardware}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};