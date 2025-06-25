
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TreatmentFormData } from './types';

interface BasicDetailsTabProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const BasicDetailsTab = ({ formData, onInputChange }: BasicDetailsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="treatmentName">Treatment Name</Label>
          <Input
            id="treatmentName"
            value={formData.treatmentName}
            onChange={(e) => onInputChange("treatmentName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => onInputChange("quantity", parseInt(e.target.value) || 1)}
          />
        </div>
        <div>
          <Label>Window Type</Label>
          <Select value={formData.windowType} onValueChange={(value) => onInputChange("windowType", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Window</SelectItem>
              <SelectItem value="pair">Pair of Windows</SelectItem>
              <SelectItem value="bay">Bay Window</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Treatment Specifications</Label>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>Heading Style</Label>
            <Select value={formData.headingStyle} onValueChange={(value) => onInputChange("headingStyle", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select heading style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pencil-pleat">Pencil Pleat</SelectItem>
                <SelectItem value="triple-pleat">Triple Pleat</SelectItem>
                <SelectItem value="goblet">Goblet Pleat</SelectItem>
                <SelectItem value="eyelet">Eyelet</SelectItem>
                <SelectItem value="tab-top">Tab Top</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fullness Ratio</Label>
            <Select value={formData.headingFullness} onValueChange={(value) => onInputChange("headingFullness", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2:1 (Economical)</SelectItem>
                <SelectItem value="2.5">2.5:1 (Standard)</SelectItem>
                <SelectItem value="3">3:1 (Luxury)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lining</Label>
            <Select value={formData.lining} onValueChange={(value) => onInputChange("lining", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lining" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unlined</SelectItem>
                <SelectItem value="standard">Standard Lining</SelectItem>
                <SelectItem value="blackout">Blackout Lining</SelectItem>
                <SelectItem value="thermal">Thermal Lining</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mounting</Label>
            <Select value={formData.mounting} onValueChange={(value) => onInputChange("mounting", value)}>
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
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Measurements (cm)</Label>
        <div className="grid grid-cols-4 gap-4 mt-3">
          <div>
            <Label htmlFor="railWidth">Rail Width *</Label>
            <Input
              id="railWidth"
              type="number"
              value={formData.railWidth}
              onChange={(e) => onInputChange("railWidth", e.target.value)}
              placeholder="e.g. 200"
            />
          </div>
          <div>
            <Label htmlFor="curtainDrop">Curtain Drop *</Label>
            <Input
              id="curtainDrop"
              type="number"
              value={formData.curtainDrop}
              onChange={(e) => onInputChange("curtainDrop", e.target.value)}
              placeholder="e.g. 250"
            />
          </div>
          <div>
            <Label htmlFor="curtainPooling">Pooling</Label>
            <Input
              id="curtainPooling"
              type="number"
              value={formData.curtainPooling}
              onChange={(e) => onInputChange("curtainPooling", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="returnDepth">Return Depth</Label>
            <Input
              id="returnDepth"
              type="number"
              value={formData.returnDepth}
              onChange={(e) => onInputChange("returnDepth", e.target.value)}
              placeholder="4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
