import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Link2, Settings2, Eye } from 'lucide-react';

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  condition: {
    option_key_pattern: string;
    operator: 'equals' | 'not_equals';
  };
  effect: {
    action: 'show_option' | 'hide_option' | 'require_option' | 'set_default' | 'filter_values';
    target_option_key_pattern: string;
  };
}

const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'control-chain',
    name: 'Control → Chain Options',
    description: 'Show chain length and side options when chain control is selected',
    icon: <Link2 className="h-4 w-4" />,
    examples: ['Chain → Chain Length', 'Chain → Chain Side'],
    condition: { option_key_pattern: 'control', operator: 'equals' },
    effect: { action: 'show_option', target_option_key_pattern: 'chain' },
  },
  {
    id: 'hardware-track-rod',
    name: 'Hardware → Track/Rod',
    description: 'Filter available hardware based on track or rod selection',
    icon: <Settings2 className="h-4 w-4" />,
    examples: ['Track → Track Options', 'Rod → Rod Options'],
    condition: { option_key_pattern: 'hardware_type', operator: 'equals' },
    effect: { action: 'filter_values', target_option_key_pattern: 'hardware' },
  },
  {
    id: 'heading-hardware-default',
    name: 'Heading → Hardware Default',
    description: 'Auto-set hardware type based on heading selection',
    icon: <Zap className="h-4 w-4" />,
    examples: ['Rod Pocket → Default to Rod', 'Pinch Pleat → Default to Track'],
    condition: { option_key_pattern: 'heading', operator: 'equals' },
    effect: { action: 'set_default', target_option_key_pattern: 'hardware_type' },
  },
  {
    id: 'motorised-remote',
    name: 'Motorised → Remote Options',
    description: 'Show remote control options when motorised is selected',
    icon: <Eye className="h-4 w-4" />,
    examples: ['Motorised → Remote Type', 'Motorised → Channel'],
    condition: { option_key_pattern: 'control', operator: 'equals' },
    effect: { action: 'show_option', target_option_key_pattern: 'remote' },
  },
];

interface RuleTemplatesPanelProps {
  onSelectTemplate: (template: RuleTemplate) => void;
}

export const RuleTemplatesPanel = ({ onSelectTemplate }: RuleTemplatesPanelProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Rule Templates
        </CardTitle>
        <CardDescription>
          Start with a common pattern and customize for your options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RULE_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="p-3 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.examples.slice(0, 2).map((example, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export type { RuleTemplate };
