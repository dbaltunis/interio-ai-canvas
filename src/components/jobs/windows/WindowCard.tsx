import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, FileText, Package, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WindowCardProps {
  window: {
    id: string;
    title?: string;
    template_name?: string;
    size?: string;
    price_total?: number;
    state?: any;
    template_id?: string;
    svg_snapshot?: string;
  };
  onEdit: (windowId: string) => void;
  onAddToQuote: (windowId: string) => void;
  onWorkroomOrder: (windowId: string) => void;
}

export const WindowCard: React.FC<WindowCardProps> = ({
  window,
  onEdit,
  onAddToQuote,
  onWorkroomOrder,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getWindowTitle = () => {
    if (window.title) return window.title;
    if (window.state?.selectedTemplate?.name) return window.state.selectedTemplate.name;
    return window.template_name || 'Untitled Window';
  };

  const getWindowSize = () => {
    if (window.size) return window.size;
    if (window.state?.measurements) {
      const { rail_width, drop } = window.state.measurements;
      if (rail_width && drop) {
        return `${rail_width}mm × ${drop}mm`;
      }
    }
    return 'No size';
  };

  const getTemplateName = () => {
    if (window.state?.selectedTemplate?.name) return window.state.selectedTemplate.name;
    return window.template_name || 'No template';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{getWindowTitle()}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getTemplateName()}</Badge>
              <Badge variant="secondary">{getWindowSize()}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(window.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddToQuote(window.id)}>
                <FileText className="h-4 w-4 mr-2" />
                Add to Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWorkroomOrder(window.id)}>
                <Package className="h-4 w-4 mr-2" />
                Workroom Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {window.svg_snapshot && (
          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden">
            <img 
              src={window.svg_snapshot} 
              alt="Window preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="text-lg font-semibold text-primary">
            {formatCurrency(window.price_total || 0)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(window.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onAddToQuote(window.id)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};