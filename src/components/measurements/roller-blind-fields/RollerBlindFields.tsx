import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const ControlPositionField = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="space-y-2">
    <Label>Control Position</Label>
    <RadioGroup value={value || 'right'} onValueChange={onChange}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="left" id="control-left" />
        <Label htmlFor="control-left" className="font-normal cursor-pointer">Left Side</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="right" id="control-right" />
        <Label htmlFor="control-right" className="font-normal cursor-pointer">Right Side</Label>
      </div>
    </RadioGroup>
  </div>
);

export const MountingTypeField = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="space-y-2">
    <Label>Mounting Type</Label>
    <Select value={value || 'inside'} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select mounting type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inside">Inside Mount</SelectItem>
        <SelectItem value="outside">Outside Mount</SelectItem>
      </SelectContent>
    </Select>
    <p className="text-xs text-muted-foreground">
      {value === 'inside' ? 'Blind fits inside window frame' : 'Blind mounts outside window frame'}
    </p>
  </div>
);

export const FabricTransparencyField = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="space-y-2">
    <Label>Fabric Transparency</Label>
    <Select value={value || 'light_filtering'} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select transparency level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="blackout">
          <div>
            <div className="font-medium">Blackout</div>
            <div className="text-xs text-muted-foreground">100% light blocking</div>
          </div>
        </SelectItem>
        <SelectItem value="light_filtering">
          <div>
            <div className="font-medium">Light Filtering</div>
            <div className="text-xs text-muted-foreground">Reduces light & glare</div>
          </div>
        </SelectItem>
        <SelectItem value="sheer">
          <div>
            <div className="font-medium">Sheer</div>
            <div className="text-xs text-muted-foreground">Soft diffused light</div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const ChainLengthField = ({ value, onChange, unit }: { value: string; onChange: (val: string) => void; unit: string }) => (
  <div className="space-y-2">
    <Label>Chain Length</Label>
    <div className="flex gap-2">
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter chain length"
      />
      <span className="flex items-center px-3 border rounded-md bg-muted text-sm">
        {unit}
      </span>
    </div>
    <p className="text-xs text-muted-foreground">
      Standard: 2/3 of drop height
    </p>
  </div>
);
