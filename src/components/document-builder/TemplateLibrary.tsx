import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Receipt, ClipboardList, Package, Truck, FileCheck } from 'lucide-react';
import { DocumentTemplate } from './DocumentBuilderTab';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface TemplateLibraryProps {
  onTemplateSelect: (template: DocumentTemplate) => void;
  selectedTemplateId?: string;
}

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'Quotations', icon: FileText },
  { id: 'invoice', label: 'Invoices', icon: Receipt },
  { id: 'work-order', label: 'Work Orders', icon: ClipboardList },
  { id: 'packing-slip', label: 'Packing Slips', icon: Package },
  { id: 'delivery-note', label: 'Delivery Notes', icon: Truck },
  { id: 'measurement', label: 'Measurement Sheets', icon: FileCheck },
];

const SAMPLE_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'sample-quote-1',
    name: 'Standard Quotation',
    document_type: 'quotation',
    blocks: []
  },
  {
    id: 'sample-invoice-1',
    name: 'Standard Invoice',
    document_type: 'invoice',
    blocks: []
  }
];

export const TemplateLibrary = ({ onTemplateSelect, selectedTemplateId }: TemplateLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { data: dbTemplates = [], isLoading } = useDocumentTemplates();

  // Combine database templates with sample templates
  const allTemplates = [...SAMPLE_TEMPLATES, ...dbTemplates];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || template.document_type === selectedType;
    const isActive = !template.status || template.status === 'active' || template.status === 'draft';
    return matchesSearch && matchesType && isActive;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Template Library</h3>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Document Types Filter */}
      <div className="p-3 border-b border-border">
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={selectedType === null ? "default" : "ghost"}
            onClick={() => setSelectedType(null)}
            className="h-7 text-xs"
          >
            All
          </Button>
          {DOCUMENT_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                size="sm"
                variant={selectedType === type.id ? "default" : "ghost"}
                onClick={() => setSelectedType(type.id)}
                className="h-7 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {type.label.split(' ')[0]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Templates List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredTemplates.map(template => {
            const TypeIcon = DOCUMENT_TYPES.find(t => t.id === template.document_type)?.icon || FileText;
            return (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className={`w-full p-3 rounded-lg border transition-all text-left hover:shadow-sm ${
                  selectedTemplateId === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded ${
                    selectedTemplateId === template.id
                      ? 'bg-primary/10'
                      : 'bg-muted'
                  }`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{template.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {template.document_type.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
