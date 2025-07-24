import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface MeasurementWorksheetProps {
  client: any;
  project: any;
  room?: any;
  surface?: any;
  treatment?: any;
  existingMeasurement?: any;
  isJobFlow?: boolean;
  onSave: (measurement: any) => void;
  readOnly?: boolean;
}

export const MeasurementWorksheet = ({
  client,
  project,
  room,
  surface,
  treatment,
  existingMeasurement,
  isJobFlow = false,
  onSave,
  readOnly = false,
}: MeasurementWorksheetProps) => {
  const [measurement, setMeasurement] = useState({
    client_id: client?.id || '',
    project_id: project?.id || '',
    room_id: room?.id || '',
    surface_id: surface?.id || '',
    treatment_id: treatment?.id || '',
    width: '',
    height: '',
    depth: '',
    fabric_width: '54',
    fabric_multiplier: '1',
    notes: '',
    photo_url: '',
  });

  useEffect(() => {
    if (existingMeasurement) {
      setMeasurement(existingMeasurement);
    }
  }, [existingMeasurement]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setMeasurement(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(measurement);
  };

  const calculateFabricUsage = () => {
    if (!measurement.width || !measurement.height) return "0";
    
    const width = parseFloat(measurement.width) || 0;
    const height = parseFloat(measurement.height) || 0;
    const area = width * height;
    const fabric_multiplier = parseFloat(measurement.fabric_multiplier) || 1;
    const fabric_width = parseFloat(measurement.fabric_width) || 54;
    
    const result = {
      area,
      fabric_multiplier,
      fabric_width,
      total_fabric: area * fabric_multiplier,
      cuts_needed: Math.ceil(width / fabric_width),
      waste_percentage: ((fabric_width - (width % fabric_width)) / fabric_width) * 100
    };
    
    return typeof result === 'string' ? result : result.total_fabric.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Measurement Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="width">Width (in inches)</Label>
          <Input
            type="number"
            id="width"
            name="width"
            value={measurement.width}
            onChange={handleChange}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="height">Height (in inches)</Label>
          <Input
            type="number"
            id="height"
            name="height"
            value={measurement.height}
            onChange={handleChange}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="depth">Depth (in inches)</Label>
          <Input
            type="number"
            id="depth"
            name="depth"
            value={measurement.depth}
            onChange={handleChange}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="fabric_width">Fabric Width (in inches)</Label>
          <Input
            type="number"
            id="fabric_width"
            name="fabric_width"
            value={measurement.fabric_width}
            onChange={handleChange}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="fabric_multiplier">Fabric Multiplier</Label>
          <Input
            type="number"
            id="fabric_multiplier"
            name="fabric_multiplier"
            value={measurement.fabric_multiplier}
            onChange={handleChange}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={measurement.notes}
          onChange={handleChange}
          placeholder="Additional notes about this measurement"
          disabled={readOnly}
        />
      </div>
      
      {/* Fabric Usage Calculation */}
      <div className="bg-brand-secondary/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-brand-primary mb-2">Fabric Usage</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Fabric Needed:</span>
            <span className="ml-2">{calculateFabricUsage()} sq ft</span>
          </div>
          <div>
            <span className="font-medium">Cuts Needed:</span>
            <span className="ml-2">{Math.ceil((parseFloat(measurement.width) || 0) / (parseFloat(measurement.fabric_width) || 54))}</span>
          </div>
          <div>
            <span className="font-medium">Waste Percentage:</span>
            <span className="ml-2">{((((parseFloat(measurement.fabric_width) || 54) - ((parseFloat(measurement.width) || 0) % (parseFloat(measurement.fabric_width) || 54))) / (parseFloat(measurement.fabric_width) || 54)) * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {!readOnly && (
        <Button onClick={handleSubmit} className="w-full">
          Save Measurement
        </Button>
      )}
    </div>
  );
};
