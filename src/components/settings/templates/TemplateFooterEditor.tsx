
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/jobs/email-components/RichTextEditor";

interface TemplateFooterEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TemplateFooterEditor = ({ data, onChange }: TemplateFooterEditorProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Text */}
      <Card>
        <CardHeader>
          <CardTitle>Introduction Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quote Introduction</Label>
            <RichTextEditor
              value={data.introText}
              onChange={(content) => updateField('introText', content)}
              placeholder="Enter an introduction message for your quotes..."
              className="min-h-32"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            This text will appear before the quote items. You can use rich formatting.
          </p>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Terms & Conditions</Label>
            <RichTextEditor
              value={data.termsText}
              onChange={(content) => updateField('termsText', content)}
              placeholder="Enter payment terms, conditions, and other important information..."
              className="min-h-32"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Include payment terms, warranty information, and other legal text.
          </p>
        </CardContent>
      </Card>

      {/* Additional Footer Content */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Footer Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Thank You Message</Label>
            <Textarea
              value={data.thankYouText || ""}
              onChange={(e) => updateField('thankYouText', e.target.value)}
              placeholder="Thank you for your business..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Information Footer</Label>
            <Textarea
              value={data.contactFooter || ""}
              onChange={(e) => updateField('contactFooter', e.target.value)}
              placeholder="For questions about this quote, please contact us..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={data.showSignature}
              onCheckedChange={(checked) => updateField('showSignature', checked)}
            />
            <Label>Include Signature Area</Label>
          </div>

          {data.showSignature && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Signature Label</Label>
                <Input
                  value={data.signatureLabel || "Authorized Signature"}
                  onChange={(e) => updateField('signatureLabel', e.target.value)}
                  placeholder="Authorized Signature"
                />
              </div>

              <div className="space-y-2">
                <Label>Date Label</Label>
                <Input
                  value={data.dateLabel || "Date"}
                  onChange={(e) => updateField('dateLabel', e.target.value)}
                  placeholder="Date"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Placeholders */}
      <Card>
        <CardHeader>
          <CardTitle>Available Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              '{{company_name}}',
              '{{company_phone}}',
              '{{company_email}}',
              '{{quote_date}}',
              '{{quote_number}}',
              '{{client_name}}',
              '{{total_amount}}',
              '{{valid_until}}'
            ].map((placeholder) => (
              <div key={placeholder} className="p-2 bg-muted rounded text-center">
                {placeholder}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
