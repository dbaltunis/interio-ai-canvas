import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Hash } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

export const DocumentSequencesStep = ({ data, updateSection }: StepProps) => {
  const sequences = data.document_sequences || {};

  const handleChange = (field: string, value: string | number) => {
    updateSection('document_sequences', { ...sequences, [field]: value });
  };

  // Match app's EntityType: 'draft' | 'quote' | 'order' | 'invoice' | 'job'
  const documents = [
    {
      id: 'draft',
      label: 'Drafts',
      prefixField: 'draft_prefix',
      startField: 'draft_start',
      prefixDefault: 'DRF-',
      startDefault: 1,
      description: 'e.g., DRF-0001',
    },
    {
      id: 'quote',
      label: 'Quotes',
      prefixField: 'quote_prefix',
      startField: 'quote_start',
      prefixDefault: 'QT-',
      startDefault: 1,
      description: 'e.g., QT-0001',
    },
    {
      id: 'order',
      label: 'Orders',
      prefixField: 'order_prefix',
      startField: 'order_start',
      prefixDefault: 'ORD-',
      startDefault: 1,
      description: 'e.g., ORD-0001',
    },
    {
      id: 'invoice',
      label: 'Invoices',
      prefixField: 'invoice_prefix',
      startField: 'invoice_start',
      prefixDefault: 'INV-',
      startDefault: 1,
      description: 'e.g., INV-0001',
    },
    {
      id: 'job',
      label: 'Jobs',
      prefixField: 'job_prefix',
      startField: 'job_start',
      prefixDefault: 'JOB-',
      startDefault: 1,
      description: 'e.g., JOB-0001',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document Number Sequences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{doc.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {doc.description}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={doc.prefixField} className="text-sm">
                    Prefix
                  </Label>
                  <Input
                    id={doc.prefixField}
                    placeholder={doc.prefixDefault}
                    value={sequences[doc.prefixField as keyof typeof sequences] || doc.prefixDefault}
                    onChange={(e) => handleChange(doc.prefixField, e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={doc.startField} className="text-sm">
                    Start #
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={doc.startField}
                      type="number"
                      min="1"
                      className="pl-9 font-mono"
                      placeholder="1"
                      value={sequences[doc.startField as keyof typeof sequences] || doc.startDefault}
                      onChange={(e) => handleChange(doc.startField, parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
