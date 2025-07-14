
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from '../calculationUtils';

interface TemplateOptionsCardProps {
  matchingTemplate: any;
  formData: any;
  liningOptions: any[];
  headingOptions: any[];
  hardwareOptions: any[];
  serviceOptions: any[];
  onFormDataChange: (updates: any) => void;
  onHeadingChange: (value: string) => void;
}

export const TemplateOptionsCard = ({
  matchingTemplate,
  formData,
  liningOptions,
  headingOptions,
  hardwareOptions,
  serviceOptions,
  onFormDataChange,
  onHeadingChange
}: TemplateOptionsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show Lining options only if template has lining selected */}
        {matchingTemplate?.components?.lining && 
         Object.entries(matchingTemplate.components.lining).some(([id, selected]) => selected === true) && (
          <div>
            <Label>Select lining</Label>
            <Select value={formData.lining} onValueChange={(value) => onFormDataChange({ lining: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {liningOptions.map((option, index) => (
                  <SelectItem key={option.value || index} value={option.label}>
                    {option.label} {option.price > 0 && `(+${formatCurrency(option.price)}/m)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Show Heading options only if template has headings selected */}
        {matchingTemplate?.components?.headings && 
         Object.entries(matchingTemplate.components.headings).some(([id, selected]) => selected === true) && (
          <div>
            <Label>Select curtain heading style</Label>
            <Select value={formData.headingStyle} onValueChange={onHeadingChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {headingOptions.map((option, index) => (
                  <SelectItem key={option.value || index} value={option.value}>
                    {option.label} (Fullness: {option.fullness}:1)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Heading Fullness - moved here for better UX */}
        {matchingTemplate?.components?.headings && 
         Object.entries(matchingTemplate.components.headings).some(([id, selected]) => selected === true) && (
          <div>
            <Label>Heading fullness</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.headingFullness}
              onChange={(e) => onFormDataChange({ headingFullness: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current: {formData.headingFullness}:1 ratio
            </p>
          </div>
        )}

        {/* Hardware Options - only show if template has hardware selected */}
        {matchingTemplate?.components?.hardware && 
         Object.entries(matchingTemplate.components.hardware).some(([id, selected]) => selected === true) && 
         hardwareOptions.length > 0 && (
          <div>
            <Label>Select hardware</Label>
            <Select value={formData.hardware} onValueChange={(value) => onFormDataChange({ hardware: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose hardware..." />
              </SelectTrigger>
              <SelectContent>
                {hardwareOptions.filter(option => 
                  Object.keys(matchingTemplate.components.hardware).includes(option.id)
                ).map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name} (+{formatCurrency(option.price)}/{option.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Service Options with Subcategories */}
        {matchingTemplate?.components?.services && 
         Object.entries(matchingTemplate.components.services).some(([id, selected]) => selected === true) && 
         serviceOptions.length > 0 && (
          <div>
            <Label>Select services</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="service-fitting"
                  checked={formData.additionalFeatures.some(f => f.name === 'fitting')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFormDataChange({
                        additionalFeatures: [...formData.additionalFeatures, {
                          id: 'fitting',
                          name: 'fitting',
                          price: 50,
                          selected: true
                        }]
                      });
                    } else {
                      onFormDataChange({
                        additionalFeatures: formData.additionalFeatures.filter(f => f.name !== 'fitting')
                      });
                    }
                  }}
                />
                <Label htmlFor="service-fitting" className="text-sm">
                  Fitting (+£50.00/unit)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="service-installation"
                  checked={formData.additionalFeatures.some(f => f.name === 'installation')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFormDataChange({
                        additionalFeatures: [...formData.additionalFeatures, {
                          id: 'installation',
                          name: 'installation',
                          price: 100,
                          selected: true
                        }]
                      });
                    } else {
                      onFormDataChange({
                        additionalFeatures: formData.additionalFeatures.filter(f => f.name !== 'installation')
                      });
                    }
                  }}
                />
                <Label htmlFor="service-installation" className="text-sm">
                  Installation (+£100.00/unit)
                </Label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
