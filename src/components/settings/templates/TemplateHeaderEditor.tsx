
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image } from "lucide-react";

interface TemplateHeaderEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TemplateHeaderEditor = ({ data, onChange }: TemplateHeaderEditorProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateCompanyInfo = (field: string, value: string) => {
    onChange({
      ...data,
      companyInfo: { ...data.companyInfo, [field]: value }
    });
  };

  const updateClientInfo = (field: string, value: any) => {
    onChange({
      ...data,
      clientInfo: { ...data.clientInfo, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={data.showLogo}
              onCheckedChange={(checked) => updateField('showLogo', checked)}
            />
            <Label>Show Company Logo</Label>
          </div>

          {data.showLogo && (
            <>
              <div className="space-y-2">
                <Label>Logo Position</Label>
                <Select value={data.logoPosition} onValueChange={(value) => updateField('logoPosition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload Logo</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Use {{company_logo}} placeholder
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={data.companyInfo.name}
                onChange={(e) => updateCompanyInfo('name', e.target.value)}
                placeholder="{{company_name}}"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={data.companyInfo.email}
                onChange={(e) => updateCompanyInfo('email', e.target.value)}
                placeholder="{{company_email}}"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={data.companyInfo.address}
              onChange={(e) => updateCompanyInfo('address', e.target.value)}
              placeholder="{{company_address}}"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={data.companyInfo.phone}
              onChange={(e) => updateCompanyInfo('phone', e.target.value)}
              placeholder="{{company_phone}}"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Section Label</Label>
            <Input
              value={data.clientInfo.label}
              onChange={(e) => updateClientInfo('label', e.target.value)}
              placeholder="Bill To:"
            />
          </div>

          <div className="space-y-2">
            <Label>Available Placeholders</Label>
            <div className="grid grid-cols-2 gap-2">
              {['{{client_name}}', '{{client_email}}', '{{client_address}}', '{{client_phone}}'].map((placeholder) => (
                <div key={placeholder} className="flex items-center p-2 bg-muted rounded text-sm">
                  {placeholder}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
