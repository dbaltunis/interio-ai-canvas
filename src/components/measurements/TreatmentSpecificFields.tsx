import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { useEffect, useMemo } from "react";

interface TreatmentSpecificFieldsProps {
  covering: any;
  measurements: any;
  treatmentData: any;
  onTreatmentDataChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const TreatmentSpecificFields = ({
  covering,
  measurements,
  treatmentData,
  onTreatmentDataChange,
  readOnly = false
}: TreatmentSpecificFieldsProps) => {
  const { units } = useMeasurementUnits();
  
  // Determine treatment category for dynamic options
  const treatmentCategory = useMemo(() => {
    const coveringName = covering?.name?.toLowerCase() || '';
    const coveringId = covering?.id?.toLowerCase() || '';
    
    if (coveringName.includes('venetian') || coveringId.includes('venetian')) {
      return 'venetian_blinds';
    }
    if (coveringName.includes('vertical') || coveringId.includes('vertical')) {
      return 'vertical_blinds';
    }
    if (coveringName.includes('roller') || coveringId.includes('roller')) {
      return 'roller_blinds';
    }
    if (coveringName.includes('cellular') || coveringId.includes('cellular') || 
        coveringName.includes('honeycomb') || coveringId.includes('honeycomb')) {
      return 'cellular_blinds';
    }
    return 'blinds';
  }, [covering]);

  // Fetch dynamic treatment options for blinds
  const { data: dynamicOptions = [] } = useTreatmentOptions(treatmentCategory, 'category');

  // Extract options by key
  const getOptionsForKey = (key: string) => {
    const option = dynamicOptions.find(opt => opt.key === key);
    return option?.option_values || [];
  };

  const mountTypeOptions = getOptionsForKey('mount_type');
  const controlTypeOptions = getOptionsForKey('control_type');
  const slatSizeOptions = getOptionsForKey('slat_size') || getOptionsForKey('slat_width');
  const vaneSizeOptions = getOptionsForKey('vane_width') || getOptionsForKey('louvre_width');

  // Auto-select first options on mount for blinds
  useEffect(() => {
    if (!readOnly && covering?.name?.toLowerCase().includes('blind')) {
      if (!treatmentData.mounting_type) {
        const firstMount = mountTypeOptions[0]?.code || 'inside';
        onTreatmentDataChange("mounting_type", firstMount);
      }
      if (!treatmentData.control_type) {
        const firstControl = controlTypeOptions[0]?.code || 'cord';
        onTreatmentDataChange("control_type", firstControl);
      }
      if (!treatmentData.slat_size) {
        const firstSlat = slatSizeOptions[0]?.code || vaneSizeOptions[0]?.code || '50mm';
        onTreatmentDataChange("slat_size", firstSlat);
      }
    }
  }, [covering?.name, readOnly, mountTypeOptions, controlTypeOptions, slatSizeOptions, vaneSizeOptions]);

  const renderCurtainFields = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Curtain Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heading Type</Label>
              <Select 
                value={treatmentData.heading_type || ""} 
                onValueChange={(value) => onTreatmentDataChange("heading_type", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select heading" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pencil_pleat">Pencil Pleat</SelectItem>
                  <SelectItem value="eyelet">Eyelet</SelectItem>
                  <SelectItem value="tab_top">Tab Top</SelectItem>
                  <SelectItem value="rod_pocket">Rod Pocket</SelectItem>
                  <SelectItem value="pinch_pleat">Pinch Pleat</SelectItem>
                  <SelectItem value="goblet">Goblet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Fullness Ratio</Label>
              <Select 
                value={treatmentData.fullness_ratio || "2.0"} 
                onValueChange={(value) => onTreatmentDataChange("fullness_ratio", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5">1.5x (Budget)</SelectItem>
                  <SelectItem value="2.0">2.0x (Standard)</SelectItem>
                  <SelectItem value="2.5">2.5x (Full)</SelectItem>
                  <SelectItem value="3.0">3.0x (Luxury)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Pooling ({units.length})</Label>
              <Input
                type="number"
                value={treatmentData.pooling || 0}
                onChange={(e) => onTreatmentDataChange("pooling", parseFloat(e.target.value) || 0)}
                placeholder="0"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label>Header Hem ({units.length})</Label>
              <Input
                type="number"
                value={treatmentData.header_hem ?? ""}
                onChange={(e) => onTreatmentDataChange("header_hem", parseFloat(e.target.value) || 0)}
                placeholder="4"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label>Bottom Hem ({units.length})</Label>
              <Input
                type="number"
                value={treatmentData.bottom_hem ?? ""}
                onChange={(e) => onTreatmentDataChange("bottom_hem", parseFloat(e.target.value) || 0)}
                placeholder="4"
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Side Hem ({units.length})</Label>
              <Input
                type="number"
                value={treatmentData.side_hem ?? ""}
                onChange={(e) => onTreatmentDataChange("side_hem", parseFloat(e.target.value) || 0)}
                placeholder="1.5"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label>Seam Allowance ({units.length})</Label>
              <Input
                type="number"
                value={treatmentData.seam_allowance ?? ""}
                onChange={(e) => onTreatmentDataChange("seam_allowance", parseFloat(e.target.value) || 0)}
                placeholder="0.5"
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="lining" 
              checked={treatmentData.lining || false}
              onCheckedChange={(checked) => onTreatmentDataChange("lining", checked)}
              disabled={readOnly}
            />
            <Label htmlFor="lining">Add Lining</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBlindFields = () => {
    const isVertical = treatmentCategory === 'vertical_blinds';
    const sizeOptions = isVertical ? vaneSizeOptions : slatSizeOptions;
    const sizeLabel = isVertical ? 'Vane Width' : 'Slat Size';
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Blind Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mounting Type</Label>
                <Select 
                  value={treatmentData.mounting_type || "inside"} 
                  onValueChange={(value) => onTreatmentDataChange("mounting_type", value)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mountTypeOptions.length > 0 ? (
                      mountTypeOptions.map(opt => (
                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="inside">Inside Mount</SelectItem>
                        <SelectItem value="outside">Outside Mount</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Control Type</Label>
                <Select 
                  value={treatmentData.control_type || "cord"} 
                  onValueChange={(value) => onTreatmentDataChange("control_type", value)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {controlTypeOptions.length > 0 ? (
                      controlTypeOptions.map(opt => (
                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="cord">Cord</SelectItem>
                        <SelectItem value="wand">Wand</SelectItem>
                        <SelectItem value="motorized">Motorized</SelectItem>
                        <SelectItem value="cordless">Cordless</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{sizeLabel}</Label>
                <Select 
                  value={treatmentData.slat_size || sizeOptions[0]?.code || "50mm"} 
                  onValueChange={(value) => onTreatmentDataChange("slat_size", value)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.length > 0 ? (
                      sizeOptions.map(opt => (
                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                      ))
                    ) : isVertical ? (
                      <>
                        <SelectItem value="89mm">89mm (3.5")</SelectItem>
                        <SelectItem value="127mm">127mm (5")</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="25mm">25mm (1")</SelectItem>
                        <SelectItem value="50mm">50mm (2")</SelectItem>
                        <SelectItem value="63mm">63mm (2.5")</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Valance</Label>
                <Select 
                  value={treatmentData.valance || "standard"} 
                  onValueChange={(value) => onTreatmentDataChange("valance", value)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Valance</SelectItem>
                    <SelectItem value="standard">Standard Valance</SelectItem>
                    <SelectItem value="decorative">Decorative Valance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRomanShadeFields = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Roman Shade Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fold Style</Label>
              <Select 
                value={treatmentData.fold_style || "flat"} 
                onValueChange={(value) => onTreatmentDataChange("fold_style", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Roman</SelectItem>
                  <SelectItem value="hobbled">Hobbled Roman</SelectItem>
                  <SelectItem value="balloon">Balloon Roman</SelectItem>
                  <SelectItem value="relaxed">Relaxed Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Fold Spacing ({units.length})</Label>
              <Input
                type="number"
                value={treatmentData.fold_spacing ?? 8}
                onChange={(e) => onTreatmentDataChange("fold_spacing", parseFloat(e.target.value) || 0)}
                placeholder="8"
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Control Type</Label>
              <Select 
                value={treatmentData.control_type || "cord"} 
                onValueChange={(value) => onTreatmentDataChange("control_type", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cord">Cord Control</SelectItem>
                  <SelectItem value="chain">Chain Control</SelectItem>
                  <SelectItem value="motorized">Motorized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Mounting</Label>
              <Select 
                value={treatmentData.mounting_type || "inside"} 
                onValueChange={(value) => onTreatmentDataChange("mounting_type", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inside">Inside Mount</SelectItem>
                  <SelectItem value="outside">Outside Mount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="blackout_lining" 
              checked={treatmentData.blackout_lining || false}
              onCheckedChange={(checked) => onTreatmentDataChange("blackout_lining", checked)}
              disabled={readOnly}
            />
            <Label htmlFor="blackout_lining">Blackout Lining</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderShutterFields = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Shutter Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Louver Size</Label>
              <Select 
                value={treatmentData.louver_size || "3.5"} 
                onValueChange={(value) => onTreatmentDataChange("louver_size", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2.5">2.5 inch</SelectItem>
                  <SelectItem value="3.5">3.5 inch</SelectItem>
                  <SelectItem value="4.5">4.5 inch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Panel Configuration</Label>
              <Select 
                value={treatmentData.panel_config || "2_panel"} 
                onValueChange={(value) => onTreatmentDataChange("panel_config", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_panel">Single Panel</SelectItem>
                  <SelectItem value="2_panel">Bi-fold (2 panels)</SelectItem>
                  <SelectItem value="3_panel">Tri-fold (3 panels)</SelectItem>
                  <SelectItem value="4_panel">Quad-fold (4 panels)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frame Style</Label>
              <Select 
                value={treatmentData.frame_style || "z_frame"} 
                onValueChange={(value) => onTreatmentDataChange("frame_style", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="z_frame">Z-Frame</SelectItem>
                  <SelectItem value="l_frame">L-Frame</SelectItem>
                  <SelectItem value="deco_frame">Deco Frame</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Hinge Type</Label>
              <Select 
                value={treatmentData.hinge_type || "standard"} 
                onValueChange={(value) => onTreatmentDataChange("hinge_type", value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Hinge</SelectItem>
                  <SelectItem value="invisible">Invisible Hinge</SelectItem>
                  <SelectItem value="offset">Offset Hinge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="tilt_rod" 
              checked={treatmentData.tilt_rod || false}
              onCheckedChange={(checked) => onTreatmentDataChange("tilt_rod", checked)}
              disabled={readOnly}
            />
            <Label htmlFor="tilt_rod">Hidden Tilt Rod</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFieldsForCovering = () => {
    const coveringId = covering.id.toLowerCase();
    
    if (coveringId.includes('curtain') || coveringId.includes('drape')) {
      return renderCurtainFields();
    } else if (coveringId.includes('blind')) {
      return renderBlindFields();
    } else if (coveringId.includes('roman') || coveringId.includes('shade')) {
      return renderRomanShadeFields();
    } else if (coveringId.includes('shutter')) {
      return renderShutterFields();
    } else {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Configuration options for {covering.name} coming soon...
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-4">
      {renderFieldsForCovering()}
    </div>
  );
};